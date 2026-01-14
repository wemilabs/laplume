"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
  useSession,
} from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { RegisterOrgForm } from "./forms/register-org-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

export function OrgSwitcher() {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: orgs, isPending: orgsPending } = useListOrganizations();
  const { isMobile } = useSidebar();
  const { data: activeOrg, isPending: activeOrgPending } =
    useActiveOrganization();
  const { data: session, isPending: sessionPending } = useSession();

  const router = useRouter();

  const isLoading = orgsPending || activeOrgPending || sessionPending;

  const userId = session?.session?.userId;

  const handleOrgChange = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    organizationId: string,
    organizationSlug: string
  ) => {
    e.preventDefault();
    try {
      await organization.setActive({
        organizationId,
        organizationSlug,
      });
      setOpen(false);
      router.refresh();
      toast.success("Done!", {
        description: "Org has been successfully set.",
      });
    } catch (error) {
      console.error("Error setting org:", error);
      toast.error("Error", {
        description: "Failed to set org.",
      });
    }
  };

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:mt-4">
      <SidebarMenuItem>
        {isLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <SidebarMenuButton
                aria-expanded={open}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground justify-between"
                role="combobox"
                size="lg"
              >
                {(() => {
                  return (
                    <div className="flex w-full items-center gap-2">
                      <Avatar className="size-6 -ml-1 group-data-[collapsible=icon]:mx-auto">
                        <AvatarImage
                          alt={activeOrg?.name ?? "Org logo"}
                          src={
                            (activeOrg?.logo as string | undefined) ?? undefined
                          }
                        />
                        <AvatarFallback>
                          {(activeOrg?.name ?? "B").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {activeOrg?.name ?? "Activate org..."}
                      </span>
                      <ChevronsUpDown className="ml-auto opacity-50 group-data-[collapsible=icon]:hidden size-4" />
                    </div>
                  );
                })()}
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-1"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <Command>
                <CommandInput className="h-9" placeholder="Search org..." />
                <CommandList>
                  <CommandEmpty>No org found.</CommandEmpty>
                  <CommandGroup>
                    {userId &&
                      orgs?.map((org, index) => (
                        <Link
                          href={`/dashboard`}
                          key={org.id}
                          onClick={(e) => handleOrgChange(e, org.id, org.slug)}
                        >
                          <CommandItem
                            className="py-2.5 cursor-pointer"
                            value={org.name}
                          >
                            <div className="flex w-full items-center gap-2">
                              <Avatar className="size-6 rounded-lg">
                                <AvatarImage
                                  alt={org.name}
                                  src={
                                    (org.logo as string | undefined) ??
                                    undefined
                                  }
                                />
                                <AvatarFallback>
                                  {org.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">{org.name}</span>
                              <Check
                                className={cn(
                                  "ml-auto",
                                  activeOrg?.id === org.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />

                              <span className="text-muted-foreground text-xs">
                                ⌘{index + 1}
                              </span>
                            </div>
                          </CommandItem>
                        </Link>
                      ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem className="pt-1.5 pb-0 px-0">
                      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
                        <DialogTrigger
                          className="flex items-start gap-2 px-2 py-1.5"
                          onClick={() => setDialogOpen(true)}
                        >
                          <div className="border rounded-md p-1 -mt-0.5">
                            <Plus className="size-4" />
                          </div>
                          Add org
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader className="mb-2">
                            <DialogTitle>Register Org</DialogTitle>
                            <DialogDescription>
                              Register a new org to get started.
                            </DialogDescription>
                          </DialogHeader>
                          <RegisterOrgForm
                            onSuccess={() => setDialogOpen(false)}
                            onCloseDialog={() => setDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
