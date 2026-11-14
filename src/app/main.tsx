import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import { App } from '@/app/App';
import { verifySupabaseConnection } from '@/services/supabase/client';
import '@/styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Không tìm thấy phần tử #root trong index.html');
}

void verifySupabaseConnection();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
