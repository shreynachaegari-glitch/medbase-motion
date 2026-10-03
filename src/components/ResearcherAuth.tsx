import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react";
import { LogIn, LogOut, X } from "lucide-react";

/**
 * Front-end-only researcher sign-in. There is no server: the ID is stored in this browser's
 * localStorage, nothing is verified and nothing leaves the device. It exists so the interface
 * has a researcher identity to hang saved work on once a backend does.
 */
interface Researcher {
    id: string;
    name: string;
}

interface AuthValue {
    researcher: Researcher | null;
    signIn: (r: Researcher) => void;
    signOut: () => void;
}

const KEY = "medbase.researcher";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** e.g. MB-7K2QF9 - random, unambiguous characters; a label, not a credential. */
export const newResearcherId = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return "MB-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
};
const AuthContext = createContext<AuthValue | null>(null);

const load = (): Researcher | null => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? (JSON.parse(raw) as Researcher) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [researcher, setResearcher] = useState<Researcher | null>(load);
    const signIn = (r: Researcher) => {
        setResearcher(r);
        try {
            localStorage.setItem(KEY, JSON.stringify(r));
        } catch {
            /* private mode: stays signed in for this session only */
        }
    };
    const signOut = () => {
        setResearcher(null);
        try {
            localStorage.removeItem(KEY);
        } catch {
            /* nothing to clear */
        }
    };
    return <AuthContext.Provider value={{ researcher, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export const useResearcher = () => {
    const v = useContext(AuthContext);
    if (!v) throw new Error("useResearcher must be used inside AuthProvider");
    return v;
};

export const AuthButton = () => {
    const { researcher, signIn, signOut } = useResearcher();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        signIn({ id: newResearcherId(), name: name.trim() });
        setOpen(false);
        setName("");
    };

    if (researcher) {
        return (
            <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
                <span className="max-w-[10rem] truncate">{researcher.name} &middot; {researcher.id}</span>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Sign out</span>
            </button>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-secondary"
            >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Researcher sign in
            </button>
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Researcher sign in"
                    onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
                >
                    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-background p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold">Researcher sign in</h2>
                            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Demo sign-in for the Lab and simulations. A researcher ID is issued for you here. Nothing is verified and no account is created; the ID stays in this browser only.
                        </p>
                        <label className="block text-sm">
                            Name
                            <input
                                value={name}
                                required
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                        </label>
                        <button type="submit" className="w-full rounded-md bg-foreground px-3 py-2 text-sm text-background">
                            Continue
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export const ResearcherBar = () => {
    const { researcher } = useResearcher();
    return (
        <div className="border-b border-border bg-card/40 px-4 py-5 text-center">
            {researcher ? (
                <div className="mx-auto flex max-w-xl flex-col items-center gap-2">
                    <p className="label-caps">Researcher ID</p>
                    <p className="rounded-md border border-border bg-background px-5 py-2 font-mono text-2xl font-semibold tracking-widest">
                        {researcher.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {researcher.name} &middot; Lab sessions and simulations are tagged to this ID in this browser.
                    </p>
                </div>
            ) : (
                <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                        Sign in as a researcher to get your researcher ID for simulations and Lab work.
                    </p>
                    <AuthButton />
                </div>
            )}
        </div>
    );
};
