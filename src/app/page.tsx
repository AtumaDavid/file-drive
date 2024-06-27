"use client";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  // Get the current organization and user
  const organization = useOrganization(); //specific
  const user = useUser();

  // Initialize orgId as undefined
  // By allowing orgId to be either a string or undefined, the code can handle situations where the organization ID might not yet be available.
  // For instance, it could be waiting for some asynchronous operation (like fetching data) to complete.
  let orgId: string | undefined;

  // When both organization and user data are loaded, set orgId to either the organization ID or user ID
  if (organization.isLoaded && user.isLoaded) {
    // Set the organization ID to either the organization ID or user ID
    orgId = organization.organization?.id ?? user.user?.id;
  }

  // Query files from the Convex API, but only if organization and user data are loaded and orgId is defined
  const files = useQuery(
    api.files.getFiles,
    // orgId: This variable holds the ID of the organization or user, depending on which one is available (organization.organization?.id or user.user?.id).
    // It's used here to conditionally pass as a parameter to the query.

    // { orgId }: If all conditions (organization.isLoaded && user.isLoaded && orgId) are met,
    // { orgId } becomes an object containing orgId,
    // which is used as a parameter in the getFiles query.
    organization.isLoaded && user.isLoaded && orgId ? { orgId } : "skip"
  );

  // Create a mutation hook for creating a file
  const createFile = useMutation(api.files.creatFile);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* sign out */}
      <SignedIn>
        <SignOutButton>
          <Button>sign out</Button>
        </SignOutButton>
      </SignedIn>

      {/* sign in */}
      <SignedOut>
        <SignInButton mode="modal">
          <Button>sign in</Button>
        </SignInButton>
      </SignedOut>

      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>;
      })}

      <Button
        onClick={() => {
          if (!orgId) return;
          createFile({
            name: "hello world",
            orgId,
          });
        }}
      >
        Click me
        {/* will be added to comvex db */}
      </Button>
    </main>
  );
}
