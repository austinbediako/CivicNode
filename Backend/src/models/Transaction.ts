import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITransaction extends Document {
  communityId: mongoose.Types.ObjectId | null;
  proposalId: mongoose.Types.ObjectId | null;
  amount: number;
  recipient: string;
  txHash: string;
  confirmedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  communityId: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    default: null,
    index: true,
  },
  proposalId: {
    type: Schema.Types.ObjectId,
    ref: 'Proposal',
    default: null,
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  recipient: {
    type: String,
    required: [true, 'Recipient address is required'],
    trim: true,
  },
  txHash: {
    type: String,
    required: [true, 'Transaction hash is required'],
    trim: true,
    index: true,
  },
  confirmedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema
);
