import { AppNavBar } from '@/components/layout/AppNavBar';
import { AppFooter } from '@/components/layout/AppFooter';
import { FileManager } from '@/components/files/FileManager';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { FolderOpen } from 'lucide-react';

export default function Files() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Arquivos</h1>
              <p className="text-sm text-muted-foreground">Gerencie imagens, vídeos e documentos da sua conta</p>
            </div>
          </div>
        </div>

        <FileManager />
      </main>
      <AppFooter />
      <MobileBottomNav activeView="files" onViewChange={() => {}} onNewProject={() => {}} />
    </div>
  );
}
