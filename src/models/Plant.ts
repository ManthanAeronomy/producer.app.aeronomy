import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlantCertification {
  name: string;
  status: "valid" | "expiring" | "expired";
  validUntil: Date;
  certificateId?: mongoose.Types.ObjectId;
}

export interface IPlant extends Document {
  name: string;
  location: string;
  pathway: string;
  primaryFeedstock: string;
  annualCapacity: number;
  ghgReduction: number;
  certifications: IPlantCertification[];
  status: "active" | "inactive" | "maintenance";
  createdAt: Date;
  updatedAt: Date;
}

const PlantCertificationSchema = new Schema<IPlantCertification>(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["valid", "expiring", "expired"],
      default: "valid",
    },
    validUntil: { type: Date, required: true },
    certificateId: { type: Schema.Types.ObjectId, ref: "Certificate" },
  },
  { _id: false }
);

const PlantSchema = new Schema<IPlant>(
  {
    name: {
      type: String,
      required: [true, "Plant name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    pathway: {
      type: String,
      required: [true, "Pathway is required"],
      trim: true,
    },
    primaryFeedstock: {
      type: String,
      required: [true, "Primary feedstock is required"],
      trim: true,
    },
    annualCapacity: {
      type: Number,
      required: [true, "Annual capacity is required"],
      min: 0,
    },
    ghgReduction: {
      type: Number,
      required: [true, "GHG reduction is required"],
      min: 0,
      max: 100,
    },
    certifications: {
      type: [PlantCertificationSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
  },
  { timestamps: true }
);

PlantSchema.index({ status: 1 });
PlantSchema.index({ name: 1 });

const Plant: Model<IPlant> =
  mongoose.models.Plant || mongoose.model<IPlant>("Plant", PlantSchema);

export default Plant;









