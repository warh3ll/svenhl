import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useSyncNHLData } from "@/hooks/useNHLData";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const location = useLocation();
  const { toast } = useToast();
  const syncMutation = useSyncNHLData();

  const navItems = [
    { href: "/", label: "Game Feed" },
    { href: "/statistics", label: "Statistics" },
  ];

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync('20242025');
      toast({
        title: 'Sync Complete',
        description: 'All NHL data has been updated successfully.',
      });
    } catch {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync NHL data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">🇸🇪</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">SVENHL</span>
            <span className="text-xs text-muted-foreground">Tracking Swedish points in the NHL</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
