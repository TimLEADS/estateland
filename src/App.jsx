import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout, HomePage } from "../EstateLand.jsx";
import { DashboardProvider } from "./context/DashboardContext.jsx";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import AgentGuide from "./pages/AgentGuide";
import MarketReports from "./pages/MarketReports";
import Referral from "./pages/Referral";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import RealtorInfo from "./pages/RealtorInfo";
import Onboarding from "./pages/Onboarding";
import DashboardLayout from "./dashboard/DashboardLayout.jsx";
import DashboardLogin from "./dashboard/DashboardLogin.jsx";
import AdminOverview from "./dashboard/AdminOverview.jsx";
import OnboardingLive from "./dashboard/OnboardingLive.jsx";
import Users from "./dashboard/Users.jsx";
import Leads from "./dashboard/Leads.jsx";
import UserDashboard from "./dashboard/UserDashboard.jsx";
import Payments from "./dashboard/Payments.jsx";
import AllRelators from "./dashboard/AllRelators.jsx";
import Chat from "./dashboard/Chat.jsx";
import EmailCenter from "./dashboard/EmailCenter.jsx";
import WebsiteChatbot from "./components/WebsiteChatbot.jsx";

// Section IDs that map to homepage sections
const SECTION_IDS = ["about", "services", "process", "results", "reviews", "plans", "faq", "contact"];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // If navigating to a section route, scroll to that section
    const sectionId = pathname.slice(1); // remove leading /
    if (SECTION_IDS.includes(sectionId)) {
      const el = document.getElementById(sectionId);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          {/* Section routes — render full homepage and scroll to section */}
          <Route path="/about" element={<Layout><HomePage /></Layout>} />
          <Route path="/services" element={<Layout><HomePage /></Layout>} />
          <Route path="/process" element={<Layout><HomePage /></Layout>} />
          <Route path="/results" element={<Layout><HomePage /></Layout>} />
          <Route path="/reviews" element={<Layout><HomePage /></Layout>} />
          <Route path="/plans" element={<Layout><HomePage /></Layout>} />
          <Route path="/faq" element={<Layout><HomePage /></Layout>} />
          <Route path="/contact" element={<Layout><HomePage /></Layout>} />
          <Route path="/pricing" element={<Layout><HomePage /></Layout>} />
          <Route path="/get-started" element={<Layout><Onboarding /></Layout>} />
          <Route path="/careers" element={<Layout><Careers /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/agent-guide" element={<Layout><AgentGuide /></Layout>} />
          <Route path="/referral" element={<Layout><Referral /></Layout>} />
          <Route path="/info" element={<Layout><RealtorInfo /></Layout>} />
          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
          <Route path="/terms" element={<Layout><Terms /></Layout>} />
          <Route path="/cookies" element={<Layout><Cookies /></Layout>} />
          <Route path="/dashboard/login" element={<DashboardLogin />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="live" element={<OnboardingLive />} />
            <Route path="payments" element={<Payments />} />
            <Route path="relators" element={<AllRelators />} />
            <Route path="users" element={<Users />} />
            <Route path="leads" element={<Leads />} />
            <Route path="email" element={<EmailCenter />} />
            <Route path="chat" element={<Chat />} />
            <Route path="me" element={<UserDashboard />} />
          </Route>
        </Routes>
        <WebsiteChatbot />
      </DashboardProvider>
    </BrowserRouter>
  );
}
