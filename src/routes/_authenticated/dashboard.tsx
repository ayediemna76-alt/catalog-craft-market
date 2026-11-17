import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Coins,
  Sparkles,
  Zap,
  TrendingUp,
  Flame,
  Crown,
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StoreLayout } from "@/components/store/StoreLayout";
import { formatTND } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import {
  BOOST_PACKAGES,
  boostProductAction,
  getTokenBalance,
  getTokenTransactions,
  type BoostPackage,
  type BoostTier,
} from "@/lib/tokens.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [{ title: "Espace Vendeur & Gestion Produits — weshop" }],
  }),
  component: UserDashboardPage,
});

type ManagedProduct = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  brand: string;
  price: number;
  promo_price: number | null;
  stock: number;
  status: "published" | "paused" | "draft" | "archived";
  image: string;
  is_boosted: boolean;
  boost_tier: BoostTier | null;
  boosted_until: string | null;
  category: string;
};

const INITIAL_USER_PRODUCTS: ManagedProduct[] = [
  {
    id: "usr-p1",
    slug: "tshirt-coton-bio",
    name_fr: "T-shirt col rond coton bio",
    name_ar: "تي شيرت بياقة دائرية من القطن العضوي",
    brand: "Medina Wear",
    price: 39.9,
    promo_price: null,
    stock: 45,
    status: "published",
    image: "/demo/tshirt-coton-bio.jpg",
    is_boosted: true,
    boost_tier: "spotlight",
    boosted_until: new Date(Date.now() + 86400000 * 5).toISOString(),
    category: "Mode",
  },
  {
    id: "usr-p2",
    slug: "robe-ete-fleurie",
    name_fr: "Robe d'été fleurie",
    name_ar: "فستان صيفي مزهر",
    brand: "Jasmin",
    price: 99.0,
    promo_price: 79.0,
    stock: 18,
    status: "published",
    image: "/demo/robe-ete-fleurie.jpg",
    is_boosted: false,
    boost_tier: null,
    boosted_until: null,
    category: "Mode",
  },
  {
    id: "usr-p3",
    slug: "ecouteurs-sans-fil",
    name_fr: "Écouteurs sans fil Buds Pro",
    name_ar: "سماعات أذن لاسلكية",
    brand: "SonicTN",
    price: 129.0,
    promo_price: 99.0,
    stock: 30,
    status: "published",
    image: "/demo/ecouteurs-sans-fil.jpg",
    is_boosted: true,
    boost_tier: "flash",
    boosted_until: new Date(Date.now() + 86400000 * 2).toISOString(),
    category: "Électronique",
  },
  {
    id: "usr-p4",
    slug: "theiere-ceramique",
    name_fr: "Théière artisanale en céramique",
    name_ar: "إبريق شاي من الخزف اليدوي",
    brand: "Nabeul Art",
    price: 54.0,
    promo_price: null,
    stock: 12,
    status: "published",
    image: "/demo/theiere-ceramique.jpg",
    is_boosted: false,
    boost_tier: null,
    boosted_until: null,
    category: "Maison",
  },
  {
    id: "usr-p5",
    slug: "huile-argan",
    name_fr: "Huile d'argan pure 100 ml",
    name_ar: "زيت أرغان نقي 100 مل",
    brand: "BioCarthage",
    price: 65.0,
    promo_price: 59.0,
    stock: 25,
    status: "paused",
    image: "/demo/huile-argan.jpg",
    is_boosted: false,
    boost_tier: null,
    boosted_until: null,
    category: "Beauté",
  },
  {
    id: "usr-p6",
    slug: "chemise-lin",
    name_fr: "Chemise en lin naturel",
    name_ar: "قميص من الكتان الطبيعي",
    brand: "Sidi Bou",
    price: 89.0,
    promo_price: null,
    stock: 8,
    status: "draft",
    image: "/demo/chemise-lin.jpg",
    is_boosted: false,
    boost_tier: null,
    boosted_until: null,
    category: "Mode",
  },
];

function UserDashboardPage() {
  const { tr, locale } = useI18n();
  const qc = useQueryClient();

  const fetchBalance = useServerFn(getTokenBalance);
  const fetchTx = useServerFn(getTokenTransactions);
  const boostAction = useServerFn(boostProductAction);

  const balanceQuery = useQuery({
    queryKey: ["tokens", "balance"],
    queryFn: () => fetchBalance(),
  });

  const txQuery = useQuery({
    queryKey: ["tokens", "transactions"],
    queryFn: () => fetchTx(),
  });

  const [products, setProducts] = useState<ManagedProduct[]>(INITIAL_USER_PRODUCTS);
  const [activeTab, setActiveTab] = useState<"all" | "published" | "paused" | "draft" | "boosted">(
    "all",
  );
  const [selectedProductForBoost, setSelectedProductForBoost] = useState<ManagedProduct | null>(
    null,
  );
  const [selectedTier, setSelectedTier] = useState<BoostTier>("spotlight");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // New product form
  const [newProduct, setNewProduct] = useState({
    name_fr: "",
    name_ar: "",
    brand: "",
    price: "",
    promo_price: "",
    stock: "10",
    category: "Mode",
    image: "/demo/tshirt-coton-bio.jpg",
    status: "published" as ManagedProduct["status"],
  });

  // Filter products by tab
  const filteredProducts = products.filter((p) => {
    if (activeTab === "all") return p.status !== "archived";
    if (activeTab === "published") return p.status === "published";
    if (activeTab === "paused") return p.status === "paused";
    if (activeTab === "draft") return p.status === "draft";
    if (activeTab === "boosted") return p.is_boosted;
    return true;
  });

  const currentBalance = balanceQuery.data?.balance ?? 150;

  function updateProductStatus(id: string, status: ManagedProduct["status"]) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const labels: Record<ManagedProduct["status"], string> = {
      published: tr("Produit mis en ligne", "تم نشر المنتج"),
      paused: tr("Produit mis en pause", "تم إيقاف المنتج مؤقتاً"),
      draft: tr("Produit passé en brouillon", "تم حفظ المنتج كمسودة"),
      archived: tr("Produit archivé", "تم أرشفة المنتج"),
    };
    toast.success(labels[status]);
  }

  function handleCreateProduct(e: FormEvent) {
    e.preventDefault();
    if (!newProduct.name_fr.trim() || !newProduct.price) {
      toast.error(tr("Veuillez renseigner les champs requis", "يرجى ملء الحقول المطلوبة"));
      return;
    }
    const created: ManagedProduct = {
      id: `usr-p-${Date.now()}`,
      slug: newProduct.name_fr.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name_fr: newProduct.name_fr.trim(),
      name_ar: newProduct.name_ar.trim() || newProduct.name_fr.trim(),
      brand: newProduct.brand.trim() || "Weshop Creator",
      price: Number(newProduct.price),
      promo_price: newProduct.promo_price ? Number(newProduct.promo_price) : null,
      stock: Number(newProduct.stock) || 1,
      status: newProduct.status,
      image: newProduct.image,
      is_boosted: false,
      boost_tier: null,
      boosted_until: null,
      category: newProduct.category,
    };
    setProducts((prev) => [created, ...prev]);
    setIsAddProductOpen(false);
    setNewProduct({
      name_fr: "",
      name_ar: "",
      brand: "",
      price: "",
      promo_price: "",
      stock: "10",
      category: "Mode",
      image: "/demo/tshirt-coton-bio.jpg",
      status: "published",
    });
    toast.success(tr("Produit créé avec succès !", "تمت إضافة المنتج بنجاح !"));
  }

  async function handleApplyBoost() {
    if (!selectedProductForBoost) return;
    const pkg = BOOST_PACKAGES.find((p) => p.tier === selectedTier);
    if (!pkg) return;

    if (currentBalance < pkg.cost) {
      toast.error(
        tr(
          `Solde insuffisant : il vous faut ${pkg.cost} tokens (solde : ${currentBalance})`,
          `رصيد غير كافٍ : تحتاج إلى ${pkg.cost} رمز (رصيدك : ${currentBalance})`,
        ),
      );
      return;
    }

    try {
      await boostAction({
        data: {
          productId: selectedProductForBoost.id,
          tier: selectedTier,
          days: pkg.durationDays,
        },
      });

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProductForBoost.id
            ? {
                ...p,
                is_boosted: true,
                boost_tier: selectedTier,
                boosted_until: new Date(Date.now() + 86400000 * pkg.durationDays).toISOString(),
              }
            : p,
        ),
      );

      // Invalidate balance
      qc.invalidateQueries({ queryKey: ["tokens"] });
      setSelectedProductForBoost(null);
      toast.success(
        tr(
          `🚀 Boost ${pkg.name_fr} activé avec succès (-${pkg.cost} tokens) !`,
          `🚀 تم تفعيل الترويج ${pkg.name_ar} بنجاح (-${pkg.cost} رمز) !`,
        ),
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du boost");
    }
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {tr("Espace Vendeur & Produits", "فضاء البائع وإدارة المنتجات")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tr(
                "Gérez vos articles, contrôlez leurs états en direct et boostez votre visibilité avec vos tokens.",
                "أدر منتجاتك، تحكم في حالاتها مباشرة وعزز انتشارها ومبيعاتها باستخدام الرموز.",
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddProductOpen(true)}
              className="gap-2 font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {tr("Ajouter un produit", "إضافة منتج جديد")}
            </Button>
          </div>
        </div>

        {/* Token Wallet Card */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 text-white shadow-lg md:col-span-2">
            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    <Coins className="h-3.5 w-3.5" /> {tr("Portefeuille Tokens", "محفظة الرموز")}
                  </span>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-5xl font-black tracking-tight">{currentBalance}</span>
                    <span className="text-lg font-medium text-amber-100">Tokens</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-100">
                    {tr(
                      "Utilisez vos tokens pour propulser vos produits en haut du catalogue et multiplier vos ventes.",
                      "استخدم رموزك لترويج المنتجات وتثبيتها في صدارة المتجر لزيادة المبيعات.",
                    )}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                  <Sparkles className="h-8 w-8 text-amber-200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 text-xs">
                <div>
                  <span className="text-amber-200">
                    {tr("Tokens cumulés", "إجمالي الرموز المكتسبة")}
                  </span>
                  <p className="text-lg font-bold">+{balanceQuery.data?.total_earned ?? 200}</p>
                </div>
                <div>
                  <span className="text-amber-200">
                    {tr("Tokens investis", "إجمالي الرموز المستثمرة")}
                  </span>
                  <p className="text-lg font-bold">-{balanceQuery.data?.total_spent ?? 50}</p>
                </div>
              </div>
            </div>
            {/* Background decorative circles */}
            <div className="absolute -end-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-8 end-24 h-40 w-40 rounded-full bg-orange-400/20 blur-xl" />
          </div>

          {/* Quick Boost Tiers Overview */}
          <div className="rounded-3xl border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <Zap className="h-4 w-4 text-primary" />
                <span>{tr("Tarifs des Boosts", "تكلفة الترويج")}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {tr(
                  "4 niveaux de boost pour maximiser votre portée",
                  "4 باقات للترويج حسب ميزانيتك",
                )}
              </p>
              <div className="mt-4 space-y-2 text-xs">
                {BOOST_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.tier}
                    className="flex items-center justify-between rounded-xl bg-muted/50 p-2.5"
                  >
                    <span className="font-medium">{pkg.name_fr}</span>
                    <Badge variant="secondary" className="font-mono font-bold text-primary">
                      {pkg.cost} tokens
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">
              💡{" "}
              {tr(
                "Conseil : Le boost Spotlight génère jusqu'à 5x plus de commandes.",
                "نصيحة: ترويج الصدارة يحقق حتى 5 أضعاف الطلبات.",
              )}
            </p>
          </div>
        </div>

        {/* Product Management Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("all")}
              >
                {tr("Tous", "الكل")} ({products.filter((p) => p.status !== "archived").length})
              </Button>
              <Button
                variant={activeTab === "published" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("published")}
                className="gap-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-success inline-block" />
                {tr("En ligne", "منشور")} ({products.filter((p) => p.status === "published").length}
                )
              </Button>
              <Button
                variant={activeTab === "paused" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("paused")}
                className="gap-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                {tr("En pause", "متوقف")} ({products.filter((p) => p.status === "paused").length})
              </Button>
              <Button
                variant={activeTab === "draft" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("draft")}
              >
                {tr("Brouillons", "مسودة")} ({products.filter((p) => p.status === "draft").length})
              </Button>
              <Button
                variant={activeTab === "boosted" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("boosted")}
                className="gap-1.5 text-primary border-primary/30"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                {tr("Boostés", "مروّج")} ({products.filter((p) => p.is_boosted).length})
              </Button>
            </div>
          </div>

          {/* Product List */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition hover:shadow-md ${
                  p.is_boosted ? "ring-2 ring-primary/40 border-primary/40" : ""
                }`}
              >
                {/* Boost badge on card */}
                {p.is_boosted && (
                  <div className="absolute top-3 end-3 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Zap className="h-3 w-3 fill-current" />
                      {BOOST_PACKAGES.find((b) => b.tier === p.boost_tier)?.badge ?? "Boosté"}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex gap-3">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                      <img src={p.image} alt={p.name_fr} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase text-primary">
                          {p.brand}
                        </span>
                        <span className="text-muted-foreground text-[10px]">•</span>
                        <span className="text-[10px] text-muted-foreground">{p.category}</span>
                      </div>
                      <h3 className="font-semibold text-sm truncate mt-0.5" title={p.name_fr}>
                        {p.name_fr}
                      </h3>
                      <p className="font-display font-bold text-base mt-1">
                        {formatTND(p.promo_price ?? p.price, locale)}
                        {p.promo_price && (
                          <span className="ms-2 text-xs text-muted-foreground line-through font-normal">
                            {formatTND(p.price, locale)}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            p.status === "published"
                              ? "default"
                              : p.status === "paused"
                                ? "outline"
                                : "secondary"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {p.status === "published"
                            ? tr("En ligne", "منشور")
                            : p.status === "paused"
                              ? tr("En pause", "متوقف")
                              : tr("Brouillon", "مسودة")}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {p.stock} en stock
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* State Controls and Boost Action */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Status Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                          {tr("État", "الحالة")} <MoreVertical className="ms-1 h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => updateProductStatus(p.id, "published")}>
                          <PlayCircle className="me-2 h-4 w-4 text-success" />
                          {tr("Publier en ligne", "نشر في المتجر")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateProductStatus(p.id, "paused")}>
                          <PauseCircle className="me-2 h-4 w-4 text-amber-500" />
                          {tr("Mettre en pause", "إيقاف مؤقت")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateProductStatus(p.id, "draft")}>
                          <Archive className="me-2 h-4 w-4 text-muted-foreground" />
                          {tr("Passer en brouillon", "تحويل إلى مسودة")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => updateProductStatus(p.id, "archived")}
                          className="text-destructive"
                        >
                          <Trash2 className="me-2 h-4 w-4" />
                          {tr("Archiver", "أرشفة")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link to="/product/$slug" params={{ slug: p.slug }} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </Link>
                    </Button>
                  </div>

                  {/* Boost Button */}
                  {p.is_boosted ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40"
                      onClick={() => setSelectedProductForBoost(p)}
                    >
                      <Sparkles className="me-1 h-3.5 w-3.5" />
                      {tr("Prolonger", "تمديد")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-8 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm"
                      onClick={() => setSelectedProductForBoost(p)}
                    >
                      <Zap className="me-1 h-3.5 w-3.5 fill-current" />
                      {tr("Booster", "ترويج")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-semibold">
                {tr("Aucun produit dans cet état", "لا توجد منتجات في هذه الحالة")}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setActiveTab("all")}
              >
                {tr("Voir tous les produits", "عرض جميع المنتجات")}
              </Button>
            </div>
          )}
        </div>

        {/* Token Transactions Ledger Section */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                {tr("Historique des mouvements de tokens", "سجل حركات الرموز")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {tr(
                  "Toutes les recharges, bonus et consommations de tokens pour les boosts.",
                  "جميع عمليات شحن الرموز، المكافآت وعمليات الخصم للترويج.",
                )}
              </p>
            </div>
          </div>

          <div className="divide-y rounded-2xl border overflow-hidden">
            {(txQuery.data ?? []).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 text-sm bg-card hover:bg-muted/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-xl ${
                      tx.amount > 0
                        ? "bg-success/15 text-success"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.note}</p>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(tx.created_at).toLocaleDateString(
                        locale === "ar" ? "ar-TN" : "fr-TN",
                        {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>
                <div className="text-end">
                  <span
                    className={`font-mono font-bold ${
                      tx.amount > 0 ? "text-success" : "text-amber-600"
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} tokens
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Solde après : {tx.balance_after}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boost Modal Dialog */}
      <Dialog
        open={selectedProductForBoost !== null}
        onOpenChange={(open) => !open && setSelectedProductForBoost(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Sparkles className="h-5 w-5 text-amber-500" />
              {tr("Booster votre produit", "ترويج المنتج بالرموز")}
            </DialogTitle>
            <DialogDescription>
              {selectedProductForBoost?.name_fr} — {tr("Votre solde actuel :", "رصيدك الحالي :")}{" "}
              <strong className="text-amber-600 font-bold">{currentBalance} tokens</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {tr("Choisissez un pack de boost :", "اختر باقة الترويج :")}
            </Label>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {BOOST_PACKAGES.map((pkg) => {
                const isSelected = selectedTier === pkg.tier;
                return (
                  <button
                    key={pkg.tier}
                    type="button"
                    onClick={() => setSelectedTier(pkg.tier)}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border text-start transition relative ${
                      isSelected
                        ? "border-primary bg-primary-soft ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{pkg.name_fr}</span>
                        <Badge
                          variant={isSelected ? "default" : "secondary"}
                          className="font-mono text-xs font-bold"
                        >
                          {pkg.cost} tokens
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {pkg.desc_fr}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <Clock className="h-3 w-3" /> Durée : {pkg.durationDays} jours
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border bg-muted/40 p-3 text-xs space-y-1.5">
              <div className="flex justify-between font-medium">
                <span>{tr("Coût du boost sélectionné :", "تكلفة الباقة :")}</span>
                <span className="font-bold text-amber-600">
                  {BOOST_PACKAGES.find((b) => b.tier === selectedTier)?.cost} tokens
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{tr("Solde restant après boost :", "الرصيد المتبقي بعد الترويج :")}</span>
                <span className="font-semibold">
                  {currentBalance -
                    (BOOST_PACKAGES.find((b) => b.tier === selectedTier)?.cost ?? 0)}{" "}
                  tokens
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedProductForBoost(null)}>
              {tr("Annuler", "إلغاء")}
            </Button>
            <Button
              onClick={handleApplyBoost}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
            >
              <Zap className="h-4 w-4 fill-current" />
              {tr("Confirmer le Boost 🚀", "تأكيد الترويج 🚀")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tr("Ajouter un nouveau produit", "إضافة منتج جديد")}</DialogTitle>
            <DialogDescription>
              {tr(
                "Renseignez les détails du produit. Vous pourrez modifier son état à tout moment.",
                "أدخل تفاصيل المنتج. يمكنك تعديل حالته في أي وقت.",
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="np-name-fr">
                {tr("Nom du produit (Français) *", "اسم المنتج (بالفرنسية) *")}
              </Label>
              <Input
                id="np-name-fr"
                required
                value={newProduct.name_fr}
                onChange={(e) => setNewProduct((f) => ({ ...f, name_fr: e.target.value }))}
                placeholder="ex: Chaussures de ville cuir"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="np-name-ar">
                {tr("Nom du produit (Arabe)", "اسم المنتج (بالعربية)")}
              </Label>
              <Input
                id="np-name-ar"
                value={newProduct.name_ar}
                onChange={(e) => setNewProduct((f) => ({ ...f, name_ar: e.target.value }))}
                placeholder="ex: حذاء جلدي كلاسيكي"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="np-brand">{tr("Marque", "العلامة")}</Label>
                <Input
                  id="np-brand"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="ex: Artisanat TN"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-category">{tr("Catégorie", "القسم")}</Label>
                <Select
                  value={newProduct.category}
                  onValueChange={(val) => setNewProduct((f) => ({ ...f, category: val }))}
                >
                  <SelectTrigger id="np-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mode">Mode</SelectItem>
                    <SelectItem value="Électronique">Électronique</SelectItem>
                    <SelectItem value="Maison">Maison & Cuisine</SelectItem>
                    <SelectItem value="Beauté">Beauté & Bien-être</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="np-price">{tr("Prix (DT) *", "السعر (د.ت) *")}</Label>
                <Input
                  id="np-price"
                  type="number"
                  step="0.1"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((f) => ({ ...f, price: e.target.value }))}
                  placeholder="49.0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-promo">{tr("Prix promo (DT)", "سعر التخفيض")}</Label>
                <Input
                  id="np-promo"
                  type="number"
                  step="0.1"
                  value={newProduct.promo_price}
                  onChange={(e) => setNewProduct((f) => ({ ...f, promo_price: e.target.value }))}
                  placeholder="39.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="np-stock">{tr("Quantité en stock", "المخزون المتوفر")}</Label>
                <Input
                  id="np-stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="np-status">{tr("État initial", "الحالة الأولية")}</Label>
                <Select
                  value={newProduct.status}
                  onValueChange={(val: ManagedProduct["status"]) =>
                    setNewProduct((f) => ({ ...f, status: val }))
                  }
                >
                  <SelectTrigger id="np-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Publié (En ligne)</SelectItem>
                    <SelectItem value="paused">En pause</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                {tr("Annuler", "إلغاء")}
              </Button>
              <Button type="submit" className="font-semibold">
                {tr("Créer le produit", "حفظ ونشر المنتج")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </StoreLayout>
  );
}
