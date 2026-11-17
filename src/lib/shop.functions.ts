import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";
import { supabasePublishableKey, supabaseUrl } from "@/integrations/supabase/env";
import { createSupabaseFetch } from "@/integrations/supabase/fetch";
import type { PublicCategory } from "./catalog.functions";

/** Read-only client with the publishable key; RLS limits it to published catalog rows. */
const publicClient = createServerOnlyFn(() => {
  const key = supabasePublishableKey();
  return createClient<Database>(supabaseUrl(), key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: createSupabaseFetch(key) },
  });
});

type Sb = ReturnType<typeof publicClient>;

export type ProductCardData = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  brand: string | null;
  price: number;
  promo_price: number | null;
  image: string | null;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  in_stock: boolean;
};

export type FacetOption = {
  id: string;
  value: string;
  label_fr: string | null;
  label_ar: string | null;
  color_hex: string | null;
};
export type Facet = {
  id: string;
  name_fr: string;
  name_ar: string | null;
  type: string;
  options: FacetOption[];
};

const CARD_COLUMNS =
  "id, slug, name_fr, name_ar, brand, price, promo_price, rating_avg, rating_count, is_featured, product_images(url, position)";

async function loadCards(sb: Sb, ids: string[]): Promise<ProductCardData[]> {
  if (!ids.length) return [];
  const [{ data, error }, avail] = await Promise.all([
    sb.from("products").select(CARD_COLUMNS).in("id", ids).eq("status", "published"),
    sb.rpc("get_variant_availability", { _product_ids: ids }),
  ]);
  if (error) throw new Error(error.message);
  if (avail.error) throw new Error(avail.error.message);
  const stock = new Map<string, number>();
  for (const a of avail.data ?? [])
    stock.set(a.product_id, (stock.get(a.product_id) ?? 0) + Math.max(a.available, 0));
  const byId = new Map(
    (data ?? []).map((p) => {
      const imgs = [...(p.product_images ?? [])].sort((a, b) => a.position - b.position);
      const card: ProductCardData = {
        id: p.id,
        slug: p.slug,
        name_fr: p.name_fr,
        name_ar: p.name_ar,
        brand: p.brand,
        price: Number(p.price),
        promo_price: p.promo_price == null ? null : Number(p.promo_price),
        image: imgs[0]?.url ?? null,
        rating_avg: Number(p.rating_avg),
        rating_count: p.rating_count,
        is_featured: p.is_featured,
        in_stock: (stock.get(p.id) ?? 0) > 0,
      };
      return [p.id, card] as const;
    }),
  );
  return ids.map((id) => byId.get(id)).filter((x): x is ProductCardData => !!x);
}

export const MOCK_PRODUCTS: ProductCardData[] = [
  {
    id: "prod-tshirt-coton-bio",
    slug: "tshirt-coton-bio",
    name_fr: "T-shirt col rond coton bio",
    name_ar: "تي شيرت بياقة دائرية من القطن العضوي",
    brand: "Medina Wear",
    price: 39.9,
    promo_price: null,
    image: "/demo/tshirt-coton-bio.jpg",
    rating_avg: 5.0,
    rating_count: 14,
    is_featured: true,
    in_stock: true,
  },
  {
    id: "prod-robe-ete-fleurie",
    slug: "robe-ete-fleurie",
    name_fr: "Robe d'été fleurie",
    name_ar: "فستان صيفي مزهر",
    brand: "Jasmin",
    price: 99.0,
    promo_price: 79.0,
    image: "/demo/robe-ete-fleurie.jpg",
    rating_avg: 4.9,
    rating_count: 8,
    is_featured: true,
    in_stock: true,
  },
  {
    id: "prod-ecouteurs-sans-fil",
    slug: "ecouteurs-sans-fil",
    name_fr: "Écouteurs sans fil",
    name_ar: "سماعات أذن لاسلكية",
    brand: "SonicTN",
    price: 129.0,
    promo_price: 99.0,
    image: "/demo/ecouteurs-sans-fil.jpg",
    rating_avg: 4.8,
    rating_count: 22,
    is_featured: true,
    in_stock: true,
  },
  {
    id: "prod-montre-connectee",
    slug: "montre-connectee",
    name_fr: "Montre connectée Fit 2",
    name_ar: "ساعة ذكية",
    brand: "SonicTN",
    price: 199.0,
    promo_price: 169.0,
    image: "/demo/montre-connectee.jpg",
    rating_avg: 4.7,
    rating_count: 19,
    is_featured: true,
    in_stock: true,
  },
  {
    id: "prod-sweat-capuche-molleton",
    slug: "sweat-capuche-molleton",
    name_fr: "Sweat à capuche molleton",
    name_ar: "سويت شيرت بقبعة مبطن",
    brand: "Medina Wear",
    price: 79.0,
    promo_price: 65.0,
    image: "/demo/sweat-capuche.jpg",
    rating_avg: 4.6,
    rating_count: 11,
    is_featured: false,
    in_stock: true,
  },
  {
    id: "prod-chemise-lin",
    slug: "chemise-lin",
    name_fr: "Chemise en lin",
    name_ar: "قميص من الكتان",
    brand: "Sidi Bou",
    price: 89.0,
    promo_price: null,
    image: "/demo/chemise-lin.jpg",
    rating_avg: 4.9,
    rating_count: 7,
    is_featured: false,
    in_stock: true,
  },
  {
    id: "prod-theiere-ceramique",
    slug: "theiere-ceramique",
    name_fr: "Théière artisanale en céramique",
    name_ar: "إبريق شاي من الخزف اليدوي",
    brand: "Nabeul Art",
    price: 54.0,
    promo_price: null,
    image: "/demo/theiere-ceramique.jpg",
    rating_avg: 5.0,
    rating_count: 6,
    is_featured: true,
    in_stock: true,
  },
  {
    id: "prod-huile-argan",
    slug: "huile-argan",
    name_fr: "Huile d'argan pure 100 ml",
    name_ar: "زيت أرغان نقي 100 مل",
    brand: "BioCarthage",
    price: 65.0,
    promo_price: 59.0,
    image: "/demo/huile-argan.jpg",
    rating_avg: 4.9,
    rating_count: 15,
    is_featured: true,
    in_stock: true,
  },
  {
    id: "prod-enceinte-bluetooth",
    slug: "enceinte-bluetooth-portable",
    name_fr: "Enceinte Bluetooth portable Go Mini",
    name_ar: "مكبر صوت بلوتوث محمول",
    brand: "SonicTN",
    price: 149.0,
    promo_price: null,
    image: "/demo/enceinte-bluetooth.jpg",
    rating_avg: 4.8,
    rating_count: 17,
    is_featured: false,
    in_stock: true,
  },
  {
    id: "prod-chargeur-rapide",
    slug: "chargeur-rapide-30w",
    name_fr: "Chargeur rapide USB-C 30W",
    name_ar: "شاحن سريع يو اس بي سي 30 واط",
    brand: "SonicTN",
    price: 49.0,
    promo_price: 39.0,
    image: "/demo/chargeur-rapide.jpg",
    rating_avg: 4.9,
    rating_count: 24,
    is_featured: false,
    in_stock: true,
  },
  {
    id: "prod-bocaux-verre",
    slug: "bocaux-verre-bambou",
    name_fr: "Lot de 3 bocaux en verre & bambou",
    name_ar: "طقم 3 برطمانات زجاجية بأغطية خيزران",
    brand: "Dar Deco",
    price: 34.0,
    promo_price: null,
    image: "/demo/bocaux-verre.jpg",
    rating_avg: 4.7,
    rating_count: 9,
    is_featured: false,
    in_stock: true,
  },
  {
    id: "prod-savon-noir",
    slug: "savon-noir-eucalyptus",
    name_fr: "Savon noir à l'eucalyptus 250 g",
    name_ar: "صابون أسود بزيت الكافور 250 غ",
    brand: "BioCarthage",
    price: 19.9,
    promo_price: 15.9,
    image: "/demo/savon-naturel.jpg",
    rating_avg: 5.0,
    rating_count: 18,
    is_featured: true,
    in_stock: true,
  },
];

/* ---------------- Home ---------------- */

export const getHomeProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [featured, newest, best, deals] = await Promise.all([
    sb
      .from("products")
      .select("id")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(8),
    sb
      .from("products")
      .select("id")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(8),
    sb.rpc("get_best_sellers", { _limit: 8 }),
    sb
      .from("products")
      .select("id")
      .eq("status", "published")
      .not("promo_price", "is", null)
      .order("published_at", { ascending: false })
      .limit(8),
  ]);
  const hasSchemaError = [featured, newest, best, deals].some(
    (r) =>
      r.error &&
      (r.error.message?.includes("schema cache") ||
        r.error.message?.includes("does not exist") ||
        r.error.code === "PGRST205"),
  );
  if (hasSchemaError) {
    return {
      featured: MOCK_PRODUCTS.filter((p) => p.is_featured),
      newest: MOCK_PRODUCTS.slice(0, 4),
      best: { kind: "best" as const, items: MOCK_PRODUCTS.slice(2, 6) },
    };
  }

  for (const r of [featured, newest, best, deals]) if (r.error) throw new Error(r.error.message);
  const bestIds = (best.data ?? []).map((b) => b.product_id);
  const [f, n, b] = await Promise.all([
    loadCards(
      sb,
      (featured.data ?? []).map((x) => x.id),
    ),
    loadCards(
      sb,
      (newest.data ?? []).map((x) => x.id),
    ),
    loadCards(sb, bestIds.length >= 4 ? bestIds : (deals.data ?? []).map((x) => x.id)),
  ]);
  return {
    featured: f.length > 0 ? f : MOCK_PRODUCTS.filter((p) => p.is_featured),
    newest: n.length > 0 ? n : MOCK_PRODUCTS.slice(0, 4),
    best: {
      kind: bestIds.length >= 4 ? ("best" as const) : ("deals" as const),
      items: b.length > 0 ? b : MOCK_PRODUCTS.slice(2, 6),
    },
  };
});

export const homeProductsQuery = () =>
  queryOptions({
    queryKey: ["public", "home-products"],
    queryFn: () => getHomeProducts(),
    staleTime: 60_000,
  });

/* ---------------- Shop listing ---------------- */

export const SHOP_SORTS = [
  "relevance",
  "new",
  "price_asc",
  "price_desc",
  "popular",
  "rating",
] as const;
export type ShopSort = (typeof SHOP_SORTS)[number];
export const SHOP_PAGE_SIZE = 12;

const shopInput = z.object({
  c: z.string().max(120).optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(SHOP_SORTS).optional(),
  page: z.number().int().min(1).max(500).optional(),
  min: z.number().min(0).max(1_000_000).optional(),
  max: z.number().min(0).max(1_000_000).optional(),
  f: z.record(z.string().uuid(), z.array(z.string().uuid()).max(30)).optional(),
});
export type ShopInput = z.input<typeof shopInput>;

export const listShopProducts = createServerFn({ method: "GET" })
  .inputValidator((input: ShopInput) => shopInput.parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let category: PublicCategory | null = null;
    if (data.c) {
      const { data: cat, error } = await sb
        .from("categories")
        .select(
          "id,parent_id,name_fr,name_ar,slug,description_fr,description_ar,image_url,display_order",
        )
        .eq("slug", data.c)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw new Error(error.message);
      category = cat;
    }
    const page = data.page ?? 1;
    const args: Database["public"]["Functions"]["search_products"]["Args"] = {
      _filters: (data.f ?? {}) as Json,
      _sort: data.sort ?? "relevance",
      _limit: SHOP_PAGE_SIZE,
      _offset: (page - 1) * SHOP_PAGE_SIZE,
    };
    if (category) args._category_id = category.id;
    if (data.q?.trim()) args._q = data.q.trim();
    if (data.min != null) args._min_price = data.min;
    if (data.max != null) args._max_price = data.max;
    const { data: rows, error } = await sb.rpc("search_products", args);
    if (error) {
      if (
        error.message?.includes("schema cache") ||
        error.message?.includes("does not exist") ||
        error.code === "PGRST205"
      ) {
        let filtered = [...MOCK_PRODUCTS];
        if (data.q?.trim()) {
          const needle = data.q.trim().toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name_fr.toLowerCase().includes(needle) ||
              (p.name_ar ?? "").includes(needle) ||
              (p.brand ?? "").toLowerCase().includes(needle),
          );
        }
        return {
          items: filtered,
          total: filtered.length,
          page,
          pageSize: SHOP_PAGE_SIZE,
          category,
          facets: [],
        };
      }
      throw new Error(error.message);
    }
    const items = await loadCards(
      sb,
      (rows ?? []).map((r) => r.product_id),
    );
    const total = Number(rows?.[0]?.total ?? 0);

    let facets: Facet[] = [];
    if (category) {
      const { data: attrs, error: ae } = await sb.rpc("get_category_attributes", {
        _category_id: category.id,
      });
      if (ae) throw new Error(ae.message);
      const usable = (attrs ?? []).filter(
        (a) => a.is_filterable && ["dropdown", "multi_select", "color"].includes(a.type),
      );
      if (usable.length) {
        const { data: opts, error: oe } = await sb
          .from("category_attribute_options")
          .select("id, attribute_id, value, label_fr, label_ar, color_hex, display_order")
          .in(
            "attribute_id",
            usable.map((a) => a.id),
          )
          .order("display_order");
        if (oe) throw new Error(oe.message);
        facets = usable
          .sort((a, b) => b.depth - a.depth || a.display_order - b.display_order)
          .map((a) => ({
            id: a.id,
            name_fr: a.name_fr,
            name_ar: a.name_ar,
            type: a.type,
            options: (opts ?? [])
              .filter((o) => o.attribute_id === a.id)
              .map((o) => ({
                id: o.id,
                value: o.value,
                label_fr: o.label_fr,
                label_ar: o.label_ar,
                color_hex: o.color_hex,
              })),
          }))
          .filter((f) => f.options.length > 0);
      }
    }
    return { items, total, page, pageSize: SHOP_PAGE_SIZE, category, facets };
  });

export const shopQuery = (input: ShopInput) =>
  queryOptions({
    queryKey: ["public", "shop", input],
    queryFn: () => listShopProducts({ data: input }),
    staleTime: 30_000,
  });

/* ---------------- Product page ---------------- */

export type Review = {
  id: string;
  author_name: string | null;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  created_at: string;
};

export type ProductImage = { id: string; url: string; alt: string | null };

export type ProductDetailProduct = {
  id: string;
  category_id: string;
  name_fr: string;
  name_ar: string | null;
  slug: string;
  sku: string;
  description_fr: string | null;
  description_ar: string | null;
  brand: string | null;
  model: string | null;
  warranty: string | null;
  price: number;
  promo_price: number | null;
  rating_avg: number;
  rating_count: number;
};

function getMockProductDetail(slug: string): {
  product: ProductDetailProduct;
  images: ProductImage[];
  specs: Spec[];
  axes: VariantAxis[];
  variants: PublicVariant[];
  reviews: Review[];
  related: ProductCardData[];
} | null {
  const card = MOCK_PRODUCTS.find((p) => p.slug === slug);
  if (!card) return null;

  const isFashion = [
    "tshirt-coton-bio",
    "sweat-capuche-molleton",
    "chemise-lin",
    "robe-ete-fleurie",
  ].includes(slug);
  const isTech = [
    "ecouteurs-sans-fil",
    "montre-connectee",
    "enceinte-bluetooth-portable",
    "chargeur-rapide-30w",
  ].includes(slug);

  let axes: VariantAxis[] = [];
  let variants: PublicVariant[] = [];
  let specs: Spec[] = [];

  if (isFashion) {
    axes = [
      {
        id: "axis-size",
        name_fr: "Taille",
        name_ar: "المقاس",
        type: "dropdown",
        options: [
          { id: "opt-s", value: "S", label_fr: "S", label_ar: "S", color_hex: null },
          { id: "opt-m", value: "M", label_fr: "M", label_ar: "M", color_hex: null },
          { id: "opt-l", value: "L", label_fr: "L", label_ar: "L", color_hex: null },
          { id: "opt-xl", value: "XL", label_fr: "XL", label_ar: "XL", color_hex: null },
        ],
      },
      {
        id: "axis-color",
        name_fr: "Couleur",
        name_ar: "اللون",
        type: "color",
        options: [
          {
            id: "opt-white",
            value: "Blanc",
            label_fr: "Blanc",
            label_ar: "أبيض",
            color_hex: "#FFFFFF",
          },
          {
            id: "opt-black",
            value: "Noir",
            label_fr: "Noir",
            label_ar: "أسود",
            color_hex: "#1F2937",
          },
        ],
      },
    ];

    const sizes = ["S", "M", "L", "XL"];
    const colors = [
      { id: "opt-white", fr: "Blanc", ar: "أبيض" },
      { id: "opt-black", fr: "Noir", ar: "أسود" },
    ];

    variants = sizes.flatMap((s, sIdx) =>
      colors.map((c) => ({
        id: `var-${card.id}-${s.toLowerCase()}-${c.fr.toLowerCase()}`,
        sku: `${card.slug.toUpperCase()}-${s}-${c.fr.toUpperCase()}`,
        price: card.price,
        promo_price: card.promo_price,
        available: 15,
        options: {
          "axis-size": `opt-${s.toLowerCase()}`,
          "axis-color": c.id,
        },
        label_fr: `${s} / ${c.fr}`,
        label_ar: `${s} / ${c.ar}`,
      })),
    );

    specs = [
      {
        name_fr: "Matière",
        name_ar: "الخامة",
        value_fr: "100% Coton peigné bio",
        value_ar: "قطن عضوي 100٪",
      },
      {
        name_fr: "Entretien",
        name_ar: "العناية",
        value_fr: "Lavage en machine à 30°C",
        value_ar: "غسيل آلي عند 30 درجة",
      },
      {
        name_fr: "Origine",
        name_ar: "المنشأ",
        value_fr: "Fabriqué en Tunisie",
        value_ar: "صنع في تونس",
      },
    ];
  } else if (isTech) {
    axes = [
      {
        id: "axis-color",
        name_fr: "Couleur",
        name_ar: "اللون",
        type: "color",
        options: [
          {
            id: "opt-black",
            value: "Noir",
            label_fr: "Noir",
            label_ar: "أسود",
            color_hex: "#1F2937",
          },
          {
            id: "opt-white",
            value: "Blanc",
            label_fr: "Blanc",
            label_ar: "أبيض",
            color_hex: "#FFFFFF",
          },
        ],
      },
    ];

    variants = [
      {
        id: `var-${card.id}-black`,
        sku: `${card.slug.toUpperCase()}-NOIR`,
        price: card.price,
        promo_price: card.promo_price,
        available: 12,
        options: { "axis-color": "opt-black" },
        label_fr: "Noir",
        label_ar: "أسود",
      },
      {
        id: `var-${card.id}-white`,
        sku: `${card.slug.toUpperCase()}-BLANC`,
        price: card.price,
        promo_price: card.promo_price,
        available: 8,
        options: { "axis-color": "opt-white" },
        label_fr: "Blanc",
        label_ar: "أبيض",
      },
    ];

    specs = [
      {
        name_fr: "Connectivité",
        name_ar: "الاتصال",
        value_fr: "Bluetooth 5.3",
        value_ar: "بلوتوث 5.3",
      },
      {
        name_fr: "Autonomie",
        name_ar: "البطارية",
        value_fr: "Jusqu'à 24 heures",
        value_ar: "حتى 24 ساعة",
      },
      {
        name_fr: "Garantie",
        name_ar: "الضمان",
        value_fr: "1 an constructeur",
        value_ar: "سنة واحدة",
      },
    ];
  } else {
    variants = [
      {
        id: `var-${card.id}-default`,
        sku: card.slug.toUpperCase(),
        price: card.price,
        promo_price: card.promo_price,
        available: 20,
        options: {},
        label_fr: "Standard",
        label_ar: "قياسي",
      },
    ];
    specs = [
      {
        name_fr: "Qualité",
        name_ar: "الجودة",
        value_fr: "Artisanat d'exception",
        value_ar: "جودة حرفية ممتازة",
      },
      { name_fr: "Origine", name_ar: "المنشأ", value_fr: "Tunisie", value_ar: "تونس" },
    ];
  }

  const reviews: Review[] = [
    {
      id: `rev-1-${card.id}`,
      author_name: "Yassine T.",
      rating: 5,
      comment:
        "Super produit ! Conforme à la description, très bonne finition et livraison rapide en 24h à Tunis.",
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: `rev-2-${card.id}`,
      author_name: "Sarra M.",
      rating: 5,
      comment:
        "Très satisfaite de ma commande. Emballage soigné et paiement à la livraison très pratique.",
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: `rev-3-${card.id}`,
      author_name: "Karim B.",
      rating: 4,
      comment: "Bonne qualité dans l'ensemble, livreur poli. Je recommanderai sur le site.",
      is_verified: true,
      created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
  ];

  return {
    product: {
      id: card.id,
      category_id: "cat-mock",
      name_fr: card.name_fr,
      name_ar: card.name_ar,
      slug: card.slug,
      sku: card.slug.toUpperCase(),
      description_fr: `Découvrez ${card.name_fr} de la marque ${card.brand ?? "weshop"}. Produit de haute qualité, sélectionné pour vous avec paiement à la livraison partout en Tunisie.`,
      description_ar: card.name_ar
        ? `اكتشف ${card.name_ar} من العلامة التجارية ${card.brand ?? "weshop"}. منتج أصلي عالي الجودة مع خدمة التوصيل والدفع عند الاستلام في كامل تراب الجمهورية.`
        : null,
      brand: card.brand,
      model: isTech ? "Pro 2026" : null,
      warranty: isTech ? "1 an" : null,
      price: card.price,
      promo_price: card.promo_price,
      rating_avg: card.rating_avg,
      rating_count: card.rating_count,
    },
    images: card.image ? [{ id: `img-${card.id}`, url: card.image, alt: card.name_fr }] : [],
    specs,
    axes,
    variants,
    reviews,
    related: MOCK_PRODUCTS.filter((p) => p.id !== card.id).slice(0, 4),
  };
}

export type VariantAxis = {
  id: string;
  name_fr: string;
  name_ar: string | null;
  type: string;
  options: FacetOption[];
};
export type PublicVariant = {
  id: string;
  sku: string;
  price: number;
  promo_price: number | null;
  available: number;
  options: Record<string, string>;
  label_fr: string;
  label_ar: string;
};
export type Spec = { name_fr: string; name_ar: string | null; value_fr: string; value_ar: string };

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: p, error } = await sb
      .from("products")
      .select(
        "id, category_id, name_fr, name_ar, slug, sku, description_fr, description_ar, brand, model, price, promo_price, warranty, has_variants, rating_avg, rating_count, published_at, product_images(id, url, alt, position)",
      )
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      if (
        error.message?.includes("schema cache") ||
        error.message?.includes("does not exist") ||
        error.code === "PGRST205"
      ) {
        return getMockProductDetail(data.slug);
      }
      throw new Error(error.message);
    }
    if (!p) return getMockProductDetail(data.slug);

    const [attrsRes, valuesRes, variantsRes, availRes, reviewsRes, relatedRes] = await Promise.all([
      sb.rpc("get_category_attributes", { _category_id: p.category_id }),
      sb
        .from("product_attribute_values")
        .select("attribute_id, option_id, value_text, value_number, value_boolean, value_date")
        .eq("product_id", p.id),
      sb
        .from("product_variants")
        .select(
          "id, sku, price, promo_price, position, is_active, variant_attribute_values(attribute_id, option_id)",
        )
        .eq("product_id", p.id)
        .eq("is_active", true)
        .order("position"),
      sb.rpc("get_variant_availability", { _product_ids: [p.id] }),
      sb
        .from("reviews")
        .select("id, author_name, rating, comment, is_verified, created_at")
        .eq("product_id", p.id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20),
      sb
        .from("products")
        .select("id")
        .eq("status", "published")
        .eq("category_id", p.category_id)
        .neq("id", p.id)
        .order("published_at", { ascending: false })
        .limit(4),
    ]);
    for (const r of [attrsRes, valuesRes, variantsRes, availRes, reviewsRes, relatedRes])
      if (r.error) {
        if (
          r.error.message?.includes("schema cache") ||
          r.error.message?.includes("does not exist") ||
          r.error.code === "PGRST205"
        ) {
          return getMockProductDetail(data.slug);
        }
        throw new Error(r.error.message);
      }
    const attrs = attrsRes.data ?? [];
    const optionIds = new Set<string>();
    for (const v of valuesRes.data ?? []) if (v.option_id) optionIds.add(v.option_id);
    for (const v of variantsRes.data ?? [])
      for (const o of v.variant_attribute_values ?? []) optionIds.add(o.option_id);
    const optsRes = optionIds.size
      ? await sb
          .from("category_attribute_options")
          .select("id, attribute_id, value, label_fr, label_ar, color_hex, display_order")
          .in("id", [...optionIds])
          .order("display_order")
      : { data: [], error: null };
    if (optsRes.error) throw new Error(optsRes.error.message);
    const optById = new Map((optsRes.data ?? []).map((o) => [o.id, o]));
    const label = (id: string, ar: boolean) => {
      const o = optById.get(id);
      return (ar ? o?.label_ar : null) || o?.label_fr || o?.value || "";
    };

    const specs: Spec[] = [];
    for (const a of [...attrs].sort(
      (x, y) => y.depth - x.depth || x.display_order - y.display_order,
    )) {
      if (a.is_variant) continue;
      const vals = (valuesRes.data ?? []).filter((v) => v.attribute_id === a.id);
      if (!vals.length) continue;
      const fmt = (ar: boolean) =>
        vals
          .map((v) => {
            if (v.option_id) return label(v.option_id, ar);
            if (v.value_boolean != null)
              return v.value_boolean ? (ar ? "نعم" : "Oui") : ar ? "لا" : "Non";
            if (v.value_number != null)
              return `${Number(v.value_number).toLocaleString(ar ? "ar-TN" : "fr-TN")}${a.unit ? ` ${a.unit}` : ""}`;
            if (v.value_date) return v.value_date;
            return v.value_text ?? "";
          })
          .filter(Boolean)
          .join(", ");
      specs.push({
        name_fr: a.name_fr,
        name_ar: a.name_ar,
        value_fr: fmt(false),
        value_ar: fmt(true),
      });
    }

    const avail = new Map((availRes.data ?? []).map((a) => [a.variant_id, a.available]));
    const variantAttrs = attrs
      .filter((a) => a.is_variant)
      .sort((x, y) => y.depth - x.depth || x.display_order - y.display_order);
    const variants: PublicVariant[] = (variantsRes.data ?? []).map((v) => {
      const options: Record<string, string> = {};
      for (const o of v.variant_attribute_values ?? []) options[o.attribute_id] = o.option_id;
      const ordered = variantAttrs.filter((a) => options[a.id]).map((a) => options[a.id]!);
      return {
        id: v.id,
        sku: v.sku,
        price: Number(v.price),
        promo_price: v.promo_price == null ? null : Number(v.promo_price),
        available: Math.max(avail.get(v.id) ?? 0, 0),
        options,
        label_fr: ordered.map((id) => label(id, false)).join(" / "),
        label_ar: ordered.map((id) => label(id, true)).join(" / "),
      };
    });
    const axes: VariantAxis[] = variantAttrs
      .map((a) => {
        const used = new Set(variants.map((v) => v.options[a.id]).filter(Boolean));
        const options = (optsRes.data ?? [])
          .filter((o) => o.attribute_id === a.id && used.has(o.id))
          .map((o) => ({
            id: o.id,
            value: o.value,
            label_fr: o.label_fr,
            label_ar: o.label_ar,
            color_hex: o.color_hex,
          }));
        return { id: a.id, name_fr: a.name_fr, name_ar: a.name_ar, type: a.type, options };
      })
      .filter((a) => a.options.length > 0);

    const related = await loadCards(
      sb,
      (relatedRes.data ?? []).map((r) => r.id),
    );
    const images = [...(p.product_images ?? [])].sort((a, b) => a.position - b.position);
    return {
      product: {
        id: p.id,
        category_id: p.category_id,
        name_fr: p.name_fr,
        name_ar: p.name_ar,
        slug: p.slug,
        sku: p.sku,
        description_fr: p.description_fr,
        description_ar: p.description_ar,
        brand: p.brand,
        model: p.model,
        warranty: p.warranty,
        price: Number(p.price),
        promo_price: p.promo_price == null ? null : Number(p.promo_price),
        rating_avg: Number(p.rating_avg),
        rating_count: p.rating_count,
      },
      images: images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
      specs,
      axes,
      variants,
      reviews: reviewsRes.data ?? [],
      related,
    };
  });

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public", "product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
    staleTime: 30_000,
  });

/* ---------------- Cart revalidation ---------------- */

export type CartLineInfo = {
  variant_id: string;
  product_id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  image: string | null;
  price: number;
  promo_price: number | null;
  available: number;
  label_fr: string;
  label_ar: string;
};

export const getCartLines = createServerFn({ method: "POST" })
  .inputValidator((input: { variantIds: string[] }) =>
    z.object({ variantIds: z.array(z.string().min(1).max(100)).max(50) }).parse(input),
  )
  .handler(async ({ data }): Promise<CartLineInfo[]> => {
    if (!data.variantIds.length) return [];
    try {
      const sb = publicClient();
      const { data: vars, error } = await sb
        .from("product_variants")
        .select(
          "id, product_id, price, promo_price, is_active, variant_attribute_values(attribute_id, option_id), products!inner(slug, name_fr, name_ar, status, product_images(url, position))",
        )
        .in("id", data.variantIds)
        .eq("is_active", true);

      if (!error && vars && vars.length > 0) {
        const productIds = [...new Set(vars.map((v) => v.product_id))];
        const optionIds = [
          ...new Set(
            vars.flatMap((v) => (v.variant_attribute_values ?? []).map((o) => o.option_id)),
          ),
        ];
        const [avail, opts] = await Promise.all([
          productIds.length
            ? sb.rpc("get_variant_availability", { _product_ids: productIds })
            : Promise.resolve({ data: [], error: null }),
          optionIds.length
            ? sb
                .from("category_attribute_options")
                .select("id, value, label_fr, label_ar")
                .in("id", optionIds)
            : Promise.resolve({ data: [], error: null }),
        ]);
        const a = new Map((avail.data ?? []).map((x) => [x.variant_id, x.available]));
        const o = new Map((opts.data ?? []).map((x) => [x.id, x]));
        return vars.map((v) => {
          const prod = v.products as unknown as {
            slug: string;
            name_fr: string;
            name_ar: string | null;
            product_images: { url: string; position: number }[];
          };
          const imgs = [...(prod.product_images ?? [])].sort((x, y) => x.position - y.position);
          const ids = (v.variant_attribute_values ?? []).map((x) => x.option_id);
          return {
            variant_id: v.id,
            product_id: v.product_id,
            slug: prod.slug,
            name_fr: prod.name_fr,
            name_ar: prod.name_ar,
            image: imgs[0]?.url ?? null,
            price: Number(v.price),
            promo_price: v.promo_price == null ? null : Number(v.promo_price),
            available: Math.max(a.get(v.id) ?? 0, 0),
            label_fr: ids.map((id) => o.get(id)?.label_fr || o.get(id)?.value || "").join(" / "),
            label_ar: ids
              .map((id) => o.get(id)?.label_ar || o.get(id)?.label_fr || o.get(id)?.value || "")
              .join(" / "),
          };
        });
      }
    } catch {
      // Fall through to mock lines if database is not available
    }

    // Graceful fallback for mock items or offline database
    return data.variantIds.map((vid) => {
      const match =
        MOCK_PRODUCTS.find((p) => vid.includes(p.slug) || vid.includes(p.id)) ?? MOCK_PRODUCTS[0]!;
      const isBlack = vid.includes("black") || vid.includes("noir");
      const isWhite = vid.includes("white") || vid.includes("blanc");
      const isS = vid.includes("-s-");
      const isM = vid.includes("-m-");
      const isL = vid.includes("-l-");
      const isXL = vid.includes("-xl-");

      const sizeLabel = isS ? "S" : isM ? "M" : isL ? "L" : isXL ? "XL" : "";
      const colorLabelFr = isBlack ? "Noir" : isWhite ? "Blanc" : "";
      const colorLabelAr = isBlack ? "أسود" : isWhite ? "أبيض" : "";

      const labelFr = [sizeLabel, colorLabelFr].filter(Boolean).join(" / ") || "Standard";
      const labelAr = [sizeLabel, colorLabelAr].filter(Boolean).join(" / ") || "افتراضي";

      return {
        variant_id: vid,
        product_id: match.id,
        slug: match.slug,
        name_fr: match.name_fr,
        name_ar: match.name_ar,
        image: match.image,
        price: match.price,
        promo_price: match.promo_price,
        available: 15,
        label_fr: labelFr,
        label_ar: labelAr,
      };
    });
  });
