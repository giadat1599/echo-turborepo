import { ConvexError, v } from 'convex/values';
import { mutation, query } from '../_generated/server';

export const create = mutation({
  args: {
    contactSessionId: v.id('contactSessions'),
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId);

    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session',
      });
    }

    const threadId = '123';

    const conversationId = await ctx.db.insert('conversations', {
      threadId: threadId,
      status: 'unresolved',
      contactSessionId: session._id,
      organizationId: args.organizationId,
    });

    return conversationId;
  },
});

export const getOne = query({
  args: {
    conversationId: v.id('conversations'),
    contactSessionId: v.id('contactSessions'),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId);

    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Invalid session',
      });
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      return null;
    }

    return {
      _id: conversation._id,
      status: conversation.status,
      threadId: conversation.threadId,
    };
  },
});
