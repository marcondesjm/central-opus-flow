import { AppLayout } from '@/components/layout/AppLayout';
import { WhatsAppAutomationPage } from '@/components/whatsapp/WhatsAppAutomationPage';

export default function WhatsAppAutomations() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 lg:pb-6 max-w-5xl mx-auto">
        <WhatsAppAutomationPage />
      </div>
    </AppLayout>
  );
}
