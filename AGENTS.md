<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (weshop)

- Critical business operations (orders, stock moves, cash collection, returns, role grants) run only through SECURITY DEFINER database functions; clients never write orders/inventory/finance tables directly. Why: guarantees each stock reservation, release, restock and accounting entry happens exactly once.
- Every product sells through variants; a product without options gets one default variant. Why: stock, cost and order lines stay uniform per variant.
- Purchase costs live in admin-only tables (`product_private`, `variant_costs`), never on public catalog rows. Why: public catalog reads must not expose margins.
- Catalog images go in the private `catalog` bucket with long-lived signed links stored on the row (workspace blocks public buckets). Why: images must render for anonymous shoppers.
- Bilingual content uses `_fr` / `_ar` column pairs read through `pickLocale`; UI strings use `useI18n().t` or `tr(fr, ar)`. Why: French default with Arabic RTL everywhere.
- Public storefront reads go through `src/lib/catalog.functions.ts` server functions with the publishable key so pages render on the server. Why: SEO and fast first paint.
- AI product copy is generated only through the admin-gated `generateDescription` server function (`src/lib/ai-description.functions.ts` → `src/lib/ai/description.server.ts`), driven by admin-managed rows in `description_templates`; the reusable `DescriptionGenerator` component exposes `onApply` so the product form can reuse it. Why: prompts and the AI key stay server-side, and writing styles stay editable without code changes.
