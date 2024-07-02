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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<File | null>((val) => val instanceof File || val === null)
    .refine((files) => files !== null, { message: "File is required" }),
});

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  async function onSubmit(
    values: z.infer<typeof formSchema>,
    orgId: string | undefined
  ) {
    if (!orgId) return;
    console.log(values); // Log the form values
    console.log(values.file);

    if (!values.file) {
      console.error("File is required");
      return;
    }

    try {
      const postUrl = await generateUploadUrl();

      const formData = new FormData();
      formData.append("file", values.file);

      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": values.file.type },
        body: formData,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const responseData = await result.json();
      const storageId = responseData.storageId;

      // Create file with required parameters
      createFile({
        name: values.title,
        // type: "image", // Replace with appropriate type (image, csv, pdf, etc.)
        orgId,
        fileId: storageId, // Assuming storageId is the fileId
      });

      console.log("File uploaded successfully and file created.");
      // Handle success logic here
    } catch (error) {
      console.error("Error uploading file:", error);
      // Handle error logic here
    }
  }

  let orgId: string | undefined;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(
    api.files.getFiles,
    organization.isLoaded && user.isLoaded && orgId ? { orgId } : "skip"
  );

  const createFile = useMutation(api.files.createFile);

  return (
    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Your files</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Upload file</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="mb-8">
              <DialogTitle>Upload your file here</DialogTitle>
              <DialogDescription>files </DialogDescription>
              {/* <DialogDescription> */}
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
                          <Input
                            placeholder="The title of your field"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>File</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                field.onChange(file);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">Submit</Button>
                </form>
              </Form>
              {/* </DialogDescription> */}
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      {files?.map((file) => <div key={file._id}>{file.name}</div>)}
    </main>
  );
}
