import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MaterialIcon from "@/components/ui/material-icon";
import { useSpoiler } from "@/contexts/SpoilerContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import svenhlLogo from "@/assets/svenhl-logo.png";
const Header = () => {
  const location = useLocation();
  const {
    spoilerMode,
    toggleSpoilerMode
  } = useSpoiler();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [{
    href: "/",
    label: "Game Feed"
  }, {
    href: "/statistics",
    label: "Statistics"
  }, {
    href: "/teams",
    label: "Teams"
  }];
  const NavLinks = ({
    mobile = false,
    onNavigate
  }: {
    mobile?: boolean;
    onNavigate?: () => void;
  }) => <>
      {navItems.map(item => <Link key={item.href} to={item.href} onClick={onNavigate} className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-colors", mobile && "w-full text-left", location.pathname === item.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
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
            Show Scores
          </> : <>
            <MaterialIcon name="visibility" size="sm" className="mr-2" />
            Hide Scores
          </>}
      </Button>
    </div>;
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={svenhlLogo} alt="SVENHL Logo" width={40} height={40} className="h-10 w-10 aspect-square" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">SVENHL</span>
            <span className="text-xs text-muted-foreground hidden sm:block">Tracking Swedish points in the NHL</span>
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
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px]">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
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