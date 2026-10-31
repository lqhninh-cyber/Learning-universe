import type { ReactNode } from 'react';
import { SourceAttributionBadge } from './TheoryBlock';

export interface FigureProps {
  readonly id?: string;
  readonly caption?: string;
  readonly source?: string;
  readonly page?: string;
  readonly children: ReactNode;
}

export function Figure({ id, caption, source, page, children }: FigureProps) {
  return (
    <figure
      id={id}
      className="my-6 overflow-x-auto rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs"
    >
      <div className="flex justify-center">{children}</div>
      {(caption || source || page) && (
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-600">
          {caption && <span>{caption}</span>}
          <SourceAttributionBadge source={source} page={page} />
        </figcaption>
      )}
    </figure>
  );
}
