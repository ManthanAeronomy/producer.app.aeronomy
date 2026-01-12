import connectDB from "./mongodb";
import Lot, { ILot } from "@/models/Lot";
import Bid, { IBid } from "@/models/Bid";
import Deal, { IDeal } from "@/models/Deal";
import ComplianceDoc, { IComplianceDoc } from "@/models/ComplianceDoc";
import type {
  CreateTenderInput,
  UpdateTenderInput,
  CreateBidInput,
} from "@/types/tender";
import mongoose from "mongoose";

// Helper to convert ILot to Tender format
const lotToTender = (lot: ILot) => ({
  id: String(lot._id),
  airline: lot.airline,
  lotName: lot.lotName,
  volume: lot.volume,
  volumeUnit: lot.volumeUnit,
  pricePerUnit: lot.pricePerUnit,
  currency: lot.currency,
  ciScore: lot.ciScore,
  location: lot.location,
  deliveryWindow: lot.deliveryWindow,
  longTerm: lot.longTerm,
  postedOn: lot.postedOn,
});

export const dataStore = {
  // Tender/Lot operations
  async getAllTenders() {
    await connectDB();
    const lots = await Lot.find({ status: "open" }).sort({ createdAt: -1 });
    return lots.map(lotToTender);
  },

  async getTenderById(id: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const lot = await Lot.findById(id);
    return lot ? lotToTender(lot) : null;
  },

  async createTender(input: CreateTenderInput) {
    await connectDB();
    const lot = await Lot.create({
      ...input,
      status: "open",
    });
    return lotToTender(lot);
  },

  async updateTender(id: string, input: UpdateTenderInput) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const lot = await Lot.findByIdAndUpdate(
      id,
      { ...input },
      { new: true, runValidators: true }
    );
    return lot ? lotToTender(lot) : null;
  },

  async deleteTender(id: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Lot.findByIdAndDelete(id);
    return !!result;
  },

  // Bid operations
  async getAllBids() {
    await connectDB();
    const bids = await Bid.find().sort({ submittedAt: -1 });
    return bids.map((bid) => ({
      id: String(bid._id),
      tenderId: bid.tenderId.toString(),
      volume: bid.volume,
      price: bid.price,
      notes: bid.notes,
      submittedAt: bid.submittedAt.toISOString(),
    }));
  },

  async getBidsByTenderId(tenderId: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(tenderId)) {
      return [];
    }
    const bids = await Bid.find({ tenderId }).sort({ submittedAt: -1 });
    return bids.map((bid) => ({
      id: String(bid._id),
      tenderId: bid.tenderId.toString(),
      volume: bid.volume,
      price: bid.price,
      notes: bid.notes,
      submittedAt: bid.submittedAt.toISOString(),
    }));
  },

  async createBid(input: CreateBidInput) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(input.tenderId)) {
      throw new Error("Invalid tender ID");
    }
    const bid = await Bid.create({
      tenderId: input.tenderId,
      lotId: input.tenderId,
      volume: input.volume,
      price: input.price,
      notes: input.notes,
      status: "submitted",
      submittedAt: new Date(),
    });
    return {
      id: String(bid._id),
      tenderId: bid.tenderId.toString(),
      volume: bid.volume,
      price: bid.price,
      notes: bid.notes,
      submittedAt: bid.submittedAt.toISOString(),
    };
  },

  // Deal operations
  async getAllDeals() {
    await connectDB();
    const deals = await Deal.find().sort({ createdAt: -1 });
    return deals;
  },

  async getDealById(id: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const deal = await Deal.findById(id);
    return deal;
  },

  async getDealsByProducerId(producerId: string) {
    await connectDB();
    const deals = await Deal.find({ producerId }).sort({ createdAt: -1 });
    return deals;
  },

  async createDeal(input: Partial<IDeal>) {
    await connectDB();
    const deal = await Deal.create(input);
    return deal;
  },

  async updateDeal(id: string, input: Partial<IDeal>) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const deal = await Deal.findByIdAndUpdate(
      id,
      { ...input },
      { new: true, runValidators: true }
    );
    return deal;
  },

  async deleteDeal(id: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await Deal.findByIdAndDelete(id);
    return !!result;
  },

  // Compliance Document operations
  async getAllComplianceDocs() {
    await connectDB();
    const docs = await ComplianceDoc.find().sort({ issueDate: -1 });
    return docs;
  },

  async getComplianceDocById(id: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await ComplianceDoc.findById(id);
    return doc;
  },

  async getComplianceDocsByProducerId(producerId: string) {
    await connectDB();
    const docs = await ComplianceDoc.find({ producerId }).sort({
      issueDate: -1,
    });
    return docs;
  },

  async createComplianceDoc(input: Partial<IComplianceDoc>) {
    await connectDB();
    const doc = await ComplianceDoc.create(input);
    return doc;
  },

  async updateComplianceDoc(id: string, input: Partial<IComplianceDoc>) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await ComplianceDoc.findByIdAndUpdate(
      id,
      { ...input },
      { new: true, runValidators: true }
    );
    return doc;
  },

  async deleteComplianceDoc(id: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await ComplianceDoc.findByIdAndDelete(id);
    return !!result;
  },
};
