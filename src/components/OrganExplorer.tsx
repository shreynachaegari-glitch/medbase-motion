import { useEffect, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "motion/react";
import { X } from "lucide-react";
import { getDiseaseById } from "@/data/knowledge";
import { cn } from "@/lib/utils";

/**
 * Clickable organ illustrations for learning anatomy. The text for each part says what it does, and which conditions in the library
 * involve it.
 */
export type OrganId = "heart" | "lungs" | "brain";

interface Part {
    id: string;
    label: string;
    text: string;
    conditions: string[];
}

interface Organ {
    title: string;
    intro: string;
    parts: Part[];
}

export const ORGANS: Record<OrganId, Organ> = {
    heart: {
        title: "The heart",
        intro: "A muscular pump about the size of a fist with four chambers. The right side sends blood to the lungs; the left side sends it around the body. Shown from the front, so the heart's right side is on your left.",
        parts: [
            { id: "ra", label: "Right atrium", text: "Collects oxygen-poor blood returning from the body through the venae cavae, then passes it through the tricuspid valve into the right ventricle.", conditions: [] },
            { id: "rv", label: "Right ventricle", text: "Pumps oxygen-poor blood through the pulmonary valve into the pulmonary artery and on to the lungs. Its wall is thinner than the left ventricle's because the lungs need lower pressure.", conditions: ["heart-failure"] },
            { id: "la", label: "Left atrium", text: "Receives oxygen-rich blood from the lungs through the pulmonary veins and passes it through the mitral valve into the left ventricle.", conditions: [] },
            { id: "lv", label: "Left ventricle", text: "The main pumping chamber. Its thick, muscular wall pushes oxygen-rich blood through the aortic valve into the aorta and around the body. Long-term high blood pressure can thicken and stiffen it.", conditions: ["hypertension", "heart-failure", "myocardial-infarction"] },
            { id: "septum", label: "Septum", text: "The muscular wall between the right and left sides. It keeps oxygen-poor and oxygen-rich blood apart.", conditions: [] },
            { id: "valves", label: "Heart valves", text: "Four one-way valves keep blood moving forward: tricuspid (right atrium to right ventricle), pulmonary (right ventricle to pulmonary artery), mitral (left atrium to left ventricle) and aortic (left ventricle to aorta). Their closing makes the 'lub-dub' sound of the heartbeat.", conditions: [] },
            { id: "aorta", label: "Aorta", text: "The body's largest artery. It carries oxygen-rich blood from the left ventricle, arches over the heart and runs down through the chest and abdomen, branching to supply every organ.", conditions: ["hypertension"] },
            { id: "pa", label: "Pulmonary artery", text: "Carries oxygen-poor blood from the right ventricle to both lungs to pick up oxygen. After birth it is the only artery that carries oxygen-poor blood.", conditions: [] },
            { id: "vc", label: "Venae cavae", text: "The superior and inferior venae cavae are the large veins that bring oxygen-poor blood back from the upper and lower body into the right atrium.", conditions: [] },
            { id: "pv", label: "Pulmonary veins", text: "Bring oxygen-rich blood from the lungs back to the left atrium.", conditions: [] },
            { id: "coronary", label: "Coronary arteries", text: "Wrap around the outside of the heart and supply the heart muscle itself with blood. A blockage in one of them starves part of the muscle of oxygen and causes a heart attack.", conditions: ["heart-disease", "myocardial-infarction"] },
            { id: "sa", label: "SA node", text: "The sinoatrial node is the heart's natural pacemaker. It fires the electrical signal that starts each heartbeat, usually 60 to 100 times a minute at rest.", conditions: [] },
        ],
    },
    lungs: {
        title: "The lungs",
        intro: "Two spongy organs that move oxygen into the blood and carbon dioxide out. Air travels down the windpipe, through branching airways, into tiny air sacs. Shown from the front.",
        parts: [
            { id: "trachea", label: "Trachea (windpipe)", text: "A tube held open by C-shaped rings of cartilage. It carries air from the throat into the chest, where it splits into the two main bronchi.", conditions: [] },
            { id: "bronchi", label: "Bronchi", text: "Airways that branch again and again into smaller bronchioles. In asthma their walls swell and tighten, narrowing the airway and causing wheeze.", conditions: ["asthma"] },
            { id: "rlung", label: "Right lung", text: "Has three lobes (upper, middle and lower) and is slightly larger than the left. Tuberculosis often settles in the upper lobes.", conditions: ["tuberculosis", "pneumonia", "covid-19"] },
            { id: "llung", label: "Left lung", text: "Has two lobes and a notch on its inner side, the cardiac notch, that makes room for the heart.", conditions: ["tuberculosis", "pneumonia"] },
            { id: "alveoli", label: "Alveoli", text: "Hundreds of millions of tiny air sacs where oxygen passes into the blood and carbon dioxide passes out. In pneumonia they fill with fluid or pus, which makes breathing hard.", conditions: ["pneumonia", "covid-19"] },
            { id: "diaphragm", label: "Diaphragm", text: "A dome-shaped muscle under the lungs. When it contracts and flattens, the chest expands and air is drawn in; when it relaxes, air flows out.", conditions: [] },
        ],
    },
    brain: {
        title: "The brain",
        intro: "The control centre for thought, movement, senses and automatic body functions. Shown from the left side, with the front of the head on your left.",
        parts: [
            { id: "frontal", label: "Frontal lobe", text: "Planning, decision-making, personality, speech production and voluntary movement. The motor strip at its back edge controls movement on the opposite side of the body.", conditions: ["stroke", "depression"] },
            { id: "parietal", label: "Parietal lobe", text: "Processes touch, temperature and pain, and helps judge space, size and the position of the body.", conditions: ["stroke"] },
            { id: "temporal", label: "Temporal lobe", text: "Hearing, memory and understanding language.", conditions: ["stroke"] },
            { id: "occipital", label: "Occipital lobe", text: "The main visual centre. It turns signals from the eyes into the images we see.", conditions: ["stroke"] },
            { id: "cerebellum", label: "Cerebellum", text: "Coordinates balance, posture and smooth, accurate movement.", conditions: [] },
            { id: "brainstem", label: "Brainstem", text: "Connects the brain to the spinal cord and runs automatic functions such as breathing, heart rate and swallowing.", conditions: ["rabies"] },
        ],
    },
};

/* ---------------------------------- images ---------------------------------- */

/**
 * Realistic medical illustrations by Blausen Medical, CC BY 3.0, via Wikimedia Commons, served
 * from public/organs. Pins are placed by percentage of the image, so they track any size.
 */
const IMAGES: Record<OrganId, { file: string; source: string; w: number; h: number; pins: Record<string, [number, number]> }> = {
    heart: {
        file: "heart.png",
        source: "https://commons.wikimedia.org/wiki/File:Blausen_0451_Heart_Anterior.png",
        w: 960,
        h: 873,
        pins: { ra: [34, 44], rv: [48, 64], la: [67, 41], lv: [72, 72], septum: [58, 74], aorta: [53, 20], pa: [56, 34], vc: [35, 18], pv: [73, 47], coronary: [62, 54], sa: [37, 36] },
    },
    lungs: {
        file: "lungs.png",
        source: "https://commons.wikimedia.org/wiki/File:Blausen_0770_RespiratorySystem_02.png",
        w: 960,
        h: 768,
        pins: { trachea: [52.5, 43], bronchi: [55.5, 53], rlung: [39, 62], llung: [64, 66], alveoli: [44.5, 55], diaphragm: [47, 76] },
    },
    brain: {
        file: "brain.png",
        source: "https://commons.wikimedia.org/wiki/File:Blausen_0111_BrainLobes.png",
        w: 960,
        h: 576,
        pins: { frontal: [31, 40], parietal: [60, 37], temporal: [50, 66], occipital: [79, 59], cerebellum: [68, 83], brainstem: [55, 93] },
    },
};

/* --------------------------------- explorer --------------------------------- */

/** Pointer-driven 3D tilt; off for people who prefer reduced motion. */
const useTilt = () => {
    const reduce = useReducedMotion();
    const rotateX = useSpring(0, { stiffness: 140, damping: 16 });
    const rotateY = useSpring(0, { stiffness: 140, damping: 16 });
    const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        rotateY.set(((e.clientX - r.left) / r.width - 0.5) * 18);
        rotateX.set(-((e.clientY - r.top) / r.height - 0.5) * 18);
    };
    const onPointerLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
    };
    return { style: { rotateX, rotateY, transformStyle: "preserve-3d" as const }, onPointerMove, onPointerLeave };
};

export const OrganDiagram = ({ organ, className }: { organ: OrganId; className?: string }) => {
    const data = ORGANS[organ];
    const [selected, setSelected] = useState<string | null>(null);
    const tilt = useTilt();
    const part = data.parts.find((p) => p.id === selected);
    const img = IMAGES[organ];

    return (
        <div className={cn("grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10", className)}>
            <div style={{ perspective: 1100 }} className="mx-auto w-full max-w-[520px]">
                <motion.div {...tilt} className="relative overflow-hidden rounded-xl border border-border bg-white shadow-2xl">
                    <img
                        src={`${import.meta.env.BASE_URL}organs/${img.file}`}
                        width={img.w}
                        height={img.h}
                        alt={`Illustration of ${data.title.toLowerCase()} with labelled parts`}
                        className="block h-auto w-full select-none"
                        draggable={false}
                    />
                    {data.parts.map((p) => {
                        const pin = img.pins[p.id];
                        if (!pin) return null;
                        const on = selected === p.id;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelected(p.id)}
                                aria-label={p.label}
                                aria-pressed={on}
                                title={p.label}
                                style={{ left: `${pin[0]}%`, top: `${pin[1]}%`, transform: "translate(-50%, -50%) translateZ(30px)" }}
                                className="group absolute flex h-7 w-7 items-center justify-center rounded-full outline-none"
                            >
                                {!on && <span className="absolute inset-0 animate-ping rounded-full bg-sky-400/60" />}
                                <span
                                    className={cn(
                                        "relative h-3.5 w-3.5 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-125 group-focus-visible:scale-125",
                                        on ? "scale-150 bg-amber-400" : "bg-sky-500",
                                    )}
                                />
                            </button>
                        );
                    })}
                </motion.div>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Tap a glowing point. Illustration:{" "}
                    <a href={img.source} target="_blank" rel="noreferrer" className="underline hover:text-foreground">
                        Blausen Medical
                    </a>
                    , CC BY 3.0.
                </p>
            </div>

            <div className="min-w-0">
                <h3 className="text-lg font-semibold">{data.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.intro}</p>
                <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label={`Parts of ${data.title.toLowerCase()}`}>
                    {data.parts.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelected(p.id)}
                            aria-pressed={selected === p.id}
                            className={cn(
                                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                                selected === p.id ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary",
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                <div aria-live="polite" className="mt-5 min-h-[8rem] rounded-lg border border-border bg-card/50 p-4">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={part?.id ?? "none"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                        >
                            {part ? (
                                <>
                                    <p className="text-sm font-medium">{part.label}</p>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{part.text}</p>
                                    {part.conditions.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="label-caps">Related</span>
                                            {part.conditions.map((id) => {
                                                const d = getDiseaseById(id);
                                                return d ? (
                                                    <Link key={id} to={`/learn/${id}`} className="text-xs text-primary hover:underline">
                                                        {d.name}
                                                    </Link>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">Select a part on the diagram or from the list to learn what it does.</p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

/** The organ view opened from the body map, zooming up out of the body. */
export const OrganModal = ({ organ, onClose }: { organ: OrganId | null; onClose: () => void }) => {
    const reduce = useReducedMotion();
    useEffect(() => {
        if (!organ) return;
        const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [organ, onClose]);

    return createPortal(
        <AnimatePresence>
            {organ && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <div style={{ perspective: 1200 }} className="w-full max-w-4xl">
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label={ORGANS[organ].title}
                            onClick={(e) => e.stopPropagation()}
                            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotateX: 28 }}
                            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, rotateX: -10 }}
                            transition={{ type: "spring", duration: 0.55, bounce: 0.18 }}
                            className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-2xl sm:p-7"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <p className="label-caps">Look inside</p>
                                <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 hover:bg-secondary">
                                    <X className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </div>
                            <OrganDiagram organ={organ} />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
};
