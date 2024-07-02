"use client";
import { Button } from "@/components/ui/button";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  title: z.string().min(2).max(200),
});

export default function Home() {
  // Get the current organization and user
  const organization = useOrganization(); //specific
  const user = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: z.any(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

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
  const createFile = useMutation(api.files.createFile);

  return (
    <main className="container, mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl, font-bold">Yout files</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button
            // onClick={() => {
            //   if (!orgId) return;
            //   createFile({
            //     name: "hello world",
            //     orgId,
            //   });
            // }}
            >
              Upload file
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload your file here</DialogTitle>
              <DialogDescription>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input type="file" {...field} />
                          </FormControl>
                          <FormDescription>
                            The title of your field
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="shadcn" {...field} />
                          </FormControl>
                          <FormDescription>your file</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {files?.map((file) => {
        return <div key={file._id}>{file.name}</div>;
      })}
    </main>
  );
}
