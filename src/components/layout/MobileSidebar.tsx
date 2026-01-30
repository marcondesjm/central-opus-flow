import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { LovableAccount } from '@/hooks/useProjects';
import { useState } from 'react';

interface MobileSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  selectedAccount: string | null;
  onAccountChange: (accountId: string | null) => void;
  accounts: LovableAccount[];
  isLoading?: boolean;
  onAddAccount?: () => void;
  onEditAccount?: (account: LovableAccount) => void;
  onOpenSettings?: () => void;
  onOpenKeys?: () => void;
}

export function MobileSidebar(props: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  const handleViewChange = (view: string) => {
    props.onViewChange(view);
    setOpen(false);
  };

  const handleAccountChange = (accountId: string | null) => {
    props.onAccountChange(accountId);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <Sidebar
          {...props}
          onViewChange={handleViewChange}
          onAccountChange={handleAccountChange}
        />
      </SheetContent>
    </Sheet>
  );
}
