import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { FloatingNavbar } from './FloatingNavbar';
import { PreviewControlBar } from './PreviewControlBar';
import { PreviewCourseDashboardView } from './PreviewCourseDashboardView';
import { PreviewHomepageView } from './PreviewHomepageView';
import {
  type PreviewCourseSlug,
  type PreviewView,
  type VisualDirection,
  VISUAL_DIRECTIONS,
} from './types';

export function UiPreviewPage() {
  const [visualDirection, setVisualDirection] = useState<VisualDirection>('atelier');
  const [activeView, setActiveView] = useState<PreviewView>('homepage');
  const [activeCourseSlug, setActiveCourseSlug] =
    useState<PreviewCourseSlug>('giai-tich-ham-mot-bien');
  const [isControlBarCollapsed, setIsControlBarCollapsed] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);

  const currentMeta = VISUAL_DIRECTIONS[visualDirection];

  const handleNavigateToCourse = (slug: string) => {
    if (slug === 'giao-duc-hoc') {
      setActiveCourseSlug('giao-duc-hoc');
    } else {
      setActiveCourseSlug('giai-tich-ham-mot-bien');
    }
    setActiveView('course');
    window.scrollTo({ top: 0, behavior: motionEnabled ? 'smooth' : 'instant' });
  };

  return (
    <div
      data-visual-direction={visualDirection}
      data-motion-enabled={motionEnabled}
      className={cn(
        'relative min-h-screen text-stone-900 transition-colors duration-500',
        visualDirection === 'atelier' && 'bg-[#f4f1ea]',
        visualDirection === 'spatial' &&
          'bg-gradient-to-br from-[#f8f6f0] via-[#f1eee6] to-[#eae5da]',
        visualDirection === 'editorial' && 'bg-[#f8f5ee]',
        !motionEnabled && 'motion-reduce',
      )}
    >
      {/* 1. FLOATING NAVIGATION BAR WITH DUAL-SPATIAL MEGA MENU */}
      <FloatingNavbar direction={visualDirection} onSelectCourse={handleNavigateToCourse} />

      {/* 2. MAIN PROTOTYPE VIEW */}
      <main className="w-full">
        {activeView === 'homepage' ? (
          <PreviewHomepageView
            direction={visualDirection}
            onNavigateToCourse={handleNavigateToCourse}
            motionEnabled={motionEnabled}
          />
        ) : (
          <PreviewCourseDashboardView
            direction={visualDirection}
            courseSlug={activeCourseSlug}
            onCourseSlugChange={setActiveCourseSlug}
            motionEnabled={motionEnabled}
          />
        )}
      </main>

      {/* 3. PROTOTYPE FOOTER */}
      <footer className="border-t border-stone-300/80 bg-white/60 py-12 text-center text-xs text-stone-500 backdrop-blur-sm">
        <div className="mx-auto max-w-[1360px] space-y-3 px-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-stone-200/80 px-2.5 py-0.5 text-[11px] font-bold text-stone-800">
              LEARNING UNIVERSE V2 PROTOTYPE
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
              {currentMeta.name}
            </span>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
              Độc lập 100% · Không ảnh hưởng route chính thức
            </span>
          </div>
          <p className="mx-auto max-w-xl text-stone-600">{currentMeta.description}</p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-semibold text-amber-900 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại trang chủ chính thức (Production)</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* 4. PREVIEW CONTROL BAR (GÓC DƯỚI MÀN HÌNH) */}
      <PreviewControlBar
        direction={visualDirection}
        onDirectionChange={setVisualDirection}
        view={activeView}
        onViewChange={setActiveView}
        courseSlug={activeCourseSlug}
        onCourseSlugChange={setActiveCourseSlug}
        isCollapsed={isControlBarCollapsed}
        onToggleCollapse={() => setIsControlBarCollapsed((prev) => !prev)}
        motionEnabled={motionEnabled}
        onToggleMotion={() => setMotionEnabled((prev) => !prev)}
      />
    </div>
  );
}

export default UiPreviewPage;
