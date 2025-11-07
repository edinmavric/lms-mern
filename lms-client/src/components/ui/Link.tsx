import { Link as RouterLink } from 'react-router-dom';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface LinkProps extends RouterLinkProps {
  variant?: 'default' | 'primary' | 'muted';
  className?: string;
}

export function Link({ variant = 'default', className, children, ...props }: LinkProps) {
  const variants = {
    default: 'text-foreground hover:text-primary transition-colors',
    primary: 'text-primary font-medium hover:text-primary/80 transition-colors',
    muted: 'text-muted-foreground hover:text-foreground transition-colors',
  };

  return (
    <RouterLink
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </RouterLink>
  );
}
