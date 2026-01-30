import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DeadlinePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default';
}

export function DeadlinePicker({ 
  value, 
  onChange, 
  disabled = false,
  className,
  size = 'default'
}: DeadlinePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange(date || null);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const isOverdue = value && new Date(value) < new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled}
          className={cn(
            "justify-start text-left font-normal",
            !value && "text-muted-foreground",
            isOverdue && "border-destructive/50 text-destructive",
            size === 'sm' && "h-8 text-xs px-2",
            className
          )}
        >
          <CalendarIcon className={cn("mr-2", size === 'sm' ? "h-3 w-3" : "h-4 w-4")} />
          {value ? (
            <span className="flex items-center gap-1">
              {format(new Date(value), "dd/MM/yyyy", { locale: ptBR })}
              <X 
                className={cn(
                  "hover:text-destructive cursor-pointer",
                  size === 'sm' ? "h-3 w-3 ml-1" : "h-3.5 w-3.5 ml-2"
                )}
                onClick={handleClear}
              />
            </span>
          ) : (
            <span>Definir prazo</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
