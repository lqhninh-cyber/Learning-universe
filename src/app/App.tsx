import { RouterProvider } from 'react-router';
import { createAppRouter } from '@/app/router';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

const router = createAppRouter();

export function App() {
  return (
    <MotionProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </MotionProvider>
  );
}

export default App;
