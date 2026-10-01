'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-[#E76F51] text-white hover:bg-[#D65A3B] active:bg-[#B84729] shadow-md shadow-[#E76F51]/20 hover:shadow-lg hover:shadow-[#E76F51]/30 focus-visible:ring-[#E76F51]',
      secondary:
        'bg-[#26221F] text-white hover:bg-stone-800 active:bg-stone-900 shadow-sm focus-visible:ring-stone-900',
      outline:
        'border-2 border-stone-200 bg-transparent text-stone-800 hover:border-stone-300 hover:bg-stone-100/60 focus-visible:ring-stone-400',
      ghost:
        'bg-transparent text-stone-700 hover:bg-stone-100/80 active:bg-stone-200/70 focus-visible:ring-stone-300',
      soft:
        'bg-[#FDF2EE] text-[#D65A3B] hover:bg-[#FCE6DF] active:bg-[#F9D6CC] focus-visible:ring-[#E76F51]/40',
      danger:
        'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm focus-visible:ring-rose-500',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'text-xs px-3.5 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-5 py-2.5 h-10 gap-2',
      lg: 'text-base px-7 py-3.5 h-12 gap-2.5',
      icon: 'h-10 w-10 p-0 rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
        whileHover={disabled || isLoading ? undefined : { scale: 1.015 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
