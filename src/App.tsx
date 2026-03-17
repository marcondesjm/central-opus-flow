import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// PWAInstallPrompt removed from main screen - now in Header dropdown menu
import { DataProtectionBanner } from "@/components/privacy/DataProtectionBanner";
import { ServiceWorkerUpdatePrompt } from "@/components/pwa/ServiceWorkerUpdatePrompt";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Demo from "./pages/Demo";
import Pricing from "./pages/Pricing";
import Collaborations from "./pages/Collaborations";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import Kanban from "./pages/Kanban";
import Billing from "./pages/Billing";
import Proposals from "./pages/Proposals";
import ProposalPublic from "./pages/ProposalPublic";
import Teams from "./pages/Teams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

    // Limpar console periodicamente
    const consoleClearInterval = setInterval(() => {
      console.clear();
    }, 3000);

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
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/proposal/:token" element={<ProposalPublic />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
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
