import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui';
import { ThemeToggle } from '../ThemeToggle';

export function LandingHeader() {
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">LMS++</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#security"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Security
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button onClick={() => navigate('/signup/tenant')}>Get Started</Button>
          </div>

          <div
            className="flex items-center gap-2 md:hidden"
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
            className="fixed top-[65px] right-4 left-4 z-50 md:hidden bg-card border border-border rounded-lg shadow-lg min-w-[200px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-2"
          >
            <nav className="flex flex-col p-2 gap-1">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 text-right rounded-md hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-h-[44px] flex items-center justify-end text-sm font-medium text-muted-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 text-right rounded-md hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-h-[44px] flex items-center justify-end text-sm font-medium text-muted-foreground"
              >
                How It Works
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 text-right rounded-md hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation min-h-[44px] flex items-center justify-end text-sm font-medium text-muted-foreground"
              >
                Security
              </a>
              <div className="border-t my-1" />
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-end touch-manipulation min-h-[44px]"
              >
                Log in
              </Button>
              <Button
                onClick={() => {
                  navigate('/signup/tenant');
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-1 touch-manipulation min-h-[44px]"
              >
                Get Started
              </Button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
