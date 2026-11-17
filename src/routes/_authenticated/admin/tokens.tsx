import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Coins,
  Sparkles,
  Zap,
  TrendingUp,
  Flame,
  Crown,
  Users,
  Search,
  PlusCircle,
  MinusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
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
import { AdminShell } from "@/components/admin/AdminShell";
import { formatTND } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { BOOST_PACKAGES, type BoostTier } from "@/lib/tokens.functions";

export const Route = createFileRoute("/_authenticated/admin/tokens")({
  head: () => ({
    meta: [{ title: "Tokens & Boosts — Administration weshop" }],
  }),
  component: AdminTokensPage,
});

type UserTokenAccount = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "seller" | "client";
  balance: number;
  total_earned: number;
  total_spent: number;
};

type ActiveBoostCampaign = {
  id: string;
  productName: string;
  sellerName: string;
  tier: BoostTier;
  cost: number;
  daysRemaining: number;
  boostedAt: string;
  expiresAt: string;
};

const INITIAL_ACCOUNTS: UserTokenAccount[] = [
  {
    id: "a0000000-0000-0000-0000-000000000005",
    name: "Artisan Carthage",
    email: "seller@weshop.tn",
    role: "seller",
    balance: 350,
    total_earned: 450,
    total_spent: 100,
  },
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Emna Admin",
    email: "admin@weshop.tn",
    role: "admin",
    balance: 1000,
    total_earned: 1000,
    total_spent: 0,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    name: "Karim Staff",
    email: "staff@weshop.tn",
    role: "staff",
    balance: 500,
    total_earned: 500,
    total_spent: 0,
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "Yassine Trabelsi",
    email: "client@weshop.tn",
    role: "client",
    balance: 150,
    total_earned: 150,
    total_spent: 0,
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    name: "Sarra Mansour",
    email: "sarra@weshop.tn",
    role: "client",
    balance: 120,
    total_earned: 120,
    total_spent: 0,
  },
];

const INITIAL_BOOSTS: ActiveBoostCampaign[] = [
  {
    id: "b-1",
    productName: "T-shirt col rond coton bio",
    sellerName: "Medina Wear",
    tier: "spotlight",
    cost: 50,
    daysRemaining: 5,
    boostedAt: "Il y a 2 jours",
    expiresAt: "Dans 5 jours",
  },
  {
    id: "b-2",
    productName: "Écouteurs sans fil Buds Pro",
    sellerName: "SonicTN",
    tier: "flash",
    cost: 15,
    daysRemaining: 2,
    boostedAt: "Hier",
    expiresAt: "Dans 2 jours",
  },
  {
    id: "b-3",
    productName: "Théière artisanale en céramique",
    sellerName: "Artisan Carthage",
    tier: "category",
    cost: 25,
    daysRemaining: 6,
    boostedAt: "Aujourd'hui",
    expiresAt: "Dans 6 jours",
  },
];

function AdminTokensPage() {
  const { tr } = useI18n();

  const [accounts, setAccounts] = useState<UserTokenAccount[]>(INITIAL_ACCOUNTS);
  const [boosts, setBoosts] = useState<ActiveBoostCampaign[]>(INITIAL_BOOSTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserTokenAccount | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(50);
  const [adjustmentNote, setAdjustmentNote] = useState("");

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalCirculation = accounts.reduce((acc, cur) => acc + cur.balance, 0);
  const totalSpent = accounts.reduce((acc, cur) => acc + cur.total_spent, 0);

  function handleAdjustTokens() {
    if (!selectedUser || adjustmentAmount === 0) return;

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === selectedUser.id) {
          const newBal = Math.max(0, a.balance + adjustmentAmount);
          return {
            ...a,
            balance: newBal,
            total_earned: adjustmentAmount > 0 ? a.total_earned + adjustmentAmount : a.total_earned,
            total_spent:
              adjustmentAmount < 0 ? a.total_spent + Math.abs(adjustmentAmount) : a.total_spent,
          };
        }
        return a;
      }),
    );

    const sign = adjustmentAmount > 0 ? "+" : "";
    toast.success(
      tr(
        `Solde ajusté (${sign}${adjustmentAmount} tokens) pour ${selectedUser.name}`,
        `تم تعديل الرصيد (${sign}${adjustmentAmount} رمز) للحساب ${selectedUser.name}`,
      ),
    );
    setSelectedUser(null);
    setAdjustmentNote("");
    setAdjustmentAmount(50);
  }

  function handleExtendBoost(id: string) {
    setBoosts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, daysRemaining: b.daysRemaining + 7 } : b)),
    );
    toast.success(tr("Boost prolongé de 7 jours !", "تم تمديد الترويج لمدة 7 أيام إضافية !"));
  }

  function handleRevokeBoost(id: string) {
    setBoosts((prev) => prev.filter((b) => b.id !== id));
    toast.info(tr("Campagne de boost révoquée.", "تم إلغاء حملة الترويج."));
  }

  return (
    <AdminShell>
      <div className="space-y-8 p-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight">
              {tr("Économie des Tokens & Boosts", "إدارة الرموز وحملات الترويج")}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {tr(
              "Supervisez la monnaie interne de la plateforme, accordez des tokens aux vendeurs et modérez les boosts.",
              "متابعة اقتصاد الرموز الداخلية للمتجر، شحن أرصدة البائعين وإدارة حملات الترويج.",
            )}
          </p>
        </div>

        {/* Global Economy Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {tr("Tokens en circulation", "الرموز المتداولة")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 font-display">
                {totalCirculation.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">tokens</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Répartis sur 5 comptes test actifs</p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {tr("Boosts actifs en cours", "الحملات النشطة")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary font-display">{boosts.length}</span>
              <span className="text-xs text-muted-foreground">produits</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Générant du trafic supplémentaire</p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {tr("Tokens investis par les vendeurs", "الرموز المستثمرة")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-600 font-display">
                {totalSpent.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">tokens</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Consommés dans les boosts catalogue</p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              {tr("Revenu estimé (Monétisation)", "العائد المقدر")}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-success font-display">
                {(totalSpent * 0.5).toFixed(1)} DT
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Sur la base de 0.5 DT / token</p>
          </div>
        </div>

        {/* Active Boost Campaigns Moderation */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-current" />
                {tr("Campagnes de Boost Actives", "حملات الترويج الجارية حالياً")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {tr(
                  "Articles mis en avant dans l'accueil, en tête de catégorie ou dans la recherche.",
                  "المنتجات المروجة في واجهة المتجر أو أعلى الأقسام أو نتائج البحث.",
                )}
              </p>
            </div>
            <Badge variant="secondary" className="font-mono">
              {boosts.length} en cours
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b text-xs font-semibold text-muted-foreground">
                  <th className="pb-3 text-start">Produit</th>
                  <th className="pb-3 text-start">Vendeur</th>
                  <th className="pb-3 text-start">Pack Boost</th>
                  <th className="pb-3 text-start">Coût</th>
                  <th className="pb-3 text-start">Expiration</th>
                  <th className="pb-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {boosts.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="py-3 font-semibold">{b.productName}</td>
                    <td className="py-3 text-muted-foreground">{b.sellerName}</td>
                    <td className="py-3">
                      <Badge className="font-mono text-[11px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200">
                        {BOOST_PACKAGES.find((pkg) => pkg.tier === b.tier)?.name_fr}
                      </Badge>
                    </td>
                    <td className="py-3 font-mono font-medium">{b.cost} tokens</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 text-primary" /> {b.expiresAt} ({b.daysRemaining}
                        j)
                      </span>
                    </td>
                    <td className="py-3 text-end space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleExtendBoost(b.id)}
                      >
                        +7 jours
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => handleRevokeBoost(b.id)}
                      >
                        Révoquer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Token Balances Table */}
        <div className="rounded-3xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {tr("Gestion des Soldes Vendeurs & Utilisateurs", "أرصدة البائعين والمستخدمين")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {tr(
                  "Créditez des tokens pour récompenser des vendeurs ou régulariser des opérations.",
                  "شحن رموز للبائعين المتميزين أو تعديل الأرصدة يدوياً.",
                )}
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un compte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 ps-8 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-start">
              <thead>
                <tr className="border-b text-xs font-semibold text-muted-foreground">
                  <th className="pb-3 text-start">Utilisateur</th>
                  <th className="pb-3 text-start">Rôle</th>
                  <th className="pb-3 text-start">Solde Actuel</th>
                  <th className="pb-3 text-start">Cumulé</th>
                  <th className="pb-3 text-start">Dépensé</th>
                  <th className="pb-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-muted/30">
                    <td className="py-3">
                      <p className="font-semibold">{acc.name}</p>
                      <span className="text-xs text-muted-foreground font-mono">{acc.email}</span>
                    </td>
                    <td className="py-3">
                      <Badge variant="outline" className="capitalize text-xs font-mono">
                        {acc.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <span className="font-display font-bold text-base text-amber-600">
                        {acc.balance}
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">tokens</span>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs font-mono">
                      +{acc.total_earned}
                    </td>
                    <td className="py-3 text-muted-foreground text-xs font-mono">
                      -{acc.total_spent}
                    </td>
                    <td className="py-3 text-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-medium gap-1"
                        onClick={() => setSelectedUser(acc)}
                      >
                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                        {tr("Ajuster Solde", "تعديل الرصيد")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Adjust Token Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              {tr("Ajuster le solde de tokens", "تعديل رصيد الرموز")}
            </DialogTitle>
            <DialogDescription>
              Compte : <strong>{selectedUser?.name}</strong> ({selectedUser?.email})
              <br />
              Solde actuel :{" "}
              <strong className="text-amber-600">{selectedUser?.balance} tokens</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>
                {tr("Quantité de tokens (positif ou négatif)", "عدد الرموز (موجب أو سالب)")}
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adjustmentAmount === 50 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdjustmentAmount(50)}
                >
                  +50
                </Button>
                <Button
                  type="button"
                  variant={adjustmentAmount === 100 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdjustmentAmount(100)}
                >
                  +100
                </Button>
                <Button
                  type="button"
                  variant={adjustmentAmount === 250 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAdjustmentAmount(250)}
                >
                  +250
                </Button>
                <Button
                  type="button"
                  variant={adjustmentAmount === -50 ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setAdjustmentAmount(-50)}
                >
                  -50
                </Button>
              </div>
              <Input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
                className="font-mono mt-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{tr("Motif / Note pour le vendeur", "سبب العملية / ملاحظة")}</Label>
              <Input
                placeholder="ex: Bonus vendeur du mois / Recharge offerte"
                value={adjustmentNote}
                onChange={(e) => setAdjustmentNote(e.target.value)}
              />
            </div>

            <div className="rounded-xl border bg-muted/40 p-3 text-xs flex justify-between font-medium">
              <span>Nouveau solde prévu :</span>
              <span className="font-bold text-amber-600">
                {Math.max(0, (selectedUser?.balance ?? 0) + adjustmentAmount)} tokens
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              {tr("Annuler", "إلغاء")}
            </Button>
            <Button onClick={handleAdjustTokens} className="font-semibold">
              <CheckCircle2 className="me-1.5 h-4 w-4" />
              {tr("Confirmer l'opération", "تأكيد العملية")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
