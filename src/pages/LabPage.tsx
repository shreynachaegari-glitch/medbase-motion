import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProvenanceTag } from "@/components/Provenance";
import TrajectoryChart, { type TrajectorySeries } from "@/components/charts/TrajectoryChart";
import DistributionChart from "@/components/charts/DistributionChart";
import TornadoChart from "@/components/charts/TornadoChart";
import { runCohort, sensitivitySweep } from "@/sim/cohort";
import { simulatePatient, type ModelConstants, type PatientInput } from "@/sim/model";
import {
    baseParams,
    treatmentArms,
    withValue,
    type ParamSpec,
    type TreatmentArm,
} from "@/sim/params";
import { cn } from "@/lib/utils";
import { diseases, getDiseaseById, modelledConditions } from "@/data/knowledge";

const ARM_COLOR: Record<string, string> = {
    none: "var(--series-1)",
    metformin: "var(--series-2)",
    lifestyle: "var(--series-3)",
    sulfonylurea: "var(--series-4)",
};

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const hba1c = (v: number) => `${v.toFixed(1)}%`;

const areas = [
    { id: "disease", label: "Disease progression", modelled: true },
    { id: "drug", label: "Drug / intervention", modelled: false },
    { id: "gene", label: "Gene / pathway", modelled: false },
] as const;

const unmodelledCopy: Record<string, { what: string; needs: string[] }> = {
    drug: {
        what: "A pharmacological arm would need to answer how a dose reaches a concentration, how that concentration moves a biomarker, and how that biomarker maps to an outcome. The disease-progression model here does none of that — its treatment arms are level shifts in HbA1c, which is a stand-in for a drug model, not a drug model.",
        needs: [
            "A PK component: dose, absorption, clearance, and exposure over time",
            "A PD component linking exposure to biomarker change, with a dose–response shape rather than a single shift",
            "Adherence and discontinuation, which dominate real-world effect sizes",
            "Adverse-effect hazards, so a benefit is never shown without its cost",
        ],
    },
    gene: {
        what: "A gene or pathway arm is the hardest of the three to do honestly. Simulating a mutation means claiming a causal chain from variant to molecular function to physiology to clinical outcome, and for most variants in type 2 diabetes that chain is not quantified — effect sizes come from association studies, which do not license simulation.",
        needs: [
            "Variant-level effect estimates with a defined causal direction, not association odds ratios",
            "A pathway model with quantified parameters, not a diagram",
            "An explicit statement of penetrance and its dependence on background and environment",
            "A way to propagate the very large uncertainty on each of the above to the output",
        ],
    },
};

const LabPage = () => {
    const [params, setParams] = useState<ParamSpec[]>(baseParams);
    const [activeArms, setActiveArms] = useState<string[]>(["none", "metformin"]);
    const [horizon, setHorizon] = useState(10);
    const [cohortMode, setCohortMode] = useState(true);
    const [cohortN, setCohortN] = useState(500);
    const [seed, setSeed] = useState(42);
    const [area, setArea] = useState<(typeof areas)[number]["id"]>("disease");
    const [searchParams, setSearchParams] = useSearchParams();

    // The Lab does not own a condition list — it resolves one out of the MedBase knowledge base.
    const requested = searchParams.get("condition");
    const condition =
        (requested ? getDiseaseById(requested) : undefined)?.labModel
            ? getDiseaseById(requested!)!
            : modelledConditions[0];

    const value = (id: string) => params.find((p) => p.id === id)!.value;
    const setValue = (id: string, v: number) => setParams((prev) => withValue(prev, id, v));

    const patient: PatientInput = {
        baselineHbA1c: value("baselineHbA1c"),
        driftRate: value("driftRate"),
        diabetesDuration: value("diabetesDuration"),
    };

    const constants: ModelConstants = {
        baselineMicroHazard: value("baselineMicroHazard"),
        baselineMiHazard: value("baselineMiHazard"),
        durationHazardPerYear: value("durationHazardPerYear"),
    };

    const arms = treatmentArms.filter((a) => activeArms.includes(a.id));

    const results = useMemo(() => {
        const years = Array.from({ length: horizon + 1 }, (_, i) => i);
        const single = arms.map((arm) => ({
            arm,
            points: simulatePatient(patient, arm, constants, horizon),
        }));
        const cohorts = cohortMode
            ? arms.map((arm) => ({
                  arm,
                  result: runCohort(
                      patient,
                      arm,
                      constants,
                      { hbA1cSd: 0.8, driftSd: 0.45, durationSd: 3 },
                      horizon,
                      cohortN,
                      seed,
                  ),
              }))
            : [];
        return { years, single, cohorts };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, activeArms, horizon, cohortMode, cohortN, seed]);

    const hbSeries: TrajectorySeries[] = cohortMode
        ? results.cohorts.map(({ arm, result }) => ({
              id: arm.id,
              label: arm.shortLabel,
              color: ARM_COLOR[arm.id],
              values: result.hbA1cMean,
              band: { lo: result.hbA1cP10, hi: result.hbA1cP90 },
          }))
        : results.single.map(({ arm, points }) => ({
              id: arm.id,
              label: arm.shortLabel,
              color: ARM_COLOR[arm.id],
              values: points.map((p) => p.hbA1c),
          }));

    const microSeries: TrajectorySeries[] = cohortMode
        ? results.cohorts.map(({ arm, result }) => ({
              id: arm.id,
              label: arm.shortLabel,
              color: ARM_COLOR[arm.id],
              values: result.microMean,
              band: { lo: result.microP10, hi: result.microP90 },
          }))
        : results.single.map(({ arm, points }) => ({
              id: arm.id,
              label: arm.shortLabel,
              color: ARM_COLOR[arm.id],
              values: points.map((p) => p.cumulativeMicro),
          }));

    const sensitivity = useMemo(() => {
        const arm = arms[0] ?? treatmentArms[0];
        return sensitivitySweep(
            patient,
            arm,
            constants,
            horizon,
            params.map((p) => ({ id: p.id, label: p.label, low: p.min, high: p.max })),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params, activeArms, horizon]);

    const provenanceKind = (paramId: string) =>
        params.find((p) => p.id === paramId)!.provenance.kind;

    const headline = results.single.map(({ arm, points }) => ({
        arm,
        micro: points[points.length - 1].cumulativeMicro,
        mi: points[points.length - 1].cumulativeMi,
        hbA1c: points[points.length - 1].hbA1c,
    }));

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Virtual experiment — {condition.labModel!.label.toLowerCase()}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Set a virtual patient, choose comparison arms, and run. Outputs are
                            model predictions under your assumptions, not estimates of what would
                            happen to a real person.
                        </p>
                    </div>
                    <div className="flex gap-1 rounded border border-border p-0.5">
                        {areas.map((a) => (
                            <button
                                key={a.id}
                                onClick={() => setArea(a.id)}
                                className={cn(
                                    "rounded px-3 py-1.5 text-xs transition-colors",
                                    area === a.id
                                        ? "bg-secondary font-medium text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {a.label}
                                {!a.modelled && (
                                    <span className="ml-1.5 text-[10px] uppercase opacity-70">
                                        not modelled
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Provenance of the experiment itself: which knowledge-base record it came from. */}
                <div className="mb-6 flex flex-col gap-3 border-l-2 border-primary/50 bg-secondary/40 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                    <div className="min-w-0">
                        <p className="label-caps">Source record</p>
                        <p className="mt-1 text-sm">
                            <Link
                                to={`/learn/${condition.id}`}
                                className="font-medium text-primary hover:underline"
                            >
                                {condition.name}
                            </Link>
                            <span className="text-muted-foreground">
                                {" "}
                                — pulled from the MedBase knowledge base
                            </span>
                        </p>
                        <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
                            <span className="label-caps">Model covers</span>{" "}
                            {condition.labModel!.scope}
                        </p>
                    </div>

                    <div className="shrink-0 sm:text-right">
                        {modelledConditions.length > 1 ? (
                            <label className="text-xs text-muted-foreground">
                                <span className="label-caps mr-2">Condition</span>
                                <select
                                    value={condition.id}
                                    onChange={(e) =>
                                        setSearchParams({ condition: e.target.value })
                                    }
                                    className="h-8 rounded border border-input bg-card px-2 text-sm text-foreground"
                                >
                                    {modelledConditions.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <p className="tnum text-xs text-muted-foreground">
                                {modelledConditions.length} of {diseases.length} MedBase records
                                {modelledConditions.length === 1 ? " carries" : " carry"} a model
                                binding
                            </p>
                        )}
                    </div>
                </div>

                {area !== "disease" ? (
                    <section className="max-w-3xl space-y-5 py-4">
                        <div className="inline-block border border-[hsl(var(--prov-extrapolated))]/40 px-2 py-1">
                            <span className="label-caps text-[hsl(var(--prov-extrapolated))]">
                                Deliberately not implemented
                            </span>
                        </div>
                        <h2 className="text-lg font-semibold">
                            {areas.find((a) => a.id === area)!.label} simulation
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {unmodelledCopy[area].what}
                        </p>
                        <div>
                            <p className="label-caps mb-2">What an honest version would require</p>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                                {unmodelledCopy[area].needs.map((n) => (
                                    <li key={n} className="flex gap-2">
                                        <span className="text-border">—</span>
                                        <span>{n}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
                            A panel of sliders here would produce output, and that output would be
                            indistinguishable in appearance from the modelled area. That is exactly
                            why it is absent.
                        </p>
                    </section>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
                        {/* Controls */}
                        <aside className="space-y-6 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2">
                            <section>
                                <h2 className="label-caps mb-3">Virtual patient</h2>
                                <div className="space-y-5">
                                    {params.slice(0, 3).map((p) => (
                                        <ParameterControl
                                            key={p.id}
                                            spec={p}
                                            onChange={(v) => setValue(p.id, v)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="border-t border-border pt-5">
                                <h2 className="label-caps mb-3">Comparison arms</h2>
                                <div className="space-y-2.5">
                                    {treatmentArms.map((arm) => {
                                        const on = activeArms.includes(arm.id);
                                        return (
                                            <div key={arm.id}>
                                                <label className="flex cursor-pointer items-start gap-2.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={on}
                                                        onChange={() =>
                                                            setActiveArms((prev) =>
                                                                prev.includes(arm.id)
                                                                    ? prev.filter((x) => x !== arm.id)
                                                                    : [...prev, arm.id],
                                                            )
                                                        }
                                                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                                                        style={{ accentColor: ARM_COLOR[arm.id] }}
                                                    />
                                                    <span className="min-w-0">
                                                        <span className="flex items-center gap-2 text-sm">
                                                            <span
                                                                className="inline-block h-2 w-2 shrink-0 rounded-full"
                                                                style={{
                                                                    background: ARM_COLOR[arm.id],
                                                                    opacity: on ? 1 : 0.3,
                                                                }}
                                                            />
                                                            {arm.label}
                                                        </span>
                                                        {arm.caveat && (
                                                            <span className="mt-0.5 block text-[11px] text-[hsl(var(--prov-extrapolated))]">
                                                                {arm.caveat}
                                                            </span>
                                                        )}
                                                    </span>
                                                </label>
                                                <ProvenanceTag
                                                    provenance={arm.provenance}
                                                    className="ml-6 mt-1"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="border-t border-border pt-5">
                                <h2 className="label-caps mb-3">Model constants</h2>
                                <div className="space-y-5">
                                    {params.slice(3).map((p) => (
                                        <ParameterControl
                                            key={p.id}
                                            spec={p}
                                            onChange={(v) => setValue(p.id, v)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className="border-t border-border pt-5">
                                <h2 className="label-caps mb-3">Run settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-sm">Horizon</span>
                                            <span className="tnum text-sm font-medium">
                                                {horizon} yr
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={2}
                                            max={25}
                                            step={1}
                                            value={horizon}
                                            onChange={(e) => setHorizon(Number(e.target.value))}
                                            className="mt-2"
                                            aria-label="Simulation horizon in years"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2.5 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={cohortMode}
                                            onChange={(e) => setCohortMode(e.target.checked)}
                                            className="h-3.5 w-3.5"
                                        />
                                        Cohort mode (Monte Carlo)
                                    </label>

                                    {cohortMode && (
                                        <>
                                            <div>
                                                <div className="flex items-baseline justify-between">
                                                    <span className="text-sm">Virtual patients</span>
                                                    <span className="tnum text-sm font-medium">
                                                        {cohortN}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={100}
                                                    max={2000}
                                                    step={100}
                                                    value={cohortN}
                                                    onChange={(e) =>
                                                        setCohortN(Number(e.target.value))
                                                    }
                                                    className="mt-2"
                                                    aria-label="Number of virtual patients"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-sm">Seed</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={seed}
                                                        onChange={(e) =>
                                                            setSeed(Number(e.target.value) || 0)
                                                        }
                                                        className="tnum h-8 w-20 rounded border border-input bg-card px-2 text-sm"
                                                        aria-label="Random seed"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            setSeed(
                                                                Math.floor(Math.random() * 100000),
                                                            )
                                                        }
                                                        className="h-8 rounded border border-input px-2 text-xs hover:bg-secondary"
                                                    >
                                                        Re-draw
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Same seed, same cohort — a run is reproducible and
                                                can be cited by its seed.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </section>
                        </aside>

                        {/* Results */}
                        <div className="min-w-0 space-y-8">
                            {arms.length === 0 ? (
                                <p className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                                    Select at least one comparison arm to run the experiment.
                                </p>
                            ) : (
                                <>
                                    <section>
                                        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                                            <h2 className="text-sm font-semibold">
                                                Outcome at {horizon} years
                                            </h2>
                                            <span className="text-xs text-muted-foreground">
                                                Single virtual patient, deterministic
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[520px] text-sm">
                                                <thead>
                                                    <tr className="border-b border-border text-left">
                                                        <th className="label-caps py-2 font-medium">
                                                            Arm
                                                        </th>
                                                        <th className="label-caps py-2 text-right font-medium">
                                                            HbA1c
                                                        </th>
                                                        <th className="label-caps py-2 text-right font-medium">
                                                            Microvascular
                                                        </th>
                                                        <th className="label-caps py-2 text-right font-medium">
                                                            MI
                                                        </th>
                                                        <th className="label-caps py-2 text-right font-medium">
                                                            Δ vs first arm
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {headline.map((h, i) => (
                                                        <tr
                                                            key={h.arm.id}
                                                            className="border-b border-border/60"
                                                        >
                                                            <td className="py-2.5">
                                                                <span className="flex items-center gap-2">
                                                                    <span
                                                                        className="inline-block h-2 w-2 rounded-full"
                                                                        style={{
                                                                            background:
                                                                                ARM_COLOR[h.arm.id],
                                                                        }}
                                                                    />
                                                                    {h.arm.label}
                                                                </span>
                                                            </td>
                                                            <td className="tnum py-2.5 text-right">
                                                                {hba1c(h.hbA1c)}
                                                            </td>
                                                            <td className="tnum py-2.5 text-right font-medium">
                                                                {pct(h.micro)}
                                                            </td>
                                                            <td className="tnum py-2.5 text-right">
                                                                {pct(h.mi)}
                                                            </td>
                                                            <td className="tnum py-2.5 text-right text-muted-foreground">
                                                                {i === 0
                                                                    ? "—"
                                                                    : `${h.micro - headline[0].micro > 0 ? "+" : ""}${pct(h.micro - headline[0].micro)}`}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    <section>
                                        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                                            <h2 className="text-sm font-semibold">
                                                HbA1c trajectory
                                            </h2>
                                            <span className="text-xs text-muted-foreground">
                                                {cohortMode
                                                    ? `cohort mean, shaded p10–p90 across ${cohortN} virtual patients`
                                                    : "single patient"}
                                            </span>
                                        </div>
                                        <Legend arms={arms} />
                                        <TrajectoryChart
                                            years={results.years}
                                            series={hbSeries}
                                            yLabel="HbA1c (%)"
                                            format={hba1c}
                                        />
                                    </section>

                                    <section>
                                        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                                            <h2 className="text-sm font-semibold">
                                                Cumulative microvascular incidence
                                            </h2>
                                            <span className="text-xs text-muted-foreground">
                                                hazard scaled to updated mean HbA1c (UKPDS 35)
                                            </span>
                                        </div>
                                        <Legend arms={arms} />
                                        <TrajectoryChart
                                            years={results.years}
                                            series={microSeries}
                                            yLabel="Cumulative incidence"
                                            format={pct}
                                            yDomain={[0, Math.max(...microSeries.flatMap((s) => s.band?.hi ?? s.values)) * 1.1]}
                                        />
                                    </section>

                                    {cohortMode && (
                                        <section>
                                            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                                                <h2 className="text-sm font-semibold">
                                                    Outcome spread across the cohort
                                                </h2>
                                                <span className="text-xs text-muted-foreground">
                                                    cumulative microvascular incidence at{" "}
                                                    {horizon} yr · seed {seed}
                                                </span>
                                            </div>
                                            <DistributionChart
                                                arms={results.cohorts.map(({ arm, result }) => ({
                                                    id: arm.id,
                                                    label: arm.label,
                                                    color: ARM_COLOR[arm.id],
                                                    values: result.finalMicro,
                                                }))}
                                                format={pct}
                                            />
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Spread here reflects only the between-patient
                                                variation you configured — it is not a confidence
                                                interval, and it does not include uncertainty in
                                                the parameters themselves.
                                            </p>
                                        </section>
                                    )}

                                    <section className="border-t border-border pt-6">
                                        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                                            <h2 className="text-sm font-semibold">
                                                What is actually driving this result
                                            </h2>
                                            <span className="text-xs text-muted-foreground">
                                                swing in {horizon}-yr microvascular incidence across
                                                each parameter's full range
                                            </span>
                                        </div>
                                        <TornadoChart
                                            entries={sensitivity}
                                            provenanceFor={provenanceKind}
                                            format={pct}
                                        />
                                    </section>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

const Legend = ({ arms }: { arms: TreatmentArm[] }) => (
    <div className="mb-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        {arms.map((a) => (
            <span key={a.id} className="flex items-center gap-1.5">
                <span
                    className="inline-block h-[2px] w-4"
                    style={{ background: ARM_COLOR[a.id] }}
                />
                <span className="text-muted-foreground">{a.label}</span>
            </span>
        ))}
    </div>
);

const ParameterControl = ({
    spec,
    onChange,
}: {
    spec: ParamSpec;
    onChange: (v: number) => void;
}) => (
    <div>
        <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={spec.id} className="text-sm">
                {spec.label}
            </label>
            <span className="tnum shrink-0 text-sm font-medium">
                {spec.value}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{spec.unit}</span>
            </span>
        </div>
        <input
            id={spec.id}
            type="range"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={spec.value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="mt-2"
        />
        <ProvenanceTag provenance={spec.provenance} className="mt-1.5" />
    </div>
);

export default LabPage;
