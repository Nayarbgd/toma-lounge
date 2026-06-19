import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function Reviews() {
  const reviews = [
    {
      name: "Nur Amalina",
      rating: 5,
      date: "5 months ago",
      text: "Had a lovely dining experience here. We ordered the carbonara spaghetti and a pizza, and both were really satisfying. The carbonara was creamy, well-seasoned, and comforting, while the pizza had a nicely baked crust with generous toppings. Everything tasted fresh and was served hot. A special mention to Captain Maher, who was incredibly nice and helpful, his friendly service really made our visit even better. The atmosphere was pleasant and welcoming. Definitely a place I'd come back to again! Xoxo"
    },
    {
      name: "Tomson Issac",
      rating: 5,
      date: "1 month ago",
      text: "We ordered the full grilled chicken and the mixed grill platter. Both the meat and chicken were incredibly tender! The best part was the complimentary side dishes—they served us hummus, olives, and pickles, which you don't usually get at many other restaurants. Also, the 40 AED shisha is definitely worth it in Barsha heights."
    },
    {
      name: "Alam Mohammed",
      rating: 5,
      date: "4 months ago",
      text: "10/10 for these guys! Randomly ordered from here as we were at the Ramada opposite. The portions, presentation and packaging was 10/10. 2 chicken and beef sharwarma meals above cost only £11"
    },
    {
      name: "Sami Ibrahim",
      rating: 5,
      date: "5 months ago",
      text: "My visit was exceptional. The place is elegant and comfortable, with a calm, refined atmosphere. The food was excellent in quality, flavor, and presentation. The service exceeded expectations, especially thanks to Captain Maher, whose professionalism, attentiveness, and hospitality made the experience even better. I highly recommend Toma Lounge."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <title>Reviews | Toma Lounge</title>
      <meta name="description" content="Read what our guests have to say about their experience at Toma Lounge, a premier Syrian restaurant and shisha lounge in Barsha Heights." />
      
      <Reveal variant="fadeUp" className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-secondary mb-4">Guest Experiences</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Don't just take our word for it. Here is what our guests have to say.</p>
        
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="text-4xl font-bold text-foreground">4.4</div>
          <div className="flex flex-col items-start">
            <div className="flex text-secondary">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" className="opacity-50" />
            </div>
            <span className="text-sm text-muted-foreground">Based on 231 Google Reviews</span>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        {reviews.map((review, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: idx * 0.08, duration: 0.65, ease: "easeOut" }}
            className="bg-card border border-border p-8 rounded-2xl relative"
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 text-6xl font-serif text-primary/20">"</div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground text-lg">{review.name}</h3>
                <span className="text-sm text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex text-secondary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-muted"} />
                ))}
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed italic">
              "{review.text}"
            </p>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <a
          href="https://www.google.com/maps/place/Toma+lounge/@25.0951615,55.1732905,760m/data=!3m1!1e3!4m8!3m7!1s0x3e5f6bd0a50d3f1d:0xec124c5994cd5024!8m2!3d25.0951567!4d55.1758654!9m1!1b1!16s%2Fg%2F11lr9n6q2k?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-secondary text-secondary hover:bg-secondary/10 transition-colors px-8 py-3 rounded-full font-medium text-sm"
        >
          <Star size={15} fill="currentColor" />
          Ver más reviews en Google
        </a>
      </div>
    </div>
  );
}
