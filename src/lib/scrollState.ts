/**
 * Module-level mutable ref.
 * Written every frame by ScrollSyncer (inside the R3F Canvas).
 * Read by overlay components (outside Canvas, in the DOM).
 * This avoids prop-drilling the raw scroll offset through React state.
 */
export const scrollState = { offset: 0 }
