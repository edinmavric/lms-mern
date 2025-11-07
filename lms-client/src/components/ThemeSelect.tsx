import { useTheme } from '../contexts/ThemeContext';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { cn } from '../lib/utils';

const themes = [
  { value: 'light' as const, label: 'Light', icon: '☀️' },
  { value: 'dark' as const, label: 'Dark', icon: '🌙' },
  { value: 'system' as const, label: 'System', icon: '💻' },
];

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const currentTheme = themes.find(t => t.value === theme) || themes[2];

  return (
    <Listbox value={theme} onChange={setTheme}>
      <div className="relative">
        <Listbox.Button
          className={cn(
            'relative w-full cursor-pointer rounded-lg border border-input',
            'bg-background py-2 pl-3 pr-10 text-left text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'transition-all duration-fast'
          )}
        >
          <span className="flex items-center gap-2">
            <span>{currentTheme.icon}</span>
            <span className="block truncate text-foreground">
              {currentTheme.label}
            </span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={cn(
              'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg',
              'border border-border bg-card py-1 text-sm shadow-lg',
              'focus:outline-none'
            )}
          >
            {themes.map(themeOption => (
              <Listbox.Option
                key={themeOption.value}
                value={themeOption.value}
                className={({ active }) =>
                  cn(
                    'relative cursor-pointer select-none py-2 pl-3 pr-4',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-card-foreground'
                  )
                }
              >
                {({ selected }) => (
                  <div className="flex items-center gap-2">
                    <span>{themeOption.icon}</span>
                    <span
                      className={cn(
                        'block truncate',
                        selected ? 'font-medium' : 'font-normal'
                      )}
                    >
                      {themeOption.label}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
