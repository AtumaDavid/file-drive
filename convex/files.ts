import { v } from "convex/values";
import { mutation } from "./_generated/server";

// mutation: an endpoint you can call from your FE react code
// it will do some kind of modification such as store an entry into convex database

// mutation for creating and storing data into database
export const creatFile = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.insert("files", {
      name: args.name,
    });
  },
});
