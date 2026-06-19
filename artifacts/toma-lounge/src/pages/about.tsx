import { motion } from "framer-motion";

export function About() {
  return (
    <div className="w-full">
      <title>About Us | Toma Lounge Dubai</title>
      <meta name="description" content="Discover the authentic Syrian story behind Toma Lounge. Late-night dining, fresh ingredients, and genuine Middle Eastern hospitality in Barsha Heights." />
      
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/interior.png" alt="Toma Lounge Ambience" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6"
          >
            Our <span className="text-secondary">Story</span>
          </motion.h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl space-y-12 md:space-y-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-6">Authentic Syrian Heritage</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Born from a passion for genuine Levantine cuisine, Toma Lounge brings the rich culinary traditions of Syria to the heart of Dubai. Every dish we serve carries the warmth of home, prepared using time-honored techniques and recipes passed down through generations.
              </p>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-border/50">
              <img src="/images/shawarma.png" alt="Authentic Shawarma" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse"
          >
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-serif font-bold text-secondary mb-6">The Culture of Generosity</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                In Middle Eastern culture, a meal is a celebration. We believe in the tradition of complimentary sides — fresh bread, olives, pickles, and dips that welcome you before your main course arrives. It is our way of saying "Ahlan wa Sahlan" (Welcome).
              </p>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-border/50 order-2 md:order-1">
              <img src="/images/mezze.png" alt="Mezze Spread" className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-6">Late-Night Atmosphere</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                As the city winds down, Toma Lounge comes alive. Open until 3 AM daily, our lounge offers a moody, candlelit sanctuary for night owls. Whether you're here for an elite shisha session or a late-night feast, our space is designed for comfort, conversation, and memories.
              </p>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-border/50">
              <img src="/images/shisha.png" alt="Shisha Lounge" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
