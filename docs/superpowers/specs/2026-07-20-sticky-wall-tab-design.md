# Sticky Wall Tab Design

## Summary

Add a new top-level `便利贴墙` tab to the existing `misaka.design` Astro site. The page should feel like a playful but polished experimental space inside the current writing-first site: a wide canvas with movable sticky notes, local persistence, lightweight editing tools, and visual language that stays consistent with the current `misaka.design` refresh.

The wall is intentionally designed as a static-host-friendly feature. It must deploy through the current GitHub + Netlify workflow without requiring a custom server, database, or authenticated backend.

## Why this feature exists

The existing site is already evolving from a template portfolio into a personal knowledge space. A sticky wall introduces a new mode of expression: not long-form writing, not taxonomy browsing, but a visual board for fragments, reminders, ideas, and experiments.

Done well, this tab makes the site feel more alive and more personal without turning the whole site into a heavy app. It also creates a natural path toward a possible future standalone product while staying realistic for the current deployment constraints.

## Goals

- Add a new top-level navigation entry named `便利贴墙`.
- Create a dedicated route such as `/wall` that feels distinct from article pages.
- Support real interaction: create, drag, edit, recolor, duplicate, and delete notes.
- Persist all wall data in the browser so the feature works on Netlify without a server.
- Keep the feature visually consistent with the current `misaka.design` brand while allowing more playful color and motion than the main writing surfaces.
- Design the code so the storage layer can later be swapped for a cloud backend if the feature becomes a standalone project.

## Non-goals

- No server-side database or custom API in this phase.
- No cross-device sync.
- No login, sharing permissions, or collaboration.
- No image upload, attachments, or file storage.
- No multi-select, zoomable infinite canvas, connectors, or whiteboard-level editing.
- No full visual whiteboard framework such as tldraw or Excalidraw for the first implementation.

## Constraints

- The site is deployed through GitHub and Netlify.
- There is no self-hosted server available.
- The current site remains an Astro site with relatively light interactivity.
- The sticky wall should not force the rest of the project into a large SPA rewrite.

## Entry point and information architecture

### Navigation

Add `便利贴墙` as a new top-level nav item alongside the existing main navigation. It should behave like a first-class section rather than a buried feature.

### Route

Use a dedicated route such as `/wall`. This route should still inherit the site shell and brand language, but the page body should be wider and more canvas-oriented than the reading pages.

### Relationship to the rest of the site

This page is an experimental visual space inside `misaka.design`, not a separate product launch. The header, footer, typography, and color logic should still feel like part of the same site.

## User experience

### Desktop-first experience

The primary target is desktop usage. The wall should feel natural with mouse or trackpad interaction, with a broad canvas, visible note overlap, and a right-side property panel when a note is selected.

### Mobile behavior

Mobile should remain usable, but not identical. The canvas can stay scrollable, notes remain draggable, and the property controls should move from a right-side floating panel into a bottom sheet or drawer. Desktop is the main design target for the first version.

### Empty state

The first visit should not show a blank canvas. If there is no saved local state, preload a small sample wall with several notes so the page immediately communicates what the feature is for.

## Core feature set

The first version should support these user actions:

- Create a new note.
- Drag a note to reposition it.
- Click a note to select it.
- Double-click or otherwise enter edit mode to update note text.
- Change note color.
- Change note style.
- Change note size.
- Duplicate the selected note.
- Delete the selected note.
- Add a small emoji or icon accent.
- Save automatically to local storage after any change.

## Deliberate exclusions for v1

To keep the first version manageable and Netlify-friendly, do not include:

- image attachments
- arbitrary resize handles
- multi-note selection
- keyboard shortcut systems beyond simple quality-of-life support
- pin type and pin position customization at the complexity shown in the reference image
- collaborative presence or remote persistence

## Visual design

### Overall mood

The sticky wall should feel like a `misaka.design` experiment page: lighter, more playful, and more spatial than the writing pages, but still aligned with the brand. It should not suddenly look like a separate SaaS dashboard.

### Canvas

- Use a wide page container rather than the narrow article column.
- Apply a very subtle dotted grid background.
- Keep the base background close to the existing off-white `misaka.design` palette.
- Let the notes provide most of the color.

### Notes

- Prefer soft, low-saturation note colors such as pale yellow, mint, mist blue, coral, lavender, and cream.
- Use light shadows and restrained texture.
- Keep note visuals readable and tactile without going into heavy skeuomorphism.
- Use the site's existing accent blue for selection states, action highlights, and panel emphasis.

### Controls

- A simple `+ 新建` button should sit near the top-left of the page.
- The selected note should reveal a lightweight property panel.
- The panel should feel calm and compact, not like a heavy configuration console.

## Page structure

The wall page should be organized like this:

1. page heading area with title `便利贴墙` and a small descriptive subtitle
2. top-left quick action for creating a note
3. broad canvas with dotted background and note layer
4. contextual property panel that appears when a note is selected

The page can keep the existing global header and footer so it remains clearly part of the main site.

## Note model

Each note should keep a focused set of fields:

- `id`
- `content`
- `color`
- `style`
- `size`
- `x`
- `y`
- `zIndex`
- `icon`
- `createdAt`
- `updatedAt`

This is enough to support the first feature set while keeping migration to a future backend simple.

## Wall state

The page-level state should track:

- the current note list
- the selected note id
- wall storage version
- initial sample state fallback when storage is empty

## Interaction rules

- Clicking a note selects it and raises it above the others.
- Double-clicking the note body enters edit mode.
- Dragging a note updates its position live and saves on drag end.
- Creating a note places it near the current visible center area.
- Duplicating a note creates a slightly offset copy.
- Deleting a note removes it from the wall and storage.
- Editing content, color, style, size, or icon saves automatically.
- New notes should begin with a helpful draft prompt such as `写点什么……` and focus quickly.

## Storage strategy

### Current implementation

Persist wall data in `localStorage`. This satisfies the current static-host deployment model and works cleanly with GitHub + Netlify.

### Abstraction boundary

Do not let UI components write directly to `localStorage` everywhere. Create a thin storage adapter with responsibilities such as:

- `loadWall()`
- `saveWall()`
- `createNote()`
- `updateNote()`
- `deleteNote()`

This abstraction is important because the long-term direction may be a standalone project with cloud sync. The first implementation should make that future swap realistic without overengineering now.

## Open source reuse strategy

### What should be reused

Reuse an interaction library for drag behavior instead of implementing raw drag math from scratch. The recommended choice is `interactjs`.

Reasons:

- it is framework-agnostic and therefore fits Astro better than React-only drag libraries
- it covers the hardest part of the interaction layer without forcing a full whiteboard architecture
- it keeps the implementation light enough for the current site
- it leaves room to migrate the feature later into a standalone project

### What should not be reused for v1

Do not use full whiteboard frameworks such as `tldraw` or `@excalidraw/excalidraw` in the first version. They are too heavy for the current need and would turn the feature into an embedded whiteboard product instead of a focused sticky wall.

Do not require React-only drag frameworks as the primary plan unless the project intentionally adopts a React island for this page later. React-based drag libraries are valid future options, but they are not the best first fit for the current Astro setup.

### Ownership boundary

The app should own:

- note data model
- property panel
- local persistence
- page styling
- sample note generation
- wall-level UI decisions

The library should only own the low-level drag interaction foundation.

## Implementation shape

The first implementation should likely be a dedicated wall page plus a client-side interactive module that mounts only on that route. It does not need to convert the rest of the site into a client-heavy application.

A good boundary would look like:

- Astro route for page shell and layout
- one interactive wall module for note state and canvas behavior
- one storage adapter for persistence
- a small set of presentational note and panel components

## Accessibility and usability

- Keep text readable at all supported note sizes.
- Preserve visible focus states for buttons and panel controls.
- Ensure reduced-motion users are not forced into animated movement beyond essential drag behavior.
- Maintain acceptable contrast between note text and note color choices.
- Avoid tiny controls that become unusable on touch devices.

## Success criteria

This feature is successful when:

- `便利贴墙` feels like a natural new top-level section of the site
- users can create and manage notes without a backend
- the wall persists across refreshes in the same browser
- the page feels playful but still visually related to `misaka.design`
- the implementation avoids a heavyweight whiteboard dependency
- the storage and interaction boundaries are clean enough to support future extraction into a standalone project

## Decisions intentionally deferred

These decisions should remain out of scope for this design and can be handled during implementation or a future product phase:

- exact route name if `/wall` needs renaming
- final palette values for each note color
- exact emoji or icon list
- future cloud sync vendor choice
- collaboration or public sharing model
- image or attachment support

These are execution or product-expansion details, not blockers for the current design.
