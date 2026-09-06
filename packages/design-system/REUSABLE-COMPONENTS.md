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
3. What differs per use is a **variable** (aspect ratio, size, color role) — documented and
   interchangeable — not a fork.
4. Break this only when the *structure* itself differs, and document why.

## Consolidation (done)

There used to be two overlapping trays. They're now consolidated to one:

- **`Tray`** — canonical. One component; thumb shape driven by the `thumb/aspect-ratio` **variable**.
- **`SelectionTray` → deprecated.** It carried the shape as a `Shape=Door / Shape=Square` **variant** —
  exactly the fork this rule replaces. Soft-deprecated (renamed + pointed at `Tray`) rather than
  deleted, so existing instances keep working; migrate them to `Tray`, then remove it.

The lesson generalizes: when you find a component using a **variant** to express what is really the
same organism with different content, that variant is usually a **variable** in disguise.

## Naming audit

Applying the rule to every name — the point is to rename what hardcodes *one feature*, and to
consciously **keep** names that are already function-level or carry a deliberate semantic. Renaming
for its own sake just churns the token pipeline, registries, and governance.

| Component | Verdict | Why |
|---|---|---|
| `RoomSelector` | **renamed → `Dropdown`** | "Room" was one feature; the function is a dropdown. |
| `CabinetStyleTray` | **renamed → `Tray`** | "Cabinet" was one of many tray uses; the function is a tray. |
| `MaterialSwatch` | **keep** | "Material" is a **data family** (product-material data, paired with `MaterialCard`, per governance rule 7 — never flat hex chrome), not a feature. It already generalizes across cabinets, counters, paint, backsplash. Bare `Swatch` would lose that and collide with a generic UI color swatch. |
| `OptionCard` | **keep** | "Option" *is* the function — a selectable option tile. |
| `PackageCard` | **keep** | Generic composition (media + title + price + CTA); "package" is the content type, and there's no cleaner generic (`Card` collides with `OptionCard`). |
| `RightRail` | **keep** | Named by layout position/function (a right-hand rail), like `Sidebar` — not a product feature. |

Rule of thumb: rename when the name would be wrong for a second valid use (a `RoomSelector` full of
sources reads wrong). Keep when the name still fits every use (a `MaterialSwatch` of paint is still a
material swatch).
