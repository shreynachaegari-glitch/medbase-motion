import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import LearnPage from "@/pages/LearnPage";
import ConditionPage from "@/pages/ConditionPage";
import LabPage from "@/pages/LabPage";
import EvidencePage from "@/pages/EvidencePage";
import MethodsPage from "@/pages/MethodsPage";
import FundingPage from "@/pages/FundingPage";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/learn" element={<LearnPage />} />
                    <Route path="/learn/:id" element={<ConditionPage />} />
                    <Route path="/lab" element={<LabPage />} />
                    <Route path="/evidence" element={<EvidencePage />} />
                    <Route path="/methods" element={<MethodsPage />} />
                    <Route path="/funding" element={<FundingPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    );
}

export default App;
