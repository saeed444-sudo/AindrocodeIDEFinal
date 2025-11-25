# AindroCode Design Guidelines

## Design Philosophy
Hybrid system combining VSCode IDE patterns, Linear's developer UI, and Material Design components. Principles: clarity over decoration, density without clutter, mobile-first responsiveness, predictable layouts for muscle memory.

---

## Typography

**Fonts**:
- **Interface**: Inter (400, 500, 600) - UI elements
- **Code/Monospace**: JetBrains Mono (400, 500) - editor, terminal, file paths

**Scale**:
- Display: `text-3xl font-semibold` (30px) - onboarding, empty states
- Page Titles: `text-2xl font-semibold` (24px)
- Section Headers: `text-xl font-semibold` (20px)
- Panel Titles: `text-lg font-medium` (18px)
- Body/Interface: `text-base font-normal` (16px)
- Labels/Metadata: `text-sm font-medium` (14px)
- Captions/Hints: `text-xs font-normal` (12px)
- Code Editor: `text-sm font-normal` (14px) in JetBrains Mono

**Line Heights**: Headings `leading-tight` (1.25), body `leading-normal` (1.5), code `leading-relaxed` (1.625)

---

## Layout & Spacing

**Spacing Units**: `2, 3, 4, 6, 8, 12, 16` for consistent rhythm

**Patterns**:
- Component padding: `p-4` (mobile), `p-6` (tablet+)
- Section spacing: `space-y-6` (mobile), `space-y-8` (desktop)
- Panel margins: `m-2` (mobile), `m-4` (desktop)
- Icon-text gaps: `gap-2` or `gap-3`
- Form fields: `space-y-4`
- Buttons: `px-4 py-2` (standard), `px-6 py-3` (prominent)

**App Shell**:
- Top bar: `h-14` - logo, project name, global actions
- Bottom nav (mobile): `h-16` - 5 tabs (Home/Editor/Run/AI/Settings)
- Side nav (desktop): `w-16` - icon-based vertical nav
- File tree: `w-64` (desktop), slide-over drawer (mobile)
- Editor: `flex-1` (remaining space)
- Right sidebar: `w-80` (collapsible)
- Terminal: `h-80` (resizable, collapsible)

**Container Max-widths**:
- Full-width app: `w-full`
- Settings panels: `max-w-4xl mx-auto`
- Onboarding/docs: `max-w-3xl mx-auto`

**Breakpoints**:
- Mobile: `base` (<768px) - stacked panels, bottom nav
- Tablet: `md:` (768px+) - side-by-side layouts
- Desktop: `lg:` (1024px+) - full multi-panel, resizable dividers
- Wide: `xl:` (1280px+) - wider panels, minimap

---

## Components

### Navigation
**Top Bar**: `h-14 flex items-center justify-between px-4`
- Left: Logo `h-8 w-8` + project name `text-base font-medium truncate max-w-xs`
- Right: Icon buttons `h-10 w-10`

**Bottom Tab Bar**: `h-16 flex items-center justify-around`
- Items: `flex-1 flex flex-col items-center gap-1`
- Icon: `h-6 w-6`, label: `text-xs`, active: `font-medium`

**File Tree**:
- Header: `px-4 py-3 flex items-center justify-between`
- Items: `px-3 py-1.5 flex items-center gap-2`
- Nesting: `pl-6` per level
- Icons: `h-4 w-4` (Heroicons outline)

### Editor
**Tab Bar**: `flex overflow-x-auto h-10 border-b`
- Tab: `px-4 py-2 flex items-center gap-2 min-w-32 max-w-48`
- Content: Icon `h-4 w-4` + filename `text-sm truncate` + close `h-4 w-4`
- Close: `opacity-0 group-hover:opacity-100 transition`

**Monaco Container**: `h-full w-full relative overflow-hidden`

**Minimap** (desktop): `w-24 lg:w-32 absolute right-0 top-0 bottom-0`

**Terminal**:
- Container: `h-80 min-h-48 max-h-96` (resizable)
- Drag handle: `h-1 w-full cursor-row-resize`
- Header: `h-10 px-4 flex items-center justify-between`
- Output: `flex-1 overflow-auto p-3`

### AI Panel
**Chat**: `flex flex-col h-full`
- Header: `h-12 px-4 border-b`
- Messages: `flex-1 overflow-y-auto p-4 space-y-4`
- Input: `p-4 border-t`

**Message Bubbles**:
- User: `ml-8 rounded-2xl rounded-tr-sm p-3`
- AI: `mr-8 rounded-2xl rounded-tl-sm p-4`
- Code: `rounded-lg p-3 font-mono text-sm` + copy button `absolute top-2 right-2`

**Agent Cards**: `rounded-lg border p-4 space-y-3`
- Header: `flex items-start justify-between`
- Steps: `space-y-2` with icon `h-5 w-5` + text `text-sm`
- Actions: `flex gap-2 mt-4`

**Diff Viewer**: `grid grid-cols-2 gap-0`
- Line numbers: `w-12 text-right pr-2 text-xs select-none`
- Changes: `w-1 border-l-4`

### Forms
**Input**: `h-10 px-3 py-2 rounded-md border` (prominent: `h-12`)
- Label: `text-sm font-medium mb-1.5`
- Hint/error: `text-xs mt-1`

**Buttons**:
- Primary: `px-4 py-2 rounded-md font-medium` (prominent: `px-6 py-3`)
- Secondary: `px-4 py-2 rounded-md border`
- Icon-only: `h-10 w-10 rounded-md flex items-center justify-center`
- Ghost: `px-3 py-1.5 rounded` (hover only)

**Select**: 
- Trigger: `h-10 px-3 rounded-md border flex items-center justify-between`
- Menu: `absolute mt-1 rounded-lg border shadow-lg p-1 min-w-48`
- Items: `px-3 py-2 rounded text-sm gap-2`

**Toggle**: Container `w-11 h-6 rounded-full relative`, thumb `h-5 w-5 rounded-full absolute transform transition`

### Cards & Panels
**Project Cards**: `rounded-lg border p-4 cursor-pointer hover:shadow-md transition`
- Layout: `flex flex-col gap-3`
- Title: `text-lg font-semibold truncate`
- Metadata: `flex items-center gap-4 text-sm`
- Actions: `opacity-0 group-hover:opacity-100 transition`

**Settings**:
- Section: `space-y-6`, header: `text-lg font-semibold mb-4`
- Row: `flex items-center justify-between py-3 border-b last:border-0`
- Label: `flex-1` (title `text-base font-medium` + description `text-sm`)
- Control: `ml-4`

**Modal**: 
- Overlay: `fixed inset-0 bg-black/50 flex items-center justify-center p-4`
- Content: `max-w-lg w-full rounded-lg shadow-xl p-6`
- Header: `flex items-center justify-between mb-4 text-xl font-semibold`
- Footer: `flex justify-end gap-3 mt-6`

**Toast**: `fixed bottom-4 right-4 max-w-sm rounded-lg shadow-lg p-4 flex items-start gap-3`

### Empty States
**Empty File**: `flex items-center justify-center h-full`
- Icon: `h-16 w-16 opacity-40`
- Message: `text-lg font-medium mt-4`
- Hint: `text-sm mt-2 max-w-md text-center`

**No Projects**: Centered vertically
- Icon: `h-32 w-32`
- Heading: `text-2xl font-semibold mt-6`
- Description: `text-base mt-2 max-w-md`
- CTA: `mt-8 px-6 py-3`

---

## Icons
**Library**: Heroicons (outline default, solid for active states)

**Sizes**: `h-4 w-4` (small), `h-5 w-5` (standard), `h-6 w-6` (headers), `h-12 w-12` to `h-16 w-16` (empty states)

**Common**: DocumentTextIcon, FolderIcon, PlayIcon, StopIcon, TrashIcon, XMarkIcon, HomeIcon, CodeBracketIcon, ChatBubbleLeftIcon, Cog6ToothIcon, InformationCircleIcon

---

## Mobile Adaptations
**Touch Targets**: Minimum `h-11 w-11` (44px), tab bar `min-h-16`, drag handles `h-2 w-full`

**Responsive**:
- File tree: slide-over drawer overlay
- Terminal: full-width bottom sheet
- AI panel: full-screen modal
- Tabs: horizontal scroll
- Settings: single column

---

## Special States
**Welcome**: `min-h-screen flex flex-col`
- Logo: `h-24 w-24 mx-auto`
- Heading: `text-3xl font-bold mt-6 text-center`
- Features: `grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto`
- Feature card: `text-center p-6` (icon `h-12 w-12 mx-auto`)

**Banners**: `px-4 py-3 rounded-lg border flex items-start gap-3`
- Icon: `h-5 w-5 flex-shrink-0`
- Text: `text-sm`

**Future APK Notice**: `rounded-lg border-2 p-6`
- Badge: `inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3`
- Title: `text-xl font-bold`

---

## Animations
**Use Sparingly** - meaningful transitions only:
- Panel slide: `transition-transform duration-200`
- Modal fade: `transition-opacity duration-150`
- Button hover: `transition-colors duration-150`
- Tab switch: `transition-opacity duration-100`

**No animations**: code typing, terminal output, file tree expansion

---

**Priority**: Developer productivity, information density, mobile usability, IDE-quality aesthetics.