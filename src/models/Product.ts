import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  producerId: string;
  name: string;
  pathway: string; // e.g., "HEFA", "AtJ", "PtL"
  feedstock: string; // e.g., "UCO", "Tallow"
  ghgReduction: number; // typical percentage
  plantId: mongoose.Types.ObjectId;
  plantName: string;

  specifications: {
    astmAnnex?: string; // e.g., "A2"
    maxBlendRatio?: number; // percentage
    freezePoint?: number; // in Celsius
    flashPoint?: number;
    density?: number;
  };

  eligibleSchemes: string[]; // e.g., ["ISCC EU", "CORSIA", "RED II"]
  status: "active" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    producerId: {
      type: String,
      required: [true, "Producer ID is required"],
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    pathway: {
      type: String,
      required: [true, "Pathway is required"],
    },
    feedstock: {
      type: String,
      required: [true, "Feedstock is required"],
    },
    ghgReduction: {
      type: Number,
      required: [true, "GHG reduction is required"],
      min: 0,
      max: 100,
    },
    plantId: {
      type: Schema.Types.ObjectId,
      ref: "Plant",
      required: [true, "Plant ID is required"],
    },
    plantName: { type: String, required: true },

    specifications: {
      astmAnnex: { type: String },
      maxBlendRatio: { type: Number, min: 0, max: 100 },
      freezePoint: { type: Number },
      flashPoint: { type: Number },
      density: { type: Number },
    },

    eligibleSchemes: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

ProductSchema.index({ producerId: 1, status: 1 });
ProductSchema.index({ plantId: 1 });
ProductSchema.index({ pathway: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;























