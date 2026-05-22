"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cloneCategoriesForAdmin, upsertCategory, deleteCategory } from "@/lib/mock/catalog-store";
import type { CategoryRow } from "@/lib/mock/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories-for-select"] });
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["demo-products"] });
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => cloneCategoriesForAdmin(),
  });

  // Pagination
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  const confirmDelete = async () => {
    if (!deleting) return;
    deleteCategory(deleting.id);
    toast.success("Category deleted");
    invalidateLists();
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">Categories</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your store's catalog collections dynamically.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="w-full shrink-0 sm:w-auto"
        >
          {showForm ? "Cancel" : "Add Category"}
        </Button>
      </div>

      {showForm && (
        <CategoryForm
          mode="add"
          onSuccess={() => {
            setShowForm(false);
            invalidateLists();
          }}
        />
      )}

      <div className="overflow-hidden overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Category Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories?.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 font-semibold text-foreground">{c.name}</td>
                <td className="p-3 text-muted-foreground">/{c.slug}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, categories.length)} of{" "}
            {categories.length} categories
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          {editing ? (
            <CategoryForm
              mode="edit"
              category={editing}
              onSuccess={() => {
                setEditing(null);
                invalidateLists();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{deleting?.name}” from the categories database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryForm({
  mode,
  category,
  onSuccess,
}: {
  mode: "add" | "edit";
  category?: CategoryRow;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && category) {
      setName(category.name);
      setSlug(category.slug);
    }
  }, [mode, category]);

  // Auto-generate slug on name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (mode === "add") {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]+/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      upsertCategory({
        ...(mode === "edit" && category ? { id: category.id } : {}),
        name,
        slug,
      });
      toast.success(mode === "edit" ? "Category updated" : "Category added");
    } catch {
      toast.error("Could not save category");
      setLoading(false);
      return;
    }
    setLoading(false);
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={mode === "add" ? "mb-6 space-y-4 rounded-lg border bg-card p-4" : "space-y-4 pt-2"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Category Name *</Label>
          <Input
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Women's Wear"
            required
          />
        </div>
        <div>
          <Label>Slug *</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. women-wear"
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Add Category"}
      </Button>
    </form>
  );
}
