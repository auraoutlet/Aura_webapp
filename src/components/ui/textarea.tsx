import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const textareaClasses = [
      'w-full px-4 py-3 text-sm bg-white text-black',
      'border transition-colors duration-200 resize-vertical min-h-[100px]',
      'placeholder:text-gray',
      'focus:outline-none focus:border-black focus:ring-1 focus:ring-black',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-off-white',
      error ? 'border-error' : 'border-border',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-black"
          >
            {label}
          </label>
        )}
        <textarea ref={ref} id={textareaId} className={textareaClasses} {...props} />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
