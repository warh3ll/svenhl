import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MaterialIcon from "@/components/ui/material-icon";
import { useSpoiler } from "@/contexts/SpoilerContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import svenhlLogo from "@/assets/svenhl-logo.svg";
import { englishPath, localizePath, useI18n } from "@/i18n";

// The first page a visitor lands on keeps the browser's normal focus. After that, every
// in-app navigation moves focus to the new page's heading so screen readers announce it.
let isFirstPage = true;
const focusPageHeading = () => {
  const main = document.getElementById("main");
  const target = main?.querySelector<HTMLElement>("h1") ?? main;
  if (!target) return;
  if (target !== main) target.tabIndex = -1;
  target.focus();
};
const Header = () => {
  const location = useLocation();
  const {
    spoilerMode,
    toggleSpoilerMode
  } = useSpoiler();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, t, path } = useI18n();
  // The same page in the other language
  const otherLang = lang === "en" ? "sv" : "en";
  const otherLangPath = localizePath(englishPath(location.pathname), otherLang);
  useEffect(() => {
    if (isFirstPage) {
      isFirstPage = false;
      return;
    }
    focusPageHeading();
  }, [location.pathname]);
  const navItems = [{
    href: path("/"),
    label: t("nav.gameFeed")
  }, {
    href: path("/statistics"),
    label: t("nav.statistics")
  }, {
    href: path("/teams"),
    label: t("nav.teams")
  }];
  const NavLinks = ({
    mobile = false,
    onNavigate
  }: {
    mobile?: boolean;
    onNavigate?: () => void;
  }) => <>
      {navItems.map(item => <Link key={item.href} to={item.href} onClick={onNavigate} aria-current={location.pathname === item.href ? "page" : undefined} className={cn("whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors", mobile && "w-full text-left", location.pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
          {item.label}
        </Link>)}
    </>;
  const ActionButtons = ({
    mobile = false
  }: {
    mobile?: boolean;
  }) => <div className={cn("flex items-center gap-2", mobile && "flex-col w-full")}>
      <Button variant="outline" size="sm" onClick={toggleSpoilerMode} className={cn(mobile && "w-full justify-start")}>
        {spoilerMode ? <>
            <MaterialIcon name="visibility_off" size="sm" className="mr-2" />
            {t("spoiler.show")}
          </> : <>
            <MaterialIcon name="visibility" size="sm" className="mr-2" />
            {t("spoiler.hide")}
          </>}
      </Button>
      <Button variant="ghost" size="sm" asChild className={cn(mobile && "w-full justify-start")}>
        <Link to={otherLangPath} lang={otherLang} hrefLang={otherLang} aria-label={t("language.switchLabel")}>
          <MaterialIcon name="language" size="sm" className="mr-2" />
          {t("language.switch")}
        </Link>
      </Button>
    </div>;
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        {t("nav.skipToContent")}
      </a>
      <div className="container h-16 flex items-center justify-between">
        <Link to={path("/")} className="flex items-center gap-3">
          <img src={svenhlLogo} alt="" width={40} height={40} className="h-10 w-10 aspect-square" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">SVENHL</span>
            <span className="text-xs text-muted-foreground hidden sm:block md:hidden lg:block">{t("site.tagline")}</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-1">
            <NavLinks />
          </nav>
          <ActionButtons />
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <MaterialIcon name="menu" size="md" />
              <span className="sr-only">{t("nav.openMenu")}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="text-left">{t("nav.menu")}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 mt-6">
              <nav className="flex flex-col gap-2">
                <NavLinks mobile onNavigate={() => setMobileMenuOpen(false)} />
              </nav>
              <div className="border-t border-border pt-4">
                <ActionButtons mobile />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>;
};
export default Header;