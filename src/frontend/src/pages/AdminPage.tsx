import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  LogIn,
  LogOut,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  ShieldAlert,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import ProductFormDialog from "../components/ProductFormDialog";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetProducts,
  useIsAdmin,
  useRemoveProduct,
  useToggleStock,
} from "../hooks/useQueries";

const ADMIN_SKELETON_KEYS = ["as1", "as2", "as3", "as4"];

function formatPrice(cents: bigint) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

function getImageSrc(product: Product): string {
  if (product.image) return product.image.getDirectURL();
  if (product.imageId) return product.imageId;
  return "/assets/generated/purse-1.dim_600x600.jpg";
}

function LoginView() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-luxury p-10 max-w-sm w-full text-center"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">
          Admin Access
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Sign in to manage your boutique collection.
        </p>
        <Button
          data-ocid="login.submit_button"
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 font-medium"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </>
          )}
        </Button>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to shop
        </Link>
      </motion.div>
    </div>
  );
}

function AccessDeniedView() {
  const { clear } = useInternetIdentity();
  const qc = useQueryClient();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-luxury p-10 max-w-sm w-full text-center"
      >
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-6 h-6 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">
          Access Denied
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your account does not have admin privileges.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            clear();
            qc.clear();
          }}
          className="w-full rounded-full"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to shop
        </Link>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const { identity, clear } = useInternetIdentity();
  const qc = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: products, isLoading: productsLoading } = useGetProducts();
  const toggleStock = useToggleStock();
  const removeProduct = useRemoveProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  if (!isAuthenticated) return <LoginView />;

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2
          data-ocid="admin.loading_state"
          className="w-6 h-6 animate-spin text-primary"
        />
      </div>
    );
  }

  if (!isAdmin) return <AccessDeniedView />;

  const handleToggleStock = async (
    id: string,
    name: string,
    inStock: boolean,
  ) => {
    try {
      await toggleStock.mutateAsync(id);
      toast.success(
        `${name} marked as ${inStock ? "out of stock" : "in stock"}`,
      );
    } catch {
      toast.error("Failed to update stock status");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await removeProduct.mutateAsync(id);
      toast.success(`"${name}" removed from collection`);
    } catch {
      toast.error("Failed to remove product");
    }
  };

  return (
    <div data-ocid="admin.page" className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              data-ocid="admin.link"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Shop
            </Link>
            <span className="text-border">·</span>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="font-display text-lg font-semibold">
                Admin Dashboard
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clear();
              qc.clear();
            }}
            className="rounded-full text-muted-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 py-10">
        {/* Page title + add button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">
              Product Collection
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {products?.length ?? 0} items in your boutique
            </p>
          </div>
          <Button
            data-ocid="admin.add_button"
            onClick={() => {
              setEditProduct(null);
              setFormOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Products list */}
        {productsLoading ? (
          <div data-ocid="admin.loading_state" className="space-y-3">
            {ADMIN_SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
              >
                <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <motion.div
            data-ocid="admin.empty_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-card border border-border rounded-2xl"
          >
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="font-display text-xl text-muted-foreground mb-2">
              No products yet
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Add your first purse to start your collection.
            </p>
            <Button
              onClick={() => {
                setEditProduct(null);
                setFormOpen(true);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" /> Add First Product
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                data-ocid={`admin.product.row.${i + 1}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 group"
              >
                {/* Image */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img
                    src={getImageSrc(product)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {formatPrice(product.priceCents)}
                  </p>
                </div>

                {/* Stock badge */}
                <Badge
                  variant={product.inStock ? "default" : "secondary"}
                  className={`hidden sm:flex ${
                    product.inStock
                      ? "bg-primary/15 text-primary border-primary/25"
                      : ""
                  }`}
                >
                  {product.inStock ? "In Stock" : "Sold Out"}
                </Badge>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={
                      product.inStock ? "Mark out of stock" : "Mark in stock"
                    }
                    onClick={() =>
                      handleToggleStock(
                        product.id,
                        product.name,
                        product.inStock,
                      )
                    }
                    disabled={toggleStock.isPending}
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    {product.inStock ? (
                      <PackageX className="w-4 h-4" />
                    ) : (
                      <PackageCheck className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    data-ocid={`admin.product.edit_button.${i + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditProduct(product);
                      setFormOpen(true);
                    }}
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        data-ocid={`admin.product.delete_button.${i + 1}`}
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="admin.product.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display">
                          Remove Product?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove &ldquo;{product.name}
                          &rdquo; from your collection? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          data-ocid="admin.product.cancel_button"
                          className="rounded-full"
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="admin.product.confirm_button"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editProduct={editProduct}
      />
    </div>
  );
}
