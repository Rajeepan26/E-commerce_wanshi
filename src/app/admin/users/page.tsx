"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import type { DemoRole } from "@/lib/mock/types-shared";
import { listAdminUserDirectory } from "@/lib/mock/admin-users-directory";
import { addAdminCreatedUser, deleteAdminCreatedUser } from "@/lib/mock/admin-user-registry";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user, signOut } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<DemoRole, null>>("customer");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: directory = [] } = useQuery({
    queryKey: ["admin-users-directory"],
    queryFn: async () => listAdminUserDirectory(),
  });

  const addMutation = useMutation({
    mutationFn: async () =>
      addAdminCreatedUser({
        email,
        password,
        full_name: fullName,
        role,
      }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`User ${result.user.email} created`);
      setEmail("");
      setFullName("");
      setPassword("");
      setRole("customer");
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users-directory"] });
    },
    onError: () => toast.error("Could not save user."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (targetId: string) => deleteAdminCreatedUser(targetId),
    onSuccess: (result, targetId) => {
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("User removed");
      setConfirmDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users-directory"] });
      if (user?.id === targetId) {
        void signOut();
      }
    },
    onError: () => toast.error("Could not remove user."),
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage storefront accounts. Names and phones update when customers edit Profile;
            built-in presets cannot be deleted from this demo.
          </p>
        </div>
        <Button size="sm" className="shrink-0" onClick={() => setShowAddForm((o) => !o)}>
          {showAddForm ? "Cancel" : "Add user"}
        </Button>
      </div>

      {showAddForm && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Add user</h2>
          <form
            className="grid max-w-xl gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate();
            }}
          >
            <div className="sm:col-span-2">
              <Label htmlFor="u-email">Email</Label>
              <Input
                id="u-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="off"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="u-name">Full name</Label>
              <Input
                id="u-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Display name"
                required
              />
            </div>
            <div>
              <Label htmlFor="u-role">Role</Label>
              <select
                id="u-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Exclude<DemoRole, null>)}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <Label htmlFor="u-password">Temporary password</Label>
              <Input
                id="u-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" disabled={addMutation.isPending} className="w-full sm:w-auto">
                {addMutation.isPending ? "Saving…" : "Add user"}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="space-y-3">
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/40 font-medium">
              <tr>
                <th className="whitespace-nowrap px-3 py-2">Full name</th>
                <th className="whitespace-nowrap px-3 py-2">Email</th>
                <th className="whitespace-nowrap px-3 py-2">Role</th>
                <th className="whitespace-nowrap px-3 py-2">Phone number</th>
                <th className="whitespace-nowrap px-3 py-2">Status</th>
                <th className="whitespace-nowrap px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {directory.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-3 py-2">{row.full_name}</td>
                  <td className="px-3 py-2">{row.email}</td>
                  <td className="px-3 py-2 capitalize">{row.role}</td>
                  <td className="px-3 py-2 text-muted-foreground">{row.phone_display}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize shadow-sm",
                        row.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                          : "bg-destructive/15 text-destructive",
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={!row.deletable || deleteMutation.isPending}
                      aria-label={`Delete ${row.email}`}
                      title={
                        row.deletable ? "Remove user" : "Preset demo accounts cannot be deleted"
                      }
                      onClick={() => {
                        if (!row.deletable) return;
                        setConfirmDeleteId(row.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to remove access for this user? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirmDeleteId) deleteMutation.mutate(confirmDeleteId);
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Removing..." : "Remove User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
