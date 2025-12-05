import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDelivery {
  _id?: mongoose.Types.ObjectId;
  scheduledDate: Date;
  actualDate?: Date;
  volume: number;
  actualVolume?: number;
  location: string;
  status: "scheduled" | "delivered" | "invoiced" | "paid" | "late";
  batchIds?: mongoose.Types.ObjectId[];
  deliveryType?: "physical" | "book_and_claim";
  billOfLading?: string;
  deliveryNote?: string;
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDate?: Date;
  paidDate?: Date;
}

export interface IContract extends Document {
  contractNumber: string;
  rfqId?: mongoose.Types.ObjectId;
  bidId?: mongoose.Types.ObjectId;

  // Parties
  buyer: string;
  buyerLegal?: string;
  buyerContact?: string;
  buyerEmail?: string;
  billingContact?: string;
  billingEmail?: string;

  // Volume & Pricing
  totalVolume: number;
  volumeUnit: "MT" | "gal";
  deliveredVolume: number;
  pricingType: "indexed" | "fixed";
  priceIndex?: string;
  premium?: number;
  fixedPrice?: number;
  currency: "EUR" | "USD" | "GBP";
  contractValue: number;

  // Dates
  signatureDate?: Date;
  effectiveDate: Date;
  endDate: Date;

  // Terms
  incoterms: string;
  paymentTerms: string;
  tolerance: number;
  penaltyAmount?: number;
  gracePeriod?: number;

  // Deliveries
  deliveries: IDelivery[];

  // Documents
  signedContractUrl?: string;
  additionalDocs: { name: string; url: string; type: string }[];

  // Status
  status: "draft" | "scheduled" | "active" | "completed" | "cancelled";
  onTrack: boolean;
  outstandingInvoices: number;

  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    scheduledDate: { type: Date, required: true },
    actualDate: { type: Date },
    volume: { type: Number, required: true, min: 0 },
    actualVolume: { type: Number, min: 0 },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "delivered", "invoiced", "paid", "late"],
      default: "scheduled",
    },
    batchIds: [{ type: Schema.Types.ObjectId, ref: "ProductionBatch" }],
    deliveryType: {
      type: String,
      enum: ["physical", "book_and_claim"],
      default: "physical",
    },
    billOfLading: { type: String },
    deliveryNote: { type: String },
    invoiceNumber: { type: String },
    invoiceAmount: { type: Number },
    invoiceDate: { type: Date },
    paidDate: { type: Date },
  },
  { _id: true }
);

const ContractSchema = new Schema<IContract>(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
    },
    rfqId: { type: Schema.Types.ObjectId, ref: "RFQ" },
    bidId: { type: Schema.Types.ObjectId, ref: "ProducerBid" },

    buyer: { type: String, required: true, trim: true },
    buyerLegal: { type: String, trim: true },
    buyerContact: { type: String, trim: true },
    buyerEmail: { type: String, trim: true },
    billingContact: { type: String, trim: true },
    billingEmail: { type: String, trim: true },

    totalVolume: { type: Number, required: true, min: 0 },
    volumeUnit: { type: String, enum: ["MT", "gal"], default: "MT" },
    deliveredVolume: { type: Number, default: 0, min: 0 },
    pricingType: { type: String, enum: ["indexed", "fixed"], required: true },
    priceIndex: { type: String },
    premium: { type: Number },
    fixedPrice: { type: Number },
    currency: { type: String, enum: ["EUR", "USD", "GBP"], default: "EUR" },
    contractValue: { type: Number, required: true },

    signatureDate: { type: Date },
    effectiveDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    incoterms: { type: String, default: "DAP" },
    paymentTerms: { type: String, default: "Net 30" },
    tolerance: { type: Number, default: 10 },
    penaltyAmount: { type: Number },
    gracePeriod: { type: Number },

    deliveries: { type: [DeliverySchema], default: [] },

    signedContractUrl: { type: String },
    additionalDocs: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
      },
    ],

    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed", "cancelled"],
      default: "draft",
    },
    onTrack: { type: Boolean, default: true },
    outstandingInvoices: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ContractSchema.index({ status: 1, effectiveDate: 1 });
ContractSchema.index({ buyer: 1 });
ContractSchema.index({ contractNumber: 1 });

const Contract: Model<IContract> =
  mongoose.models.Contract ||
  mongoose.model<IContract>("Contract", ContractSchema);

export default Contract;









