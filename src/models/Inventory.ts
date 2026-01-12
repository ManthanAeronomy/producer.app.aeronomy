import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInventoryItem extends Document {
  airline: string;
  productName: string;
  productType: "HEFA" | "FT" | "ATJ" | "SIP" | "Other";
  producerName: string;
  producerId?: string;
  batchNumber: string;
  
  // Volume
  totalVolume: number;
  allocatedVolume: number;
  availableVolume: number;
  volumeUnit: "MT" | "gal";
  
  // Quality & Compliance
  carbonIntensity: number; // gCO2e/MJ
  ghgReduction: number; // percentage
  certifications: string[]; // ISCC EU, RSB, etc.
  pathway: string;
  feedstock: string;
  
  // Location & Dates
  storageLocation: string;
  airportCode?: string;
  receivedDate: Date;
  expiryDate?: Date;
  
  // Contract & Pricing
  contractId?: mongoose.Types.ObjectId;
  purchasePrice: number;
  currency: "USD" | "EUR" | "GBP";
  
  // Status
  status: "in_transit" | "available" | "allocated" | "depleted" | "expired";
  qualityCheckStatus: "pending" | "passed" | "failed";
  qualityCheckDate?: Date;
  qualityNotes?: string;
  
  // Allocations
  allocations: Array<{
    flightNumber?: string;
    route?: string;
    allocatedVolume: number;
    allocatedDate: Date;
    usedDate?: Date;
    status: "planned" | "used" | "cancelled";
  }>;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AllocationSchema = new Schema(
  {
    flightNumber: { type: String, trim: true },
    route: { type: String, trim: true },
    allocatedVolume: { type: Number, required: true, min: 0 },
    allocatedDate: { type: Date, required: true },
    usedDate: { type: Date },
    status: {
      type: String,
      enum: ["planned", "used", "cancelled"],
      default: "planned",
    },
  },
  { _id: true }
);

const InventorySchema = new Schema<IInventoryItem>(
  {
    airline: {
      type: String,
      required: [true, "Airline name is required"],
      trim: true,
      index: true,
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    productType: {
      type: String,
      enum: ["HEFA", "FT", "ATJ", "SIP", "Other"],
      required: [true, "Product type is required"],
    },
    producerName: {
      type: String,
      required: [true, "Producer name is required"],
      trim: true,
    },
    producerId: { type: String, trim: true },
    batchNumber: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
      unique: true,
    },
    
    totalVolume: {
      type: Number,
      required: [true, "Total volume is required"],
      min: [0, "Volume must be positive"],
    },
    allocatedVolume: { type: Number, default: 0, min: 0 },
    availableVolume: { type: Number, required: true, min: 0 },
    volumeUnit: {
      type: String,
      enum: ["MT", "gal"],
      default: "MT",
    },
    
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
    certifications: [{ type: String, trim: true }],
    pathway: { type: String, required: true, trim: true },
    feedstock: { type: String, required: true, trim: true },
    
    storageLocation: {
      type: String,
      required: [true, "Storage location is required"],
      trim: true,
    },
    airportCode: { type: String, trim: true },
    receivedDate: {
      type: Date,
      required: [true, "Received date is required"],
    },
    expiryDate: { type: Date },
    
    contractId: { type: Schema.Types.ObjectId, ref: "Contract" },
    purchasePrice: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
    },
    
    status: {
      type: String,
      enum: ["in_transit", "available", "allocated", "depleted", "expired"],
      default: "available",
      index: true,
    },
    qualityCheckStatus: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },
    qualityCheckDate: { type: Date },
    qualityNotes: { type: String, trim: true },
    
    allocations: { type: [AllocationSchema], default: [] },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for efficient queries
InventorySchema.index({ airline: 1, status: 1 });
InventorySchema.index({ batchNumber: 1 }, { unique: true });
InventorySchema.index({ storageLocation: 1 });
InventorySchema.index({ receivedDate: -1 });
InventorySchema.index({ expiryDate: 1 });

// Virtual for calculating available percentage
InventorySchema.virtual("availablePercentage").get(function () {
  return this.totalVolume > 0 
    ? Math.round((this.availableVolume / this.totalVolume) * 100) 
    : 0;
});

const Inventory: Model<IInventoryItem> =
  mongoose.models.Inventory ||
  mongoose.model<IInventoryItem>("Inventory", InventorySchema);

export default Inventory;











