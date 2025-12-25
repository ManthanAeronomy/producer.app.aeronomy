import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeal extends Document {
  lotId: mongoose.Types.ObjectId;
  producerId?: string;
  producerName?: string;
  airline: string;
  lotName: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  agreedPrice: number;
  currency: "USD" | "EUR" | "GBP";
  ciScore: number;
  location: string;
  deliveryWindow: string;
  contractStartDate: Date;
  contractEndDate?: Date;
  status: "draft" | "pending" | "executed" | "active" | "completed" | "terminated";
  milestones: Array<{
    description: string;
    dueDate: Date;
    status: "pending" | "completed" | "overdue";
    completedAt?: Date;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema(
  {
    description: {
      type: String,
      required: [true, "Milestone description is required"],
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Milestone due date is required"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "overdue"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const DealSchema = new Schema<IDeal>(
  {
    lotId: {
      type: Schema.Types.ObjectId,
      ref: "Lot",
      required: [true, "Lot ID is required"],
    },
    producerId: {
      type: String,
      trim: true,
    },
    producerName: {
      type: String,
      trim: true,
    },
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
    agreedPrice: {
      type: Number,
      required: [true, "Agreed price is required"],
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
    contractStartDate: {
      type: Date,
      required: [true, "Contract start date is required"],
    },
    contractEndDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "executed", "active", "completed", "terminated"],
      default: "draft",
    },
    milestones: {
      type: [MilestoneSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
DealSchema.index({ lotId: 1 });
DealSchema.index({ producerId: 1 });
DealSchema.index({ status: 1, createdAt: -1 });
DealSchema.index({ airline: 1 });
DealSchema.index({ contractStartDate: 1 });

const Deal: Model<IDeal> =
  mongoose.models.Deal || mongoose.model<IDeal>("Deal", DealSchema);

export default Deal;

























