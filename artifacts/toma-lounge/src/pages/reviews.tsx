import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function Reviews() {
  const reviews = [
    {
      name: "Ahmed K.",
      rating: 5,
      date: "3 weeks ago",
      text: "The mixed grill platter was outstanding — perfectly charred, incredibly tender. And they brought complimentary hummus and olives without even asking. Will be back."
    },
    {
      name: "Sara M.",
      rating: 5,
      date: "1 month ago",
      text: "We booked for a Ramadan iftar and they handled our group of 20 perfectly. The buffet setup was generous and well-organized. Highly recommend for group bookings."
    },
    {
      name: "James T.",
      rating: 4,
      date: "2 weeks ago",
      text: "Great shisha selection, good quality. The atmosphere after midnight is really something — feels like the whole of Tecom is here. Stayed until closing."
    },
    {
      name: "Nour F.",
      rating: 5,
      date: "5 days ago",
      text: "Best chicken shawarma I've had in Dubai. The complimentary sides — pickles, olives, bread — make it feel like a proper home-cooked spread. Solid value."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <title>Reviews | Toma Lounge</title>
      <meta name="description" content="Read what our guests have to say about their experience at Toma Lounge, a premier Syrian restaurant and shisha lounge in Barsha Heights." />
      
      <div className="text-center mb-16">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {reviews.map((review, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
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
    </div>
  );
}
