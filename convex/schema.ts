import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({ name: v.string(), orgId: v.string() }).index(
    "by_orgId",
    ["orgId"]
  ),
});

// import { defineSchema, defineTable } from "convex/server";
// import { v } from "convex/values";

// // export default defineSchema({
// //   files: defineTable({ name: v.string(), orgId: v.string() }).index(
// //     "by_orgId",
// //     ["orgId"]
// //   ),
// // });
// export default defineSchema({
//   files: defineTable({
//     name: v.string(),
//     orgId: v.union(v.string(), v.null()),
//     userId: v.union(v.string(), v.null()),
//   })
//     .index("by_orgId", ["orgId"])
//     .index("by_userId", ["userId"]),
// });

// // The v.union(v.string(), v.null()) is used here to define a field that can accept either a string value or null.
// // This is important for the orgId and userId fields because a file can belong to either an organization or a user, but not both at the same time.
// // Therefore, one of these fields might be null depending on the context of the file upload.
