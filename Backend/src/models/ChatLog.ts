import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IChatLog extends Document {
  communityId: mongoose.Types.ObjectId;
  uploadedBy: string;
  sanitizedText: string;
  uploadedAt: Date;
}

const chatLogSchema = new Schema<IChatLog>({
  communityId: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: [true, 'communityId is required'],
    index: true,
  },
  uploadedBy: {
    type: String,
    required: [true, 'uploadedBy wallet address is required'],
    trim: true,
  },
  sanitizedText: {
    type: String,
    required: [true, 'sanitizedText is required'],
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export const ChatLog: Model<IChatLog> = mongoose.model<IChatLog>('ChatLog', chatLogSchema);
