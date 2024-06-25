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
- **Backend**: Convex (https://docs.convex.dev/quickstart/nextjs)
  - _Install_: npm install convex
  - _Intialize Convex Project_: npx convex dev
- **Authentication**: Clerk (https://clerk-docs-1swzi0cqq.clerkpreview.com/quickstarts/nextjs/app-router)
  - - _Install_: npm install @clerk/nextjs
- **UI Library**: shadcn (https://ui.shadcn.com/docs)

## Key Points in Project

- **Mutation**: mutation for creating and storing data into database (`/convex/files.ts`)
