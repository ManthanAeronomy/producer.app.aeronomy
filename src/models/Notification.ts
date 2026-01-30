import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType = "bid" | "contract" | "tender" | "info";

export interface INotification extends Document {
    type: NotificationType;
    title: string;
    message: string;
    userId?: string; // Clerk userId (optional, for user-specific notifications)
    relatedId?: string; // Reference to related entity (bid, contract, etc.)
    relatedType?: string; // Type of related entity
    read: boolean;
    metadata?: Record<string, any>; // Additional data
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
    {
        type: {
            type: String,
            enum: ["bid", "contract", "tender", "info"],
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        userId: {
            type: String,
            trim: true,
            index: true,
        },
        relatedId: {
            type: String,
            trim: true,
        },
        relatedType: {
            type: String,
            trim: true,
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

const Notification: Model<INotification> =
    mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
