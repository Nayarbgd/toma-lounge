import { motion } from "framer-motion";
import { Reveal } from "@/components/reveal";

export function Menu() {
  const categories = [
    {
      title: "Mezze & Starters",
      items: [
        { name: "Hummus Bairouti", price: "AED 32", desc: "Creamy chickpea puree with tahini, garlic, parsley, and olive oil." },
        { name: "Falafel", price: "AED 28", desc: "Crispy fried chickpea patties served with tahini sauce." },
        { name: "Tomato Soup", price: "AED 25", desc: "Rich and hearty tomato soup." },
        { name: "Mushroom Soup", price: "AED 28", desc: "Creamy wild mushroom soup." }
      ]
    },
    {
      title: "Charcoal Grill",
      items: [
        { name: "Mixed Grill Platter", price: "AED 110", desc: "Selection of shish taouk, lamb tikka, and kebab." },
        { name: "Charcoal Grill Chicken", price: "AED 65", desc: "Half chicken marinated in our signature spices." },
        { name: "Grilled Chicken Steak", price: "AED 75", desc: "Tender chicken breast served with vegetables." },
        { name: "Stuffed Chicken", price: "AED 85", desc: "Chicken stuffed with fragrant rice and nuts." },
        { name: "Full Grilled Chicken", price: "AED 120", desc: "Whole chicken grilled to perfection over charcoal." }
      ]
    },
    {
      title: "Wraps & Specialties",
      items: [
        { name: "Chicken Shawarma", price: "AED 35", desc: "Authentic Syrian-style chicken shawarma." },
        { name: "Beef Stroganoff", price: "AED 85", desc: "Tender beef strips in a rich mushroom cream sauce." }
      ]
    },
    {
      title: "Lounge & Shisha",
      items: [
        { name: "Premium Shisha", price: "From AED 40", desc: "Variety of premium flavors available. Ask your server." },
        { name: "Mint Margherita", price: "AED 32", desc: "Refreshing blend of fresh mint and lemon." },
        { name: "Americano with Water", price: "AED 25", desc: "Classic espresso pulled over hot water." },
        { name: "Tort Dessert", price: "AED 45", desc: "House special layered dessert." }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <Reveal variant="fadeUp" className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-secondary mb-4">Our Menu</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Authentic Levantine flavors crafted with premium ingredients.</p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {categories.map((category, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ delay: idx * 0.08, duration: 0.65, ease: "easeOut" }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-serif font-bold text-primary border-b border-border/50 pb-4">{category.title}</h2>
            <div className="space-y-6">
              {category.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex flex-col">
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <h3 className="font-bold text-foreground text-base md:text-lg min-w-0">{item.name}</h3>
                    <div className="border-b border-dotted border-border/40 flex-grow mx-2 shrink relative top-[-4px] hidden sm:block"></div>
                    <span className="font-bold text-secondary whitespace-nowrap shrink-0">{item.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
