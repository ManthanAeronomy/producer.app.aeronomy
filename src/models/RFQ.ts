import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVolumeBreakdown {
  year: number;
  volume: number;
  location: string;
}

export interface IRFQ extends Document {
  // Buyer Information
  buyerCompany: string;
  buyerContact?: string;
  buyerEmail?: string;
  source: "email" | "phone" | "meeting" | "rfp" | "platform";
  originalDocUrl?: string;

  // Volume Requirements
  totalVolume: number;
  volumeUnit: "MT" | "gal";
  volumeBreakdown: IVolumeBreakdown[];

  // Fuel Specifications
  fuelType: "HEFA" | "AtJ" | "PtL" | "FT";
  feedstock: string;
  minGHGReduction: number;

  // Pricing
  pricingType: "indexed" | "fixed" | "hybrid";
  priceIndex?: string;
  premium?: number;
  targetPrice?: number;
  currency: "EUR" | "USD" | "GBP";

  // Terms
  incoterms: string;
  paymentTerms: string;
  responseDeadline: Date;

  // Certifications
  requiredCerts: string[];

  // Status & Tracking
  status: "open" | "watching" | "closed" | "awarded";
  fitStatus: "good" | "possible" | "cannot" | "pending";
  isWatching: boolean;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const VolumeBreakdownSchema = new Schema<IVolumeBreakdown>(
  {
    year: { type: Number, required: true },
    volume: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const RFQSchema = new Schema<IRFQ>(
  {
    buyerCompany: {
      type: String,
      required: [true, "Buyer company is required"],
      trim: true,
    },
    buyerContact: { type: String, trim: true },
    buyerEmail: { type: String, trim: true },
    source: {
      type: String,
      enum: ["email", "phone", "meeting", "rfp", "platform"],
      default: "platform",
    },
    originalDocUrl: { type: String, trim: true },

    totalVolume: {
      type: Number,
      required: [true, "Total volume is required"],
      min: [0, "Volume must be positive"],
    },
    volumeUnit: {
      type: String,
      enum: ["MT", "gal"],
      default: "MT",
    },
    volumeBreakdown: {
      type: [VolumeBreakdownSchema],
      default: [],
    },

    fuelType: {
      type: String,
      enum: ["HEFA", "AtJ", "PtL", "FT"],
      required: [true, "Fuel type is required"],
    },
    feedstock: { type: String, default: "Any", trim: true },
    minGHGReduction: {
      type: Number,
      required: [true, "Min GHG reduction is required"],
      min: 0,
      max: 100,
    },

    pricingType: {
      type: String,
      enum: ["indexed", "fixed", "hybrid"],
      required: true,
    },
    priceIndex: { type: String, trim: true },
    premium: { type: Number },
    targetPrice: { type: Number },
    currency: {
      type: String,
      enum: ["EUR", "USD", "GBP"],
      default: "EUR",
    },

    incoterms: { type: String, default: "DAP", trim: true },
    paymentTerms: { type: String, default: "Net 30", trim: true },
    responseDeadline: {
      type: Date,
      required: [true, "Response deadline is required"],
    },

    requiredCerts: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["open", "watching", "closed", "awarded"],
      default: "open",
    },
    fitStatus: {
      type: String,
      enum: ["good", "possible", "cannot", "pending"],
      default: "pending",
    },
    isWatching: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

RFQSchema.index({ status: 1, responseDeadline: 1 });
RFQSchema.index({ buyerCompany: 1 });
RFQSchema.index({ isWatching: 1 });
RFQSchema.index({ fitStatus: 1 });

const RFQ: Model<IRFQ> =
  mongoose.models.RFQ || mongoose.model<IRFQ>("RFQ", RFQSchema);

export default RFQ;









