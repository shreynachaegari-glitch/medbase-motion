import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollManager from "@/components/ScrollManager";
import Chatbot from "@/components/Chatbot";
import { LangProvider } from "@/i18n";
import { AuthProvider } from "@/components/ResearcherAuth";

// Each page past the landing page loads on first visit, so the landing page no longer ships
// the Lab's charts, database clients and simulation engine up front.
const LearnPage = lazy(() => import("@/pages/LearnPage"));
const ConditionPage = lazy(() => import("@/pages/ConditionPage"));
const LabPage = lazy(() => import("@/pages/LabPage"));
const AnatomyPage = lazy(() => import("@/pages/AnatomyPage"));
const EvidencePage = lazy(() => import("@/pages/EvidencePage"));
const MethodsPage = lazy(() => import("@/pages/MethodsPage"));
const FundingPage = lazy(() => import("@/pages/FundingPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/** Holds the page height while a route chunk loads, so the footer never flashes up. */
const PageFallback = () => (
    <div className="min-h-screen" role="status" aria-live="polite">
        <span className="sr-only">Loading page…</span>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            {/* import.meta.env.BASE_URL tracks vite.config.ts's `base` (e.g. "/medbase-motion/"
                on GitHub Pages, "/" in dev) so routes resolve correctly under either. */}
            <LangProvider>
            <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <ScrollManager />
                <Chatbot />
                <Suspense fallback={<PageFallback />}>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/learn" element={<LearnPage />} />
                        <Route path="/learn/:id" element={<ConditionPage />} />
                        <Route path="/anatomy" element={<AnatomyPage />} />
                        <Route path="/lab" element={<LabPage />} />
                        <Route path="/evidence" element={<EvidencePage />} />
                        <Route path="/methods" element={<MethodsPage />} />
                        <Route path="/funding" element={<FundingPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
            </AuthProvider>
            </LangProvider>
        </ErrorBoundary>
    );
}

export default App;
