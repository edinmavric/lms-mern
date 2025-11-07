import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-lg',
        'border border-input bg-background text-foreground',
        'transition-all duration-200',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
