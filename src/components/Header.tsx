import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const nav = [
    { to: "/learn", label: "Learn" },
    { to: "/lab", label: "Lab" },
    { to: "/evidence", label: "Evidence" },
    { to: "/methods", label: "Methods" },
    { to: "/funding", label: "Funding" },
];

const Header = () => {
    const { pathname } = useLocation();

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
                <Link to="/" className="flex items-baseline gap-2">
                    <span className="text-[15px] font-semibold tracking-tight">MedBase</span>
                    <span className="label-caps hidden sm:inline">Virtual Laboratory</span>
                </Link>

                <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
                    {nav.map((item) => {
                        const active = pathname.startsWith(item.to);
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={cn(
                                    "relative px-2 py-1.5 text-sm transition-colors sm:px-3",
                                    active
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {item.label}
                                {/* Moves only on navigation — state indication, not decoration. */}
                                {active && (
                                    <motion.span
                                        layoutId="nav-active"
                                        className="absolute inset-x-1 -bottom-[13px] h-px bg-foreground"
                                        transition={{
                                            type: "spring",
                                            duration: 0.35,
                                            bounce: 0.15,
                                        }}
                                    />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
};

export default Header;
