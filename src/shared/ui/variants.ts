import { tv } from 'tailwind-variants';

export const buttonVariants = tv({
  base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-subject-600 dark:focus-visible:outline-[var(--accent-os)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  variants: {
    variant: {
      primary:
        'bg-stone-900 text-stone-50 hover:bg-stone-800 active:bg-stone-950 dark:bg-[#E7ECEA] dark:text-[#0D1110] dark:hover:bg-white dark:active:bg-[#D5DFDB]',
      subject:
        'bg-subject-600 text-white hover:bg-subject-700 active:bg-subject-800 dark:bg-[var(--accent-os)] dark:text-[#0D1110] dark:hover:opacity-90',
      secondary:
        'bg-stone-100 text-stone-800 hover:bg-stone-200/80 active:bg-stone-200 border border-stone-200/80 dark:bg-[var(--bg-surface)] dark:text-[var(--text-main)] dark:border-[var(--border-hairline)] dark:hover:bg-[var(--bg-shell)]',
      outline:
        'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-400 dark:border-[var(--border-hairline)] dark:bg-[var(--bg-surface)] dark:text-[var(--text-main)] dark:hover:bg-[var(--bg-shell)] dark:hover:border-[var(--accent-os)]/50',
      subjectOutline:
        'border border-subject-200 bg-subject-50/50 text-subject-700 hover:bg-subject-100/70 hover:border-subject-300 dark:border-[var(--accent-os)]/40 dark:bg-[var(--accent-os)]/15 dark:text-[var(--text-main)] dark:hover:bg-[var(--accent-os)]/25',
      ghost:
        'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-[var(--text-secondary)] dark:hover:bg-[var(--bg-surface)] dark:hover:text-[var(--text-main)]',
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-11 px-5 text-sm',
      icon: 'h-9 w-9 p-0',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export const badgeVariants = tv({
  base: 'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
  variants: {
    variant: {
      neutral:
        'bg-stone-100 text-stone-700 border border-stone-200/80 dark:bg-[var(--bg-surface)] dark:text-[var(--text-secondary)] dark:border-[var(--border-hairline)]',
      subject:
        'bg-subject-50 text-subject-700 border border-subject-200/80 dark:bg-[var(--accent-os)]/15 dark:text-[var(--text-main)] dark:border-[var(--accent-os)]/35',
      subjectSolid: 'bg-subject-600 text-white dark:bg-[var(--accent-os)] dark:text-[#0D1110]',
      draft:
        'bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
      review:
        'bg-sky-50 text-sky-800 border border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60',
      approved:
        'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
      published: 'bg-stone-900 text-stone-50 dark:bg-[#E7ECEA] dark:text-[#0D1110]',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export const containerVariants = tv({
  base: 'mx-auto w-full px-4 sm:px-6 lg:px-8',
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      wide: 'max-w-[1680px]',
      reader: 'max-w-[1680px]',
      prose: 'max-w-[70ch]',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});
