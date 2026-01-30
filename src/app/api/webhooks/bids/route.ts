import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ProducerBid from "@/models/ProducerBid";
import Contract from "@/models/Contract";
import Notification from "@/models/Notification";
import { validateInterDashboardAuth } from "@/lib/jwt";

/**
 * Webhook endpoint to receive bid status updates from Buyer Dashboard
 * 
 * Events handled:
 * - bid.accepted: Update bid status to "won", optionally create contract
 * - bid.rejected: Update bid status to "lost"
 * - bid.counter_offer: Handle counter offer logic
 * 
 * Authentication: Supports JWT tokens and API key fallback
 */
export async function POST(request: NextRequest) {
    try {
        // Verify webhook authentication (JWT or API key)
        const authHeader = request.headers.get("authorization");
        const xApiKey = request.headers.get("x-api-key");

        const authResult = validateInterDashboardAuth(authHeader, xApiKey);
        if (!authResult.valid) {
            console.warn("❌ Unauthorized webhook request:", authResult.error);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await request.json();
        const { event, bid, lot, contract: contractData, counterOffer } = payload;

        console.log(`📥 Received bid webhook: ${event} for bid: ${bid?.externalBidId || bid?._id}`);

        // Connect to database
        await connectDB();

        // Find the corresponding producer bid by externalBidId
        let producerBid = null;
        if (bid?.externalBidId) {
            // Try to find by the external bid ID we sent
            producerBid = await ProducerBid.findOne({
                externalBidId: bid.externalBidId,
            });
        }

        // Helper function to create notification
        const createNotification = async (
            type: "bid" | "contract" | "tender" | "info",
            title: string,
            message: string,
            relatedId?: string,
            relatedType?: string,
            metadata?: Record<string, any>
        ) => {
            try {
                const notification = await Notification.create({
                    type,
                    title,
                    message,
                    relatedId,
                    relatedType,
                    metadata,
                    read: false,
                });
                console.log(`📝 Notification created: ${title}`);
                return notification;
            } catch (error: any) {
                console.error("Failed to create notification:", error.message);
            }
        };

        // Handle different events
        switch (event) {
            case "bid.accepted":
                console.log(`✅ Bid accepted: ${bid?.externalBidId}`);

                if (producerBid) {
                    await ProducerBid.findByIdAndUpdate(producerBid._id, {
                        status: "won",
                        buyerBidId: bid._id,
                        updatedAt: new Date(),
                    });
                }

                // Create notification for bid acceptance
                await createNotification(
                    "bid",
                    "🎉 Bid Accepted!",
                    `Your bid for "${lot?.title || 'the lot'}" has been accepted! ${contractData ? 'A contract has been created.' : ''}`,
                    producerBid?._id?.toString() || bid?._id,
                    "bid",
                    { lotTitle: lot?.title, bidPrice: bid?.pricing?.price, currency: bid?.pricing?.currency }
                );

                // Create contract if contract data is provided
                if (contractData) {
                    // Map buyer portal contract to producer portal contract format
                    const contractNumber = contractData.contractNumber ||
                        `CNT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

                    const newContract = await Contract.create({
                        contractNumber: contractNumber,
                        bidId: producerBid?._id,  // Link to ProducerBid
                        rfqId: lot?._id ? lot._id : undefined,  // Link to RFQ/Lot if exists
                        producerBidId: producerBid?._id,
                        buyerContractId: contractData._id,  // Buyer portal's contract _id
                        buyerBidId: bid._id,  // Buyer portal's bid _id
                        buyer: lot?.organization?.name || contractData.buyerName || "Unknown Buyer",
                        buyerLegal: contractData.buyerLegal || contractData.buyerName,
                        buyerContact: contractData.buyerContact || lot?.organization?.contact,
                        buyerEmail: contractData.buyerEmail || lot?.organization?.email,
                        totalVolume: bid?.volume?.amount || contractData.volume?.amount || 0,
                        volumeUnit: (bid?.volume?.unit === "gallons" ? "gal" : "MT") as "MT" | "gal",
                        pricingType: contractData.pricingType || "fixed",
                        fixedPrice: bid?.pricing?.pricePerUnit || contractData.pricing?.pricePerUnit,
                        currency: (bid?.pricing?.currency || contractData.currency || "USD") as "EUR" | "USD" | "GBP",
                        contractValue: bid?.pricing?.price || contractData.totalValue || 0,
                        effectiveDate: contractData.effectiveDate ? new Date(contractData.effectiveDate) : new Date(),
                        endDate: contractData.endDate ? new Date(contractData.endDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year
                        status: contractData.status === "signed" ? "active" : "draft",
                        deliveries: contractData.deliveries || [],
                    });
                    console.log(`📝 Contract created: ${newContract._id} (Contract Number: ${contractNumber})`);

                    // Create notification for contract creation
                    await createNotification(
                        "contract",
                        "📄 Contract Created",
                        `Contract ${contractNumber} has been created for your accepted bid.`,
                        newContract._id?.toString(),
                        "contract",
                        { contractNumber, buyer: lot?.organization?.name }
                    );
                }
                break;

            case "bid.rejected":
                console.log(`❌ Bid rejected: ${bid?.externalBidId}`);

                if (producerBid) {
                    await ProducerBid.findByIdAndUpdate(producerBid._id, {
                        status: "lost",
                        buyerBidId: bid._id,
                        rejectionReason: bid.rejectionReason || payload.reason,
                        updatedAt: new Date(),
                    });
                }

                // Create notification for bid rejection
                await createNotification(
                    "bid",
                    "Bid Rejected",
                    `Your bid for "${lot?.title || 'the lot'}" was not accepted.${bid.rejectionReason ? ` Reason: ${bid.rejectionReason}` : ''}`,
                    producerBid?._id?.toString() || bid?._id,
                    "bid",
                    { lotTitle: lot?.title, reason: bid.rejectionReason }
                );
                break;

            case "bid.counter_offer":
                console.log(`🔄 Counter offer received: ${bid?.externalBidId}`);

                const counterOfferPrice = counterOffer?.price || bid?.counterOffer?.price;
                const counterOfferVolume = counterOffer?.volume || bid?.counterOffer?.volume?.amount;

                if (producerBid) {
                    await ProducerBid.findByIdAndUpdate(producerBid._id, {
                        status: "counter_offer",
                        buyerBidId: bid._id,  // Store buyer's bid ID for counter-bid acceptance
                        counterOffer: {
                            volume: counterOfferVolume || bid?.volume?.amount,
                            pricePerUnit: counterOfferPrice || bid?.pricing?.pricePerUnit,
                            message: counterOffer?.message || bid?.counterOffer?.message || bid?.message,
                            buyerBidId: bid._id,  // Store for acceptCounterBid() call
                            receivedAt: new Date(),
                        },
                        updatedAt: new Date(),
                    });
                    console.log(`📝 Counter-offer stored for ProducerBid ${producerBid._id}, buyerBidId: ${bid._id}`);
                }

                // Create notification for counter offer
                await createNotification(
                    "bid",
                    "💬 Counter-Offer Received",
                    `The buyer has sent a counter-offer for "${lot?.title || 'your bid'}": ${bid?.pricing?.currency || 'USD'} ${counterOfferPrice?.toLocaleString() || 'N/A'} for ${counterOfferVolume?.toLocaleString() || 'N/A'} units.`,
                    producerBid?._id?.toString() || bid?._id,
                    "bid",
                    { lotTitle: lot?.title, counterOfferPrice, counterOfferVolume, message: counterOffer?.message }
                );
                break;

            default:
                console.log(`⚠️ Unknown bid event type: ${event}`);
        }

        return NextResponse.json({
            success: true,
            event,
            bidId: bid?._id || bid?.externalBidId,
            processed: true,
        });
    } catch (error: any) {
        console.error("❌ Bid webhook error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
