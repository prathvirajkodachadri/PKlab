import { Cpu, Mail, Phone, MapPin, Globe, Shield } from "lucide-react";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { label: "RPM Calculator", id: "rpm" },
    { label: "Cutter Deflection", id: "tool-deflection" },
    { label: "L10 Bearing Life", id: "bearing-life" },
    { label: "Chip Thinning", id: "chip-load" },
    { label: "Surface Finish", id: "surface-finish" }
  ];

  const infoLinks = [
    { label: "Materials Library", page: "materials" },
    { label: "CNC Machine Assets", page: "machines" },
    { label: "Engineering Topics", page: "topics" },
    { label: "About PKlab", page: "about" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscription registered. This is a local mock database simulation; your newsletter email has been saved in localStorage!");
    const input = (e.currentTarget as HTMLFormElement).elements.namedItem("newsletter-email") as HTMLInputElement;
    if (input) {
      const subscribers = JSON.parse(localStorage.getItem("pklab_newsletter") || "[]");
      subscribers.push(input.value);
      localStorage.setItem("pklab_newsletter", JSON.stringify(subscribers));
      input.value = "";
    }
  };

  return (
    <footer className="border-t border-brand-beige-dark bg-brand-beige/25 pt-16 pb-12 text-brand-charcoal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* UPPER GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-brand-beige-dark/50">
          
          {/* Logo & Description */}
          <div className="lg:col-span-4 space-y-5">
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2.5 text-left focus:outline-hidden group"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-olive text-brand-ivory transition-transform duration-300 group-hover:rotate-12">
                <Cpu className="h-5 w-5" />
              </span>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-brand-charcoal">
                  PK<span className="text-brand-olive font-sans font-light">lab</span>
                </span>
              </div>
            </button>
            <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light max-w-sm">
              PKlab provides mathematical accuracy and high-fidelity computational models for mechanical engineers, CNC setups, and tool design labs worldwide. Engineered for extreme efficiency and physical safety calibration.
            </p>
            <div className="space-y-2 text-xs text-brand-charcoal/65">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-brand-olive shrink-0" />
                <span>800 Industrial Pkwy, Sector 4, Silicon Valley, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand-olive shrink-0" />
                <span>+1 (555) 492-3310</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand-olive shrink-0" />
                <span>precision@pklab.engineering</span>
              </div>
            </div>
          </div>

          {/* Site Pages Column */}
          <div className="lg:col-span-2.5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">
              Platform Indexes
            </h4>
            <ul className="space-y-2 text-xs">
              {infoLinks.map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => onNavigate(link.page)}
                    className="text-brand-charcoal/75 hover:text-brand-olive hover:underline transition-all text-left cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Calculators Column */}
          <div className="lg:col-span-2.5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">
              Featured Tools
            </h4>
            <ul className="space-y-2 text-xs">
              {shopLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#/calculator/${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = `#/calculator/${link.id}`;
                    }}
                    className="text-brand-charcoal/75 hover:text-brand-olive hover:underline transition-all text-left block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">
              Newsletter & Telemetry
            </h4>
            <p className="text-xs text-brand-charcoal/65 leading-relaxed font-light">
              Receive advanced speed optimization bulletins and metallurgical reports directly in your inbox.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                id="newsletter-email"
                name="newsletter-email"
                type="email"
                required
                placeholder="engineering@shop.com"
                className="w-full rounded-xl border border-brand-beige-dark bg-brand-ivory/60 px-3 py-2 text-xs text-brand-charcoal outline-hidden focus:border-brand-olive focus:ring-1 focus:ring-brand-olive"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-olive py-2 text-xs font-semibold text-brand-ivory hover:bg-brand-olive-dark transition-colors cursor-pointer"
              >
                Subscribe to Bulletin
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM METRICS */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-charcoal/50 font-light">
          
          <div className="flex items-center gap-1.5 flex-wrap justify-center md:justify-start">
            <span>© {currentYear} PKlab. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => onNavigate("privacy")}
              className="hover:underline hover:text-brand-olive cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => onNavigate("terms")}
              className="hover:underline hover:text-brand-olive cursor-pointer"
            >
              Terms of Use
            </button>
          </div>

          {/* Compliance stamps */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 bg-brand-beige/60 px-2 py-1 rounded-md text-[10px] font-semibold border border-brand-beige-dark/50">
              <Shield className="h-3 w-3 text-brand-olive" />
              ISO 9001:2015 Simulated
            </span>
            <span className="flex items-center gap-1 bg-brand-beige/60 px-2 py-1 rounded-md text-[10px] font-semibold border border-brand-beige-dark/50">
              <Globe className="h-3 w-3 text-brand-olive" />
              GitHub Deploy Ready
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
