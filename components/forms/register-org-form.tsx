"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { organization } from "@/lib/auth-client";
import { slugify } from "@/lib/utils";

import { Spinner } from "../ui/spinner";
import { Textarea } from "../ui/textarea";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50),
  description: z.string().min(2).max(100),
});

interface RegisterOrgFormProps {
  onSuccess?: () => void;
  onCloseDialog?: () => void;
}

export function RegisterOrgForm({
  onSuccess,
}: // onCloseDialog,
RegisterOrgFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  // const { data: session } = useSession();
  // const ownerId = session?.user?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const watchedName = form.watch("name");

  useEffect(() => {
    if (watchedName) {
      const slugValue = slugify(watchedName);
      form.setValue("slug", slugValue, { shouldValidate: true });
    } else {
      form.setValue("slug", "", { shouldValidate: false });
    }
  }, [watchedName, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await organization.create({
          name: values.name,
          slug: values.slug,
          metadata: {
            description: values.description,
          },
        });
        toast.success("Success", {
          description: "A new org has successfully been registered ",
        });
        onSuccess?.();
        router.refresh();
      } catch (error: unknown) {
        const e = error as Error;
        console.error(e.message);
        toast.error("Failure", {
          description: e.message || "Failed to register org",
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My org"
                  className="placeholder:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="my-org"
                  readOnly
                  className="bg-muted cursor-not-allowed text-muted-foreground placeholder:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Could simply be the slogan of your org."
                  className="placeholder:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isPending} type="submit" className="w-full mt-2">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <p>Registering Org...</p>
            </div>
          ) : (
            "Register Org"
          )}
        </Button>
      </form>
    </Form>
  );
}
