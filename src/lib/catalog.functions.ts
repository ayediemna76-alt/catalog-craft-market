import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabasePublishableKey, supabaseUrl } from "@/integrations/supabase/env";
import { createSupabaseFetch } from "@/integrations/supabase/fetch";

/** Read-only client with the publishable key; RLS limits it to public rows. */
const publicClient = createServerOnlyFn(() => {
  const key = supabasePublishableKey();
  return createClient<Database>(supabaseUrl(), key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { fetch: createSupabaseFetch(key) },
  });
});

export type PublicCategory = {
  id: string;
  parent_id: string | null;
  name_fr: string;
  name_ar: string | null;
  slug: string;
  description_fr: string | null;
  description_ar: string | null;
  image_url: string | null;
  display_order: number;
};

export const MOCK_CATEGORIES: PublicCategory[] = [
  // ================= 1. MODE & HABILLEMENT =================
  {
    id: "cat-mode",
    parent_id: null,
    name_fr: "Mode & Vêtements",
    name_ar: "موضة وأزياء",
    slug: "mode",
    description_fr:
      "Prêt-à-porter pour hommes, femmes et enfants. Styles tendances et confort quotidien.",
    description_ar: "أحدث صيحات الموضة للرجال والنساء والأطفال. أزياء مريحة وأنيقة لكل يوم.",
    image_url: "/demo/robe-ete-fleurie.jpg",
    display_order: 1,
  },
  {
    id: "cat-tshirts",
    parent_id: "cat-mode",
    name_fr: "T-shirts & Sweats",
    name_ar: "تي شيرت وسويت شيرت",
    slug: "t-shirts-sweats",
    description_fr: "T-shirts en coton peigné bio et sweats à capuche molletonnés.",
    description_ar: "تي شيرت من القطن العضوي وسويت شيرت مريح ودافئ.",
    image_url: "/demo/tshirt-coton-bio.jpg",
    display_order: 1,
  },
  {
    id: "cat-chemises",
    parent_id: "cat-mode",
    name_fr: "Chemises & Hauts",
    name_ar: "قمصان وبلوزات",
    slug: "chemises",
    description_fr: "Chemises en lin léger, chemisiers élégants et polos.",
    description_ar: "قمصان من الكتان الطبيعي الخفيف وتصاميم عصرية للصيف والمناسبات.",
    image_url: "/demo/chemise-lin.jpg",
    display_order: 2,
  },
  {
    id: "cat-robes",
    parent_id: "cat-mode",
    name_fr: "Robes & Jupes",
    name_ar: "فساتين وتنانير",
    slug: "robes",
    description_fr: "Robes d'été fleuries, robes de soirée et jupes élégantes.",
    description_ar: "فساتين صيفية مزهرة وفساتين أنيقة لكل الإطلالات والمناسبات.",
    image_url: "/demo/robe-ete-fleurie.jpg",
    display_order: 3,
  },
  {
    id: "cat-pantalons",
    parent_id: "cat-mode",
    name_fr: "Pantalons & Jeans",
    name_ar: "سراويل وجينز",
    slug: "pantalons-jeans",
    description_fr: "Jeans denim résistants, pantalons chino et joggings.",
    description_ar: "بناطيل جينز عالية الجودة وسراويل مريحة للعمل والخروج.",
    image_url: "/demo/sweat-capuche.jpg",
    display_order: 4,
  },
  {
    id: "cat-chaussures",
    parent_id: "cat-mode",
    name_fr: "Chaussures & Baskets",
    name_ar: "أحذية وأحذية رياضية",
    slug: "chaussures",
    description_fr: "Sneakers urbaines, mocassins en cuir et sandales d'été.",
    description_ar: "أحذية رياضية مريحة وأحذية جلدية كلاسيكية وصنادل صيفية.",
    image_url: "/demo/tshirt-coton-bio.jpg",
    display_order: 5,
  },
  {
    id: "cat-maroquinerie",
    parent_id: "cat-mode",
    name_fr: "Sacs & Maroquinerie",
    name_ar: "حقائب ومصنوعات جلدية",
    slug: "sacs-maroquinerie",
    description_fr: "Sacs à main, sacs à dos urbains, portefeuilles et ceintures.",
    description_ar: "حقائب يد راقية، حقائب ظهر، محافظ وأحزمة جلدية أصلية.",
    image_url: "/demo/robe-ete-fleurie.jpg",
    display_order: 6,
  },

  // ================= 2. ÉLECTRONIQUE & HIGH-TECH =================
  {
    id: "cat-electronique",
    parent_id: null,
    name_fr: "Électronique & High-Tech",
    name_ar: "إلكترونيات وتكنولوجيا",
    slug: "electronique",
    description_fr: "Gadgets connectés, audio haute fidélité et accessoires mobiles.",
    description_ar: "أحدث الأجهزة الذكية، سماعات احترافية وإكسسوارات الهواتف.",
    image_url: "/demo/ecouteurs-sans-fil.jpg",
    display_order: 2,
  },
  {
    id: "cat-audio",
    parent_id: "cat-electronique",
    name_fr: "Audio & Écouteurs",
    name_ar: "صوتيات وسماعات",
    slug: "audio",
    description_fr: "Écouteurs sans fil TWS, casques réducteurs de bruit et enceintes Bluetooth.",
    description_ar: "سماعات أذن لاسلكية، سماعات رأس عازلة للضوضاء ومكبرات صوت بلوتوث.",
    image_url: "/demo/ecouteurs-sans-fil.jpg",
    display_order: 1,
  },
  {
    id: "cat-montres-accessoires",
    parent_id: "cat-electronique",
    name_fr: "Montres Connectées",
    name_ar: "ساعات ذكية",
    slug: "montres-accessoires",
    description_fr: "Smartwatches étanches, bracelets d'activité et trackers santé.",
    description_ar: "ساعات ذكية مقاومة للماء، أساور لياقة بدنية وتتبع نبضات القلب.",
    image_url: "/demo/montre-connectee.jpg",
    display_order: 2,
  },
  {
    id: "cat-telephones-tablettes",
    parent_id: "cat-electronique",
    name_fr: "Smartphones & Tablettes",
    name_ar: "هواتف وأجهزة لوحية",
    slug: "smartphones-tablettes",
    description_fr: "Smartphones récents, tablettes tactiles et liseuses électroniques.",
    description_ar: "أحدث الهواتف الذكية والأجهزة اللوحية للدراسة والعمل والترفيه.",
    image_url: "/demo/chargeur-rapide.jpg",
    display_order: 3,
  },
  {
    id: "cat-accessoires-charge",
    parent_id: "cat-electronique",
    name_fr: "Chargeurs & Câbles",
    name_ar: "شواحن وكابلات",
    slug: "chargeurs-cables",
    description_fr: "Chargeurs rapides USB-C, batteries externes Powerbank et câbles blindés.",
    description_ar: "شواحن سريعة، بطاريات متنقلة قوية وكابلات شحن فائقة المتانة.",
    image_url: "/demo/chargeur-rapide.jpg",
    display_order: 4,
  },
  {
    id: "cat-gaming",
    parent_id: "cat-electronique",
    name_fr: "Gaming & Jeux vidéo",
    name_ar: "ألعاب الفيديو وملحقاتها",
    slug: "gaming",
    description_fr: "Souris gamer RGB, claviers mécaniques, manettes et casques de jeu.",
    description_ar: "لوحات مفاتيح ميكانيكية، فارات ألعاب بدقة عالية وسماعات جيمنج محيطية.",
    image_url: "/demo/enceinte-bluetooth.jpg",
    display_order: 5,
  },

  // ================= 3. MAISON, DÉCO & CUISINE =================
  {
    id: "cat-maison-cuisine",
    parent_id: null,
    name_fr: "Maison & Cuisine",
    name_ar: "المنزل والمطبخ",
    slug: "maison-cuisine",
    description_fr:
      "Artisanat d'intérieur, vaisselle, rangements pratiques et petit électroménager.",
    description_ar: "ديكورات داخلية أنيقة، أدوات مطبخ عصرية وحلول تخزين ذكية.",
    image_url: "/demo/theiere-ceramique.jpg",
    display_order: 3,
  },
  {
    id: "cat-cuisine",
    parent_id: "cat-maison-cuisine",
    name_fr: "Cuisine & Arts de la table",
    name_ar: "أدوات المطبخ ومائدة الطعام",
    slug: "cuisine",
    description_fr: "Poêles antiadhésives, couteaux de chef, théières et vaisselle design.",
    description_ar: "أواني طبخ ممتازة، سكاكين احترافية، أباريق شاي وأطقم ضيافة فاخرة.",
    image_url: "/demo/theiere-ceramique.jpg",
    display_order: 1,
  },
  {
    id: "cat-rangement",
    parent_id: "cat-maison-cuisine",
    name_fr: "Rangement & Organisation",
    name_ar: "تنظيم وترتيب المنزل",
    slug: "rangement",
    description_fr: "Bocaux en verre hermétiques, boîtes modulables et paniers tressés.",
    description_ar: "برطمانات زجاجية صحية، علب تخزين منظمة وسلال خيزران طبيعية.",
    image_url: "/demo/bocaux-verre.jpg",
    display_order: 2,
  },
  {
    id: "cat-decoration",
    parent_id: "cat-maison-cuisine",
    name_fr: "Décoration d'intérieur",
    name_ar: "ديكور المنزل والتحف",
    slug: "decoration-interieur",
    description_fr: "Vases artisanaux, tableaux muraux, bougies parfumées et coussins déco.",
    description_ar: "مزهريات خزفية، لوحات فنية، شموع معطرة ووسائد زينة مريحة.",
    image_url: "/demo/theiere-ceramique.jpg",
    display_order: 3,
  },
  {
    id: "cat-linge-maison",
    parent_id: "cat-maison-cuisine",
    name_fr: "Linge de lit & Bain",
    name_ar: "مفروشات ومناشف",
    slug: "linge-maison",
    description_fr: "Parures de draps en coton satiné, couvertures douillettes et foutas en lin.",
    description_ar: "أغطية أسرة قطنية ناعمة، مناشف حمام فاخرة وفوط تونسية تقليدية.",
    image_url: "/demo/chemise-lin.jpg",
    display_order: 4,
  },

  // ================= 4. BEAUTÉ, SOINS & BIEN-ÊTRE =================
  {
    id: "cat-beaute",
    parent_id: null,
    name_fr: "Beauté & Bien-être",
    name_ar: "الجمال والعناية",
    slug: "beaute",
    description_fr: "Soins naturels du visage, du corps et huiles précieuses de Méditerranée.",
    description_ar: "منتجات عناية طبيعية بالبشرة والشعر، وزيوت نباتية نقية 100٪.",
    image_url: "/demo/huile-argan.jpg",
    display_order: 4,
  },
  {
    id: "cat-soins-visage",
    parent_id: "cat-beaute",
    name_fr: "Soins du Visage",
    name_ar: "العناية بالوجه",
    slug: "soins-visage",
    description_fr: "Sérums anti-âge, crèmes hydratantes, nettoyants doux et eaux florales.",
    description_ar: "سيرومات مغذية، كريمات ترطيب، غسول لطيف ومياه زهرية طبيعية.",
    image_url: "/demo/huile-argan.jpg",
    display_order: 1,
  },
  {
    id: "cat-soins",
    parent_id: "cat-beaute",
    name_fr: "Soins du Corps & Bain",
    name_ar: "العناية بالجسم والاستحمام",
    slug: "soins-corps",
    description_fr: "Savons noirs traditionnels à l'eucalyptus, gommages et crèmes corporelles.",
    description_ar: "صابون أسود تقليدي بالكافور، مقشرات طبيعية وكريمات ترطيب الجسم.",
    image_url: "/demo/savon-naturel.jpg",
    display_order: 2,
  },
  {
    id: "cat-cheveux",
    parent_id: "cat-beaute",
    name_fr: "Soins Capillaires",
    name_ar: "العناية بالشعر",
    slug: "soins-capillaires",
    description_fr: "Shampoings sans sulfate, masques nourrissants et huiles fortifiantes.",
    description_ar: "شامبو طبيعي بدون كبريتات، أقنعة تغذية عميقة وزيوت لتقوية الشعر.",
    image_url: "/demo/huile-argan.jpg",
    display_order: 3,
  },
  {
    id: "cat-parfums",
    parent_id: "cat-beaute",
    name_fr: "Parfums & Brumes",
    name_ar: "عطور ومعطرات",
    slug: "parfums",
    description_fr: "Eaux de parfum raffinées, brumes corporelles et extraits de musc.",
    description_ar: "عطور فواحة وراقية، معطرات جسم ومنتجات مسك شرقية مميزة.",
    image_url: "/demo/savon-naturel.jpg",
    display_order: 4,
  },

  // ================= 5. ARTISANAT TUNISIEN & TERROIR =================
  {
    id: "cat-artisanat-terroir",
    parent_id: null,
    name_fr: "Artisanat & Terroir",
    name_ar: "صناعات تقليدية ومنتجات محلية",
    slug: "artisanat-terroir",
    description_fr:
      "Le savoir-faire authentique des artisans tunisiens : poterie, tissage et terroir.",
    description_ar: "أصالة الصناعة التقليدية التونسية: فخار نابل، مرقوم القيروان ومنتجات التراث.",
    image_url: "/demo/theiere-ceramique.jpg",
    display_order: 5,
  },
  {
    id: "cat-poterie-nabeul",
    parent_id: "cat-artisanat-terroir",
    name_fr: "Poterie & Céramique de Nabeul",
    name_ar: "خزف وفخار نابل",
    slug: "poterie-ceramique",
    description_fr: "Plats à couscous peints à la main, tajines décoratifs et bols traditionnels.",
    description_ar: "أطباق فخارية مرسومة باليد، طواجن تقليدية وزخارف فنية نابلية أصيلة.",
    image_url: "/demo/theiere-ceramique.jpg",
    display_order: 1,
  },
  {
    id: "cat-bois-olivier",
    parent_id: "cat-artisanat-terroir",
    name_fr: "Bois d'Olivier sculpté",
    name_ar: "خشب الزيتون المنحوت",
    slug: "bois-olivier",
    description_fr:
      "Mortiers, cuillères, planches à découper et saladiers en bois d'olivier massif.",
    description_ar: "مهاويس، ملاعق، ألواح تقطيع وأوعية فخمة منحوتة من خشب الزيتون التونسي.",
    image_url: "/demo/bocaux-verre.jpg",
    display_order: 2,
  },
  {
    id: "cat-tapis-margoum",
    parent_id: "cat-artisanat-terroir",
    name_fr: "Tapis & Margoum de Kairouan",
    name_ar: "زرابي ومرقوم القيروان",
    slug: "tapis-margoum",
    description_fr:
      "Tapis berbères faits main en pure laine et klims traditionnels aux motifs géométriques.",
    description_ar: "زرابي من الصوف الخالص منسوجة يدوياً ومرقوم تقليدي بنقوش هندسية ساحرة.",
    image_url: "/demo/chemise-lin.jpg",
    display_order: 3,
  },
  {
    id: "cat-terroir-tunisien",
    parent_id: "cat-artisanat-terroir",
    name_fr: "Produits du Terroir & Huile d'Olive",
    name_ar: "زيت زيتون ومؤونة تونسية",
    slug: "produits-terroir",
    description_fr:
      "Huile d'olive extra vierge pressée à froid, miel de thym, harissa artisanale et bsissa.",
    description_ar: "زيت زيتون بكر ممتاز معصور على البارد، عسل سدر وزعتر، هريسة عربي وبسيسة.",
    image_url: "/demo/huile-argan.jpg",
    display_order: 4,
  },

  // ================= 6. SPORT & FITNESS =================
  {
    id: "cat-sport",
    parent_id: null,
    name_fr: "Sport & Fitness",
    name_ar: "رياضة ولياقة بدنية",
    slug: "sport-fitness",
    description_fr: "Matériel d'entraînement, tenues sportives respirantes et accessoires outdoor.",
    description_ar: "معدات التمارين الرياضية، ملابس رياضية مريحة ومستلزمات اللياقة.",
    image_url: "/demo/montre-connectee.jpg",
    display_order: 6,
  },
  {
    id: "cat-fitness-equipement",
    parent_id: "cat-sport",
    name_fr: "Équipements de Musculation",
    name_ar: "معدات وأوزان رياضية",
    slug: "musculation-fitness",
    description_fr:
      "Haltères réglables, élastiques de résistance, tapis de yoga et cordes à sauter.",
    description_ar: "أثقال، أحبال مقاومة مرنة، سجادات يوغا مريحة وحبال قفز للتمارين المنزلية.",
    image_url: "/demo/montre-connectee.jpg",
    display_order: 1,
  },
  {
    id: "cat-sport-textile",
    parent_id: "cat-sport",
    name_fr: "Vêtements & Baskets de Sport",
    name_ar: "أزياء رياضية وأحذية تمرين",
    slug: "textile-sport",
    description_fr:
      "Leggings de compression, t-shirts respirants dry-fit et shorts d'entraînement.",
    description_ar: "ملابس رياضية سريعة الجفاف، بناطيل ضغط وشورتات تدريب مريحة.",
    image_url: "/demo/tshirt-coton-bio.jpg",
    display_order: 2,
  },
  {
    id: "cat-camping-outdoor",
    parent_id: "cat-sport",
    name_fr: "Camping & Randonnée",
    name_ar: "تخييم ورحلات برية",
    slug: "camping-randonnee",
    description_fr: "Tentes légères, sacs de couchage, lampes frontales et gourdes isothermes.",
    description_ar: "خيام سريعة التركيب، أكياس نوم دافئة، مصابيح كشاف وقوارير حافظة للحرارة.",
    image_url: "/demo/enceinte-bluetooth.jpg",
    display_order: 3,
  },

  // ================= 7. BÉBÉ & ENFANTS =================
  {
    id: "cat-bebe-enfants",
    parent_id: null,
    name_fr: "Bébés & Enfants",
    name_ar: "أطفال ورضع",
    slug: "bebes-enfants",
    description_fr:
      "Vêtements doux pour bébés, puériculture, jeux éducatifs et accessoires d'éveil.",
    description_ar: "ملابس قطنية ناعمة للمواليد، ألعاب ذكاء وتنمية المهارات ومستلزمات الأطفال.",
    image_url: "/demo/robe-ete-fleurie.jpg",
    display_order: 7,
  },
  {
    id: "cat-mode-bebe",
    parent_id: "cat-bebe-enfants",
    name_fr: "Vêtements Bébé & Enfant",
    name_ar: "ملابس الرضع والأطفال",
    slug: "mode-bebe-enfant",
    description_fr: "Bodys 100% coton, pyjamas douillets et ensembles colorés pour enfants.",
    description_ar: "تبانات قطنية نقية، بيجامات مريحة وأطقم ملابس مبهجة للأطفال.",
    image_url: "/demo/tshirt-coton-bio.jpg",
    display_order: 1,
  },
  {
    id: "cat-jouets-eveil",
    parent_id: "cat-bebe-enfants",
    name_fr: "Jeux & Jouets d'éveil",
    name_ar: "ألعاب تعليمية وترفيهية",
    slug: "jouets-eveil",
    description_fr:
      "Jouets en bois Montessori, puzzles d'éveil, peluches douces et jeux de société.",
    description_ar: "ألعاب مونتيسوري خشبية لتنمية الذكاء، ألغاز تعليمية ودمى ناعمة.",
    image_url: "/demo/bocaux-verre.jpg",
    display_order: 2,
  },

  // ================= 8. LIVRES & CULTURE =================
  {
    id: "cat-livres-culture",
    parent_id: null,
    name_fr: "Livres & Papeterie",
    name_ar: "كتب وقرطاسية",
    slug: "livres-papeterie",
    description_fr:
      "Romans passionnants, livres de développement personnel, carnets et stylos de calligraphie.",
    description_ar: "روايات أدبية، كتب تطوير الذات، دفاتر ملاحظات فاخرة وأدوات خط عربي.",
    image_url: "/demo/theiere-ceramique.jpg",
    display_order: 8,
  },
  {
    id: "cat-litterature",
    parent_id: "cat-livres-culture",
    name_fr: "Romans & Littérature",
    name_ar: "روايات وأدب",
    slug: "romans-litterature",
    description_fr:
      "Classiques de la littérature arabe et française, polars et romans historiques.",
    description_ar: "أشهر الروايات العالمية والعربية، كتب الأدب والتاريخ وقصص مشوقة.",
    image_url: "/demo/theiere-ceramique.jpg",
    display_order: 1,
  },
  {
    id: "cat-papeterie",
    parent_id: "cat-livres-culture",
    name_fr: "Carnets & Fournitures de Bureau",
    name_ar: "أجندات ومستلزمات مكتبية",
    slug: "papeterie-bureau",
    description_fr: "Agendas en cuir, carnets lignés, stylos plumes et accessoires d'organisation.",
    description_ar: "أجندات سنوية راقية، دفاتر فاخرة، أقلام حبر ممتازة ومنظمات مكتب.",
    image_url: "/demo/bocaux-verre.jpg",
    display_order: 2,
  },
];

export const getPublicCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicCategory[]> => {
    const sb = publicClient();
    const { data, error } = await sb
      .from("categories")
      .select(
        "id,parent_id,name_fr,name_ar,slug,description_fr,description_ar,image_url,display_order",
      )
      .eq("is_active", true)
      .order("display_order")
      .order("name_fr");
    if (error) {
      if (error.message?.includes("schema cache") || error.code === "PGRST205") {
        return MOCK_CATEGORIES;
      }
      throw new Error(error.message);
    }
    // hide children whose parent is inactive (not returned)
    const ids = new Set((data ?? []).map((c) => c.id));
    const active = (data ?? []).filter((c) => !c.parent_id || ids.has(c.parent_id));

    // Merge database categories with enriched catalog categories
    const existingSlugs = new Set(active.map((c) => c.slug));
    const missing = MOCK_CATEGORIES.filter((m) => !existingSlugs.has(m.slug));
    const merged = [...active, ...missing].sort(
      (a, b) => a.display_order - b.display_order || a.name_fr.localeCompare(b.name_fr),
    );
    return merged.length > 0 ? merged : MOCK_CATEGORIES;
  },
);

const FALLBACK_SETTINGS: Database["public"]["Tables"]["store_settings"]["Row"] = {
  id: true,
  store_name: "weshop",
  currency: "TND",
  support_email: "contact@weshop.tn",
  support_phone: "+216 71 000 000",
  delivery_fee: 7,
  free_delivery_threshold: 150,
  delivery_cities: [
    "Tunis",
    "Ariana",
    "Ben Arous",
    "Manouba",
    "Nabeul",
    "Zaghouan",
    "Bizerte",
    "Béja",
    "Jendouba",
    "Le Kef",
    "Siliana",
    "Sousse",
    "Monastir",
    "Mahdia",
    "Sfax",
    "Kairouan",
    "Kasserine",
    "Sidi Bouzid",
    "Gabès",
    "Médenine",
    "Tataouine",
    "Gafsa",
    "Tozeur",
    "Kébili",
  ],
  announcement_fr: "Livraison offerte dès 150 DT — paiement à la livraison",
  announcement_ar: "توصيل مجاني ابتداءً من 150 د.ت — الدفع عند الاستلام",
  default_low_stock_threshold: 5,
  return_window_days: 14,
  updated_at: new Date().toISOString(),
};

export const getStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("store_settings").select("*").maybeSingle();
  if (error) {
    if (error.message?.includes("schema cache") || error.code === "PGRST205") {
      return FALLBACK_SETTINGS;
    }
    throw new Error(error.message);
  }
  return data ?? FALLBACK_SETTINGS;
});

export const publicCategoriesQuery = () =>
  queryOptions({
    queryKey: ["public", "categories"],
    queryFn: () => getPublicCategories(),
    staleTime: 60_000,
  });

export const storeSettingsQuery = () =>
  queryOptions({
    queryKey: ["public", "settings"],
    queryFn: () => getStoreSettings(),
    staleTime: 60_000,
  });
