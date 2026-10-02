type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-black text-white',
  success: 'bg-success text-white',
  error: 'bg-error text-white',
  warning: 'bg-warning text-white',
  outline: 'bg-transparent text-black border border-black',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const classes = [
    'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}
