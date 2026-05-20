"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  cloneCategories,
  cloneProductsForAdmin,
  deleteProduct,
  upsertProduct,
} from "@/lib/mock/catalog-store";
import type { ProductRow } from "@/lib/mock/types";
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
import { Pencil, Trash2, Search } from "lucide-react";

type AdminProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  original_price?: number | string | null;
  category_id: string | null;
  image_url?: string | null;
  stock_quantity?: number | string | null;
  weight_kg?: number | string | null;
  is_active?: boolean | null;
  categories?: { name: string } | null;
  origin?: string | null;
  sizes?: string[] | null;
};

export default function AdminProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProductRow | null>(null);
  const [deleting, setDeleting] = useState<AdminProductRow | null>(null);
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["demo-products"] });
    queryClient.invalidateQueries({ queryKey: ["demo-product"] });
  };

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => cloneProductsForAdmin(),
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products?.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.categories?.name ?? "").toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term)
    );
  });

  const confirmDelete = async () => {
    if (!deleting) return;
    deleteProduct(deleting.id);
    toast.success("Product deleted");
    queryClient.removeQueries({ queryKey: ["demo-product", deleting.id] });
    invalidateLists();
    setDeleting(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Products</h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="w-full shrink-0 sm:w-auto"
        >
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9 rounded-xl"
        />
      </div>

      {showForm && (
        <ProductForm
          mode="add"
          onSuccess={() => {
            setShowForm(false);
            invalidateLists();
          }}
        />
      )}

      <div className="overflow-hidden overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/40 text-left">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="flex items-center gap-3 p-3">
                  <img src={p.image_url ?? ""} alt="" className="size-10 rounded object-cover" />
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="p-3 text-muted-foreground">{p.categories?.name ?? "-"}</td>
                <td className="p-3">{inr(Number(p.price))}</td>
                <td className="p-3">{p.stock_quantity ?? "-"}</td>
                <td className="p-3">
                  <span className={p.is_active ? "text-success" : "text-destructive"}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleting(p)}
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

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ProductForm
              mode="edit"
              product={editing}
              onSuccess={() => {
                const id = editing.id;
                setEditing(null);
                invalidateLists();
                queryClient.invalidateQueries({ queryKey: ["demo-product", id] });
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes “{deleting?.name}” from the catalog. This cannot be undone.
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

function ProductForm({
  mode,
  product,
  onSuccess,
}: {
  mode: "add" | "edit";
  product?: AdminProductRow;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [origin, setOrigin] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sizes, setSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories-for-select"],
    queryFn: async () => cloneCategories(),
  });

  useEffect(() => {
    if (mode === "edit" && product) {
      setName(product.name);
      setDescription(product.description ?? "");
      setPrice(String(product.price));
      setOriginalPrice(
        product.original_price != null && product.original_price !== ""
          ? String(product.original_price)
          : "",
      );
      setCategoryId(product.category_id ?? "");
      setImageUrl(product.image_url ?? "");
      setStockQuantity(
        product.stock_quantity != null && product.stock_quantity !== ""
          ? String(product.stock_quantity)
          : "",
      );
      setWeightKg(
        product.weight_kg != null && product.weight_kg !== "" ? String(product.weight_kg) : "1",
      );
      setOrigin(product.origin ?? "");
      setIsActive(product.is_active !== false);
      setSizes(product.sizes ?? []);
    }
  }, [mode, product]);

  const isClothingCategory = categories
    ?.find((c) => c.id === categoryId)
    ?.name.toLowerCase()
    .includes("cloths");

  const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];

  const toggleSize = (size: string) => {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      toast.error("Please fill in required fields");
      return;
    }
    setLoading(true);
    try {
      const row: Omit<ProductRow, "id"> & { id?: string } = {
        ...(mode === "edit" && product ? { id: product.id } : {}),
        name,
        description,
        price: Number(price),
        original_price: originalPrice ? Number(originalPrice) : null,
        category_id: categoryId,
        image_url: imageUrl || null,
        weight_kg: weightKg ? Number(weightKg) : 1,
        stock_quantity: stockQuantity ? Number(stockQuantity) : 0,
        origin: origin || "Sri Lanka",
        is_active: isActive,
        sizes: isClothingCategory ? sizes : null,
      };
      upsertProduct(row);
    } catch {
      toast.error("Could not save product");
      setLoading(false);
      return;
    }

    setLoading(false);
    toast.success(mode === "edit" ? "Product updated" : "Product added");
    if (mode === "add") {
      setName("");
      setDescription("");
      setPrice("");
      setOriginalPrice("");
      setCategoryId("");
      setImageUrl("");
      setStockQuantity("");
      setWeightKg("");
      setOrigin("");
      setIsActive(true);
      setSizes([]);
    }
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={mode === "add" ? "mb-6 space-y-4 rounded-lg border bg-card p-4" : "space-y-4 pt-2"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Product Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            required
          />
        </div>
        <div>
          <Label>Category *</Label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            required
          >
            <option value="">Select category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Price (LKR) *</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="100"
            required
          />
        </div>
        <div>
          <Label>Original Price (LKR)</Label>
          <Input
            type="number"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="150"
          />
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Product description"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Image URL</Label>
          <div className="flex gap-2">
            <Input
              value={imageUrl}
              onChange={(e) => {
                let val = e.target.value.trim();
                // Basic normalization for common copy-paste missing protocol
                if (val && !val.startsWith("http") && !val.startsWith("/") && val.includes(".")) {
                  val = `https://${val}`;
                }
                setImageUrl(val);
              }}
              placeholder="https://..."
            />
            {imageUrl && (
              <div className="size-10 shrink-0 overflow-hidden rounded border bg-muted">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/40?text=Error";
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <Label>Stock Quantity</Label>
          <Input
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="100"
          />
        </div>
        <div>
          <Label>Weight (kg)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="1"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Origin</Label>
          <Input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Sri Lanka"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Active</span>
        </label>

        {isClothingCategory && (
          <div className="flex flex-wrap items-center gap-3 border-l pl-6">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Available Sizes:
            </span>
            <div className="flex gap-2">
              {CLOTHING_SIZES.map((size) => (
                <label
                  key={size}
                  className={cn(
                    "flex min-w-[2.5rem] cursor-pointer items-center justify-center rounded-md border py-1.5 text-xs font-bold transition-all",
                    sizes.includes(size)
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-input bg-background hover:border-primary/50",
                  )}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={sizes.includes(size)}
                    onChange={() => toggleSize(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Add Product"}
      </Button>
    </form>
  );
}
