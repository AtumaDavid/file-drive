import { ConvexError, v } from "convex/values"; // ConvexError and validation utilities from Convex
import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  query,
} from "./_generated/server";
import { roles } from "./schema";
import { hasAccessToOrg } from "./files";

// Function to get a user by their token identifier
export async function getUser(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  // Querying the users table using an index by tokenIdentifier
  const user = await ctx.db
    .query("users") // Start a query on the 'users' table
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier)
    )
    .first(); // Use the index 'by_tokenIdentifier' for the query || Get the first (and ideally only) result of the query

  // If the user is not found, throw an error
  if (!user) {
    throw new ConvexError("expected user to be defined");
  }

  return user; // Return the user object if found
}

// Mutation to create a new user
export const createUser = internalMutation({
  // Define the arguments the mutation expects
  args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
  // The handler function that will be executed
  async handler(ctx, args) {
    // Insert the new user into the users table
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
      name: args.name,
      image: args.image,
    });
  },
});

// Mutation to update an existing user's information
export const updateUser = internalMutation({
  // Define the arguments the mutation expects
  args: { tokenIdentifier: v.string(), name: v.string(), image: v.string() },
  // The handler function that will be executed
  async handler(ctx, args) {
    // Query the user by their token identifier
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();

    // If the user is not found, throw an error
    if (!user) {
      throw new ConvexError("no user with this token found");
    }

    // Update the user's name and image
    await ctx.db.patch(user._id, {
      name: args.name,
      image: args.image,
    });
  },
});

// Mutation to add an organization ID to a user's list of organizations
export const addOrgIdToUser = internalMutation({
  // Define the arguments the mutation expects
  args: { tokenIdentifier: v.string(), orgId: v.string(), role: roles },
  // The handler function that will be executed
  async handler(ctx, args) {
    // Get the user by their token identifier
    const user = await getUser(ctx, args.tokenIdentifier);

    // Update the user's organization IDs with the new orgId and role
    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds, { orgId: args.orgId, role: args.role }],
    });
  },
});

// Mutation to update a user's role within an organization
export const updateRoleInOrgForUser = internalMutation({
  // Define the arguments the mutation expects
  args: { tokenIdentifier: v.string(), orgId: v.string(), role: roles },
  // The handler function that will be executed
  async handler(ctx, args) {
    // Get the user by their token identifier
    const user = await getUser(ctx, args.tokenIdentifier);

    // Find the organization in the user's orgIds
    const org = user.orgIds.find((org) => org.orgId === args.orgId);

    // If the organization is not found, throw an error
    if (!org) {
      throw new ConvexError(
        "expected an org on the user but was not found when updating"
      );
    }

    // Update the role of the organization
    org.role = args.role;

    // Save the updated orgIds back to the user
    await ctx.db.patch(user._id, {
      orgIds: user.orgIds,
    });
  },
});

// Query to get a user's profile information
export const getUserProfile = query({
  // Define the arguments the query expects
  args: { userId: v.id("users") },
  // The handler function that will be executed
  async handler(ctx, args) {
    // Get the user by their ID
    const user = await ctx.db.get(args.userId);

    // Return the user's name and image
    return {
      name: user?.name,
      image: user?.image,
    };
  },
});

// Query to get the currently authenticated user's information
export const getMe = query({
  // This query does not expect any arguments
  args: {},
  // The handler function that will be executed
  async handler(ctx) {
    // Get the identity of the currently authenticated user
    const identity = await ctx.auth.getUserIdentity();

    // If there is no identity, return null
    if (!identity) {
      return null;
    }

    // Get the user by their token identifier
    const user = await getUser(ctx, identity.tokenIdentifier);

    // If the user is not found, return null
    if (!user) {
      return null;
    }

    return user;
  },
});
