import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { BodySilhouette } from "@/components/BodyMap";
import { OrganDiagram } from "@/components/OrganExplorer";

/**
 * Scroll-driven zoom: as the reader scrolls, the body grows toward the chest and dissolves
 * into the interactive heart. With reduced motion it shows the heart directly.
 */
const ScrollJourney = () => {
    const ref = useRef<HTMLElement>(null);
    const reduce = useReducedMotion();
    const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

    const scale = useTransform(p, [0, 0.55], [1, 7]);
    const rotateY = useTransform(p, [0, 0.55], [-18, 0]);
    const bodyOpacity = useTransform(p, [0.4, 0.58], [1, 0]);
    const heartOpacity = useTransform(p, [0.5, 0.68], [0, 1]);
    const heartScale = useTransform(p, [0.5, 0.68], [0.75, 1]);
    const heartEvents = useTransform(p, (v) => (v > 0.6 ? "auto" : "none"));
    const cap1 = useTransform(p, [0, 0.12, 0.22], [1, 1, 0]);
    const cap2 = useTransform(p, [0.2, 0.3, 0.45, 0.52], [0, 1, 1, 0]);

    if (reduce) {
        return (
            <section className="mt-10 border-t border-border pt-8">
                <p className="label-caps">Inside the body</p>
                <OrganDiagram organ="heart" className="mt-6" />
            </section>
        );
    }

    return (
        <section ref={ref} className="relative mt-10 h-[280vh] border-t border-border" aria-label="Scroll into the heart">
            <div className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden pt-6">
                <p className="label-caps">Inside the body</p>
                <div className="relative flex-1" style={{ perspective: 1000 }}>
                    <motion.div
                        style={{ scale, rotateY, opacity: bodyOpacity, transformOrigin: "56% 28%" }}
                        className="absolute inset-0 flex items-center justify-center"
                        aria-hidden="true"
                    >
                        <div className="h-[70%] max-h-[560px] aspect-[200/440]">
                            <BodySilhouette highlight="heart" />
                        </div>
                    </motion.div>

                    <motion.p style={{ opacity: cap1 }} className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm text-muted-foreground">
                        Scroll to travel into the chest &darr;
                    </motion.p>
                    <motion.p style={{ opacity: cap2 }} className="pointer-events-none absolute inset-x-0 bottom-6 text-center text-sm text-muted-foreground">
                        The heart sits just left of centre, behind the breastbone, between the lungs.
                    </motion.p>

                    <motion.div style={{ opacity: heartOpacity, scale: heartScale, pointerEvents: heartEvents }} className="absolute inset-0 overflow-y-auto py-4">
                        <OrganDiagram organ="heart" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ScrollJourney;
