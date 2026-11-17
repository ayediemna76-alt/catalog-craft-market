import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Read-only client with the publishable key; RLS limits it to public rows. */
const publicClient = createServerOnlyFn(() => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
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

export const getPublicCategories = createServerFn({ method: "GET" }).handler(async (): Promise<PublicCategory[]> => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("categories")
    .select("id,parent_id,name_fr,name_ar,slug,description_fr,description_ar,image_url,display_order")
    .eq("is_active", true)
    .order("display_order")
    .order("name_fr");
  if (error) throw new Error(error.message);
  // hide children whose parent is inactive (not returned)
  const ids = new Set(data.map((c) => c.id));
  return data.filter((c) => !c.parent_id || ids.has(c.parent_id));
});

export const getStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("store_settings").select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const publicCategoriesQuery = () =>
  queryOptions({ queryKey: ["public", "categories"], queryFn: () => getPublicCategories(), staleTime: 60_000 });

export const storeSettingsQuery = () =>
  queryOptions({ queryKey: ["public", "settings"], queryFn: () => getStoreSettings(), staleTime: 60_000 });
