import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBatchAllocation {
  contractId: mongoose.Types.ObjectId;
  contractNumber: string;
  volume: number;
  allocatedAt: Date;
}

export interface IProductionBatch extends Document {
  batchNumber: string;
  productionDate: Date;
  plantId: mongoose.Types.ObjectId;
  plantName: string;

  volume: number;
  volumeUnit: "MT" | "gal";
  feedstockType: string;
  feedstockSupplier?: string;
  feedstockOrigin?: string;

  ghgReduction: number;
  meetsASTM: boolean;
  meetsISCC: boolean;
  meetsCORSIA: boolean;

  allocations: IBatchAllocation[];
  allocatedVolume: number;
  availableVolume: number;

  status: "available" | "partially_allocated" | "fully_allocated" | "delivered";
  qualityCertificateUrl?: string;
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BatchAllocationSchema = new Schema<IBatchAllocation>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    contractNumber: { type: String, required: true },
    volume: { type: Number, required: true, min: 0 },
    allocatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProductionBatchSchema = new Schema<IProductionBatch>(
  {
    batchNumber: {
      type: String,
      required: true,
      unique: true,
    },
    productionDate: {
      type: Date,
      required: [true, "Production date is required"],
    },
    plantId: {
      type: Schema.Types.ObjectId,
      ref: "Plant",
      required: [true, "Plant ID is required"],
    },
    plantName: {
      type: String,
      required: true,
    },

    volume: {
      type: Number,
      required: [true, "Volume is required"],
      min: 0,
    },
    volumeUnit: {
      type: String,
      enum: ["MT", "gal"],
      default: "MT",
    },
    feedstockType: {
      type: String,
      required: [true, "Feedstock type is required"],
    },
    feedstockSupplier: { type: String },
    feedstockOrigin: { type: String },

    ghgReduction: {
      type: Number,
      required: [true, "GHG reduction is required"],
      min: 0,
      max: 100,
    },
    meetsASTM: { type: Boolean, default: true },
    meetsISCC: { type: Boolean, default: true },
    meetsCORSIA: { type: Boolean, default: true },

    allocations: { type: [BatchAllocationSchema], default: [] },
    allocatedVolume: { type: Number, default: 0 },
    availableVolume: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["available", "partially_allocated", "fully_allocated", "delivered"],
      default: "available",
    },
    qualityCertificateUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to calculate available volume and status
ProductionBatchSchema.pre("save", function (next) {
  this.allocatedVolume = this.allocations.reduce((sum, a) => sum + a.volume, 0);
  this.availableVolume = this.volume - this.allocatedVolume;

  if (this.availableVolume <= 0) {
    this.status = "fully_allocated";
  } else if (this.allocatedVolume > 0) {
    this.status = "partially_allocated";
  } else {
    this.status = "available";
  }

  next();
});

ProductionBatchSchema.index({ plantId: 1, productionDate: -1 });
ProductionBatchSchema.index({ status: 1 });
ProductionBatchSchema.index({ batchNumber: 1 });

const ProductionBatch: Model<IProductionBatch> =
  mongoose.models.ProductionBatch ||
  mongoose.model<IProductionBatch>("ProductionBatch", ProductionBatchSchema);

export default ProductionBatch;









