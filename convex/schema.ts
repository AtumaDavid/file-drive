import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define possible file types using a union of literals (specific string values)
export const fileTypes = v.union(
  v.literal("image"), // File can be an image
  v.literal("csv"), // File can be a CSV
  v.literal("pdf") // File can be a PDF
);

// Define possible roles for users in an organization
export const roles = v.union(v.literal("admin"), v.literal("member"));

// Define the schema for our database
export default defineSchema({
  // Define the 'files' table with its fields and indexes
  files: defineTable({
    name: v.string(), // Name of the file (string)
    type: fileTypes, // Type of the file (image, csv, pdf)
    orgId: v.string(), // ID of the organization (string)
    fileId: v.id("_storage"), // ID of the file in storage (ID type linked to '_storage')
    userId: v.id("users"), // ID of the user (ID type linked to 'users' table)
    shouldDelete: v.optional(v.boolean()), // Optional boolean to mark file for deletion
  })
    .index("by_orgId", ["orgId"]) // Index to query files by organization ID
    .index("by_shouldDelete", ["shouldDelete"]), // Index to query files by deletion status

  // Define the 'favorites' table with its fields and indexes
  favorites: defineTable({
    fileId: v.id("files"), // ID of the file (ID type linked to 'files' table)
    orgId: v.string(), // ID of the organization (string)
    userId: v.id("users"), // ID of the user (ID type linked to 'users' table)
  }).index("by_userId_orgId_fileId", ["userId", "orgId", "fileId"]), // Index to query favorites

  // Define the 'users' table with its fields and indexes
  users: defineTable({
    tokenIdentifier: v.string(), // Token identifier for the user (string)
    name: v.optional(v.string()), // Optional name of the user (string)
    image: v.optional(v.string()), // Optional image URL of the user (string)
    orgIds: v.array(
      // Array of objects representing organization memberships
      v.object({
        orgId: v.string(), // ID of the organization (string)
        role: roles, // Role in the organization (admin or member)
      })
    ),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]), // Index to query users by token identifier
});
