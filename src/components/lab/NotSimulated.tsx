import { Disclosure } from "./primitives";
import { cn } from "@/lib/utils";

const copy = {
    drug: {
        title: "Why there is no drug simulation here",
        what: "A pharmacological arm would need to answer how a dose reaches a concentration, how that concentration moves a biomarker, and how that biomarker maps to an outcome. The disease-progression model does none of that — its treatment arms are level shifts in HbA1c, which is a stand-in for a drug model, not a drug model.",
        needs: [
            "A PK component: dose, absorption, clearance, and exposure over time",
            "A PD component linking exposure to biomarker change, with a dose–response shape rather than a single shift",
            "Adherence and discontinuation, which dominate real-world effect sizes",
            "Adverse-effect hazards, so a benefit is never shown without its cost",
        ],
    },
    gene: {
        title: "Why there is no gene or pathway simulation here",
        what: "Simulating a variant means claiming a causal chain from variant to molecular function to physiology to clinical outcome, and for most variants that chain is not quantified — effect sizes come from association studies, which do not license simulation.",
        needs: [
            "Variant-level effect estimates with a defined causal direction, not association odds ratios",
            "A pathway model with quantified parameters, not a diagram",
            "An explicit statement of penetrance and its dependence on background and environment",
            "A way to propagate the very large uncertainty on each of the above to the output",
        ],
    },
} as const;

/**
 * The drug and gene panels show retrieved reference data. This note says, next to that data,
 * why none of it is turned into a simulation — sliders here would produce output that looks
 * exactly like the modelled area's, which is the reason they are absent.
 */
export const NotSimulated = ({ area, className }: { area: keyof typeof copy; className?: string }) => {
    const c = copy[area];
    return (
        <div className={cn("border-t border-border pt-5", className)}>
            <Disclosure summary={c.title}>
                <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>{c.what}</p>
                    <p className="label-caps">What an honest version would require</p>
                    <ul className="space-y-1.5">
                        {c.needs.map((n) => (
                            <li key={n} className="flex gap-2">
                                <span className="text-border">—</span>
                                <span>{n}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs">
                        So this panel retrieves reference data and stops there. Nothing on it feeds the simulator.
                    </p>
                </div>
            </Disclosure>
        </div>
    );
};
