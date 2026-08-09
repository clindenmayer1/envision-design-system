/**
 * Minimal product data-model shapes the product components accept.
 *
 * These describe PRODUCT DATA (materials, packages), which per SYSTEM_SPEC §4 are NOT design
 * tokens — a material's color/image is content, set inline, not via `--envision-*`. The shapes are
 * intentionally small and structural so the components don't couple to the app's full domain types.
 */
export interface MaterialOption {
  id: string;
  name: string;
  finish?: string;
  /** e.g. "Included" or "+$120" — display string; formatting is the caller's responsibility. */
  priceLabel?: string;
  /** Product image/texture URL (preferred fill). */
  image?: string;
  /** Fallback solid fill (product color, not a UI token). */
  color?: string;
}

export interface KitchenPackage {
  id: string;
  name: string;
  image?: string;
  priceLabel?: string;
  popular?: boolean;
  /** Material swatch fills previewed on the card. */
  materials?: MaterialOption[];
}
