import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AdmissionsPage = lazy(() => import("./pages/AdmissionsPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const LearnPage = lazy(() => import("./pages/LearnPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const NoticesPage = lazy(() => import("./pages/NoticesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const PortalPage = lazy(() => import("./pages/PortalPage"));
const StaffEntryPage = lazy(() => import("./pages/StaffEntryPage"));
const StudentMediaPage = lazy(() => import("./pages/StudentMediaPage"));

export default function App() {
  return (
    <Suspense fallback={<div className="app-loading">Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/student-media" element={<StudentMediaPage />} />
        <Route path="/admin" element={<StaffEntryPage />} />
        <Route path="/campus-connect" element={<StaffEntryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
