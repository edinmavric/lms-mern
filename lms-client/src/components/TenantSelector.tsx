import { useEffect, useMemo, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Check, ChevronsUpDown, Loader2, X } from 'lucide-react';

import { authApi } from '../lib/api/auth';
import type { TenantSummary } from '../types';
import { cn } from '../lib/utils';
import { Label } from './ui';

interface TenantSelectorProps {
  label?: string;
  value: TenantSummary | null;
  onChange: (tenant: TenantSummary | null) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

export function TenantSelector({
  label,
  value,
  onChange,
  required,
  error,
  placeholder = 'Search for your organization',
  helperText,
  disabled,
}: TenantSelectorProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => {
      window.clearTimeout(handler);
    };
  }, [query]);

  const isSearchEnabled = debouncedQuery.trim().length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ['tenant-search', debouncedQuery],
    queryFn: () => authApi.searchTenants(debouncedQuery.trim()),
    enabled: isSearchEnabled,
    staleTime: 60 * 1000,
  });

  const options = useMemo(() => data ?? [], [data]);

  // Show options when searching (query length >= 2) and we have results or no error
  // The dropdown will close automatically when a selection is made because we clear the query
  const showOptions = isSearchEnabled && (options.length > 0 || !error);

  const handleSelect = (tenant: TenantSummary | null) => {
    onChange(tenant);
    // Clear the search query immediately to close the dropdown
    // The displayValue will show the selected tenant's name
    setQuery('');
  };

  return (
    <div className="space-y-2">
      {label && <Label required={required}>{label}</Label>}

      <Combobox
        value={value}
        onChange={handleSelect}
        nullable
        disabled={disabled}
      >
        <div className="relative">
          <Combobox.Input
            className={cn(
              'flex h-11 w-full rounded-lg border border-input bg-background text-sm text-foreground',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200 pl-10 pr-10',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            displayValue={(tenant: TenantSummary | null) => {
              return query || tenant?.name || '';
            }}
            onChange={event => setQuery(event.target.value)}
            placeholder={placeholder}
          />

          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Building2 className="h-5 w-5" />
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <Combobox.Button className="text-muted-foreground">
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronsUpDown className="h-4 w-4" />
              )}
            </Combobox.Button>
          </div>

          {showOptions && (
            <Transition
              show={showOptions}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card text-card-foreground shadow-lg focus:outline-none">
                {options.length === 0 && !isFetching ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No organizations match "{debouncedQuery}".
                  </div>
                ) : (
                  options.map(tenant => (
                    <Combobox.Option
                      key={tenant.id}
                      value={tenant}
                      className={({ active }) =>
                        cn(
                          'flex cursor-pointer items-start gap-3 px-4 py-3 text-sm',
                          active && 'bg-accent text-accent-foreground'
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tenant.domain ?? 'Domain not provided'}
                            </p>
                            {tenant.contactEmail && (
                              <p className="text-xs text-muted-foreground">
                                {tenant.contactEmail}
                              </p>
                            )}
                          </div>
                          {selected && <Check className="h-4 w-4" />}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          )}
        </div>
      </Combobox>

      {!isSearchEnabled && query.trim().length > 0 && (
        <p className="text-sm text-muted-foreground">
          Enter at least two characters to search.
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
