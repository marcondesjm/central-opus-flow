import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DataProtectionBanner } from "@/components/privacy/DataProtectionBanner";
import { ServiceWorkerUpdatePrompt } from "@/components/pwa/ServiceWorkerUpdatePrompt";
import { Loader2 } from "lucide-react";

// Lazy load all pages
const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const Demo = lazy(() => import("./pages/Demo"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Collaborations = lazy(() => import("./pages/Collaborations"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));
const Kanban = lazy(() => import("./pages/Kanban"));
const Billing = lazy(() => import("./pages/Billing"));
const Proposals = lazy(() => import("./pages/Proposals"));
const ProposalPublic = lazy(() => import("./pages/ProposalPublic"));
const ProjectPublic = lazy(() => import("./pages/ProjectPublic"));
const Teams = lazy(() => import("./pages/Teams"));
const Ideas = lazy(() => import("./pages/Ideas"));
const Reports = lazy(() => import("./pages/Reports"));
const Files = lazy(() => import("./pages/Files"));
const Manual = lazy(() => import("./pages/Manual"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Scheduling = lazy(() => import("./pages/Scheduling"));
const Agenda = lazy(() => import("./pages/Agenda"));
const BookingPublic = lazy(() => import("./pages/BookingPublic"));
const Briefings = lazy(() => import("./pages/Briefings"));
const BriefingPublic = lazy(() => import("./pages/BriefingPublic"));
const Leads = lazy(() => import("./pages/Leads"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // avoid cascading refetches
      retry: 1,
    },
  },
});

// Hook para desabilitar inspeção de código
function useDisableDevTools() {
  useEffect(() => {
    // Desabilitar menu de contexto (clique direito)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Desabilitar atalhos de teclado para DevTools e cópia
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (ver código fonte)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (salvar página)
      if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+A (selecionar tudo)
      if (e.ctrlKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+C (copiar)
      if (e.ctrlKey && (e.key === 'C' || e.key === 'c')) {
        // Permitir copiar apenas em inputs e textareas
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea, [contenteditable]')) {
          e.preventDefault();
          return false;
        }
      }
      // Ctrl+P (imprimir)
      if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+I (macOS)
      if (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) {
        e.preventDefault();
        return false;
      }
      // Cmd+Option+J (macOS)
      if (e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+P (Command palette)
      if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        return false;
      }
      // PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
    };

    // Desabilitar arrastar elementos
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Desabilitar seleção de texto globalmente (exceto inputs)
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('input, textarea, [contenteditable]')) {
        e.preventDefault();
      }
    };

    // Desabilitar cópia
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('input, textarea, [contenteditable]')) {
        e.preventDefault();
      }
    };

    // Clear console less frequently (30s instead of 3s)
    const consoleClearInterval = setInterval(() => {
      console.clear();
    }, 30000);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('copy', handleCopy);
      clearInterval(consoleClearInterval);
    };
  }, []);
}

function AppContent() {
  useDisableDevTools();
  
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      <ServiceWorkerUpdatePrompt />
      <DataProtectionBanner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/proposal/:token" element={<ProposalPublic />} />
            <Route path="/p/:token" element={<ProjectPublic />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/collaborations"
              element={
                <ProtectedRoute>
                  <Collaborations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kanban"
              element={
                <ProtectedRoute>
                  <Kanban />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proposals"
              element={
                <ProtectedRoute>
                  <Proposals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teams"
              element={
                <ProtectedRoute>
                  <Teams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ideas"
              element={
                <ProtectedRoute>
                  <Ideas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/files"
              element={
                <ProtectedRoute>
                  <Files />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manual"
              element={
                <ProtectedRoute>
                  <Manual />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documentation"
              element={
                <ProtectedRoute>
                  <Documentation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scheduling"
              element={
                <ProtectedRoute>
                  <Scheduling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <ProtectedRoute>
                  <Agenda />
                </ProtectedRoute>
              }
            />
            <Route path="/agendar/:slug" element={<BookingPublic />} />
            <Route
              path="/briefings"
              element={
                <ProtectedRoute>
                  <Briefings />
                </ProtectedRoute>
              }
            />
            <Route path="/briefing/:token" element={<BriefingPublic />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="centralopusflow-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
