import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header
        className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-[12px]"
        style={{ background: "rgba(0,0,0,0.80)" }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 select-none min-w-0">
            <img
              src="/images/logo.png"
              alt="Toma Lounge Logo"
              fetchPriority="high"
              className="w-auto object-contain shrink-0 transition-all duration-[250ms] ease-in-out group-hover:scale-[1.03]"
              style={{ height: "40px" }}
              onMouseEnter={e => (e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(32,200,245,0.18))")}
              onMouseLeave={e => (e.currentTarget.style.filter = "")}
            />
            <div className="flex flex-col justify-center leading-none min-w-0">
              <span
                className="font-bold tracking-[0.04em] truncate"
                style={{ fontFamily: "'Cinzel', serif", color: "#20C8F5", fontSize: "clamp(13px, 1.3vw, 17px)", fontWeight: 700 }}
              >
                TOMA LOUNGE
              </span>
              <span
                className="hidden sm:block mt-0.5"
                style={{ fontFamily: "'Inter', sans-serif", color: "#B89663", fontSize: "11px", fontWeight: 400 }}
              >
                Where Taste Meets Comfort
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+971581095540" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              058 109 5540
            </a>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/contact">Order Now</Link>
            </Button>
          </div>

          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-foreground hover:text-primary transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col md:hidden"
          style={{ background: "rgba(0,0,0,0.97)", paddingTop: "64px" }}
        >
          <nav className="flex flex-col items-center justify-center flex-1 gap-1 py-8">
            {NAV_LINKS.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="w-full text-center py-4 text-2xl font-medium text-foreground hover:text-primary active:text-primary transition-colors"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pb-10 flex flex-col items-center gap-3">
            <a href="tel:+971581095540" className="text-sm text-muted-foreground mb-1">058 109 5540</a>
            <Button
              asChild
              size="lg"
              className="w-full max-w-xs bg-primary text-black font-semibold"
            >
              <Link href="/contact" onClick={() => setMenuOpen(false)}>Reserve a Table</Link>
            </Button>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card mt-12 py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-primary">TOMA LOUNGE</h3>
            <p className="text-sm text-muted-foreground">Where Taste Meets Comfort</p>
            <p className="text-sm text-muted-foreground mt-2">Syrian & Middle Eastern Cuisine<br/>Premium Shisha Lounge</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Visit Us</h4>
            <address className="text-sm text-muted-foreground not-italic">
              Cayan Business Center<br />
              Al Thanyah First, Barsha Heights (Tecom)<br />
              Dubai, UAE
            </address>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Hours</h4>
            <p className="text-sm text-muted-foreground">Daily 8:00 AM – 3:00 AM</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-secondary">Contact</h4>
            <p className="text-sm text-muted-foreground">058 109 5540</p>
            <p className="text-sm text-muted-foreground">04 577 0217</p>
            <div className="flex gap-4 mt-4">
              <a href="https://wa.me/971581095540" className="text-primary hover:text-primary/80">WhatsApp</a>
              <a href="https://instagram.com/toma_lounge_dubai" className="text-primary hover:text-primary/80">Instagram</a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border/40 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Toma Lounge Dubai. All rights reserved.
        </div>
      </footer>

      <a
        href="https://wa.me/971581095540"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
}
