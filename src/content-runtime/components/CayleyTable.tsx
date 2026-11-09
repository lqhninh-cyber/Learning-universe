import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface CayleyTableProps {
  readonly group?: 'V4' | 'S3' | 'D6' | 'Z4' | 'v4' | 's3' | 'd6' | 'z4';
  readonly preset?: 'V4' | 'S3' | 'D6' | 'Z4' | 'v4' | 's3' | 'd6' | 'z4';
  readonly title?: string;
  readonly caption?: string;
  readonly operationSymbol?: string;
  readonly elements?: readonly string[];
  readonly rows?: readonly (readonly string[])[];
  readonly identity?: string;
  readonly className?: string;
}

const PRESET_V4 = {
  title: 'Bảng Cayley của nhóm bốn Klein V₄',
  operationSymbol: '\\cdot',
  elements: ['e', 'a', 'b', 'c'],
  identity: 'e',
  rows: [
    ['e', 'a', 'b', 'c'],
    ['a', 'e', 'c', 'b'],
    ['b', 'c', 'e', 'a'],
    ['c', 'b', 'a', 'e'],
  ],
};

const PRESET_Z4 = {
  title: 'Bảng Cayley của nhóm cyclic ℤ/4ℤ',
  operationSymbol: '+',
  elements: ['[0]', '[1]', '[2]', '[3]'],
  identity: '[0]',
  rows: [
    ['[0]', '[1]', '[2]', '[3]'],
    ['[1]', '[2]', '[3]', '[0]'],
    ['[2]', '[3]', '[0]', '[1]'],
    ['[3]', '[0]', '[1]', '[2]'],
  ],
};

const PRESET_S3 = {
  title: 'Bảng Cayley của nhóm đối xứng S₃ (cấp 6)',
  operationSymbol: '\\circ',
  elements: ['e', '(1\\;2)', '(1\\;3)', '(2\\;3)', '(1\\;2\\;3)', '(1\\;3\\;2)'],
  identity: 'e',
  rows: [
    ['e', '(1\\;2)', '(1\\;3)', '(2\\;3)', '(1\\;2\\;3)', '(1\\;3\\;2)'],
    ['(1\\;2)', 'e', '(1\\;3\\;2)', '(1\\;2\\;3)', '(2\\;3)', '(1\\;3)'],
    ['(1\\;3)', '(1\\;2\\;3)', 'e', '(1\\;3\\;2)', '(1\\;2)', '(2\\;3)'],
    ['(2\\;3)', '(1\\;3\\;2)', '(1\\;2\\;3)', 'e', '(1\\;3)', '(1\\;2)'],
    ['(1\\;2\\;3)', '(1\\;3)', '(2\\;3)', '(1\\;2)', '(1\\;3\\;2)', 'e'],
    ['(1\\;3\\;2)', '(2\\;3)', '(1\\;2)', '(1\\;3)', 'e', '(1\\;2\\;3)'],
  ],
};

const PRESET_D6 = {
  title: 'Bảng Cayley của nhóm nhị diện D₆ (tam giác đều)',
  operationSymbol: '\\cdot',
  elements: ['e', 'r', 'r^2', 's', 'sr', 'sr^2'],
  identity: 'e',
  rows: [
    ['e', 'r', 'r^2', 's', 'sr', 'sr^2'],
    ['r', 'r^2', 'e', 'sr^2', 's', 'sr'],
    ['r^2', 'e', 'r', 'sr', 'sr^2', 's'],
    ['s', 'sr', 'sr^2', 'e', 'r', 'r^2'],
    ['sr', 'sr^2', 's', 'r^2', 'e', 'r'],
    ['sr^2', 's', 'sr', 'r', 'r^2', 'e'],
  ],
};

const PRESETS: Record<string, typeof PRESET_V4> = {
  V4: PRESET_V4,
  Z4: PRESET_Z4,
  S3: PRESET_S3,
  D6: PRESET_D6,
};

export function CayleyTable({
  group,
  preset,
  title,
  caption,
  operationSymbol,
  elements,
  rows,
  identity,
  className,
}: CayleyTableProps) {
  const key = (group ?? preset)?.toUpperCase();
  const presetData = key ? PRESETS[key] : undefined;
  const activeTitle = title ?? caption ?? presetData?.title;
  const op = operationSymbol ?? presetData?.operationSymbol ?? '\\cdot';
  const activeElements = elements ?? presetData?.elements ?? [];
  const activeRows = rows ?? presetData?.rows ?? [];
  const idEl = identity ?? presetData?.identity ?? 'e';

  return (
    <div
      data-testid="cayley-table"
      className={cn(
        'my-6 overflow-x-auto rounded-xl border border-stone-200/90 bg-white/70 p-4 shadow-sm dark:border dark:border-[#1D3629] dark:bg-[#0B1712]',
        className,
      )}
    >
      {activeTitle && (
        <div className="mb-3 text-center">
          <span className="font-serif text-sm font-bold text-stone-900 dark:text-[#F5F2EB]">
            {activeTitle}
          </span>
        </div>
      )}
      <table className="w-full border-collapse text-center text-[15px] text-stone-800 dark:text-[#E8F1EC]">
        <thead>
          <tr>
            <th className="border border-stone-200/80 bg-stone-100/80 px-4 py-2.5 text-center font-serif font-bold text-stone-900 dark:border-[#1F3D2E] dark:bg-[#12241C] dark:text-[#C5A262]">
              <KatexMath math={op} />
            </th>
            {activeElements.map((el, idx) => (
              <th
                key={idx}
                className="border border-stone-200/80 bg-stone-100/80 px-4 py-2.5 text-center font-serif font-bold text-stone-900 dark:border-[#1F3D2E] dark:bg-[#12241C] dark:text-[#C5A262]"
              >
                <KatexMath math={el} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeRows.map((row, rIdx) => {
            const rowHeader = activeElements[rIdx] ?? String(rIdx);
            return (
              <tr
                key={rIdx}
                className="transition-colors hover:bg-stone-50/60 dark:border-b dark:border-[#152B20] hover:dark:bg-[#102219]"
              >
                <th className="border border-stone-200/80 bg-stone-100/80 px-4 py-2.5 text-center font-serif font-bold text-stone-900 dark:border-[#1F3D2E] dark:bg-[#12241C] dark:text-[#C5A262]">
                  <KatexMath math={rowHeader} />
                </th>
                {row.map((cell, cIdx) => {
                  const isIdentity = cell === idEl || cell === 'e' || cell === '[0]';
                  return (
                    <td
                      key={cIdx}
                      className="border border-stone-200/80 px-4 py-2.5 text-center text-[15px] leading-relaxed text-stone-800 dark:border-[#152B20] dark:text-[#E8F1EC]"
                    >
                      {isIdentity ? (
                        <span className="inline-block rounded bg-amber-100/60 px-1.5 py-0.5 font-bold text-amber-900 shadow-2xs dark:bg-[#1B3828] dark:text-[#E5C378]">
                          <KatexMath math={cell} />
                        </span>
                      ) : (
                        <KatexMath math={cell} />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
