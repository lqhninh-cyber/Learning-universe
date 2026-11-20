import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';

const RAIL_COLLAPSED_STORAGE_KEY = 'lu_rail_collapsed';

export interface LayoutContextValue {
  readonly isRailCollapsed: boolean;
  readonly toggleRail: () => void;
  readonly setRailCollapsed: (collapsed: boolean) => void;
  readonly isMobileMenuOpen: boolean;
  readonly setMobileMenuOpen: (open: boolean) => void;
  readonly toggleMobileMenu: () => void;
  readonly isCommandOpen: boolean;
  readonly setCommandOpen: (open: boolean) => void;
  readonly openCommandPalette: () => void;
  readonly closeCommandPalette: () => void;
  readonly topBarRightSlot: ReactNode;
  readonly setTopBarRightSlot: (slot: ReactNode) => void;
}

const DEFAULT_LAYOUT_CONTEXT: LayoutContextValue = {
  isRailCollapsed: false,
  toggleRail: () => {},
  setRailCollapsed: () => {},
  isMobileMenuOpen: false,
  setMobileMenuOpen: () => {},
  toggleMobileMenu: () => {},
  isCommandOpen: false,
  setCommandOpen: () => {},
  openCommandPalette: () => {},
  closeCommandPalette: () => {},
  topBarRightSlot: null,
  setTopBarRightSlot: () => {},
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function readInitialRailCollapsed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const saved = window.localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY);
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch {
    // Bỏ qua lỗi lưu trữ cục bộ
  }
  const w = window.innerWidth;
  if (w >= 768 && w < 1280) {
    return true;
  }
  return false;
}

export interface LayoutProviderProps {
  readonly children: ReactNode;
  readonly initialRailCollapsed?: boolean;
}

const LayoutInternalProvider: FC<LayoutProviderProps> = ({ children, initialRailCollapsed }) => {
  const [isRailCollapsed, setIsRailCollapsedState] = useState<boolean>(() =>
    initialRailCollapsed !== undefined ? initialRailCollapsed : readInitialRailCollapsed(),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [topBarRightSlot, setTopBarRightSlot] = useState<ReactNode>(null);

  const isCommandOpenRef = useRef(isCommandOpen);
  useEffect(() => {
    isCommandOpenRef.current = isCommandOpen;
  }, [isCommandOpen]);

  const setRailCollapsed = useCallback((collapsed: boolean) => {
    setIsRailCollapsedState(collapsed);
    try {
      window.localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      // Bỏ qua lỗi lưu trữ cục bộ
    }
  }, []);

  const toggleRail = useCallback(() => {
    setIsRailCollapsedState((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(RAIL_COLLAPSED_STORAGE_KEY, String(next));
      } catch {
        // Bỏ qua lỗi lưu trữ cục bộ
      }
      return next;
    });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const openCommandPalette = useCallback(() => {
    setIsCommandOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setIsCommandOpen(false);
  }, []);

  // Phím tắt toàn cục OS: Cmd/Ctrl + K mở/đóng Command Palette; phím `[` thu gọn/mở rộng Rail trái
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const editable = isEditableTarget(event.target) || isEditableTarget(document.activeElement);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        if (editable && !isCommandOpenRef.current) {
          return;
        }
        event.preventDefault();
        setIsCommandOpen((prev) => !prev);
        return;
      }

      if (
        event.key === '[' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !editable &&
        !isCommandOpenRef.current
      ) {
        event.preventDefault();
        toggleRail();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleRail]);

  const value = useMemo<LayoutContextValue>(
    () => ({
      isRailCollapsed,
      toggleRail,
      setRailCollapsed,
      isMobileMenuOpen,
      setMobileMenuOpen: setIsMobileMenuOpen,
      toggleMobileMenu,
      isCommandOpen,
      setCommandOpen: setIsCommandOpen,
      openCommandPalette,
      closeCommandPalette,
      topBarRightSlot,
      setTopBarRightSlot,
    }),
    [
      isRailCollapsed,
      toggleRail,
      setRailCollapsed,
      isMobileMenuOpen,
      toggleMobileMenu,
      isCommandOpen,
      openCommandPalette,
      closeCommandPalette,
      topBarRightSlot,
    ],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export const LayoutProvider: FC<LayoutProviderProps> = ({ children, ...props }) => {
  const existing = useContext(LayoutContext);
  if (existing) {
    return <>{children}</>;
  }
  return <LayoutInternalProvider {...props}>{children}</LayoutInternalProvider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  return ctx ?? DEFAULT_LAYOUT_CONTEXT;
}

export default LayoutProvider;
