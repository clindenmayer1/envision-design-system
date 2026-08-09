/*
 * Typed ESM adapter around the existing UMD module `envision-targeting.js`.
 *
 * The targeting module is intentionally left untouched (it encodes the
 * validated, collision-safe name rules + path-aware lookup). It is a UMD
 * bundle: when imported in the browser it assigns `window.EnvisionTargeting`.
 * We import it for that side-effect and re-export it with TypeScript types.
 *
 * Targeting rule reminder: the GLB export dropped all SketchUp tags. Target by
 * preserved NODE NAMES only, using these helpers. Use path-aware `find()` when
 * shared SketchUp definitions produce duplicate node names.
 */
// Import the API DIRECTLY (not just for its side-effect) so the module is a USED import that
// the production bundler cannot tree-shake. It still sets window.EnvisionTargeting on eval too.
import EnvisionTargetingImpl from './envision-targeting.js'
import type { Object3D } from 'three'

export type CategoryKey =
  | 'cabinet_style' | 'cabinet_body' | 'hardware' | 'appliance' | 'countertop'
  | 'backsplash' | 'floor' | 'walls' | 'ceiling' | 'windows' | 'plumbing'
  | 'trim' | 'island'

export interface FindQuery {
  name?: string | string[]
  requireAncestor?: string | string[]
  excludeAncestor?: string | string[]
  category?: CategoryKey
}

export interface DebugRow {
  category: string
  name: string
  path: string
  parentName: string | null
  via: 'name' | 'inherited-parent-category' | 'ancestry'
}

export type TargetSets = Record<CategoryKey, Object3D[]>

export interface Lookup {
  root: Object3D
  applianceMode: string
  targets: TargetSets
  path(node: Object3D, opts?: { includeNoise?: boolean; separator?: string }): string
  parentName(node: Object3D): string | null
  ancestors(node: Object3D): Object3D[]
  describe(node: Object3D): {
    name: string; path: string; parentName: string | null
    ownCategories: string[]; inheritedCategory: string[]
  }
  find(q: FindQuery): Object3D[]
  debug(): DebugRow[]
  debugFind(q: FindQuery): DebugRow[]
}

export interface EnvisionTargetingAPI {
  CATEGORIES: CategoryKey[]
  WRAPPER_PREFIXES: string[]
  isIgnored(name: string): boolean
  classifyNodeName(name: string, opts?: { applianceMode?: string }): CategoryKey[]
  buildTargets(root: Object3D, opts?: { applianceMode?: string }): TargetSets
  findNodes(root: Object3D, q: FindQuery): Object3D[]
  getPath(node: Object3D, root: Object3D, opts?: object): string
  createLookup(root: Object3D, opts?: { applianceMode?: string }): Lookup
}

// Prefer the direct ESM default export; fall back to the global the UMD module set on eval.
const raw = (EnvisionTargetingImpl ??
  (globalThis as unknown as { EnvisionTargeting?: EnvisionTargetingAPI }).EnvisionTargeting) as
  EnvisionTargetingAPI | undefined

if (!raw) {
  throw new Error('EnvisionTargeting global not found — envision-targeting.js failed to load.')
}

const ET: EnvisionTargetingAPI = raw
export default ET
