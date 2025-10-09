import { ConvexError, v } from 'convex/values';
import { mutation, query } from '../_generated/server';

export const remove = mutation({
  args: { service: v.union(v.literal('vapi')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Must be logged in',
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Organization ID not found',
      });
    }

    const exisitngPlugin = await ctx.db
      .query('plugins')
      .withIndex('by_organization_id_and_service', (q) =>
        q.eq('organizationId', orgId).eq('service', args.service)
      )
      .unique();

    if (!exisitngPlugin) {
      throw new ConvexError({
        code: 'NOT_FOUND',
        message: 'Plugin not found',
      });
    }

    await ctx.db.delete(exisitngPlugin._id);
  },
});

export const getOne = query({
  args: { service: v.union(v.literal('vapi')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Must be logged in',
      });
    }

    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: 'UNAUTHORIZED',
        message: 'Organization ID not found',
      });
    }

    return await ctx.db
      .query('plugins')
      .withIndex('by_organization_id_and_service', (q) =>
        q.eq('organizationId', orgId).eq('service', args.service)
      )
      .unique();
  },
});
