import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDiseaseById } from "@/data/knowledge";
import { literature } from "@/data/evidence";

const sections = [
    { key: "causes", title: "Causes" },
    { key: "riskFactors", title: "Risk factors" },
    { key: "prevention", title: "Prevention" },
    { key: "treatment", title: "Treatment" },
] as const;

const ConditionPage = () => {
    const { id } = useParams();
    const condition = id ? getDiseaseById(id) : undefined;

    if (!condition) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-24 sm:px-6">
                    <h1 className="text-2xl font-semibold tracking-tight">Condition not found</h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        No record with that identifier exists in the knowledge base.
                    </p>
                    <Link to="/learn" className="mt-6 inline-block text-sm text-primary hover:underline">
                        ← Back to the knowledge base
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const modelPapers = condition.labModel ? literature.filter((l) => l.feedsModel) : [];

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6">
                <Link to="/learn" className="text-xs text-muted-foreground hover:text-foreground">
                    ← Knowledge base
                </Link>

                <header className="mt-4 max-w-3xl">
                    <p className="label-caps">{condition.category}</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">{condition.name}</h1>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {condition.description}
                    </p>
                </header>

                <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
                    <div className="min-w-0">
                        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                            {sections.map((s) => (
                                <section key={s.key}>
                                    <h2 className="label-caps border-b border-border pb-2">
                                        {s.title}
                                    </h2>
                                    <ul className="mt-3 space-y-2">
                                        {condition[s.key].map((item) => (
                                            <li
                                                key={item}
                                                className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                                            >
                                                <span className="text-border">—</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>

                        <section className="mt-10 border-t border-border pt-5">
                            <h2 className="label-caps">Sources</h2>
                            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                                {condition.sources.map((s) => (
                                    <li key={s.url + s.name}>
                                        <a
                                            href={s.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-primary hover:underline"
                                        >
                                            {s.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>

                    {/* The bridge between the two halves of the product. */}
                    <aside className="lg:border-l lg:border-border lg:pl-8">
                        <h2 className="label-caps">Research lab</h2>
                        {condition.labModel ? (
                            <div className="mt-3 space-y-4">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    This record has a model binding, so it can be loaded into the
                                    Lab as a virtual experiment.
                                </p>
                                <div className="border border-border p-3">
                                    <p className="text-sm font-medium">{condition.labModel.label}</p>
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                        <span className="label-caps">Model scope</span>{" "}
                                        {condition.labModel.scope}
                                    </p>
                                </div>
                                <Link
                                    to={`/lab?condition=${condition.id}`}
                                    className="inline-block rounded bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                    Open in the Lab →
                                </Link>

                                {modelPapers.length > 0 && (
                                    <div className="pt-2">
                                        <p className="label-caps">Parameters drawn from</p>
                                        <ul className="mt-2 space-y-2">
                                            {modelPapers.map((p) => (
                                                <li key={p.pmid} className="text-xs">
                                                    <a
                                                        href={`https://pubmed.ncbi.nlm.nih.gov/${p.pmid}/`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-primary hover:underline"
                                                    >
                                                        {p.authors.split(",")[0]} et al. {p.year}
                                                    </a>
                                                    <span className="text-muted-foreground">
                                                        {" "}
                                                        — {p.feedsModel}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-3 space-y-3">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    No model binding. Nothing in the Lab simulates this condition,
                                    so there is no experiment to open — the reference record above
                                    is all MedBase holds on it.
                                </p>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    A binding requires published parameters for a progression
                                    pathway, not just a description of the disease. Most conditions
                                    here do not have them in a usable form.
                                </p>
                                <Link
                                    to="/lab"
                                    className="inline-block text-sm text-primary hover:underline"
                                >
                                    See what is modelled →
                                </Link>
                            </div>
                        )}
                    </aside>
                </div>

                <p className="mt-12 max-w-3xl border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
                    Educational reference only — a summary of public health guidance for learning,
                    not a diagnosis, treatment plan, or substitute for a clinician.
                </p>
            </main>

            <Footer />
        </div>
    );
};

export default ConditionPage;
