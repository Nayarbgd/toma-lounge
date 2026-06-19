import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin, Phone } from "lucide-react";
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
    </div>
  );
}
