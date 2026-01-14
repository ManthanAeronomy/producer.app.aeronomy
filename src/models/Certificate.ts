import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificate extends Document {
  producerId: string;
  name: string;
  certificateType:
    | "ISCC EU"
    | "ISCC CORSIA"
    | "RSB"
    | "ASTM D7566"
    | "RED II"
    | "National Scheme"
    | "ISO"
    | "Other";
  issuingBody: string;
  certificateNumber: string;

  issueDate: Date;
  expiryDate: Date;

  appliesTo: {
    plants: Array<{
      plantId: mongoose.Types.ObjectId;
      plantName: string;
    }>;
    products: Array<{
      productId: mongoose.Types.ObjectId;
      productName: string;
    }>;
    entireCompany: boolean;
  };

  fileUrl: string;
  fileKey: string;
  notes?: string;

  status: "valid" | "expiring" | "expired";

  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    producerId: {
      type: String,
      required: [true, "Producer ID is required"],
    },
    name: {
      type: String,
      required: [true, "Certificate name is required"],
    },
    certificateType: {
      type: String,
      enum: [
        "ISCC EU",
        "ISCC CORSIA",
        "RSB",
        "ASTM D7566",
        "RED II",
        "National Scheme",
        "ISO",
        "Other",
      ],
      required: [true, "Certificate type is required"],
    },
    issuingBody: {
      type: String,
      required: [true, "Issuing body is required"],
    },
    certificateNumber: {
      type: String,
      required: [true, "Certificate number is required"],
    },

    issueDate: {
      type: Date,
      required: [true, "Issue date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },

    appliesTo: {
      plants: [
        {
          plantId: { type: Schema.Types.ObjectId, ref: "Plant" },
          plantName: { type: String },
        },
      ],
      products: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          productName: { type: String },
        },
      ],
      entireCompany: { type: Boolean, default: false },
    },

    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileKey: {
      type: String,
      required: [true, "File key is required"],
    },
    notes: { type: String },

    status: {
      type: String,
      enum: ["valid", "expiring", "expired"],
      default: "valid",
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate status based on expiry date
CertificateSchema.pre("save", function (next) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (this.expiryDate < now) {
    this.status = "expired";
  } else if (this.expiryDate < thirtyDaysFromNow) {
    this.status = "expiring";
  } else {
    this.status = "valid";
  }

  next();
});

CertificateSchema.index({ producerId: 1, status: 1 });
CertificateSchema.index({ certificateType: 1 });
CertificateSchema.index({ expiryDate: 1 });

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;























