import { v } from 'convex/values';
import { internalQuery } from '../_generated/server';

export const getByThreadId = internalQuery({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    const conversation = ctx.db
      .query('conversations')
      .withIndex('by_thread_id', (q) => q.eq('threadId', threadId))
      .unique();

    return conversation;
  },
});
