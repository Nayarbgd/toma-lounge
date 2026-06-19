import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";

export function Gallery() {
  const images = [
    { src: "/images/grill.png", alt: "Mixed grill platter on charcoal grill, close-up, warm amber light", span: "md:col-span-2 md:row-span-2" },
    { src: "/images/mezze.png", alt: "Arabic mezze spread with hummus, falafel, olives on a dark wood table", span: "col-span-1 row-span-1" },
    { src: "/images/shisha.png", alt: "Shisha lounge interior, moody evening ambiance", span: "col-span-1 row-span-1" },
    { src: "/images/shawarma.png", alt: "Chicken shawarma wrap, street food style", span: "col-span-1 row-span-1" },
    { src: "/images/interior.png", alt: "Restaurant interior, dimly lit, warm gold lighting", span: "col-span-1 row-span-1" },
    { src: "/images/buffet.png", alt: "Ramadan iftar buffet setup, generous spread", span: "md:col-span-2 md:row-span-1" }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <title>Gallery | Toma Lounge</title>
      <meta name="description" content="Explore the opulent ambiance, charcoal grills, and premium shisha of Toma Lounge in Dubai." />
      
      <Reveal variant="fadeUp" className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Gallery</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">A glimpse into the ambiance, craft, and culinary passion at Toma Lounge.</p>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 md:auto-rows-[300px]">
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ delay: idx * 0.08, duration: 0.55, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-xl group aspect-square md:aspect-auto ${img.span}`}
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img 
              src={img.src} 
              alt={img.alt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
