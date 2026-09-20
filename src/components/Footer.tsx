import { Link } from "react-router-dom";

const Footer = () => (
    <footer className="mt-16 border-t border-border">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xl space-y-2">
                    <p className="text-sm font-semibold">MedBase Virtual Laboratory</p>
                    <p className="text-sm text-muted-foreground">
                        A research and teaching sandbox for exploring how modelling assumptions
                        drive predicted outcomes. Not a clinical decision support tool, not a
                        validated simulator, and not a source of medical advice.
                    </p>
                </div>
                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <Link to="/learn" className="text-muted-foreground hover:text-foreground">
                        Learn
                    </Link>
                    <Link to="/lab" className="text-muted-foreground hover:text-foreground">
                        Lab
                    </Link>
                    <Link to="/evidence" className="text-muted-foreground hover:text-foreground">
                        Evidence
                    </Link>
                    <Link to="/methods" className="text-muted-foreground hover:text-foreground">
                        Methods &amp; limits
                    </Link>
                    <Link to="/funding" className="text-muted-foreground hover:text-foreground">
                        Funding
                    </Link>
                </nav>
            </div>
            <p className="mt-8 text-xs text-muted-foreground">
                Literature records retrieved from PubMed; trial records from ClinicalTrials.gov.
                Prototype build — re-verify every parameter and snapshot before research use.
            </p>
        </div>
    </footer>
);

export default Footer;
