import { RouterProvider } from 'react-router';
import { createAppRouter } from '@/app/router';
import { CustomCursorFollower } from '@/components/layout/CustomCursorFollower';
import { IslandProvider } from '@/context/IslandContext';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

const router = createAppRouter();

export function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)]">
      <MotionProvider>
        <TooltipProvider>
          <IslandProvider>
            <CustomCursorFollower />
            <RouterProvider router={router} />
          </IslandProvider>
        </TooltipProvider>
      </MotionProvider>
    </div>
  );
}

export default App;
