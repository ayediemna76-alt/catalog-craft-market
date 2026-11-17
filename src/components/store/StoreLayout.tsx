import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { publicCategoriesQuery, storeSettingsQuery, type PublicCategory } from "@/lib/catalog.functions";
import { pickLocale, useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { AccountMenu } from "./AccountMenu";

function CategoryMenu({ categories }: { categories: PublicCategory[] }) {
  const { t, locale } = useI18n();
  const roots = categories.filter((c) => !c.parent_id);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          {t("nav.categories")} <ChevronDown className="opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {roots.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">{t("home.categories.empty")}</div>}
        {roots.map((c) => (
          <DropdownMenuItem key={c.id} asChild>
            <Link to="/categories" hash={c.slug}>
              {pickLocale(c, "name", locale)}
            </Link>
          </DropdownMenuItem>
        ))}
        {roots.length > 0 && (
          <DropdownMenuItem asChild>
            <Link to="/categories" className="font-medium text-primary">
              {t("categories.title")} →
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StoreLayout({ children }: { children: ReactNode }) {
  const { t, locale } = useI18n();
  const { data: categories = [] } = useQuery(publicCategoriesQuery());
  const { data: settings } = useQuery(storeSettingsQuery());
  const announcement = settings ? pickLocale(settings, "announcement", locale) : "";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {announcement && (
        <div className="bg-ink text-ink-foreground">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-xs font-medium">
            <Truck className="h-3.5 w-3.5" /> {announcement}
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side={locale === "ar" ? "right" : "left"} className="w-72">
              <SheetHeader>
                <SheetTitle className="text-start">weshop</SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-1 px-4">
                <Link to="/" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent">{t("nav.home")}</Link>
                <Link to="/categories" className="rounded-md px-2 py-2 text-sm font-medium hover:bg-accent">{t("nav.categories")}</Link>
                {categories.filter((c) => !c.parent_id).map((c) => (
                  <Link key={c.id} to="/categories" hash={c.slug} className="rounded-md px-4 py-1.5 text-sm text-muted-foreground hover:bg-accent">
                    {pickLocale(c, "name", locale)}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Logo />
          <nav className="ms-4 hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>{t("nav.home")}</Link>
            </Button>
            <CategoryMenu categories={categories} />
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <LanguageToggle />
            <AccountMenu />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-16 border-t bg-muted/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">{t("brand.tagline")}</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">{t("nav.categories")}</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {categories.filter((c) => !c.parent_id).slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link to="/categories" hash={c.slug} className="hover:text-foreground">{pickLocale(c, "name", locale)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{t("home.perk.cod")}</p>
            <p>{t("footer.cod")}</p>
            {settings?.support_phone && <p dir="ltr" className="text-start">{settings.support_phone}</p>}
          </div>
        </div>
        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} weshop. {t("footer.rights")}
        </div>
      </footer>
    </div>
  );
}
