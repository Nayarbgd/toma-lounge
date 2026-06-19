import { Link } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur-[12px]" style={{ background: "rgba(0,0,0,0.80)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 select-none">
            <img
              src="/images/logo.png"
              alt="Toma Lounge Logo"
              fetchPriority="high"
              className="w-auto object-contain transition-all duration-[250ms] ease-in-out group-hover:scale-[1.03]"
              style={{
                height: "44px",
                filter: "drop-shadow(0 0 0px rgba(32,200,245,0))",
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(32,200,245,0.18))")}
              onMouseLeave={e => (e.currentTarget.style.filter = "drop-shadow(0 0 0px rgba(32,200,245,0))")}
            />
            <div className="flex flex-col justify-center leading-none">
              <span
                className="font-bold tracking-[0.04em]"
                style={{ fontFamily: "'Cinzel', serif", color: "#20C8F5", fontSize: "clamp(14px, 1.4vw, 18px)", fontWeight: 700 }}
              >
                TOMA LOUNGE
              </span>
              <span
                className="hidden sm:block mt-0.5"
                style={{ fontFamily: "'Inter', sans-serif", color: "#B89663", fontSize: "11px", fontWeight: 400, letterSpacing: "0.02em" }}
              >
                Where Taste Meets Comfort
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/menu" className="hover:text-primary transition-colors">Menu</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
            <Link href="/reviews" className="hover:text-primary transition-colors">Reviews</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <a href="tel:+971581095540" className="text-sm font-medium hidden sm:block text-muted-foreground hover:text-foreground">
              058 109 5540
            </a>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/contact">Order Now</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card mt-12 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
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
