import mongoose, { Document, Schema, Model } from 'mongoose';

export enum VoteChoice {
  YES = 'yes',
  NO = 'no',
  ABSTAIN = 'abstain',
}

export interface IVote extends Document {
  proposalId: mongoose.Types.ObjectId;
  voterWallet: string;
  choice: VoteChoice;
  txHash: string | null;
  votedAt: Date;
}

const voteSchema = new Schema<IVote>({
  proposalId: {
    type: Schema.Types.ObjectId,
    ref: 'Proposal',
    required: [true, 'proposalId is required'],
    index: true,
  },
  voterWallet: {
    type: String,
    required: [true, 'voterWallet is required'],
    trim: true,
  },
  choice: {
    type: String,
    enum: Object.values(VoteChoice),
    required: [true, 'Vote choice is required'],
  },
  txHash: {
    type: String,
    default: null,
  },
  votedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent double voting: one vote per wallet per proposal
voteSchema.index({ proposalId: 1, voterWallet: 1 }, { unique: true });

export const Vote: Model<IVote> = mongoose.model<IVote>('Vote', voteSchema);
