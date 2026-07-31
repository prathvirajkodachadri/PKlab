/**
 * ContactPage — support desk template with localStorage inquiry simulation.
 */
import { useState } from "react";
import { MapPin, Phone, Mail, CheckCircle } from "lucide-react";
import { navigate, getCrumbs } from "../router/core";
import PageShell from "../layouts/PageShell";
import { Card, Button } from "../components/ui/Primitives";

export default function ContactPage() {
  const [contactSubmitted, setContactStatus] = useState(false);
  const crumbs = getCrumbs({ page: "contact", id: null });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus(true);
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("contact-name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("contact-email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("contact-message") as HTMLTextAreaElement).value;

    const saved = JSON.parse(localStorage.getItem("pklab_inquiries") || "[]");
    saved.push({ name, email, message, date: new Date().toISOString() });
    localStorage.setItem("pklab_inquiries", JSON.stringify(saved));
    form.reset();
  };

  return (
    <PageShell
      crumbs={crumbs}
      onNavigate={navigate}
      eyebrow="Custom Calibration Desk"
      title="Engineering Support & Inquiries"
      description="Request custom mechanical equations, ask about integrations, or notify us of new tool substrates. Inquiries are stored in local simulation storage."
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Support information panel */}
        <div className="md:col-span-5 space-y-6">
          <div className="rounded-3xl border border-brand-beige-dark bg-brand-panel p-6 text-brand-ivory space-y-5 shadow-xs">
            <h3 className="text-xl font-serif font-bold">PKlab Workshop Support</h3>
            <p className="text-xs leading-relaxed font-light text-brand-ivory/80">
              We maintain calibration references compliant with aerospace specifications. Submit your request for rapid integration.
            </p>
            <div className="space-y-3 text-xs pt-2">
              <div className="flex gap-2 items-center">
                <MapPin className="h-4 w-4 shrink-0 text-brand-ivory/60" />
                <span>800 Industrial Pkwy, CA</span>
              </div>
              <div className="flex gap-2 items-center">
                <Phone className="h-4 w-4 shrink-0 text-brand-ivory/60" />
                <span>+1 (555) 492-3310</span>
              </div>
              <div className="flex gap-2 items-center">
                <Mail className="h-4 w-4 shrink-0 text-brand-ivory/60" />
                <span>precision@pklab.engineering</span>
              </div>
            </div>
          </div>

          <Card className="p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">Enterprise Integrations</h4>
            <p className="text-xs text-brand-charcoal/60 leading-relaxed font-light">
              Interested in syncing PKlab mathematical modules directly with your shop ERP or CAD tablets?
              Write to us for a standalone package configuration.
            </p>
          </Card>
        </div>

        {/* Form */}
        <Card className="md:col-span-7 p-6 sm:p-8 shadow-sm">
          {contactSubmitted ? (
            <div className="text-center py-12 space-y-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="h-8 w-8" />
              </span>
              <h3 className="text-xl font-serif font-bold text-brand-charcoal">Calibration Inquiry Sent</h3>
              <p className="text-xs sm:text-sm text-brand-charcoal/60 max-w-md mx-auto leading-relaxed font-light">
                Thank you for contacting PKlab. Your inquiry has been registered in our local simulation
                storage (localStorage). A manufacturing specialist will review this model shortly.
              </p>
              <Button variant="primary" onClick={() => setContactStatus(false)}>Send Another Message</Button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="text-xs font-semibold text-brand-charcoal">
                  Full Mechanical Engineer / Programmer Name
                </label>
                <input
                  id="contact-name"
                  name="contact-name"
                  type="text"
                  required
                  placeholder="Marcus Vance"
                  className="w-full rounded-xl border border-brand-beige-dark bg-brand-beige/10 px-4 py-2.5 text-xs sm:text-sm text-brand-charcoal outline-hidden focus:border-brand-olive focus:ring-1 focus:ring-brand-olive"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="text-xs font-semibold text-brand-charcoal">
                  Professional Work Email Address
                </label>
                <input
                  id="contact-email"
                  name="contact-email"
                  type="email"
                  required
                  placeholder="m.vance@company.com"
                  className="w-full rounded-xl border border-brand-beige-dark bg-brand-beige/10 px-4 py-2.5 text-xs sm:text-sm text-brand-charcoal outline-hidden focus:border-brand-olive focus:ring-1 focus:ring-brand-olive"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-semibold text-brand-charcoal">
                  Calibrations, Feedback, or Integration Request Details
                </label>
                <textarea
                  id="contact-message"
                  name="contact-message"
                  required
                  rows={4}
                  placeholder="Please include cutter geometries, specific alloy classifications, and expected spindle RPM constraints..."
                  className="w-full rounded-xl border border-brand-beige-dark bg-brand-beige/10 px-4 py-2.5 text-xs sm:text-sm text-brand-charcoal outline-hidden focus:border-brand-olive focus:ring-1 focus:ring-brand-olive resize-none"
                />
              </div>
              <Button variant="primary" size="md" type="submit" className="w-full">
                Submit Calibration Request
              </Button>
            </form>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
