import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Emil Kowalski craft rules:
    // 1. Instant feedback on :active (scale(0.97))
    // 2. Specific transitions: transform 160ms var(--ease-out), background 120ms
    // 3. Touch action manipulation, user-select none
    const baseClasses =
      'inline-flex items-center justify-center font-medium select-none cursor-pointer ' +
      'transition-[transform,background-color,border-color,color] duration-150 ' +
      'active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ' +
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D5BFF]';

    const sizeClasses = {
      sm: 'h-8 px-3 text-[13px] rounded-md gap-1.5',
      md: 'h-9 px-4 text-[13px] rounded-lg gap-2',
      lg: 'h-11 px-5 text-[15px] rounded-lg gap-2.5',
    }[size];

    const variantClasses = {
      primary:
        'bg-[#2D5BFF] hover:bg-[#1B48E8] text-white border border-[#2D5BFF]',
      secondary:
        'bg-[#F8F9FB] hover:bg-[#E5E7EB] text-[#1E1E2A] border border-[#E5E7EB]',
      outline:
        'bg-transparent hover:bg-[#F8F9FB] text-[#1E1E2A] border border-[#D1D5DB]',
      danger:
        'bg-[#EF4444] hover:bg-[#DC2626] text-white border border-[#EF4444]',
      ghost:
        'bg-transparent hover:bg-[#F8F9FB] text-[#6B7280] hover:text-[#1E1E2A] border border-transparent',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Processing</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
