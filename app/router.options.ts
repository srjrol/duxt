// app/router.options.ts

// resetting to the top-left corner of the page on route change
import { type RouteLocationNormalized, type RouteLocationNormalizedLoaded } from 'vue-router';

type Position = { x: number; y: number };

export default {
  scrollBehavior(
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    savedPosition: Position | null
  ): Position {
    return { x: 0, y: 0 };
  },
};
