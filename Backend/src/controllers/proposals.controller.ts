import { Request, Response } from 'express';
import { Proposal, ProposalStatus } from '../models/Proposal.js';
import { ChatLog } from '../models/ChatLog.js';
import { Community } from '../models/Community.js';
import { synthesizeProposal as aiSynthesize } from '../services/anthropic.js';

/**
 * List proposals with optional status filter and pagination.
 */
export async function getProposals(req: Request, res: Response): Promise<void> {
  try {
    const {
      status,
      communityId,
      page = '1',
      limit = '20',
    } = req.query as {
      status?: string;
      communityId?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: Record<string, unknown> = {};
    if (status && Object.values(ProposalStatus).includes(status as ProposalStatus)) {
      filter.status = status;
    }
    if (communityId) {
      filter.communityId = communityId;
    }

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Proposal.countDocuments(filter),
    ]);

    res.status(200).json({
      data: proposals.map(formatProposal),
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[proposals] getProposals error: ${message}`);
    res.status(500).json({
      message: 'Failed to fetch proposals',
      code: 'PROPOSALS_FETCH_ERROR',
      statusCode: 500,
    });
  }
}

/**
 * Get a single proposal by ID.
 */
export async function getProposal(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id).lean();

    if (!proposal) {
      res.status(404).json({
        message: 'Proposal not found',
        code: 'PROPOSAL_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    res.status(200).json(formatProposal(proposal));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[proposals] getProposal error: ${message}`);
    res.status(500).json({
      message: 'Failed to fetch proposal',
      code: 'PROPOSAL_FETCH_ERROR',
      statusCode: 500,
    });
  }
}

/**
 * Update a draft proposal.
 */
export async function updateProposal(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body as Record<string, unknown>;

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      res.status(404).json({
        message: 'Proposal not found',
        code: 'PROPOSAL_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    // Only draft proposals can be edited
    if (proposal.status !== ProposalStatus.DRAFT) {
      res.status(400).json({
        message: 'Only draft proposals can be edited',
        code: 'PROPOSAL_NOT_EDITABLE',
        statusCode: 400,
      });
      return;
    }

    // Apply allowed updates — fields are already validated by Zod middleware
    if (updates.title !== undefined) proposal.title = updates.title as string;
    if (updates.summary !== undefined) proposal.summary = updates.summary as string;
    if (updates.budget !== undefined) proposal.budgetRequested = updates.budget as number;
    if (updates.currency !== undefined) proposal.currency = updates.currency as string;
    if (updates.actionItems !== undefined) proposal.actionItems = updates.actionItems as string[];
    if (updates.rationale !== undefined) proposal.rationale = updates.rationale as string;
    if (updates.dissent !== undefined) proposal.dissent = updates.dissent as string;
    if (updates.recipient !== undefined) proposal.recipient = updates.recipient as string;
    if (updates.deadline !== undefined) proposal.deadline = new Date(updates.deadline as string);

    await proposal.save();

    const plain = proposal.toObject() as unknown as Record<string, unknown>;
    res.status(200).json(formatProposal(plain));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[proposals] updateProposal error: ${message}`);
    res.status(500).json({
      message: 'Failed to update proposal',
      code: 'PROPOSAL_UPDATE_ERROR',
      statusCode: 500,
    });
  }
}

/**
 * Publish a draft proposal — changes status to 'live' and sets the deadline.
 */
export async function publishProposal(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const proposal = await Proposal.findById(id);
    if (!proposal) {
      res.status(404).json({
        message: 'Proposal not found',
        code: 'PROPOSAL_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    if (proposal.status !== ProposalStatus.DRAFT) {
      res.status(400).json({
        message: 'Only draft proposals can be published',
        code: 'PROPOSAL_NOT_PUBLISHABLE',
        statusCode: 400,
      });
      return;
    }

    // Set deadline to 7 days from now if not already set
    if (!proposal.deadline) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);
      proposal.deadline = deadline;
    }

    proposal.status = ProposalStatus.LIVE;
    await proposal.save();

    const plain = proposal.toObject() as unknown as Record<string, unknown>;
    res.status(200).json(formatProposal(plain));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[proposals] publishProposal error: ${message}`);
    res.status(500).json({
      message: 'Failed to publish proposal',
      code: 'PROPOSAL_PUBLISH_ERROR',
      statusCode: 500,
    });
  }
}

/**
 * Synthesize a proposal from a chat log using AI.
 * Uses Server-Sent Events (SSE) to stream the response.
 */
export async function synthesizeProposal(req: Request, res: Response): Promise<void> {
  try {
    const { chatLogId, communityId } = req.body as {
      chatLogId: string;
      communityId: string;
    };

    if (!chatLogId || !communityId) {
      res.status(400).json({
        message: 'chatLogId and communityId are required',
        code: 'SYNTHESIS_MISSING_FIELDS',
        statusCode: 400,
      });
      return;
    }

    // Fetch the chat log and community
    const [chatLog, community] = await Promise.all([
      ChatLog.findById(chatLogId),
      Community.findById(communityId),
    ]);

    if (!chatLog) {
      res.status(404).json({
        message: 'Chat log not found',
        code: 'CHATLOG_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    if (!community) {
      res.status(404).json({
        message: 'Community not found',
        code: 'COMMUNITY_NOT_FOUND',
        statusCode: 404,
      });
      return;
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Stream AI response
    let fullText = '';
    const generator = aiSynthesize(chatLog.sanitizedText, community.name);

    for await (const chunk of generator) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // After streaming completes, try to parse the full response and create a draft proposal
    try {
      const parsed = JSON.parse(fullText) as {
        title: string;
        summary: string;
        budgetRequested: number;
        currency: string;
        actionItems: string[];
        rationale: string;
        dissent: string;
      };

      const walletAddress = req.user?.walletAddress ?? 'system';

      const proposal = await Proposal.create({
        communityId,
        title: parsed.title,
        summary: parsed.summary,
        budgetRequested: parsed.budgetRequested ?? 0,
        currency: parsed.currency ?? 'GHS',
        actionItems: parsed.actionItems ?? [],
        rationale: parsed.rationale ?? '',
        dissent: parsed.dissent ?? '',
        recipient: '',
        chatLogId: chatLog._id,
        createdBy: walletAddress,
        status: ProposalStatus.DRAFT,
      });

      // Send the final event with the created proposal ID
      res.write(
        `data: ${JSON.stringify({ done: true, proposalId: String(proposal._id) })}\n\n`
      );
    } catch (parseError: unknown) {
      // AI response wasn't valid JSON — send the raw text and let the frontend handle it
      const parseMessage = parseError instanceof Error ? parseError.message : 'Parse error';
      console.warn(`[proposals] AI response wasn't valid JSON: ${parseMessage}`);
      res.write(
        `data: ${JSON.stringify({ done: true, rawText: fullText, parseError: parseMessage })}\n\n`
      );
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[proposals] synthesizeProposal error: ${message}`);

    // If headers haven't been sent yet, send a JSON error
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to synthesize proposal',
        code: 'SYNTHESIS_ERROR',
        statusCode: 500,
      });
    } else {
      // Headers already sent (SSE mode) — send error as an SSE event
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
}

/**
 * Format a proposal document for API response.
 */
function formatProposal(doc: Record<string, unknown>): Record<string, unknown> {
  return {
    id: String(doc._id),
    communityId: String(doc.communityId),
    title: doc.title,
    summary: doc.summary,
    budgetRequested: doc.budgetRequested,
    currency: doc.currency,
    actionItems: doc.actionItems,
    rationale: doc.rationale,
    dissent: doc.dissent,
    recipient: doc.recipient,
    deadline: doc.deadline ? new Date(doc.deadline as string).toISOString() : null,
    status: doc.status,
    chatLogId: doc.chatLogId ? String(doc.chatLogId) : null,
    createdBy: doc.createdBy,
    yesVotes: doc.yesVotes,
    noVotes: doc.noVotes,
    abstainVotes: doc.abstainVotes,
    txHash: doc.txHash ?? null,
    createdAt: doc.createdAt ? new Date(doc.createdAt as string).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt as string).toISOString() : null,
  };
}
