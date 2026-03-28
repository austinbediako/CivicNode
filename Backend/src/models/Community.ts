import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  adminWallet: string;
  quorumThreshold: number;
  memberCount: number;
  memberWallets: string[];
  onChainId: string | null;
  adminCapId: string | null;
  createdAt: Date;
}

const communitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true,
    },
    adminWallet: {
      type: String,
      required: [true, 'Admin wallet address is required'],
      trim: true,
    },
    quorumThreshold: {
      type: Number,
      required: true,
      default: 51,
      min: [1, 'Quorum threshold must be at least 1%'],
      max: [100, 'Quorum threshold cannot exceed 100%'],
    },
    memberCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    memberWallets: {
      type: [String],
      default: [],
    },
    onChainId: {
      type: String,
      default: null,
      trim: true,
    },
    adminCapId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Community: Model<ICommunity> = mongoose.model<ICommunity>(
  'Community',
  communitySchema
);
