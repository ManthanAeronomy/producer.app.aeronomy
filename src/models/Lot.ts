import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILot extends Document {
  airline: string;
  lotName: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  pricePerUnit: number;
  currency: "USD" | "EUR" | "GBP";
  ciScore: number;
  location: string;
  deliveryWindow: string;
  longTerm: boolean;
  postedOn: string;
  status: "open" | "closed" | "awarded";
  createdAt: Date;
  updatedAt: Date;
}

const LotSchema = new Schema<ILot>(
  {
    airline: {
      type: String,
      required: [true, "Airline name is required"],
      trim: true,
    },
    lotName: {
      type: String,
      required: [true, "Lot name is required"],
      trim: true,
    },
    volume: {
      type: Number,
      required: [true, "Volume is required"],
      min: [0, "Volume must be positive"],
    },
    volumeUnit: {
      type: String,
      enum: ["MT", "gal"],
      required: [true, "Volume unit is required"],
      default: "MT",
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0, "Price must be positive"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      required: [true, "Currency is required"],
      default: "USD",
    },
    ciScore: {
      type: Number,
      required: [true, "CI score is required"],
      min: [0, "CI score must be positive"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    deliveryWindow: {
      type: String,
      required: [true, "Delivery window is required"],
      trim: true,
    },
    longTerm: {
      type: Boolean,
      default: false,
    },
    postedOn: {
      type: String,
      required: [true, "Posted date is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "awarded"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
LotSchema.index({ status: 1, createdAt: -1 });
LotSchema.index({ airline: 1 });
LotSchema.index({ longTerm: 1 });

const Lot: Model<ILot> =
  mongoose.models.Lot || mongoose.model<ILot>("Lot", LotSchema);

export default Lot;


















