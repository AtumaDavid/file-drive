# File Drive(Google Drive clone(ish))

## Table of Contents

- [File Drive(Google Drive clone(ish))](#file-drivegoogle-drive-cloneish)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Key Points in Project](#key-points-in-project)

## Features

- User authentication and authorization (`/src/app/ConvexClientProvider.tsx`)
- File upload, download, and deletion
- Folder creation and management
- File sharing with other users
- Storage usage tracking

## Technologies

- **Frontend**: Next
  - _Clerk Organization Switcher_: `<OrganizationSwitcher />`
  - _User Button_: `<UserButton />` (Appears when logged in)
- **Backend**: Convex (https://docs.convex.dev/quickstart/nextjs)
  - _Install_: npm install convex
  - _Intialize Convex Project_: npx convex dev
- **Authentication**: Clerk (https://clerk-docs-1swzi0cqq.clerkpreview.com/quickstarts/nextjs/app-router)
  - _Install_: npm install @clerk/nextjs
- **UI Library**: shadcn (https://ui.shadcn.com/docs)

## Key Points in Project

- **Mutation**: mutation for creating and storing data into database (`/convex/files.ts`)
- **Query**: query to get the data back out and send them over to the frontend. (`/convex/files.ts`)
- **Handling Organizations**:

  - **frontend**: The Home component(`/src/app/page.tsx`) interacts with the Convex backend to manage files associated with a specific organization. It uses Clerk's `useOrganization` hook to get the current organization context.
  - **Backend**: The backend uses Convex to define the schema and queries/mutations. The schema includes an `orgId` field to associate files with specific organizations.
  - **schema definition**: The schema ensures each file has an `orgId` to associate it with an organization.

  ```javascript
  import { defineSchema, defineTable } from "convex/server";
  import { v } from "convex/values";
  export default defineSchema({
    files: defineTable({ name: v.string(), orgId: v.string() }).index(
      "by_orgId",
      ["orgId"]
    ),
  });
  ```

  - **Mutation**: The mutation for creating and storing data includes orgId as an argument.

  ```javascript
  import { ConvexError, v } from "convex/values";
  import { mutation } from "./_generated/server";
  export const createFile = mutation({
    args: {
      name: v.string(),
      orgId: v.string(),
    },
    async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("You must be logged in to create a file");
      }
      await ctx.db.insert("files", {
        name: args.name,
        orgId: args.orgId,
      });
    },
  });
  ```

  - **Query**: The query retrieves files associated with the provided orgId.

  ```javascript
  import { v } from "convex/values";
  import { query } from "./_generated/server";
  export const getFiles = query({
    args: {
      orgId: v.string(),
    },
    async handler(ctx, args) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return [];
      }
      return ctx.db
        .query("files")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
    },
  });
  ```
