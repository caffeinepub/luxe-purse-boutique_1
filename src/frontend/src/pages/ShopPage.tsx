import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend";
import { useGetProducts } from "../hooks/useQueries";

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-1",
    name: "The Amalfi Tote",
    description:
      "Handcrafted from full-grain Italian leather, this structured tote effortlessly carries everything your day demands. Features suede interior lining, gold-tone hardware, and a removable zip pouch. A forever piece.",
    priceCents: BigInt(32500),
    inStock: true,
    createdAt: BigInt(0),
    imageId: "/assets/generated/purse-4.dim_600x600.jpg",
  },
  {
    id: "sample-2",
    name: "Noir Quilted Evening Bag",
    description:
      "Timeless quilted lambskin with a delicate gold chain strap. From gallery openings to candlelit dinners, this evening bag is the final word in sophistication. Limited edition.",
    priceCents: BigInt(48000),
    inStock: true,
    createdAt: BigInt(0),
    imageId: "/assets/generated/purse-2.dim_600x600.jpg",
  },
  {
    id: "sample-3",
    name: "Blush Velvet Clutch",
    description:
      "Soft blush suede meets minimalist silhouette. A magnetic closure, satin interior, and discreet wrist strap make this the clutch you'll reach for season after season.",
    priceCents: BigInt(19500),
    inStock: false,
    createdAt: BigInt(0),
    imageId: "/assets/generated/purse-3.dim_600x600.jpg",
  },
  {
    id: "sample-4",
    name: "The Ivory Mini Satchel",
    description:
      "Compact yet commanding. This ivory leather satchel is adorned with antique brass hardware and a hand-stitched body that speaks to true artisan craft. Crossbody or top-handle styling.",
    priceCents: BigInt(27500),
    inStock: true,
    createdAt: BigInt(0),
    imageId: "/assets/generated/purse-1.dim_600x600.jpg",
  },
];

const FEATURES = [
  {
    title: "Artisan Crafted",
    text: "Every bag handmade by master leather artisans",
  },
  {
    title: "Free Shipping",
    text: "Complimentary delivery on orders over $150",
  },
  {
    title: "Lifetime Care",
    text: "Complimentary leather care for every purchase",
  },
];

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"];
const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4"];

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

function ProductDetailModal({
  product,
  onClose,
}: { product: Product; onClose: () => void }) {
  return (
    <motion.div
      data-ocid="shop.product.item"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative bg-card rounded-2xl shadow-luxury overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-secondary overflow-hidden">
            <img
              src={getImageSrc(product)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  variant={product.inStock ? "default" : "secondary"}
                  className={
                    product.inStock
                      ? "bg-primary/20 text-primary border-primary/30"
                      : ""
                  }
                >
                  {product.inStock ? "In Stock" : "Sold Out"}
                </Badge>
                <div className="flex gap-0.5">
                  {STAR_KEYS.map((k) => (
                    <Star key={k} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
              </div>
              <h2 className="font-display text-2xl font-semibold text-card-foreground mb-3">
                {product.name}
              </h2>
              <p className="text-3xl font-display font-medium text-primary mb-5">
                {formatPrice(product.priceCents)}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
            <div className="mt-8">
              <Button
                disabled={!product.inStock}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 font-medium tracking-wide"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Free shipping on orders over $150
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductCard({
  product,
  index,
  onClick,
}: { product: Product; index: number; onClick: () => void }) {
  const ocid = `shop.product.card.${index + 1}`;
  return (
    <motion.button
      type="button"
      data-ocid={ocid}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="product-card text-left w-full group"
      onClick={onClick}
    >
      <div className="bg-card rounded-2xl overflow-hidden shadow-xs border border-border">
        <div className="aspect-square bg-secondary overflow-hidden relative">
          <img
            src={getImageSrc(product)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <span className="bg-background/90 text-foreground text-xs font-medium px-3 py-1 rounded-full">
                Sold Out
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-xs">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-display font-medium text-card-foreground text-lg leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-primary font-medium text-lg">
            {formatPrice(product.priceCents)}
          </p>
          <p className="text-muted-foreground text-xs mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function ShopPage() {
  const { data: backendProducts, isLoading } = useGetProducts();
  const [selected, setSelected] = useState<Product | null>(null);

  const products =
    backendProducts && backendProducts.length > 0
      ? backendProducts
      : SAMPLE_PRODUCTS;

  return (
    <div data-ocid="shop.page" className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="font-display text-xl font-semibold tracking-tight">
              Maison Élégante
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-foreground hover:text-primary transition-colors"
              data-ocid="shop.link"
            >
              Collection
            </Link>
            <Link
              to="/admin"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              data-ocid="admin.link"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-purse-shop.dim_1200x600.jpg"
            alt="Luxury purse collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        </div>
        <div className="relative container max-w-7xl mx-auto px-6 py-28 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-lg"
          >
            <p className="text-primary text-sm font-medium tracking-widest uppercase mb-4">
              New Collection
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight mb-5">
              Crafted for
              <br />
              <em className="text-primary not-italic">Her Story</em>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Timeless handbags for the woman who moves through the world with
              intention.
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 font-medium tracking-wide"
              onClick={() =>
                document
                  .getElementById("collection")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Shop the Collection
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Collection */}
      <section
        id="collection"
        className="container max-w-7xl mx-auto px-6 py-16 md:py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-xs font-medium tracking-widest uppercase mb-2">
            Curated Selection
          </p>
          <h2 className="font-display text-4xl font-semibold text-foreground">
            The Collection
          </h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Each piece tells its own story of craft, quality, and enduring
            elegance.
          </p>
        </motion.div>

        {isLoading ? (
          <div
            data-ocid="shop.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="bg-card rounded-2xl overflow-hidden border border-border"
              >
                <Skeleton className="aspect-square" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div data-ocid="shop.empty_state" className="text-center py-24">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="font-display text-xl text-muted-foreground">
              No products available yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back soon for new arrivals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onClick={() => setSelected(product)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features strip */}
      <section className="border-t border-border bg-secondary/40">
        <div className="container max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="font-display font-semibold text-foreground mb-1">
                  {feat.title}
                </p>
                <p className="text-muted-foreground text-sm">{feat.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-medium">
              Maison Élégante
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selected && (
          <ProductDetailModal
            product={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
