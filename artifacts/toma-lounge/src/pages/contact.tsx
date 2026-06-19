import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateReservation } from "@workspace/api-client-react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  partySize: z.coerce.number().min(1).max(50),
  occasion: z.string().optional(),
  notes: z.string().optional(),
});

export function Contact() {
  const { toast } = useToast();
  const createReservation = useCreateReservation();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      date: "",
      partySize: 2,
      occasion: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createReservation.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Reservation Submitted",
            description: "We will contact you shortly to confirm your booking.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to submit reservation. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Contact & Reservations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Book your table for an unforgettable dining and lounge experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-card p-8 rounded-xl border border-border">
            <h2 className="text-2xl font-serif font-bold text-secondary mb-6">Visit Us</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Location</h3>
                  <p className="text-muted-foreground mt-1">Cayan Business Center, Al Thanyah First<br/>Barsha Heights (Tecom), Dubai, UAE</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Phone className="text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="text-muted-foreground mt-1">058 109 5540 <br/> 04 577 0217</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Hours</h3>
                  <p className="text-muted-foreground mt-1">Daily: 8:00 AM – 3:00 AM</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-foreground mb-4">Order Online</h3>
              <div className="flex gap-4">
                <Button variant="outline" className="border-primary text-primary" asChild>
                  <a href="#" target="_blank" rel="noreferrer">Talabat</a>
                </Button>
                <Button variant="outline" className="border-secondary text-secondary" asChild>
                  <a href="#" target="_blank" rel="noreferrer">Noon Food</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Form */}
        <div className="bg-card p-8 rounded-xl border border-border">
          <h2 className="text-2xl font-serif font-bold text-primary mb-6">Book a Table</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="05X XXX XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email <span className="text-muted-foreground text-xs font-normal">(optional — for booking confirmation)</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party Size</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="occasion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occasion (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Birthday, Anniversary, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any dietary requirements or seating preferences?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={createReservation.isPending}>
                {createReservation.isPending ? "Submitting..." : "Reserve Table"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
