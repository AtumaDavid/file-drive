import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// mutation: an endpoint you can call from your FE react code
// it will do some kind of modification such as store an entry into convex database

// mutation for creating and storing data into database
export const creatFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("you must be logged in to create a file");
    }
    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
    });
  },
});

// query to get the data back out and send them over to the frontend
export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    // return ctx.db.query("files").collect();
    return ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});

// import { ConvexError, v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// // mutation: an endpoint you can call from your FE react code
// // it will do some kind of modification such as store an entry into convex database

// // mutation for creating and storing data into database
// export const creatFile = mutation({
//   args: {
//     name: v.string(),
//     // orgId: v.string(),
//     orgId: v.union(v.string(), v.null()),
//     userId: v.union(v.string(), v.null()),
//   },
//   async handler(ctx, args) {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       throw new ConvexError("you must be logged in to create a file");
//     }
//     await ctx.db.insert("files", {
//       name: args.name,
//       orgId: args.orgId,
//       userId: args.orgId,
//     });
//   },
// });

// // query to get the data back out and send them over to the frontend
// export const getFiles = query({
//   args: {
//     // orgId: v.string(),
//     orgId: v.union(v.string(), v.null()),
//     userId: v.union(v.string(), v.null()),
//   },
//   async handler(ctx, args) {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) {
//       return [];
//     }
//     // // return ctx.db.query("files").collect();
//     // return ctx.db
//     //   .query("files")
//     //   .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
//     //   .collect();
//     if (args.orgId) {
//       return ctx.db
//         .query("files")
//         .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)) //If orgId is provided, it queries the files table using the by_orgId index, matching files where orgId equals the provided orgId.
//         .collect();
//     } else if (args.userId) {
//       return ctx.db
//         .query("files")
//         .withIndex("by_userId", (q) => q.eq("userId", args.userId)) //If userId is provided (and orgId is not), it queries the files table using the by_userId index, matching files where userId equals the provided userId.
//         .collect();
//     }

//     return [];
//   },
// });
