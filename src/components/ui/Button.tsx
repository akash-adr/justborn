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
        'bg-[#D9232E] text-white hover:bg-[#BF1620] active:bg-[#9E1019] shadow-md shadow-[#D9232E]/25 hover:shadow-lg hover:shadow-[#D9232E]/35 focus-visible:ring-[#D9232E]',
      secondary:
        'bg-[#111827] text-white hover:bg-stone-800 active:bg-stone-900 shadow-sm focus-visible:ring-stone-900',
      outline:
        'border-2 border-stone-200 bg-white text-stone-800 hover:border-red-200 hover:bg-red-50/40 hover:text-[#D9232E] focus-visible:ring-red-400',
      ghost:
        'bg-transparent text-stone-700 hover:bg-stone-100/80 active:bg-stone-200/70 focus-visible:ring-stone-300',
      soft:
        'bg-red-50 text-[#D9232E] hover:bg-red-100 active:bg-red-200 focus-visible:ring-red-400',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm focus-visible:ring-rose-500',
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
