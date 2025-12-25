import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlantAllocation {
  plantId: mongoose.Types.ObjectId;
  plantName: string;
  allocations: { year: number; volume: number }[];
}

export interface IApprover {
  userId?: string;
  name: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  decidedAt?: Date;
  comments?: string;
}

export interface IProducerBid extends Document {
  bidNumber: string;
  version: number;
  rfqId: mongoose.Types.ObjectId;

  // Supply Source
  plantAllocations: IPlantAllocation[];
  blendedGHGReduction: number;

  // Pricing
  pricingType: "indexed" | "fixed";
  priceIndex?: string;
  premium?: number;
  fixedPrices?: { year: number; price: number }[];
  currency: "EUR" | "USD" | "GBP";
  estimatedValue: number;
  estimatedMargin: number;

  // Terms
  incoterms: string;
  paymentTerms: string;
  deliverySchedule: "rfq" | "custom";
  customSchedule?: { year: number; quarter: string; volume: number }[];
  acceptPenalties: boolean;
  penaltyAmount?: number;
  gracePeriod?: number;
  maxLiability?: number;
  tolerance: number;
  specialTerms?: string;

  // Documents
  attachedDocuments: string[];

  // Approval
  requiresApproval: boolean;
  approvalReasons?: string[];
  approvers: IApprover[];
  approvalMode: "sequential" | "parallel";
  approvalNotes?: string;

  // Status
  status: "draft" | "pending_approval" | "submitted" | "won" | "lost" | "withdrawn";
  submittedAt?: Date;
  decidedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PlantAllocationSchema = new Schema<IPlantAllocation>(
  {
    plantId: { type: Schema.Types.ObjectId, ref: "Plant", required: true },
    plantName: { type: String, required: true },
    allocations: [
      {
        year: { type: Number, required: true },
        volume: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { _id: false }
);

const ApproverSchema = new Schema<IApprover>(
  {
    userId: { type: String },
    name: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    decidedAt: { type: Date },
    comments: { type: String },
  },
  { _id: false }
);

const ProducerBidSchema = new Schema<IProducerBid>(
  {
    bidNumber: {
      type: String,
      required: true,
      unique: true,
    },
    version: { type: Number, default: 1 },
    rfqId: {
      type: Schema.Types.ObjectId,
      ref: "RFQ",
      required: [true, "RFQ ID is required"],
    },

    plantAllocations: {
      type: [PlantAllocationSchema],
      default: [],
    },
    blendedGHGReduction: { type: Number, min: 0, max: 100 },

    pricingType: {
      type: String,
      enum: ["indexed", "fixed"],
      required: true,
    },
    priceIndex: { type: String },
    premium: { type: Number },
    fixedPrices: [
      {
        year: { type: Number },
        price: { type: Number },
      },
    ],
    currency: {
      type: String,
      enum: ["EUR", "USD", "GBP"],
      default: "EUR",
    },
    estimatedValue: { type: Number, default: 0 },
    estimatedMargin: { type: Number, default: 0 },

    incoterms: { type: String, default: "DAP" },
    paymentTerms: { type: String, default: "Net 30" },
    deliverySchedule: {
      type: String,
      enum: ["rfq", "custom"],
      default: "rfq",
    },
    customSchedule: [
      {
        year: { type: Number },
        quarter: { type: String },
        volume: { type: Number },
      },
    ],
    acceptPenalties: { type: Boolean, default: true },
    penaltyAmount: { type: Number },
    gracePeriod: { type: Number },
    maxLiability: { type: Number },
    tolerance: { type: Number, default: 10 },
    specialTerms: { type: String },

    attachedDocuments: { type: [String], default: [] },

    requiresApproval: { type: Boolean, default: false },
    approvalReasons: { type: [String], default: [] },
    approvers: { type: [ApproverSchema], default: [] },
    approvalMode: {
      type: String,
      enum: ["sequential", "parallel"],
      default: "sequential",
    },
    approvalNotes: { type: String },

    status: {
      type: String,
      enum: ["draft", "pending_approval", "submitted", "won", "lost", "withdrawn"],
      default: "draft",
    },
    submittedAt: { type: Date },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

ProducerBidSchema.index({ rfqId: 1, status: 1 });
ProducerBidSchema.index({ status: 1, createdAt: -1 });
ProducerBidSchema.index({ bidNumber: 1 });

const ProducerBid: Model<IProducerBid> =
  mongoose.models.ProducerBid ||
  mongoose.model<IProducerBid>("ProducerBid", ProducerBidSchema);

export default ProducerBid;
















