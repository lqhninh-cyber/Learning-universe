import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './content/**/*.{md,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-page': 'var(--bg-page)',
        'bg-surface': 'var(--bg-surface)',
        'bg-sunken': 'var(--bg-sunken)',
        'border-subtle': 'var(--border-subtle)',
        'border-control': 'var(--border-control)',

        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',

        'gold-badge': 'var(--gold-badge)',
        'gold-line': 'var(--gold-line)',
        'gold-text': 'var(--gold-text)',

        'indigo-link': 'var(--indigo-link)',

        'cinnabar-text': 'var(--cinnabar-text)',
        'cinnabar-bg': 'var(--cinnabar-bg)',
      },
      boxShadow: {
        editorial: 'var(--shadow-editorial)',
      },
    },
  },
};

export default config;
