import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Check } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';

export default function MobileSelect({ value, onValueChange, options, title = 'Select', trigger }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleSelect = (val) => {
    onValueChange(val);
    setOpen(false);
  };

  if (!isMobile) {
    // On desktop, render inline pill buttons
    return (
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onValueChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              value === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  // On mobile, open a bottom drawer
  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger || (
          <div className="flex gap-2 flex-wrap">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  value === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 flex flex-col gap-1" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            {options.map((opt) => (
              <DrawerClose key={opt.value} asChild>
                <button
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                    value === opt.value
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {opt.icon && <opt.icon className="w-4 h-4" />}
                    {opt.label}
                  </div>
                  {value === opt.value && <Check className="w-4 h-4 text-primary" />}
                </button>
              </DrawerClose>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}