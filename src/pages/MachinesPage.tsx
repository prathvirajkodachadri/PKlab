/**
 * MachinesPage — one reusable template for the CNC machine assets library.
 * Specification cards auto-generate from machines.json.
 */
import { machines } from "../data/db";
import { navigate, getCrumbs } from "../router/core";
import PageShell from "../layouts/PageShell";
import MachineCard from "../components/MachineCard";

export default function MachinesPage() {
  const crumbs = getCrumbs({ page: "machines", id: null });

  return (
    <PageShell
      wide
      crumbs={crumbs}
      onNavigate={navigate}
      eyebrow="CNC Machine Profiles"
      title="CNC Machine Assets Specification"
      description="Dimensional structural details, maximum feed velocities, spindle parameters and axis capabilities used to benchmark tooling limits."
    >
      <div className="space-y-8 pt-4">
        {machines.map((mach) => (
          <MachineCard key={mach.id} machine={mach} />
        ))}
      </div>
    </PageShell>
  );
}
