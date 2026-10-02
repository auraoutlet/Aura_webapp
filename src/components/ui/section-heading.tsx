interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';

  return (
    <div className={`mb-10 md:mb-14 ${alignClass} ${className}`}>
      <h2 className="text-3xl font-extrabold uppercase tracking-tight text-black md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-gray md:text-lg font-medium">{subtitle}</p>
      )}
    </div>
  );
}
