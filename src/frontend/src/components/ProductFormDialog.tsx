import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Product } from "../backend";
import { useAddProduct, useUpdateProduct } from "../hooks/useQueries";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct: Product | null;
}

function generateId() {
  return `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  editProduct,
}: ProductFormDialogProps) {
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [inStock, setInStock] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editProduct;
  const isPending = addProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (open) {
      if (editProduct) {
        setName(editProduct.name);
        setDescription(editProduct.description);
        setPriceStr((Number(editProduct.priceCents) / 100).toFixed(2));
        setInStock(editProduct.inStock);
        setImagePreview(
          editProduct.image?.getDirectURL() ?? editProduct.imageId ?? null,
        );
      } else {
        setName("");
        setDescription("");
        setPriceStr("");
        setInStock(true);
        setImagePreview(null);
      }
      setImageFile(null);
      setUploadProgress(0);
    }
  }, [open, editProduct]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number.parseFloat(priceStr);
    if (!name.trim()) {
      toast.error("Please enter a product name.");
      return;
    }
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }

    let imageBlob: ExternalBlob | undefined = editProduct?.image;

    if (imageFile) {
      try {
        const bytes = new Uint8Array(await imageFile.arrayBuffer());
        imageBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      } catch {
        toast.error("Failed to prepare image.");
        return;
      }
    }

    const priceCents = BigInt(Math.round(priceNum * 100));
    const now = BigInt(Date.now());

    try {
      if (isEditing && editProduct) {
        const updated: Product = {
          ...editProduct,
          name: name.trim(),
          description: description.trim(),
          priceCents,
          inStock,
          image: imageBlob,
          imageId: editProduct.imageId,
        };
        await updateProduct.mutateAsync({
          id: editProduct.id,
          product: updated,
        });
        toast.success(`"${name}" updated successfully`);
      } else {
        const newProduct: Product = {
          id: generateId(),
          name: name.trim(),
          description: description.trim(),
          priceCents,
          inStock,
          createdAt: now,
          image: imageBlob,
        };
        await addProduct.mutateAsync(newProduct);
        toast.success(`"${name}" added to collection`);
      }
      onOpenChange(false);
    } catch {
      toast.error("Failed to save product. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-2xl"
        data-ocid="admin.product.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image upload — use label wrapping file input for native file-picker support */}
          <div className="space-y-2">
            <span className="text-sm font-medium leading-none">
              Product Image
            </span>
            <label
              htmlFor="image-upload"
              className="relative border-2 border-dashed border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors block"
              data-ocid="product.image.upload_button"
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-background/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Change image
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs opacity-60">
                    PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              )}
            </label>
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  Uploading… {uploadProgress}%
                </p>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              data-ocid="product.name.input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Amalfi Tote"
              className="rounded-lg"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="product-desc">Description</Label>
            <Textarea
              id="product-desc"
              data-ocid="product.description.textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the materials, style, and craftsmanship…"
              className="rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="product-price">Price (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="product-price"
                data-ocid="product.price.input"
                type="number"
                step="0.01"
                min="0.01"
                value={priceStr}
                onChange={(e) => setPriceStr(e.target.value)}
                placeholder="0.00"
                className="pl-7 rounded-lg"
                required
              />
            </div>
          </div>

          {/* In Stock */}
          <div className="flex items-center justify-between py-1">
            <div>
              <Label>In Stock</Label>
              <p className="text-xs text-muted-foreground">
                Available for purchase
              </p>
            </div>
            <Switch
              data-ocid="product.instock.switch"
              checked={inStock}
              onCheckedChange={setInStock}
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
              data-ocid="admin.product.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="admin.save_button"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
