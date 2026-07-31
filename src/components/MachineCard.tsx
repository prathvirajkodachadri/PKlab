/**
 * MachineCard — CNC machine specification card auto-generated from
 * machines.json entries inside the Machine Assets library.
 */
import { Machine } from "../data/db";
import { Card, Badge } from "./ui/Primitives";

interface MachineCardProps {
  machine: Machine;
}

export default function MachineCard({ machine: mach }: MachineCardProps) {
  return (
    <Card
      id={`machine-${mach.id}`}
      className="p-6 sm:p-8 hover:border-brand-olive/40 transition-all duration-300"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Identity + applications (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <Badge tone="olive">{mach.type}</Badge>
            <h3 className="text-2xl font-bold font-serif text-brand-charcoal mt-3">{mach.name}</h3>
          </div>
          <p className="text-xs text-brand-charcoal/70 leading-relaxed font-light">{mach.applications}</p>

          <div className="rounded-2xl border border-brand-beige-dark bg-brand-beige/10 p-4 space-y-2 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-brand-charcoal/45">Controller Engine</span>
              <span className="font-bold text-brand-charcoal text-right">{mach.controller}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-brand-charcoal/45">Axis Configuration</span>
              <span className="font-semibold text-brand-charcoal text-right">{mach.axes}</span>
            </div>
          </div>
        </div>

        {/* Operational limits grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-1">
            <span className="text-brand-charcoal/40 font-bold uppercase tracking-wider text-[10px]">Maximum Speed</span>
            <span className="text-lg font-bold text-brand-charcoal block font-mono">{mach.maxRpm.toLocaleString()} RPM</span>
          </div>
          <div className="rounded-xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-1">
            <span className="text-brand-charcoal/40 font-bold uppercase tracking-wider text-[10px]">Spindle Power</span>
            <span className="text-lg font-bold text-brand-charcoal block font-mono">{mach.maxPower}</span>
          </div>
          <div className="rounded-xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-1 col-span-1 sm:col-span-2">
            <span className="text-brand-charcoal/40 font-bold uppercase tracking-wider text-[10px]">Axes Mechanical Travel</span>
            <span className="text-sm font-semibold text-brand-charcoal block font-mono">{mach.travels}</span>
          </div>
          <div className="rounded-xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-1">
            <span className="text-brand-charcoal/40 font-bold uppercase tracking-wider text-[10px]">Max Programmed Feed</span>
            <span className="text-sm font-bold text-brand-charcoal block font-mono">{mach.maxFeed}</span>
          </div>
          <div className="rounded-xl border border-brand-beige-dark bg-brand-beige/20 p-4 space-y-1">
            <span className="text-brand-charcoal/40 font-bold uppercase tracking-wider text-[10px]">Rapid Traverse Velocity</span>
            <span className="text-sm font-bold text-brand-charcoal block font-mono">{mach.rapids}</span>
          </div>
          <div className="rounded-xl border border-brand-olive/25 bg-brand-olive/5 p-4 space-y-1 col-span-1 sm:col-span-2">
            <span className="text-brand-olive font-bold uppercase tracking-wider text-[10px]">Default Interface Shank</span>
            <span className="text-xs font-bold text-brand-olive block font-mono">{mach.spindleTaper} Standard</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
