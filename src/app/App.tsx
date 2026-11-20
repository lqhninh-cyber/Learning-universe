import { RouterProvider } from 'react-router';
import { createAppRouter } from '@/app/router';
import { IslandProvider } from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

const router = createAppRouter();

export function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-workspace)] text-[var(--text-main)]">
      <MotionProvider>
        <TooltipProvider>
          <LayoutProvider>
            <IslandProvider>
              <RouterProvider router={router} />
            </IslandProvider>
          </LayoutProvider>
        </TooltipProvider>
      </MotionProvider>
    </div>
  );
}

export default App;
