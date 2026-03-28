import mongoose, { Document, Schema, Model } from 'mongoose';

// Inline the enum so we don't depend on uninstalled package at runtime
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

export interface IUser extends Document {
  walletAddress: string;
  role: UserRole;
  communityId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: [true, 'walletAddress is required'],
      unique: true,
      index: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.MEMBER,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
