# Reusable components — the naming & hierarchy rule

**Components are named and built for their *function*, never for a *feature*.** A feature is an
**instance** of a generic component, not a component of its own. This is the core reuse rule of the
Envision system.

| ❌ Feature-specific (anti-pattern) | ✅ Generic organism | The feature becomes… |
|---|---|---|
| `RoomSelector` | **`Dropdown`** | an instance (rooms, sources, views) |
| `CabinetStyleTray` | **`Tray`** | an instance (cabinets, countertops, backsplash, hardware) |

If a component's name only makes sense for one feature, it's too specific — generalize it.

## The `Tray` example (the hierarchy)

The **Tray** is the reusable **organism**: a selection surface with a header (title + close), a
horizontally-scrollable row of option tiles, and carousel nav. That structure is identical whether
you're choosing cabinets, countertops, backsplash, or hardware.

- **Atom** — the **thumbnail** (has a shape / aspect-ratio *variable*).
- **Molecule** — the **tile** (thumb + name + price + selected ring/check).
- **Organism** — the **Tray** (header + scrollable row of tiles + carousel).

Cabinet-style vs countertop-materials is **not** a component decision and **not** a variant — it's
just different **content** in the same Tray, plus one **variable**: the thumbnail aspect ratio.

## What actually changes per use → a variable, not a fork

The only visual difference between uses is the **thumbnail aspect ratio**, expressed as a variable
(`thumb/aspect-ratio` in *T2 · Semantic Layout*), so the thumbs are interchangeable by swapping it:

| Instance (content) | `thumb/aspect-ratio` |
|---|---|
| Countertops · materials · backsplash · hardware | `square` (1 → 1:1) |
| Cabinet doors / styles | `portrait` (0.75 → 3:4) |

To support a new material category, you add **content** and pick the **thumb variable** — you do
**not** add a component. (If a genuinely new shape is needed, add one `thumb/aspect-ratio/*` value.)

## The rule, generally

1. Name by function (`Tray`, `Dropdown`, `Card`, `Swatch`), never by feature.
2. The feature is an **instance** (content), not a component or a variant.
3. What differs per use is a **variable** (aspect ratio, size, colour role) — documented and
   interchangeable — not a fork.
4. Break this only when the *structure* itself differs, and document why.

> **Open follow-up:** the library currently has both a `Tray` (generalized from `CabinetStyleTray`)
> and a separate `SelectionTray`. These overlap — they should be consolidated into the single
> `Tray` organism, with the other retired or demoted to an instance/example.
