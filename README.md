# File Drive(Google Drive clone(ish))

## Table of Contents

- [File Drive(Google Drive clone(ish))](#file-drivegoogle-drive-cloneish)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Key Points in Project](#key-points-in-project)
  - [Schema, http.ts, users.td, clerk.ts, files.ts](#schema-httpts-userstd-clerkts-filests)
  - [Integration flow](#integration-flow)
  - [webhooks](#webhooks)
  - [How Webhooks are Utilized](#how-webhooks-are-utilized)

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

## Schema, http.ts, users.td, clerk.ts, files.ts

1. **Schema**: This file defines the schema for the Convex database. It sets up tables and their respective fields and indexes:

   - _fileTypes_: Defines allowed file types (image, csv, pdf).
   - _roles_: Defines user roles within an organization (admin, member).
   - _files_: Defines a table to store file metadata.
   - _favorites_: Defines a table to store favorite files.
   - _users_: Defines a table to store user information and their organization memberships.

2. **http.ts**: This file sets up an HTTP endpoint for handling Clerk webhooks using Convex:

   - _httpRouter_: Defines routes for handling HTTP requests.
   - _POST /clerk_: Handles POST requests to the /clerk endpoint, which processes Clerk webhook events (user.created, user.updated, organizationMembership.created, organizationMembership.updated). It verifies the webhook payload and updates the Convex database accordingly.

3. **users.ts**: This file contains Convex server-side functions for handling user data:

   - _getUser_: Fetches a user by their token identifier.
   - _createUser_: Creates a new user in the database.
   - _updateUser_: Updates an existing user's information.
   - _addOrgIdToUser_: Adds an organization ID to a user's membership.
   - _updateRoleInOrgForUser_: Updates a user's role in an organization.
   - _getUserProfile_: Fetches a user's profile by their ID.
   - _getMe_: Fetches the currently authenticated user.

4. **clerk.ts**: This file handles the verification of Clerk webhooks:

   - _fulfill_: Verifies the webhook payload using the svix library and returns the parsed payload.

5. **files.ts**: This file contains Convex server-side functions for handling file data:

   - _generateUploadUrl_: Generates a URL for uploading files.
   - _hasAccessToOrg_: Checks if a user has access to an organization.
   - _createFile_: Creates a new file record in the database.
   - _getFiles_: Fetches files for a specific organization with optional filtering.
   - _deleteAllFiles_: Deletes all files marked for deletion.
   - _deleteFile_: Marks a file for deletion.
   - _restoreFile_: Restores a previously deleted file.
   - _toggleFavorite_: Toggles a file's favorite status.
   - _getAllFavorites_: Fetches all favorite files for a user.

6. . page.tsx
   This is the client-side code (React component) for the main page of the application:
   Home Component:
   Uses useOrganization and useUser hooks from Clerk to get the current organization and user.
   Conditionally sets orgId based on the loaded organization or user.
   Uses the useQuery hook to fetch files for the current organization.
   Uses the useMutation hook to create new files.
   Displays sign-in/sign-out buttons based on the user's authentication status.
   Displays a list of files and a button to create a new file.

## Integration flow

This codebase demonstrates a seamless integration of Clerk for authentication and Convex for data management, providing a comprehensive solution for a user-managed file storage system with robust access control and webhook handling.

- **User Authentication**: Clerk handles user authentication. When a user signs in, Clerk provides a tokenIdentifier that uniquely identifies the user.

- **Handling Webhooks**: Webhooks from Clerk (e.g., user.created, user.updated) are processed by the http.ts file.
  The webhook payload is verified and appropriate actions (create/update user, add/update organization membership) are performed in Convex.

- **User and Organization Management**: Users and their organization memberships are managed through Convex mutations and queries defined in users.ts.

- **File Management**:Files are uploaded, managed, and queried through the functions defined in files.ts.
  The React component (page.tsx) provides the user interface for interacting with files (viewing, uploading, marking as favorite).

- **Access Control**: Functions like hasAccessToOrg and hasAccessToFile ensure that users can only interact with files and organizations they have access to.

## webhooks

- Webhooks are used in this codebase to ensure that the Convex database stays synchronized with the changes happening in the Clerk authentication system. Here's why webhooks are necessary and how they are utilized:

Purpose of Webhooks:
Real-time Data Synchronization:

Webhooks provide a way for Clerk to notify your application in real-time about important events related to users and organizations. This ensures that your Convex database is always up-to-date with the latest information from Clerk.
Handling User Lifecycle Events:

Events such as user creation, user updates, and changes in organization memberships are crucial for maintaining an accurate representation of users and their roles within your application. By using webhooks, you can automatically handle these events without needing to poll Clerk for updates.

## How Webhooks are Utilized

- **Webhook Endpoint Setup (http.ts)**: The http.ts file sets up an HTTP endpoint (/clerk) that Clerk can call whenever a relevant event occurs.

```javascript
http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Extract and process webhook payload
    const payloadString = await request.text();
    const headerPayload = request.headers;
    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });

      return new Response(null, { status: 200 });
    } catch (err) {
      return new Response("Webhook Error", { status: 400 });
    }
  }),
});
```

- **Verifying and Processing Webhooks (clerk.ts)**: The clerk.ts file contains the logic for verifying the webhook payload using the svix library and returning the parsed event data.

```javascript
export const fulfill = internalAction({
  args: { headers: v.any(), payload: v.string() },
  handler: async (ctx, args) => {
    const wh = new Webhook(webhookSecret);
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent;
    return payload;
  },
});
```

- **Handling Specific Events (http.ts)**:
  - After verification, specific webhook events are handled in http.ts:
    - _user.created_: Creates a new user in Convex.
    - _user.updated_: Updates an existing user's details in Convex.
    - _organizationMembership.created_: Adds an organization to a user's membership in Convex.
    - _organizationMembership.updated_: Updates a user's role in an organization.

```javascript
switch (result.type) {
  case "user.created":
    await ctx.runMutation(internal.users.createUser, {
      tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.id}`,
      name: `${result.data.first_name ?? ""} ${result.data.last_name ?? ""}`,
      image: result.data.image_url,
    });
    break;
  case "user.updated":
    await ctx.runMutation(internal.users.updateUser, {
      tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.id}`,
      name: `${result.data.first_name ?? ""} ${result.data.last_name ?? ""}`,
      image: result.data.image_url,
    });
    break;
  case "organizationMembership.created":
    await ctx.runMutation(internal.users.addOrgIdToUser, {
      tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
      orgId: result.data.organization.id,
      role: result.data.role === "org:admin" ? "admin" : "member",
    });
    break;
  case "organizationMembership.updated":
    await ctx.runMutation(internal.users.updateRoleInOrgForUser, {
      tokenIdentifier: `https://${process.env.CLERK_HOSTNAME}|${result.data.public_user_data.user_id}`,
      orgId: result.data.organization.id,
      role: result.data.role === "org:admin" ? "admin" : "member",
    });
    break;
}
```

- **Benefits**:
  - _Automation_: Webhooks automate the process of updating the Convex database, removing the need for manual synchronization.
  - _Accuracy_: Ensures that user and organization data in Convex is always in sync with Clerk.
  - _Real-time Updates_: Provides real-time updates to your application, improving the responsiveness and reliability of user-related operations.
