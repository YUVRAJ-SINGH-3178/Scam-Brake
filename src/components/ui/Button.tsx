import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'teal';
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
    // Restrained financial infrastructure controls
    // Active click scale 0.97, exact spring curve, 6px radius
    const baseClasses =
      'inline-flex items-center justify-center font-medium select-none cursor-pointer ' +
      'transition-[transform,background-color,border-color,color] duration-150 ' +
      'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ' +
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171A1F]';

    const sizeClasses = {
      sm: 'h-8 px-3 text-[12px] rounded-[6px] gap-1.5',
      md: 'h-9 px-3.5 text-[13px] rounded-[6px] gap-2',
      lg: 'h-10 px-4 text-[14px] rounded-[6px] gap-2',
    }[size];

    const variantClasses = {
      primary:
        'bg-[#171A1F] hover:bg-[#2B303A] text-white border border-[#171A1F]',
      secondary:
        'bg-[#FFFFFF] hover:bg-[#F6F6F3] text-[#171A1F] border border-[#DFE2DF]',
      outline:
        'bg-[#FFFFFF] hover:bg-[#F6F6F3] text-[#171A1F] border border-[#DFE2DF]',
      teal:
        'bg-[#1A7A64] hover:bg-[#135E4D] text-white border border-[#1A7A64]',
      danger:
        'bg-[#C53030] hover:bg-[#A82525] text-white border border-[#C53030]',
      ghost:
        'bg-transparent hover:bg-[#F6F6F3] text-[#697078] hover:text-[#171A1F] border border-transparent',
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
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
