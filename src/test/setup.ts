import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';

configure({
  asyncUtilTimeout: 5000,
});

if (typeof globalThis.ResizeObserver === 'undefined') {
  class MockResizeObserver implements ResizeObserver {
    private readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }

    observe(target: Element): void {
      const entry = {
        target,
        contentRect: {
          x: 0,
          y: 0,
          width: 640,
          height: 360,
          top: 0,
          left: 0,
          bottom: 360,
          right: 640,
          toJSON: () => ({}),
        },
        borderBoxSize: [{ inlineSize: 640, blockSize: 360 }],
        contentBoxSize: [{ inlineSize: 640, blockSize: 360 }],
        devicePixelContentBoxSize: [{ inlineSize: 640, blockSize: 360 }],
      } satisfies ResizeObserverEntry;
      this.callback([entry], this);
    }

    unobserve(): void {}

    disconnect(): void {}
  }

  globalThis.ResizeObserver = MockResizeObserver;
}
