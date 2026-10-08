import { Button } from "@/components/ui/button";
const Footer = () => {
  return <footer className="border-t border-border bg-card py-6">
      <div className="container flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
        <div>
          <p>Data updated every several times per day. Stats provided for informational purposes.</p>
          <p className="mt-1">🇸🇪 Celebrating Swedish excellence in the NHL</p>
        </div>
        <Button variant="outline" size="sm" asChild className="bg-[#C9302C] hover:bg-[#C9302C]/90 text-white hover:text-white border-[#C9302C] hover:border-[#C9302C]/90">
          <a href="https://ko-fi.com/svenhl" target="_blank" rel="noopener noreferrer">
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" className="h-4 w-4 mr-2" />
            Support Us
          </a>
        </Button>
      </div>
    </footer>;
};
export default Footer;