import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClaim extends Document {
  airline: string;
  claimType: "carbon_credit" | "corsia" | "red_ii" | "lcfs" | "rins" | "book_and_claim" | "other";
  
  // Volume & Period
  volumeClaimed: number;
  volumeUnit: "MT" | "gal";
  claimPeriod: {
    start: Date;
    end: Date;
  };
  reportingYear: number;
  reportingQuarter?: string;
  
  // SAF Details
  batchNumbers: string[];
  inventoryItemIds: mongoose.Types.ObjectId[];
  carbonIntensity: number; // gCO2e/MJ
  ghgReduction: number; // percentage
  totalEmissionsAvoided: number; // tonnes CO2e
  
  // Regulatory
  scheme: string; // CORSIA, EU RED II, US LCFS, etc.
  certificationBody: string;
  certificateNumber?: string;
  verificationStatus: "pending" | "verified" | "rejected" | "expired";
  verificationDate?: Date;
  verifierName?: string;
  
  // Route/Flight Data (for CORSIA etc.)
  routes: Array<{
    origin: string;
    destination: string;
    volumeUsed: number;
    flightCount?: number;
  }>;
  
  // Credits
  creditsGenerated?: number;
  creditUnit?: string; // MT CO2e, D6 RINs, etc.
  creditValue?: number;
  creditCurrency?: "USD" | "EUR" | "GBP";
  
  // Documents
  supportingDocs: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;
  
  // Status
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "credited";
  submittedDate?: Date;
  approvedDate?: Date;
  rejectionReason?: string;
  
  // Compliance
  auditTrail: Array<{
    action: string;
    performedBy: string;
    timestamp: Date;
    notes?: string;
  }>;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema(
  {
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    volumeUsed: { type: Number, required: true, min: 0 },
    flightCount: { type: Number, min: 0 },
  },
  { _id: false }
);

const DocumentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AuditTrailSchema = new Schema(
  {
    action: { type: String, required: true, trim: true },
    performedBy: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const ClaimSchema = new Schema<IClaim>(
  {
    airline: {
      type: String,
      required: [true, "Airline name is required"],
      trim: true,
      index: true,
    },
    claimType: {
      type: String,
      enum: ["carbon_credit", "corsia", "red_ii", "lcfs", "rins", "book_and_claim", "other"],
      required: [true, "Claim type is required"],
    },
    
    volumeClaimed: {
      type: Number,
      required: [true, "Volume claimed is required"],
      min: [0, "Volume must be positive"],
    },
    volumeUnit: {
      type: String,
      enum: ["MT", "gal"],
      default: "MT",
    },
    claimPeriod: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    reportingYear: {
      type: Number,
      required: [true, "Reporting year is required"],
      min: 2020,
      max: 2100,
    },
    reportingQuarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4"],
    },
    
    batchNumbers: [{ type: String, trim: true }],
    inventoryItemIds: [{ type: Schema.Types.ObjectId, ref: "Inventory" }],
    carbonIntensity: {
      type: Number,
      required: [true, "Carbon intensity is required"],
      min: 0,
    },
    ghgReduction: {
      type: Number,
      required: [true, "GHG reduction is required"],
      min: 0,
      max: 100,
    },
    totalEmissionsAvoided: {
      type: Number,
      required: [true, "Total emissions avoided is required"],
      min: 0,
    },
    
    scheme: {
      type: String,
      required: [true, "Scheme is required"],
      trim: true,
    },
    certificationBody: {
      type: String,
      required: [true, "Certification body is required"],
      trim: true,
    },
    certificateNumber: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "expired"],
      default: "pending",
    },
    verificationDate: { type: Date },
    verifierName: { type: String, trim: true },
    
    routes: { type: [RouteSchema], default: [] },
    
    creditsGenerated: { type: Number, min: 0 },
    creditUnit: { type: String, trim: true },
    creditValue: { type: Number, min: 0 },
    creditCurrency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
    },
    
    supportingDocs: { type: [DocumentSchema], default: [] },
    
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "approved", "rejected", "credited"],
      default: "draft",
      index: true,
    },
    submittedDate: { type: Date },
    approvedDate: { type: Date },
    rejectionReason: { type: String, trim: true },
    
    auditTrail: { type: [AuditTrailSchema], default: [] },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for efficient queries
ClaimSchema.index({ airline: 1, status: 1 });
ClaimSchema.index({ reportingYear: 1, reportingQuarter: 1 });
ClaimSchema.index({ claimType: 1 });
ClaimSchema.index({ submittedDate: -1 });
ClaimSchema.index({ verificationStatus: 1 });

const Claim: Model<IClaim> =
  mongoose.models.Claim || mongoose.model<IClaim>("Claim", ClaimSchema);

export default Claim;











