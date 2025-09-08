import { v } from 'convex/values';
import { internalQuery } from '../_generated/server';

export const getOne = internalQuery({
  args: {
    contactSessionId: v.id('contactSessions'),
  },
  handler: async (ctx, { contactSessionId }) => {
    return await ctx.db.get(contactSessionId);
  },
});
