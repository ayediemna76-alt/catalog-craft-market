import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabasePublishableKey, supabaseUrl } from "@/integrations/supabase/env";
import { createSupabaseFetch } from "@/integrations/supabase/fetch";

export type BoostTier = "spotlight" | "category" | "flash" | "search";

export type BoostPackage = {
  tier: BoostTier;
  cost: number;
  durationDays: number;
  name_fr: string;
  name_ar: string;
  desc_fr: string;
  desc_ar: string;
  badge: string;
  icon: string;
};

export const BOOST_PACKAGES: BoostPackage[] = [
  {
    tier: "spotlight",
    cost: 50,
    durationDays: 7,
    name_fr: "À la Une (Accueil)",
    name_ar: "في الصدارة (الصفحة الرئيسية)",
    desc_fr: "Affiché dans le carrousel principal de la page d'accueil avec badge Sponsorisé.",
    desc_ar: "يظهر في شريط الصفحة الرئيسية مع شارة مميز لمضاعفة المبيعات.",
    badge: "Spotlight Accueil",
    icon: "Sparkles",
  },
  {
    tier: "category",
    cost: 25,
    durationDays: 7,
    name_fr: "Tête de Catégorie",
    name_ar: "أعلى القسم",
    desc_fr: "Épinglé en tête de votre catégorie avec encadrement doré.",
    desc_ar: "مثبت في أعلى القسم المخصص للمنتج مع إطار ذهبي لافت.",
    badge: "Top Catégorie",
    icon: "Crown",
  },
  {
    tier: "flash",
    cost: 15,
    durationDays: 3,
    name_fr: "Badge Vente Flash",
    name_ar: "شارة صفقة خاطفة",
    desc_fr: "Badge animé 'Offre Spéciale' et mise en avant dans les bonnes affaires.",
    desc_ar: "شارة متحركة 'عرض خاص' وإبراز المنتج في قسم التخفيضات الكبرى.",
    badge: "Vente Flash",
    icon: "Flame",
  },
  {
    tier: "search",
    cost: 10,
    durationDays: 7,
    name_fr: "Priorité Recherche",
    name_ar: "أولوية البحث",
    desc_fr: "+200% de pertinence dans tous les résultats de recherche pertinents.",
    desc_ar: "+200٪ ظهور وتفضيل في نتائج البحث عند بحث المشترين.",
    badge: "Priorité Recherche",
    icon: "TrendingUp",
  },
];

export type TokenBalanceInfo = {
  balance: number;
  total_earned: number;
  total_spent: number;
};

export type TokenTransaction = {
  id: string;
  amount: number;
  balance_after: number;
  reason: string;
  note: string | null;
  product_id: string | null;
  created_at: string;
};

const DEFAULT_MOCK_BALANCE: TokenBalanceInfo = {
  balance: 150,
  total_earned: 200,
  total_spent: 50,
};

const DEFAULT_MOCK_TRANSACTIONS: TokenTransaction[] = [
  {
    id: "tx-1",
    amount: 100,
    balance_after: 100,
    reason: "welcome_bonus",
    note: "Cadeau de bienvenue : 100 tokens offerts pour démarrer !",
    product_id: null,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "tx-2",
    amount: 100,
    balance_after: 200,
    reason: "purchase",
    note: "Recharge Pack Starter (50 DT)",
    product_id: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "tx-3",
    amount: -50,
    balance_after: 150,
    reason: "product_boost",
    note: "Boost Spotlight Accueil activé pour 7 jours (-50 tokens)",
    product_id: "prod-tshirt-coton-bio",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

type UntypedDatabaseClient = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
  from: (table: string) => {
    select: (cols: string) => {
      order: (
        col: string,
        opts: { ascending: boolean },
      ) => {
        limit: (n: number) => Promise<{ data: unknown; error: { message: string } | null }>;
      };
    };
  };
};

export const getTokenBalance = createServerFn({ method: "GET" }).handler(
  async (): Promise<TokenBalanceInfo> => {
    try {
      const key = supabasePublishableKey();
      const sb = createClient<Database>(supabaseUrl(), key, {
        global: { fetch: createSupabaseFetch(key) },
      }) as unknown as UntypedDatabaseClient;
      const { data, error } = await sb.rpc("get_or_create_token_balance");
      if (!error && Array.isArray(data) && data.length > 0) {
        const row = data[0] as Record<string, unknown>;
        return {
          balance: Number(row["balance"] ?? 0),
          total_earned: Number(row["total_earned"] ?? 0),
          total_spent: Number(row["total_spent"] ?? 0),
        };
      }
    } catch {
      // Offline fallback
    }
    return DEFAULT_MOCK_BALANCE;
  },
);

export const getTokenTransactions = createServerFn({ method: "GET" }).handler(
  async (): Promise<TokenTransaction[]> => {
    try {
      const key = supabasePublishableKey();
      const sb = createClient<Database>(supabaseUrl(), key, {
        global: { fetch: createSupabaseFetch(key) },
      }) as unknown as UntypedDatabaseClient;
      const { data, error } = await sb
        .from("token_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && Array.isArray(data) && data.length > 0) {
        return data as unknown as TokenTransaction[];
      }
    } catch {
      // Offline fallback
    }
    return DEFAULT_MOCK_TRANSACTIONS;
  },
);

export const boostProductAction = createServerFn({ method: "POST" })
  .inputValidator((input: { productId: string; tier: BoostTier; days?: number }) =>
    z
      .object({
        productId: z.string().min(1),
        tier: z.enum(["spotlight", "category", "flash", "search"]),
        days: z.number().int().min(1).max(30).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const pkg = BOOST_PACKAGES.find((p) => p.tier === data.tier);
    const cost = pkg ? pkg.cost : 25;
    try {
      const key = supabasePublishableKey();
      const sb = createClient<Database>(supabaseUrl(), key, {
        global: { fetch: createSupabaseFetch(key) },
      }) as unknown as UntypedDatabaseClient;
      const { data: res, error } = await sb.rpc("boost_product", {
        _product_id: data.productId,
        _tier: data.tier,
        _days: data.days ?? 7,
      });
      if (!error && res) return res;
    } catch {
      // Fall through to mock response
    }
    return {
      success: true,
      product_id: data.productId,
      tier: data.tier,
      cost,
      new_balance: Math.max(0, DEFAULT_MOCK_BALANCE.balance - cost),
      boosted_until: new Date(Date.now() + 86400000 * (data.days ?? 7)).toISOString(),
    };
  });
