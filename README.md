# File Drive(Google Drive clone(ish))

## Table of Contents

- [File Drive(Google Drive clone(ish))](#file-drivegoogle-drive-cloneish)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Key Points in Project](#key-points-in-project)
  - [Schema, http.ts, users.td, clerk.ts, files.ts](#schema-httpts-userstd-clerkts-filests)
  - [Integration flow](#integration-flow)

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

2. **http.ts**: This file sets up an HTTP endpoint for handling Clerk webhooks using Convex: //why do we need webbhook????

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
