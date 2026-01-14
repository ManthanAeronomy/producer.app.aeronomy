import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganizationSettings extends Document {
    organizationId: string;
    companyName: string;
    legalName: string;
    registrationNumber: string;
    vatNumber: string;
    address: string;
    website: string;
    onboardingComplete: boolean;
    primaryContact: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSettingsSchema = new Schema<IOrganizationSettings>(
    {
        organizationId: {
            type: String,
            required: true,
            unique: true,
            default: "default",
        },
        companyName: {
            type: String,
            required: true,
            default: "",
        },
        legalName: {
            type: String,
            default: "",
        },
        registrationNumber: {
            type: String,
            default: "",
        },
        vatNumber: {
            type: String,
            default: "",
        },
        address: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default: "",
        },
        onboardingComplete: {
            type: Boolean,
            default: false,
        },
        primaryContact: {
            name: {
                type: String,
                default: "",
            },
            email: {
                type: String,
                default: "",
            },
            phone: {
                type: String,
                default: "",
            },
        },
    },
    {
        timestamps: true,
    }
);

// Use existing model if available (for hot reload in development)
const OrganizationSettings: Model<IOrganizationSettings> =
    mongoose.models.OrganizationSettings ||
    mongoose.model<IOrganizationSettings>(
        "OrganizationSettings",
        OrganizationSettingsSchema
    );

export default OrganizationSettings;
