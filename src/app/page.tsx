"use client";
import { Button } from "@/components/ui/button";
// import { SignOutButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const createFile = useMutation(api.files.creatFile);
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

      <Button
        onClick={() => {
          createFile({
            name: "hello world",
          });
        }}
      >
        Click me
        {/* will be added to comvex db */}
      </Button>
    </main>
  );
}
