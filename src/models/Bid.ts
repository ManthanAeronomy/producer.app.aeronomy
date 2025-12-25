import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBid extends Document {
  tenderId: mongoose.Types.ObjectId;
  lotId?: mongoose.Types.ObjectId;
  producerId?: string;
  producerName?: string;
  volume: number;
  price: number;
  notes: string;
  status: "submitted" | "under_review" | "accepted" | "rejected" | "withdrawn";
  submittedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    tenderId: {
      type: Schema.Types.ObjectId,
      ref: "Lot",
      required: [true, "Tender ID is required"],
    },
    lotId: {
      type: Schema.Types.ObjectId,
      ref: "Lot",
    },
    producerId: {
      type: String,
      trim: true,
    },
    producerName: {
      type: String,
      trim: true,
    },
    volume: {
      type: Number,
      required: [true, "Bid volume is required"],
      min: [0, "Volume must be positive"],
    },
    price: {
      type: Number,
      required: [true, "Bid price is required"],
      min: [0, "Price must be positive"],
    },
    notes: {
      type: String,
      required: [true, "Bid notes are required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "accepted", "rejected", "withdrawn"],
      default: "submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
BidSchema.index({ tenderId: 1, status: 1 });
BidSchema.index({ producerId: 1 });
BidSchema.index({ status: 1, submittedAt: -1 });
BidSchema.index({ lotId: 1 });

const Bid: Model<IBid> =
  mongoose.models.Bid || mongoose.model<IBid>("Bid", BidSchema);

export default Bid;

























