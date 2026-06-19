import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin, Phone, Flame, Wind, Users, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Toma Lounge",
    "image": "/images/interior.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Cayan Business Center, Al Thanyah First",
      "addressLocality": "Barsha Heights (Tecom)",
      "addressRegion": "Dubai",
      "addressCountry": "UAE"
    },
    "telephone": "+971581095540",
    "openingHours": "Mo-Su 08:00-03:00",
    "priceRange": "AED 50-100",
    "servesCuisine": ["Syrian", "Middle Eastern"],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.4",
      "reviewCount": "231"
    }
  };

  return (
    <div className="w-full">
      <title>Toma Lounge | Syrian Restaurant & Shisha Lounge in Barsha Heights</title>
      <meta name="description" content="Syrian restaurant Tecom Dubai, shisha lounge Barsha Heights, Arabic restaurant Dubai late night. Open until 3 AM." />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/interior.png" 
            alt="Toma Lounge Interior" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-6 text-sm font-medium">
              <Clock size={14} /> Open Until 3 AM
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground mb-6">
              Where Taste Meets <span className="text-primary">Comfort</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Premium charcoal grills, artful mezze, and an opulent shisha lounge in the heart of Barsha Heights.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/contact">Reserve a Table</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10" asChild>
                <Link href="/menu">View Menu</Link>
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="flex text-secondary">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <span className="font-medium">4.4 Google Rating</span>
              <span className="text-muted-foreground">(231 Reviews)</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Our Signatures</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Authentic Syrian recipes prepared with passion and premium ingredients.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Mixed Grill Platter", desc: "Perfectly charred selection of premium meats.", img: "/images/grill.png" },
              { title: "Artful Mezze", desc: "Hummus Bairouti, falafel, and fresh homemade sides.", img: "/images/mezze.png" },
              { title: "Chicken Shawarma", desc: "The best street-style shawarma in Dubai.", img: "/images/shawarma.png" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative overflow-hidden rounded-xl border border-border/50"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 bg-background">
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shisha Callout */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/shisha.png" alt="Shisha Lounge" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-secondary mb-6">Late Night Lounge</h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Experience the perfect evening ambiance. Premium shisha starting from AED 40, paired with our signature Mint Margherita or Americano. Open until 3 AM every day.
            </p>
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <Link href="/menu">View Shisha Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Toma Lounge */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">Why Toma Lounge</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need for a perfect evening — from the first bite to the last smoke.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Flame className="w-7 h-7 text-primary" />, title: "Charcoal Grilled", desc: "Every cut slow-cooked over open charcoal for maximum flavour and tenderness." },
              { icon: <Wind className="w-7 h-7 text-primary" />, title: "Premium Shisha", desc: "From AED 40. A wide selection of flavours in a calm, elegant setting." },
              { icon: <Users className="w-7 h-7 text-primary" />, title: "For Every Occasion", desc: "Intimate dinners, group gatherings, business lunches — we set the mood right." },
              { icon: <Moon className="w-7 h-7 text-primary" />, title: "Open Until 3 AM", desc: "Dubai never sleeps, and neither do we. Come late, stay late." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-border/50 bg-background"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews teaser */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">What Our Guests Say</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex text-secondary">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="font-medium text-foreground">4.4</span>
              <span className="text-muted-foreground text-sm">· 231 Google Reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-10">
            {[
              { name: "Sami Ibrahim", date: "5 months ago", text: "My visit was exceptional. The place is elegant and comfortable, with a calm, refined atmosphere. The food was excellent in quality, flavor, and presentation. The service exceeded expectations, especially thanks to Captain Maher. I highly recommend Toma Lounge." },
              { name: "Tomson Issac", date: "1 month ago", text: "We ordered the full grilled chicken and the mixed grill platter. Both the meat and chicken were incredibly tender! The best part was the complimentary side dishes—hummus, olives, and pickles. Also, the 40 AED shisha is definitely worth it in Barsha heights." },
            ].map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card border border-border p-8 rounded-2xl relative"
              >
                <div className="absolute top-0 right-8 -translate-y-1/2 text-6xl font-serif text-primary/20">"</div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="font-bold text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex text-secondary">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic">"{review.text}"</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/reviews">
              <span className="inline-flex items-center gap-2 border border-secondary text-secondary hover:bg-secondary/10 transition-colors px-8 py-3 rounded-full font-medium text-sm cursor-pointer">
                <Star size={14} fill="currentColor" />
                See All Reviews
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Find Us / Final CTA */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Come Find Us</h2>
              <p className="text-muted-foreground leading-relaxed">In the heart of Barsha Heights, steps from the Cayan Business Center. Whether you're coming for lunch, a family dinner, or a late-night shisha session — we're always ready.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <span>Cayan Business Center, Al Thanyah First, Barsha Heights, Dubai</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone size={16} className="text-primary shrink-0" />
                  <span>058 109 5540 &nbsp;·&nbsp; 04 577 0217</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock size={16} className="text-primary shrink-0" />
                  <span>Open Daily · 8:00 AM – 3:00 AM</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" asChild>
                  <Link href="/contact">Reserve a Table</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild>
                  <Link href="/menu">View Full Menu</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 rounded-2xl overflow-hidden border border-border h-72 w-full">
              <iframe
                title="Toma Lounge Map"
                src="https://maps.google.com/maps?q=Toma+Lounge+Cayan+Business+Center+Barsha+Heights+Dubai&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
