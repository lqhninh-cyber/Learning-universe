import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { SubjectThemeContext, type SubjectThemeId } from '@/shared/theme/subject-themes';

export interface SubjectThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  readonly subject: SubjectThemeId;
  readonly children: ReactNode;
}

export function SubjectThemeProvider({
  subject,
  className,
  children,
  ...rest
}: SubjectThemeProviderProps) {
  return (
    <SubjectThemeContext.Provider value={subject}>
      <div data-subject={subject} className={cn(className)} {...rest}>
        {children}
      </div>
    </SubjectThemeContext.Provider>
  );
}
