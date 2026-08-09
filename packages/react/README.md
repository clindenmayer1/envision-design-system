# @envision/react

Thin React wrappers over `@envision/components`. Each Envision component is exposed under its
**meaningful name** (`Button`, `Input`, `OptionCard`, `RightRail`, …) with typed props.

**No component logic lives here.** The package is one factory — `createComponent(tagName)` — plus
generated wrappers. All rendering, state, keyboard, and accessibility behavior lives once in the
custom elements. Adding another framework (Vue, Svelte) is the same thin shape over the same
elements — never a re-implementation. See `@envision/components/ARCHITECTURE.md` §7.

## Use

```tsx
import '@envision/tokens/css';          // load tokens once
import { Button, Input, RightRail, OptionCard } from '@envision/react';

function Panel() {
  return (
    <RightRail heading="Design" onApply={save} onModechange={(e) => setMode(e.detail.mode)}>
      <OptionCard title="Cabinets" note="+$540" onOpen={openTray} />
      <Input label="Notes" type="text" />
      <Button variant="primary" label="Apply" onClick={save} />
    </RightRail>
  );
}
```

What the wrapper does: camelCase props → kebab-case attributes; `on*` props → custom-element
events; `ref` → the element; `children` pass through. React 19 does this natively; the adapter
gives the same ergonomics (and precise types) on React 18.

## Scripts

`npm run build -w @envision/react` · `npm run test -w @envision/react` · `npm run verify -w @envision/react`
