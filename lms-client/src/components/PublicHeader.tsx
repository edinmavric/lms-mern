import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { Button, Link } from './ui';

export function PublicHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedMenuButton =
        menuButtonRef.current?.contains(target) ?? false;
      const clickedMenu = menuRef.current?.contains(target) ?? false;

      if (!clickedMenuButton && !clickedMenu && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="text-lg sm:text-xl font-semibold text-foreground hover:text-primary shrink-0"
            >
              LMS Platform
            </button>

            <nav className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
              <Link to="/login" variant="muted">
                Log in
              </Link>
              <Link to="/signup" variant="muted" className="hidden lg:inline">
                Join an organisation
              </Link>
              <Button size="sm" onClick={() => navigate('/signup/tenant')}>
                Start as organisation
              </Button>
              <ThemeToggle />
            </nav>

            <div
              className="flex items-center gap-2 md:hidden shrink-0"
              ref={menuButtonRef}
            >
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[45] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={menuRef}
            className="fixed top-[73px] right-4 left-4 z-50 md:hidden bg-card border border-border rounded-lg shadow-lg min-w-[200px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-2"
          >
            <nav className="flex flex-col p-2 gap-1">
              <Link
                to="/login"
                variant="muted"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 text-right rounded-md hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-h-[44px] flex items-center justify-end"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                variant="muted"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 text-right rounded-md hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-h-[44px] flex items-center justify-end"
              >
                Join an organisation
              </Link>
              <Button
                size="sm"
                onClick={() => {
                  navigate('/signup/tenant');
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-1 touch-manipulation min-h-[44px]"
              >
                Start as organisation
              </Button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
