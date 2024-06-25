"use client";
import { Button } from "@/components/ui/button";
// import { SignOutButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { organization } = useOrganization(); //specific
  console.log(organization?.id);
  const createFile = useMutation(api.files.creatFile);
  const files = useQuery(
    api.files.getFiles,
    organization?.id ? { orgId: organization.id } : "skip"
  );
  // const organization = useOrganization(); --everything

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* <SignInButton mode="modal">
        <Button>hello world</Button>
      </SignInButton> */}
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
          if (!organization) return;
          createFile({
            name: "hello world",
            orgId: organization.id,
          });
        }}
      >
        Click me
        {/* will be added to comvex db */}
      </Button>
    </main>
  );
}
