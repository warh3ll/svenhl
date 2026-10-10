import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
const Footer = () => {
  const { t } = useI18n();
  return <footer className="border-t border-border bg-card py-6">
      <div className="container flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
        <div>
          <p>{t("footer.dataNote")}</p>
          <p className="mt-1">{t("footer.celebrating")}</p>
        </div>
        <Button variant="outline" size="sm" asChild className="bg-[#C9302C] hover:bg-[#C9302C]/90 text-white hover:text-white border-[#C9302C] hover:border-[#C9302C]/90">
          <a href="https://ko-fi.com/svenhl" target="_blank" rel="noopener noreferrer">
            <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" className="h-4 w-4 mr-2" />
            {t("footer.support")}
          </a>
        </Button>
      </div>
    </footer>;
};
export default Footer;