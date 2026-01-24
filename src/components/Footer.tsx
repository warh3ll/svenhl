import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="container flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
        <div>
          <p>Data updated every 2 hours. Stats provided for informational purposes.</p>
          <p className="mt-1">🇸🇪 Celebrating Swedish excellence in the NHL</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="bg-[#FF5E5B] hover:bg-[#FF5E5B]/90 text-white border-[#FF5E5B] hover:border-[#FF5E5B]/90"
        >
          <a
            href="https://ko-fi.com/svenhl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://storage.ko-fi.com/cdn/cup-border.png"
              alt=""
              className="h-4 w-4 mr-2"
            />
            Support Us
          </a>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
