import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useI18n } from "@/i18n";

const NotFound = () => {
  const location = useLocation();
  const { lang, t, path } = useI18n();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Helmet htmlAttributes={{ lang }}>
        <title>{t("seo.notFound.title")}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">{t("notFound.text")}</p>
        <Link to={path("/")} className="text-primary underline hover:text-primary/90">
          {t("notFound.home")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
