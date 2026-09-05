# UI layout and loading states

Use this reference when the affected components contain responsive layout,
skeletons, or loading-state accessibility. Keep the review within the requested
components; this is not a whole-product design or accessibility audit.

## Responsive layout evidence

Start with the narrowest supported viewport or container, then check relevant
breakpoints and a representative wide layout. Inspect fixed-width children inside
shrinking flex or grid regions, minimum sizing, gaps, wrapping, and overflow.
Compare loading and loaded states where both exist.

Treat suspicious width classes as a hypothesis, not proof of overlap. Confirm in
the browser using the actual parent constraints and computed styles. If browser
verification is unavailable, state the risk and the missing check. Consider minimum
width or maximum width constraints only when they address the observed cause;
do not apply them mechanically or hide overflow to conceal a layout defect.

## Shared layout ownership

Compare skeletons with their content counterparts for column order, widths,
alignment, responsive visibility, and reserved space. Report drift separately if
correcting it changes the existing presentation.

When both implementations should evolve together, reuse an existing layout
contract or consider a small domain-local layout module. Avoid importing an entire
feature renderer solely to obtain shared column definitions. Keep unrelated
placeholder counts separate, and avoid a universal skeleton abstraction or global
constants file without a concrete shared responsibility. An extraction may improve
maintenance; bundle savings require measurement of the resulting dependency graph.

## Loading-state accessibility

Review initial loading, pagination, and refresh states that actually exist. Check
whether status text fits each context, whether busy or live-region semantics are
appropriate at the owning region, and whether decorative placeholders create
redundant announcements. Do not add a live region to every repeated skeleton.

Check animation under the reduced-motion preference, including inherited or global
styles. In a Tailwind project, `motion-safe:animate-pulse` is one possible approach
when conditional animation is intended; follow the installed version and existing
conventions. See the optional [Tailwind reduced-motion documentation](https://tailwindcss.com/docs/animation#supporting-reduced-motion)
for API details.

Changes to layout, loading copy, accessibility semantics, or motion affect the user
experience. Report improvements separately from behavior-preserving cleanup and
do not implement them without scope to change that behavior. When authorized,
verify the relevant viewport, loading transition, accessibility semantics, and
motion preference using existing tools; screenshots alone cannot verify announcements.
