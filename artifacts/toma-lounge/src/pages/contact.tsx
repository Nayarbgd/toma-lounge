import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateReservation } from "@workspace/api-client-react";
import {
  MapPin, Phone, Clock, CheckCircle2, ChevronDown, ChevronUp,
  Calendar, Users, ArrowLeft, Sparkles,
} from "lucide-react";

// ── Time slot data ───────────────────────────────────────────────────────────

function formatTimeLabel(h: number, m: number): string {
  const period = h < 12 || h === 0 ? "AM" : "PM";
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${dh}:${String(m).padStart(2, "0")} ${period}`;
}

const TIME_GROUPS: { label: string; slots: { label: string; value: string }[] }[] = (() => {
  const make = (h: number, m: number) => ({
    label: formatTimeLabel(h, m),
    value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
  });
  return [
    { label: "Afternoon", slots: [make(12,0),make(12,30),make(13,0),make(13,30),make(14,0),make(14,30),make(15,0),make(15,30)] },
    { label: "Evening",   slots: [make(16,0),make(16,30),make(17,0),make(17,30),make(18,0),make(18,30),make(19,0),make(19,30),make(20,0),make(20,30),make(21,0),make(21,30)] },
    { label: "Night",     slots: [make(22,0),make(22,30),make(23,0),make(23,30),make(0,0),make(0,30),make(1,0)] },
  ];
})();

// ── Party size options ───────────────────────────────────────────────────────

const PARTY_OPTIONS = [
  { label: "1–2", sub: "Guests", value: "1-2", size: 2 },
  { label: "3–4", sub: "Guests", value: "3-4", size: 4 },
  { label: "5–6", sub: "Guests", value: "5-6", size: 6 },
  { label: "7+",  sub: "Guests", value: "7+",  size: 8 },
];

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({
  selected, onClick, children, className = "",
}: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`rounded-xl border text-sm font-medium transition-all duration-150 focus:outline-none
        ${selected
          ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/10"
          : "border-border/40 bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
        } ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Date" },
  { n: 2, label: "Time & Guests" },
  { n: 3, label: "Details" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {STEPS.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-[52px]">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300
                ${done ? "border-primary bg-primary text-background" : active ? "border-primary bg-primary/10 text-primary" : "border-border/40 bg-card text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap transition-colors ${active ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all duration-500"
                style={{ background: current > s.n ? "hsl(var(--primary))" : "hsl(var(--border)/.4)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Booking summary card ──────────────────────────────────────────────────────

function SummaryCard({ date, time, partyGroup }: { date: Date | null; time: string | null; partyGroup: string | null }) {
  if (!date) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 mb-6 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-medium">{format(date, "EEEE, d MMMM yyyy")}</span>
          </div>
          {time && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-medium">{formatTimeLabel(
                parseInt(time.split(":")[0]), parseInt(time.split(":")[1])
              )}</span>
            </div>
          )}
          {partyGroup && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-medium">{partyGroup} Guests</span>
            </div>
          )}
        </div>
        {time && (
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs font-semibold text-green-500 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />Table Available
            </span>
            <span className="text-xs text-muted-foreground">Est. stay: ~2 hours</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Slide animation variants ──────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

// ── Success state ─────────────────────────────────────────────────────────────

function SuccessCard({ date, time, partyGroup, onReset }: {
  date: Date; time: string; partyGroup: string; onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-8 space-y-5"
    >
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-serif font-bold text-foreground">Reservation Submitted!</h3>
        <p className="text-muted-foreground mt-2 text-sm">We will contact you shortly to confirm your booking.</p>
      </div>
      <div className="rounded-xl border border-primary/30 bg-primary/5 px-6 py-4 text-left space-y-2 max-w-xs mx-auto">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{format(date, "EEEE, d MMMM yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>{formatTimeLabel(parseInt(time.split(":")[0]), parseInt(time.split(":")[1]))}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span>{partyGroup} Guests</span>
        </div>
      </div>
      <Button variant="outline" className="border-border/40" onClick={onReset}>
        Book Another Table
      </Button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Contact() {
  const { toast } = useToast();
  const createReservation = useCreateReservation();

  // Multi-step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Booking selections
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partyGroup, setPartyGroup] = useState<string | null>(null);

  // Step 3 fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  // Date options: next 21 days
  const dateOptions = useMemo(
    () => Array.from({ length: 21 }, (_, i) => addDays(new Date(), i)),
    []
  );

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const selectDate = (d: Date) => { setSelectedDate(d); setSelectedTime(null); };
  const selectTime = (t: string) => setSelectedTime(t);
  const selectParty = (g: string) => setPartyGroup(g);

  const partySize = PARTY_OPTIONS.find(o => o.value === partyGroup)?.size ?? 2;

  const canProceed1 = !!selectedDate;
  const canProceed2 = !!selectedTime && !!partyGroup;

  const handleSubmit = () => {
    const errs: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) errs.name = "Name is required";
    if (!phone.trim() || phone.trim().length < 5) errs.phone = "Phone number is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const dateISO = `${format(selectedDate!, "yyyy-MM-dd")}T${selectedTime!}:00`;
    const notesParts = [occasion, specialRequests].filter(Boolean);

    createReservation.mutate(
      { data: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, date: dateISO, partySize, notes: notesParts.join(" | ") || undefined, occasion: occasion || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Reservation Submitted", description: "We will contact you shortly to confirm your booking." });
          setSubmitted(true);
        },
        onError: () => {
          toast({ title: "Something went wrong", description: "Please try again or call us directly.", variant: "destructive" });
        },
      }
    );
  };

  const resetForm = () => {
    setSubmitted(false); setStep(1); setDirection(1);
    setSelectedDate(null); setSelectedTime(null); setPartyGroup(null);
    setName(""); setPhone(""); setEmail(""); setOccasion(""); setSpecialRequests("");
    setShowOptional(false); setErrors({});
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">Contact & Reservations</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">Book your table for an unforgettable dining and lounge experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

        {/* ── Left: Contact Info ── */}
        <div className="space-y-8">
          <div className="bg-card p-8 rounded-xl border border-border">
            <h2 className="text-2xl font-serif font-bold text-secondary mb-6">Visit Us</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Location</h3>
                  <p className="text-muted-foreground mt-1">Cayan Business Center, Al Thanyah First<br />Barsha Heights (Tecom), Dubai, UAE</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="text-muted-foreground mt-1">058 109 5540<br />04 577 0217</p>
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

        {/* ── Right: Reservation Wizard ── */}
        <div className="bg-card rounded-xl border border-border p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-serif font-bold text-primary">Book a Table</h2>
          </div>

          {submitted && selectedDate && selectedTime && partyGroup ? (
            <SuccessCard date={selectedDate} time={selectedTime} partyGroup={partyGroup} onReset={resetForm} />
          ) : (
            <>
              <StepIndicator current={step} />

              {/* Booking summary card */}
              <SummaryCard date={selectedDate} time={selectedTime} partyGroup={partyGroup} />

              <div className="overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  {/* ── STEP 1: Date ── */}
                  {step === 1 && (
                    <motion.div key="step1" custom={direction} variants={slideVariants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.22, ease: "easeOut" }}>
                      <h3 className="text-base font-semibold mb-4">Select a Date</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {dateOptions.map(d => {
                          const key = format(d, "yyyy-MM-dd");
                          const isSelected = selectedDate ? format(selectedDate, "yyyy-MM-dd") === key : false;
                          return (
                            <Chip key={key} selected={isSelected} onClick={() => selectDate(d)}
                              className="py-3 px-2 flex flex-col items-center gap-0.5">
                              <span className="text-xs uppercase tracking-wide opacity-70">
                                {isToday(d) ? "Today" : isTomorrow(d) ? "Tmrw" : format(d, "EEE")}
                              </span>
                              <span className="text-2xl font-bold leading-tight">{format(d, "d")}</span>
                              <span className="text-xs opacity-70">{format(d, "MMM")}</span>
                            </Chip>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Time & Guests ── */}
                  {step === 2 && (
                    <motion.div key="step2" custom={direction} variants={slideVariants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="space-y-6">

                      {/* Time */}
                      <div>
                        <h3 className="text-base font-semibold mb-3">Select a Time</h3>
                        <div className="space-y-4">
                          {TIME_GROUPS.map(group => (
                            <div key={group.label}>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{group.label}</p>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                                {group.slots.map(slot => (
                                  <Chip key={slot.value} selected={selectedTime === slot.value}
                                    onClick={() => selectTime(slot.value)}
                                    className="py-2 px-1 text-xs text-center">
                                    {slot.label}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Party size */}
                      <div>
                        <h3 className="text-base font-semibold mb-3">Party Size</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PARTY_OPTIONS.map(opt => (
                            <Chip key={opt.value} selected={partyGroup === opt.value}
                              onClick={() => selectParty(opt.value)}
                              className="py-5 px-3 flex flex-col items-center gap-1">
                              <Users className="w-5 h-5 opacity-70" />
                              <span className="text-xl font-bold leading-none">{opt.label}</span>
                              <span className="text-xs opacity-60">{opt.sub}</span>
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3: Guest Details ── */}
                  {step === 3 && (
                    <motion.div key="step3" custom={direction} variants={slideVariants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="space-y-4">
                      <h3 className="text-base font-semibold mb-1">Your Details</h3>

                      {/* Required fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1.5 block">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="Your full name"
                            value={name}
                            onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                          />
                          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1.5 block">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="tel"
                            placeholder="05X XXX XXXX"
                            value={phone}
                            onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: undefined })); }}
                            className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                          />
                          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-foreground mb-1.5 block">
                            Email <span className="text-muted-foreground font-normal">(optional — for confirmation)</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Optional fields collapsible */}
                      <div className="border border-border/40 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowOptional(o => !o)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/30"
                        >
                          <span>Special Occasion or Requests</span>
                          {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <AnimatePresence>
                          {showOptional && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/40">
                                <div>
                                  <label className="text-xs font-medium text-foreground mb-1.5 block">Occasion</label>
                                  <Input
                                    placeholder="Birthday, Anniversary, Business dinner…"
                                    value={occasion}
                                    onChange={e => setOccasion(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-foreground mb-1.5 block">Special Requests</label>
                                  <Textarea
                                    placeholder="Dietary requirements, seating preferences…"
                                    value={specialRequests}
                                    onChange={e => setSpecialRequests(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button variant="outline" className="border-border/40 gap-1.5" onClick={goBack}>
                    <ArrowLeft className="w-4 h-4" />Back
                  </Button>
                )}
                <div className="flex-1" />
                {step === 1 && (
                  <Button className="bg-primary text-primary-foreground px-6" disabled={!canProceed1} onClick={goNext}>
                    Continue
                  </Button>
                )}
                {step === 2 && (
                  <Button className="bg-primary text-primary-foreground px-6" disabled={!canProceed2} onClick={goNext}>
                    Continue
                  </Button>
                )}
                {step === 3 && (
                  <Button
                    className="bg-primary text-primary-foreground px-6"
                    disabled={createReservation.isPending}
                    onClick={handleSubmit}
                  >
                    {createReservation.isPending ? "Submitting…" : "Confirm Reservation"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
