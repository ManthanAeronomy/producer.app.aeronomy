import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComplianceDoc extends Document {
  producerId?: string;
  producerName?: string;
  documentType:
    | "sustainability_certification"
    | "audit_report"
    | "emissions_disclosure"
    | "feedstock_certification"
    | "production_certificate"
    | "other";
  title: string;
  description?: string;
  certificationBody?: string;
  certificateNumber?: string;
  issueDate: Date;
  expiryDate?: Date;
  status: "active" | "expired" | "pending_renewal" | "revoked";
  fileUrl?: string;
  fileKey?: string;
  metadata?: {
    [key: string]: any;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceDocSchema = new Schema<IComplianceDoc>(
  {
    producerId: {
      type: String,
      trim: true,
    },
    producerName: {
      type: String,
      trim: true,
    },
    documentType: {
      type: String,
      enum: [
        "sustainability_certification",
        "audit_report",
        "emissions_disclosure",
        "feedstock_certification",
        "production_certificate",
        "other",
      ],
      required: [true, "Document type is required"],
    },
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    certificationBody: {
      type: String,
      trim: true,
    },
    certificateNumber: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "expired", "pending_renewal", "revoked"],
      default: "active",
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileKey: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ComplianceDocSchema.index({ producerId: 1, status: 1 });
ComplianceDocSchema.index({ documentType: 1 });
ComplianceDocSchema.index({ status: 1, expiryDate: 1 });
ComplianceDocSchema.index({ issueDate: -1 });
ComplianceDocSchema.index({ tags: 1 });

// Virtual to check if document is expired
ComplianceDocSchema.virtual("isExpired").get(function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Pre-save hook to update status based on expiry date
ComplianceDocSchema.pre("save", function (next) {
  if (this.expiryDate && new Date() > this.expiryDate && this.status === "active") {
    this.status = "expired";
  }
  next();
});

const ComplianceDoc: Model<IComplianceDoc> =
  mongoose.models.ComplianceDoc ||
  mongoose.model<IComplianceDoc>("ComplianceDoc", ComplianceDocSchema);

export default ComplianceDoc;

























