import { useState } from "react";
import { Link } from "react-router-dom";
import { getDiseaseById } from "@/data/knowledge";
import { cn } from "@/lib/utils";
import { OrganModal, type OrganId } from "@/components/OrganExplorer";

/**
 * An interactive body map for learning where conditions in the library show up. It is a
 * reference index, not a symptom checker: it lists conditions that can involve an area and
 * never ranks them by likelihood or suggests a diagnosis.
 */
interface Area {
    id: string;
    label: string;
    /** Hotspot geometry in the 200 x 440 SVG space. */
    shape: { type: "ellipse"; cx: number; cy: number; rx: number; ry: number } | { type: "rect"; x: number; y: number; w: number; h: number; r?: number };
    signs: string;
    conditions: string[];
    organ?: OrganId;
}

const AREAS: Area[] = [
    {
        id: "head",
        label: "Head and brain",
        shape: { type: "ellipse", cx: 100, cy: 40, rx: 26, ry: 32 },
        signs: "Headache, confusion, sudden weakness on one side, face drooping, seizures, low mood.",
        conditions: ["stroke", "depression", "rabies", "dengue", "malaria"],
        organ: "brain",
    },
    {
        id: "eyes",
        label: "Eyes",
        shape: { type: "rect", x: 80, y: 30, w: 40, h: 12, r: 6 },
        signs: "Blurred or cloudy vision, loss of side vision, dark spots or floaters.",
        conditions: ["cataract", "glaucoma", "diabetic-retinopathy", "diabetes"],
    },
    {
        id: "lungs",
        label: "Lungs and chest",
        shape: { type: "rect", x: 66, y: 92, w: 68, h: 52, r: 18 },
        signs: "Cough, breathlessness, wheeze, chest tightness, coughing up blood in some infections.",
        conditions: ["tuberculosis", "pneumonia", "asthma", "covid-19"],
        organ: "lungs",
    },
    {
        id: "heart",
        label: "Heart and circulation",
        shape: { type: "ellipse", cx: 112, cy: 124, rx: 14, ry: 14 },
        signs: "Chest pressure, breathlessness, palpitations, swollen ankles, often no symptoms in high blood pressure.",
        conditions: ["heart-disease", "myocardial-infarction", "heart-failure", "hypertension"],
        organ: "heart",
    },
    {
        id: "abdomen",
        label: "Stomach, gut and liver",
        shape: { type: "rect", x: 68, y: 152, w: 64, h: 50, r: 16 },
        signs: "Abdominal pain, vomiting, watery or frequent stools, jaundice, loss of appetite.",
        conditions: ["typhoid", "cholera", "diarrhea", "hepatitis-b", "malnutrition"],
    },
    {
        id: "kidneys",
        label: "Kidneys",
        shape: { type: "rect", x: 74, y: 204, w: 52, h: 26, r: 12 },
        signs: "Swelling of face or legs, tiredness, changes in urination. Early disease often has no signs.",
        conditions: ["chronic-kidney-disease", "diabetes", "hypertension"],
    },
    {
        id: "bones",
        label: "Bones, joints and spine",
        shape: { type: "rect", x: 82, y: 300, w: 36, h: 50, r: 14 },
        signs: "Bone or joint pain, stiffness, swelling, back pain, bending of bones in children, fractures.",
        conditions: ["bone-tb", "osteomyelitis", "osteoporosis", "osteoarthritis", "rickets", "fluorosis", "chikungunya"],
    },
    {
        id: "skin",
        label: "Skin and nerves",
        shape: { type: "rect", x: 20, y: 100, w: 30, h: 90, r: 14 },
        signs: "Rash, pale or numb patches, loss of feeling in hands or feet.",
        conditions: ["leprosy", "dengue", "chikungunya"],
    },
    {
        id: "blood",
        label: "Whole body and blood",
        shape: { type: "rect", x: 150, y: 100, w: 30, h: 90, r: 14 },
        signs: "Fever, tiredness, pallor, weight loss, repeated infections.",
        conditions: ["anemia", "hiv-aids", "malaria", "dengue", "malnutrition", "diabetes"],
    },
];

const Hotspot = ({ area, active, onSelect }: { area: Area; active: boolean; onSelect: () => void }) => {
    const common = {
        role: "button" as const,
        tabIndex: 0,
        "aria-label": area.label,
        "aria-pressed": active,
        onClick: onSelect,
        onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
            }
        },
        className: cn(
            "cursor-pointer outline-none transition-colors focus-visible:stroke-foreground",
            active ? "fill-primary/50 stroke-primary" : "fill-primary/10 stroke-primary/40 hover:fill-primary/25",
        ),
        strokeWidth: 1.5,
    };
    const s = area.shape;
    return s.type === "ellipse" ? (
        <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />
    ) : (
        <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r ?? 0} {...common} />
    );
};

/** The plain body outline, shared with the scroll journey. */
export const BodySilhouette = ({ highlight }: { highlight?: "heart" }) => (
    <svg viewBox="0 0 200 440" className="h-full w-full">
        <g className="fill-secondary stroke-border" strokeWidth={1.5}>
            <ellipse cx="100" cy="40" rx="26" ry="32" />
            <rect x="90" y="68" width="20" height="22" rx="6" />
            <rect x="56" y="88" width="88" height="130" rx="30" />
            <rect x="20" y="96" width="30" height="130" rx="15" />
            <rect x="150" y="96" width="30" height="130" rx="15" />
            <rect x="64" y="212" width="34" height="200" rx="16" />
            <rect x="102" y="212" width="34" height="200" rx="16" />
        </g>
        {highlight === "heart" && <path d="M112 136 C100 126 100 114 108 114 C111 114 112 117 112 117 C112 117 113 114 116 114 C124 114 124 126 112 136 Z" fill="hsl(355 75% 55%)" />}
    </svg>
);

const BodyMap = () => {
    const [organ, setOrgan] = useState<OrganId | null>(null);
    const [selected, setSelected] = useState<string>("lungs");
    const area = AREAS.find((a) => a.id === selected)!;
    const conditions = area.conditions.map((id) => getDiseaseById(id)).filter((d) => d !== undefined);

    return (
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="body-map-title">
            <p className="label-caps">Body map</p>
            <h2 id="body-map-title" className="mt-2 text-lg font-semibold tracking-tight">
                Explore by body area
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Select an area to see which conditions in the library can involve it and the signs people may notice.
                This is for learning only. It is not a symptom checker and cannot tell you what you have.
            </p>

            <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-12">
                <div className="mx-auto w-full max-w-[260px]">
                    <svg viewBox="0 0 200 440" className="h-auto w-full" role="group" aria-label="Human body map">
                        {/* Silhouette */}
                        <g className="fill-secondary stroke-border" strokeWidth={1.5}>
                            <ellipse cx="100" cy="40" rx="26" ry="32" />
                            <rect x="90" y="68" width="20" height="22" rx="6" />
                            <rect x="56" y="88" width="88" height="130" rx="30" />
                            <rect x="20" y="96" width="30" height="130" rx="15" />
                            <rect x="150" y="96" width="30" height="130" rx="15" />
                            <rect x="64" y="212" width="34" height="200" rx="16" />
                            <rect x="102" y="212" width="34" height="200" rx="16" />
                        </g>
                        {AREAS.map((a) => (
                            <Hotspot key={a.id} area={a} active={a.id === selected} onSelect={() => (a.id === selected && a.organ ? setOrgan(a.organ) : setSelected(a.id))} />
                        ))}
                    </svg>
                </div>

                <div className="min-w-0">
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Body areas">
                        {AREAS.map((a) => (
                            <button
                                key={a.id}
                                type="button"
                                onClick={() => setSelected(a.id)}
                                aria-pressed={a.id === selected}
                                className={cn(
                                    "rounded-full border px-3 py-1 text-xs transition-colors",
                                    a.id === selected ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary",
                                )}
                            >
                                {a.label}
                            </button>
                        ))}
                    </div>

                    <div aria-live="polite" className="mt-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-base font-medium">{area.label}</h3>
                            {area.organ && (
                                <button
                                    type="button"
                                    onClick={() => setOrgan(area.organ!)}
                                    className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90"
                                >
                                    Look inside the {area.organ} &rarr;
                                </button>
                            )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            <span className="label-caps mr-2">Signs people may notice</span>
                            {area.signs}
                        </p>
                        <p className="label-caps mt-5">Conditions in the library that can involve this area</p>
                        <ul className="mt-2 divide-y divide-border border-y border-border">
                            {conditions.map((d) => (
                                <li key={d.id}>
                                    <Link to={`/learn/${d.id}`} className="flex items-baseline justify-between gap-4 py-2.5 text-sm hover:text-primary">
                                        <span>{d.name}</span>
                                        <span className="label-caps shrink-0">{d.category}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Many conditions share signs. Anyone with symptoms that worry them should see a clinician.
                        </p>
                    </div>
                </div>
            </div>
            <OrganModal organ={organ} onClose={() => setOrgan(null)} />
        </section>
    );
};

export default BodyMap;
