import mongoose, { Document, Schema, Model } from 'mongoose';

export enum ProposalStatus {
  DRAFT = 'draft',
  LIVE = 'live',
  PASSED = 'passed',
  FAILED = 'failed',
  EXECUTED = 'executed',
  EXECUTION_FAILED = 'execution_failed',
}

export interface IProposal extends Document {
  communityId: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  budgetRequested: number;
  currency: string;
  actionItems: string[];
  rationale: string;
  dissent: string;
  recipient: string;
  deadline: Date | null;
  status: ProposalStatus;
  chatLogId: mongoose.Types.ObjectId | null;
  createdBy: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  txHash: string | null;
  onChainId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const proposalSchema = new Schema<IProposal>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: [true, 'communityId is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Proposal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    summary: {
      type: String,
      required: [true, 'Proposal summary is required'],
      maxlength: [5000, 'Summary cannot exceed 5000 characters'],
    },
    budgetRequested: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Budget cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'GHS',
      trim: true,
    },
    actionItems: {
      type: [String],
      default: [],
    },
    rationale: {
      type: String,
      default: '',
    },
    dissent: {
      type: String,
      default: '',
    },
    recipient: {
      type: String,
      default: '',
      trim: true,
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ProposalStatus),
      default: ProposalStatus.DRAFT,
      index: true,
    },
    chatLogId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatLog',
      default: null,
    },
    createdBy: {
      type: String,
      required: [true, 'createdBy wallet address is required'],
      trim: true,
    },
    yesVotes: { type: Number, default: 0, min: 0 },
    noVotes: { type: Number, default: 0, min: 0 },
    abstainVotes: { type: Number, default: 0, min: 0 },
    txHash: { type: String, default: null },
    onChainId: { type: String, default: null, trim: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for common queries: proposals by community filtered by status
proposalSchema.index({ communityId: 1, status: 1 });

export const Proposal: Model<IProposal> = mongoose.model<IProposal>('Proposal', proposalSchema);
