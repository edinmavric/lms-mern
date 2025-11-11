import { useMemo, useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  value: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  searchPlaceholder?: string;
  maxHeight?: number;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  searchPlaceholder = 'Search...',
  maxHeight = 240,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const selectedLabels = useMemo(() => {
    const map = new Map(options.map(o => [o.value, o.label]));
    return value.map(v => map.get(v) || v);
  }, [value, options]);

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">
          {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <div className="p-2 border-b border-border">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>
          <div
            className="overflow-auto"
            style={{ maxHeight }}
            role="listbox"
            aria-multiselectable="true"
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No results
              </div>
            ) : (
              filtered.map(opt => {
                const active = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50',
                      active && 'bg-muted/50'
                    )}
                    onClick={() => toggle(opt.value)}
                    role="option"
                    aria-selected={active}
                  >
                    <span
                      className={cn(
                        'inline-flex h-4 w-4 items-center justify-center rounded-sm border border-border',
                        active &&
                          'bg-primary text-primary-foreground border-primary'
                      )}
                    >
                      {active && <Check className="h-3 w-3" />}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className="p-2 border-t border-border flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onChange([])}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
