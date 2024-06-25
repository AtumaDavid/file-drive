import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import React from "react";

export default function Header() {
  return (
    <div className="border-b py-4 bg-gray-100">
      <div className="container mx-auto justify-between flex items-center">
        <div>File Drive</div>
        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
