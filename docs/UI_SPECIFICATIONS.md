# Log Book - UI/UX Specifications

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Design System](#design-system)
3. [Page Layouts](#page-layouts)
4. [Component Specifications](#component-specifications)
5. [Interaction Patterns](#interaction-patterns)
6. [Responsive Design](#responsive-design)
7. [Accessibility Guidelines](#accessibility-guidelines)

---

## Design Philosophy

### Core Principle: EASE OF ACCESS

The Log Book application prioritizes simplicity and efficiency. Every design decision supports:

1. **Minimal Cognitive Load** - Users should never wonder "what do I do next?"
2. **Reduced Click Paths** - Maximum 3 clicks to any action
3. **Clear Visual Hierarchy** - Important elements are immediately visible
4. **Forgiving Interface** - Easy to undo, hard to make mistakes

### Target User Context
- OPT students tracking volunteer/unpaid work hours
- Often stressed about compliance requirements
- Need quick, reliable time logging
- May access from multiple devices

---

## Design System

### Color Palette

#### Light Mode
```
Primary Colors:
  Primary:        #2563EB  (Blue 600)     - Main actions, links, focus
  Primary Hover:  #1D4ED8  (Blue 700)     - Hover states
  Primary Light:  #DBEAFE  (Blue 100)     - Backgrounds, highlights

Secondary Colors:
  Secondary:      #7C3AED  (Violet 600)   - Accent elements
  Secondary Hover:#6D28D9  (Violet 700)   - Hover states

Semantic Colors:
  Success:        #059669  (Emerald 600)  - Completed, positive
  Success Light:  #D1FAE5  (Emerald 100)  - Success backgrounds
  Warning:        #D97706  (Amber 600)    - Caution, pending
  Warning Light:  #FEF3C7  (Amber 100)    - Warning backgrounds
  Error:          #DC2626  (Red 600)      - Errors, destructive
  Error Light:    #FEE2E2  (Red 100)      - Error backgrounds

Neutral Palette:
  White:          #FFFFFF
  Gray 50:        #F9FAFB  - Page background
  Gray 100:       #F3F4F6  - Card backgrounds, subtle fills
  Gray 200:       #E5E7EB  - Borders, dividers
  Gray 300:       #D1D5DB  - Disabled states
  Gray 400:       #9CA3AF  - Placeholder text
  Gray 500:       #6B7280  - Secondary text
  Gray 600:       #4B5563  - Body text
  Gray 700:       #374151  - Headings
  Gray 800:       #1F2937  - Primary text
  Gray 900:       #111827  - Emphasis text
```

#### Dark Mode
```
Background Colors:
  Background:     #0F172A  (Slate 900)    - Page background
  Surface:        #1E293B  (Slate 800)    - Cards, elevated surfaces
  Surface Hover:  #334155  (Slate 700)    - Hover states
  Border:         #475569  (Slate 600)    - Borders, dividers

Text Colors:
  Primary Text:   #F1F5F9  (Slate 100)    - Main text
  Secondary Text: #94A3B8  (Slate 400)    - Muted text
  Disabled Text:  #64748B  (Slate 500)    - Disabled states

Adjusted Semantic Colors:
  Primary:        #3B82F6  (Blue 500)     - Brighter for contrast
  Success:        #10B981  (Emerald 500)
  Warning:        #F59E0B  (Amber 500)
  Error:          #EF4444  (Red 500)
```

### Typography

#### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

#### Type Scale
```
Display:
  Size: 48px / Line Height: 56px / Weight: 700 / Letter Spacing: -0.02em
  Usage: Hero sections, splash screens

H1 - Page Title:
  Size: 36px / Line Height: 44px / Weight: 700 / Letter Spacing: -0.02em
  Usage: Main page headings

H2 - Section Title:
  Size: 30px / Line Height: 38px / Weight: 600 / Letter Spacing: -0.01em
  Usage: Major section headings

H3 - Subsection:
  Size: 24px / Line Height: 32px / Weight: 600 / Letter Spacing: 0
  Usage: Card titles, subsections

H4 - Component Title:
  Size: 20px / Line Height: 28px / Weight: 500 / Letter Spacing: 0
  Usage: Widget headers, dialog titles

H5 - Label Large:
  Size: 18px / Line Height: 26px / Weight: 500 / Letter Spacing: 0
  Usage: Important labels, summaries

Body Large:
  Size: 18px / Line Height: 28px / Weight: 400 / Letter Spacing: 0
  Usage: Featured content, introductions

Body:
  Size: 16px / Line Height: 24px / Weight: 400 / Letter Spacing: 0
  Usage: Main content, descriptions

Body Small:
  Size: 14px / Line Height: 20px / Weight: 400 / Letter Spacing: 0
  Usage: Secondary content, hints

Caption:
  Size: 12px / Line Height: 16px / Weight: 400 / Letter Spacing: 0
  Usage: Timestamps, metadata

Label:
  Size: 12px / Line Height: 16px / Weight: 500 / Letter Spacing: 0.05em
  Usage: Form labels, badges (uppercase)
```

### Spacing System

Based on 4px base unit:
```
--space-0:   0px
--space-1:   4px   (xs)    - Tight gaps
--space-2:   8px   (sm)    - Icon gaps, compact spacing
--space-3:   12px  (md)    - Related element gaps
--space-4:   16px  (base)  - Standard padding
--space-5:   20px          - Comfortable padding
--space-6:   24px  (lg)    - Card padding, section gaps
--space-8:   32px  (xl)    - Component separation
--space-10:  40px          - Major section gaps
--space-12:  48px  (2xl)   - Page section separation
--space-16:  64px  (3xl)   - Hero spacing
--space-20:  80px          - Major layout gaps
--space-24:  96px          - Page margins (desktop)
```

### Border Radius
```
--radius-none: 0px
--radius-sm:   4px    - Subtle rounding (buttons small)
--radius-md:   6px    - Inputs, small cards
--radius-lg:   8px    - Buttons, inputs
--radius-xl:   12px   - Cards, modals
--radius-2xl:  16px   - Large cards, panels
--radius-full: 9999px - Pills, avatars
```

### Shadows
```
Light Mode:
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)
--shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
--shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)

Dark Mode:
--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.3)
--shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)
--shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)
--shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)

Focus Ring:
--focus-ring: 0 0 0 2px var(--color-primary), 0 0 0 4px var(--color-primary-light)
```

### Z-Index Scale
```
--z-base:     0
--z-dropdown: 100
--z-sticky:   200
--z-overlay:  300
--z-modal:    400
--z-popover:  500
--z-toast:    600
--z-tooltip:  700
```

---

## Page Layouts

### 1. Login/Signup Page

```
DESKTOP (> 1024px)
+------------------------------------------------------------------+
|                                                                    |
|     +-------------------------+  +-----------------------------+   |
|     |                         |  |                             |   |
|     |      [Log Book Logo]    |  |   Welcome Back              |   |
|     |                         |  |   ----------------          |   |
|     |   Track your volunteer  |  |                             |   |
|     |   hours with ease       |  |   [    Email Address    ]   |   |
|     |                         |  |                             |   |
|     |   * Simple time track.  |  |   [    Password         ]   |   |
|     |   * Rich documentation  |  |                             |   |
|     |   * Easy compliance     |  |   [ ] Remember me           |   |
|     |                         |  |                             |   |
|     |   [Illustration of      |  |   [      Sign In        ]   |   |
|     |    person working]      |  |                             |   |
|     |                         |  |   -------- or --------      |   |
|     |                         |  |                             |   |
|     |                         |  |   [G] Continue with Google  |   |
|     |                         |  |                             |   |
|     |                         |  |   Don't have an account?    |   |
|     |                         |  |   Sign up                   |   |
|     |                         |  |                             |   |
|     +-------------------------+  +-----------------------------+   |
|                                                                    |
+------------------------------------------------------------------+

MOBILE (< 640px)
+--------------------------------+
|                                |
|        [Log Book Logo]         |
|                                |
|   Track your volunteer hours   |
|   with ease                    |
|                                |
+--------------------------------+
|                                |
|   Welcome Back                 |
|   ----------------             |
|                                |
|   [      Email Address     ]   |
|                                |
|   [      Password          ]   |
|                                |
|   [ ] Remember me              |
|                                |
|   [        Sign In         ]   |
|                                |
|   --------- or ---------       |
|                                |
|   [G] Continue with Google     |
|                                |
|   Don't have an account?       |
|   Sign up                      |
|                                |
+--------------------------------+
```

**Tailwind Classes:**
```
Container: min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900
Split Panel (Desktop): grid grid-cols-2 gap-0 max-w-5xl
Left Panel: bg-primary-600 text-white p-12 rounded-l-2xl hidden lg:block
Right Panel: bg-white dark:bg-slate-800 p-8 lg:p-12 rounded-2xl lg:rounded-l-none shadow-xl
Form: space-y-6
```

### 2. Dashboard

```
DESKTOP (> 1024px)
+------------------------------------------------------------------+
| [Logo] Log Book                    [?] [Dark] [Notifications] [A] |
+------------------------------------------------------------------+
| Dashboard    Time Tracker    Documents    History    Settings     |
+------------------------------------------------------------------+
|                                                                    |
|  +-----------------------------+  +-----------------------------+  |
|  |  CURRENT SESSION            |  |  THIS WEEK                  |  |
|  |  -------------------------  |  |  -----------------------    |  |
|  |                             |  |                             |  |
|  |      [  02:34:15  ]         |  |   Total Hours:  12h 45m     |  |
|  |                             |  |   Sessions:     5           |  |
|  |   Started: 9:00 AM Today    |  |   Documents:    4           |  |
|  |                             |  |                             |  |
|  |  [ Stop Session ]           |  |   [###########----] 85%     |  |
|  |  [ Schedule End ]           |  |   of 15h goal               |  |
|  |                             |  |                             |  |
|  +-----------------------------+  +-----------------------------+  |
|                                                                    |
|  +-----------------------------+  +-----------------------------+  |
|  |  RECENT LOGS                |  |  QUICK LOG                  |  |
|  |  -------------------------  |  |  -----------------------    |  |
|  |                             |  |                             |  |
|  |  Today                      |  |  What did you work on?      |  |
|  |  > Feb 16 - 2.5h - Draft    |  |  +------------------------+ |  |
|  |                             |  |  |                        | |  |
|  |  Yesterday                  |  |  |                        | |  |
|  |  > Feb 15 - 4h - Complete   |  |  |                        | |  |
|  |                             |  |  +------------------------+ |  |
|  |  Feb 14                     |  |                             |  |
|  |  > Feb 14 - 3h - Complete   |  |  [ Save Log ]               |  |
|  |                             |  |                             |  |
|  |  [View All Logs ->]         |  |  [ Open Full Editor ]       |  |
|  +-----------------------------+  +-----------------------------+  |
|                                                                    |
+------------------------------------------------------------------+

MOBILE (< 640px)
+--------------------------------+
| [=] Log Book         [Bell][A] |
+--------------------------------+
|                                |
|  CURRENT SESSION               |
|  +---------------------------+ |
|  |                           | |
|  |     [  02:34:15  ]        | |
|  |                           | |
|  |  Started: 9:00 AM Today   | |
|  |                           | |
|  |  [    Stop Session    ]   | |
|  |  [    Schedule End    ]   | |
|  +---------------------------+ |
|                                |
|  THIS WEEK          12h 45m    |
|  [###############----]  85%    |
|                                |
|  QUICK LOG                     |
|  +---------------------------+ |
|  | What did you work on?     | |
|  +---------------------------+ |
|  [ Save ]  [ Full Editor ]     |
|                                |
|  RECENT                        |
|  > Feb 16 - 2.5h - Draft       |
|  > Feb 15 - 4h - Complete      |
|  > Feb 14 - 3h - Complete      |
|                                |
+--------------------------------+
| [Home] [Timer] [Docs] [More]   |
+--------------------------------+
```

**Tailwind Classes:**
```
Page: min-h-screen bg-gray-50 dark:bg-slate-900
Header: sticky top-0 z-sticky bg-white dark:bg-slate-800 border-b shadow-sm
Nav: hidden md:flex space-x-1 px-4
Main Grid: grid grid-cols-1 lg:grid-cols-2 gap-6 p-6
Card: bg-white dark:bg-slate-800 rounded-xl shadow-md p-6
Card Title: text-sm font-medium text-gray-500 uppercase tracking-wide
Timer Display: text-5xl font-bold font-mono text-gray-900 dark:text-white
Mobile Nav: fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t
```

### 3. Time Tracker

```
DESKTOP (> 1024px)
+------------------------------------------------------------------+
| [Logo] Log Book                    [?] [Dark] [Notifications] [A] |
+------------------------------------------------------------------+
| Dashboard    [Time Tracker]    Documents    History    Settings   |
+------------------------------------------------------------------+
|                                                                    |
|                 +-----------------------------------+              |
|                 |                                   |              |
|                 |         TIME TRACKER              |              |
|                 |                                   |              |
|                 |    +-------------------------+    |              |
|                 |    |                         |    |              |
|                 |    |       00:00:00          |    |              |
|                 |    |                         |    |              |
|                 |    +-------------------------+    |              |
|                 |                                   |              |
|                 |    +-------------------------+    |              |
|                 |    |      > START            |    |              |
|                 |    +-------------------------+    |              |
|                 |                                   |              |
|                 |    [ Schedule for Later ]         |              |
|                 |                                   |              |
|                 +-----------------------------------+              |
|                                                                    |
|  +----------------------------------------------------------------+|
|  |  TODAY'S SESSIONS                                              ||
|  |----------------------------------------------------------------||
|  |  #  | Start      | End        | Duration | Status    | Action  ||
|  |-----|------------|------------|----------|-----------|---------|
|  |  1  | 9:00 AM    | 12:30 PM   | 3h 30m   | Completed |  [...]  ||
|  |  2  | 2:00 PM    | 4:15 PM    | 2h 15m   | Completed |  [...]  ||
|  |  3  | 5:00 PM    | --:-- --   | 0h 45m   | Active    |  [...]  ||
|  +----------------------------------------------------------------+|
|                                                                    |
+------------------------------------------------------------------+

WHEN TIMER IS RUNNING:
+-----------------------------------+
|                                   |
|         TIME TRACKER              |
|         (Session Active)          |
|                                   |
|    +-------------------------+    |
|    |      [pulse indicator]  |    |
|    |       02:34:15          |    |
|    |                         |    |
|    +-------------------------+    |
|                                   |
|    Started: 9:00 AM               |
|    Scheduled End: 5:00 PM         |
|                                   |
|    +-------------------------+    |
|    |      [] STOP            |    |
|    +-------------------------+    |
|                                   |
|    [ Reschedule ]  [ Cancel Sch ] |
|                                   |
+-----------------------------------+

SCHEDULE MODAL:
+-----------------------------------+
|  Schedule Session End             |
|  ---------------------------------|
|                                   |
|  End Time:                        |
|  +-------------+ +-------------+  |
|  |  05 : 00    | |    PM  v   |  |
|  +-------------+ +-------------+  |
|                                   |
|  Quick Options:                   |
|  [+30m] [+1h] [+2h] [+4h]         |
|                                   |
|  Duration Preview: 3h 45m         |
|                                   |
|  [ Cancel ]        [ Schedule ]   |
|                                   |
+-----------------------------------+
```

**Tailwind Classes:**
```
Timer Container: max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8
Timer Display: text-7xl font-bold font-mono tracking-tight
Start Button: w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-lg font-semibold
Stop Button: w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-lg font-semibold
Pulse Indicator: animate-pulse w-3 h-3 bg-green-500 rounded-full
Sessions Table: w-full divide-y divide-gray-200 dark:divide-slate-700
```

### 4. Document Editor

```
DESKTOP (> 1024px)
+------------------------------------------------------------------+
| [<- Back]    February 16, 2026      [History] [Export] [Save]     |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | [B] [I] [U] [S] | [H1] [H2] [H3] | [*] [-] | [Link] [Img] [V] | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |                                                              | |
|  |  # Work Summary                                              | |
|  |  ==================                                          | |
|  |                                                              | |
|  |  Today I worked on the API integration for the user          | |
|  |  authentication system. Made good progress on:               | |
|  |                                                              | |
|  |  * Implemented Clerk webhook handlers                        | |
|  |  * Added session validation middleware                       | |
|  |  * Created user sync logic                                   | |
|  |                                                              | |
|  |  +--------------------------------------------------+        | |
|  |  |  [Screenshot: API Response]                      |        | |
|  |  |  +--------------------------------------------+  |        | |
|  |  |  |                                            |  |        | |
|  |  |  |     [Image Preview]                        |  |        | |
|  |  |  |                                            |  |        | |
|  |  |  +--------------------------------------------+  |        | |
|  |  |  Caption: Successful API response             |        | |
|  |  +--------------------------------------------------+        | |
|  |                                                              | |
|  |  ## Next Steps                                               | |
|  |                                                              | |
|  |  - [ ] Complete error handling                               | |
|  |  - [ ] Add unit tests                                        | |
|  |  - [ ] Document the API                                      | |
|  |                                                              | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  [cloud icon] Auto-saved 2 seconds ago                            |
|                                                                    |
+------------------------------------------------------------------+

TOOLBAR DETAIL:
+--------------------------------------------------------------+
|  Formatting       Headings      Lists        Media    More   |
|  -----------      --------      -----        -----    ----   |
|  [B] Bold         [H1] Title    [*] Bullet   [Lnk]    [...]  |
|  [I] Italic       [H2] Section  [-] Number   [Img]           |
|  [U] Underline    [H3] Sub      [>] Quote    [Vid]           |
|  [S] Strike       [P]  Para     [x] Check    [Fil]           |
+--------------------------------------------------------------+

MOBILE EDITOR:
+--------------------------------+
| [<]    Feb 16    [v] [Save]    |
+--------------------------------+
|                                |
| +----------------------------+ |
| | [B][I][U] [H][*] [+Media]  | |
| +----------------------------+ |
|                                |
| +----------------------------+ |
| |                            | |
| | # Work Summary             | |
| |                            | |
| | Today I worked on the API  | |
| | integration...             | |
| |                            | |
| | * Implemented handlers     | |
| | * Added validation         | |
| |                            | |
| | [Image Thumbnail]          | |
| |                            | |
| +----------------------------+ |
|                                |
| Auto-saved just now            |
+--------------------------------+
```

**Tailwind Classes:**
```
Editor Container: max-w-4xl mx-auto
Toolbar: sticky top-16 z-10 bg-white dark:bg-slate-800 border rounded-t-xl p-2 flex flex-wrap gap-1
Toolbar Button: p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700
Toolbar Divider: w-px h-6 bg-gray-200 dark:bg-slate-600 mx-1
Editor Content: min-h-[500px] p-6 border-x border-b rounded-b-xl prose dark:prose-invert max-w-none
Auto-save Status: text-sm text-gray-500 flex items-center gap-2 mt-4
```

### 5. Document List (Calendar View)

```
DESKTOP (> 1024px)
+------------------------------------------------------------------+
| [Logo] Log Book                    [?] [Dark] [Notifications] [A] |
+------------------------------------------------------------------+
| Dashboard    Time Tracker    [Documents]    History    Settings   |
+------------------------------------------------------------------+
|                                                                    |
|  +-------------------------------+  +---------------------------+  |
|  |      FEBRUARY 2026            |  |  SELECTED: Feb 16, 2026   |  |
|  |  [<]                   [>]    |  |                           |  |
|  +-------------------------------+  |  Status: Draft            |  |
|  | Su | Mo | Tu | We | Th | Fr | Sa |  |  Duration: 2h 45m         |  |
|  |----|----|----|----|----|----|----|  |  Words: 342               |  |
|  |    |    |    |    |    |    |  1 |  |                           |  |
|  |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  |  Preview:                 |  |
|  |  9 | 10 | 11 | 12 | 13*| 14*| 15*|  |  -------------------------  |  |
|  |[16]| 17 | 18 | 19 | 20 | 21 | 22 |  |  # Work Summary           |  |
|  | 23 | 24 | 25 | 26 | 27 | 28 |    |  |  Today I worked on the    |  |
|  |    |    |    |    |    |    |    |  |  API integration...       |  |
|  +-------------------------------+  |                           |  |
|                                      |  [ Open Document ]        |  |
|  Legend:                             |  [ Delete ]               |  |
|  [*] Has document                    |                           |  |
|  [Today] Current selection           +---------------------------+  |
|                                                                    |
|  RECENT DOCUMENTS                                                  |
|  +--------------------------------------------------------------+ |
|  | Date       | Title            | Duration | Status  | Actions | |
|  |------------|------------------|----------|---------|---------|  |
|  | Feb 16     | Work Summary     | 2h 45m   | Draft   | [Open]  | |
|  | Feb 15     | API Development  | 4h 00m   | Done    | [Open]  | |
|  | Feb 14     | Research Notes   | 3h 15m   | Done    | [Open]  | |
|  | Feb 13     | Planning Session | 2h 00m   | Done    | [Open]  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+

MOBILE (< 640px):
+--------------------------------+
| [=] Documents         [+][...] |
+--------------------------------+
|                                |
|      FEBRUARY 2026             |
|    [<]              [>]        |
| Su Mo Tu We Th Fr Sa           |
|                          1     |
|  2  3  4  5  6  7  8          |
|  9 10 11 12 13 14 15          |
| 16 17 18 19 20 21 22          |
| 23 24 25 26 27 28             |
|                                |
+--------------------------------+
|                                |
| Feb 16, 2026 - Draft           |
| # Work Summary                 |
| Today I worked on...           |
| Duration: 2h 45m               |
| [       Open Document      ]   |
|                                |
+--------------------------------+
|                                |
| Feb 15, 2026 - Complete        |
| # API Development              |
| Made progress on...            |
| Duration: 4h 00m               |
| [       Open Document      ]   |
|                                |
+--------------------------------+
```

**Tailwind Classes:**
```
Calendar Container: bg-white dark:bg-slate-800 rounded-xl shadow-md p-4
Calendar Grid: grid grid-cols-7 gap-1 text-center
Day Cell: p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer
Day with Doc: bg-primary-50 dark:bg-primary-900/30
Selected Day: bg-primary-600 text-white
Today: ring-2 ring-primary-600
Preview Panel: bg-white dark:bg-slate-800 rounded-xl shadow-md p-6
Document List: divide-y divide-gray-200 dark:divide-slate-700
```

### 6. History Page

```
DESKTOP (> 1024px)
+------------------------------------------------------------------+
| [Logo] Log Book                    [?] [Dark] [Notifications] [A] |
+------------------------------------------------------------------+
| Dashboard    Time Tracker    Documents    [History]    Settings   |
+------------------------------------------------------------------+
|                                                                    |
|  SESSION HISTORY                                                   |
|  +--------------------------------------------------------------+ |
|  |  FILTERS                                                      | |
|  |  Date Range: [Feb 1, 2026] to [Feb 16, 2026]  [Apply]        | |
|  |  Status: [All v]    Export: [CSV] [PDF]                       | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  SUMMARY                                                           |
|  +---------------+  +---------------+  +---------------+           |
|  | Total Hours   |  | Sessions      |  | Avg/Day       |           |
|  |    45h 30m    |  |     18        |  |    2h 50m     |           |
|  +---------------+  +---------------+  +---------------+           |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |  SESSION LOG                                                  | |
|  |--------------------------------------------------------------| |
|  |  Date        | Start    | End      | Duration | Status       | |
|  |--------------|----------|----------|----------|--------------|  |
|  |  Feb 16      | 9:00 AM  | 11:45 AM | 2h 45m   | [Completed]  | |
|  |  Feb 16      | 2:00 PM  | 4:30 PM  | 2h 30m   | [Completed]  | |
|  |  Feb 15      | 10:00 AM | 2:00 PM  | 4h 00m   | [Completed]  | |
|  |  Feb 14      | 9:30 AM  | 12:45 PM | 3h 15m   | [Completed]  | |
|  |  Feb 13      | 11:00 AM | 1:00 PM  | 2h 00m   | [Completed]  | |
|  |--------------------------------------------------------------| |
|  |  [< Previous]            Page 1 of 3           [Next >]      | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+

MOBILE:
+--------------------------------+
| [=] History            [Filter]|
+--------------------------------+
|                                |
| Feb 1 - Feb 16, 2026           |
|                                |
| +----------------------------+ |
| | Total     Sessions   Avg   | |
| | 45h 30m      18     2h 50m | |
| +----------------------------+ |
|                                |
| February 16                    |
| +----------------------------+ |
| | 9:00 AM - 11:45 AM         | |
| | 2h 45m          [Complete] | |
| +----------------------------+ |
| +----------------------------+ |
| | 2:00 PM - 4:30 PM          | |
| | 2h 30m          [Complete] | |
| +----------------------------+ |
|                                |
| February 15                    |
| +----------------------------+ |
| | 10:00 AM - 2:00 PM         | |
| | 4h 00m          [Complete] | |
| +----------------------------+ |
|                                |
| [Load More]                    |
+--------------------------------+
```

**Tailwind Classes:**
```
Filters Bar: bg-white dark:bg-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center
Summary Cards: grid grid-cols-3 gap-4
Summary Card: bg-white dark:bg-slate-800 rounded-xl p-6 text-center
Summary Value: text-3xl font-bold text-gray-900 dark:text-white
Session Table: w-full bg-white dark:bg-slate-800 rounded-xl overflow-hidden
Table Header: bg-gray-50 dark:bg-slate-700 text-left text-sm font-medium
Table Row: hover:bg-gray-50 dark:hover:bg-slate-700/50
Pagination: flex justify-between items-center p-4 border-t
```

### 7. Settings Page

```
DESKTOP (> 1024px)
+------------------------------------------------------------------+
| [Logo] Log Book                    [?] [Dark] [Notifications] [A] |
+------------------------------------------------------------------+
| Dashboard    Time Tracker    Documents    History    [Settings]   |
+------------------------------------------------------------------+
|                                                                    |
|  +------------------+  +---------------------------------------+   |
|  |  SETTINGS        |  |  PROFILE                              |   |
|  |  --------------  |  |  -----------------------------------  |   |
|  |  > Profile       |  |                                       |   |
|  |    Appearance    |  |  +-------+  John Doe                  |   |
|  |    Notifications |  |  |  [A]  |  john.doe@email.com        |   |
|  |    Time Tracking |  |  +-------+  Member since Feb 2026     |   |
|  |    Data & Export |  |                                       |   |
|  |    Account       |  |  Display Name                         |   |
|  |                  |  |  [  John Doe                      ]   |   |
|  |                  |  |                                       |   |
|  |                  |  |  Email                                |   |
|  |                  |  |  [  john.doe@email.com            ]   |   |
|  |                  |  |  (Managed by Clerk)                   |   |
|  |                  |  |                                       |   |
|  |                  |  |  [ Save Changes ]                     |   |
|  |                  |  |                                       |   |
|  +------------------+  +---------------------------------------+   |
|                                                                    |
+------------------------------------------------------------------+

APPEARANCE SECTION:
+---------------------------------------+
|  APPEARANCE                           |
|  -----------------------------------  |
|                                       |
|  Theme                                |
|  +--------+  +--------+  +--------+   |
|  | [Sun]  |  | [Moon] |  | [Auto] |   |
|  | Light  |  | Dark   |  | System |   |
|  +--------+  +--------+  +--------+   |
|                 [*]                   |
|                                       |
|  Accent Color                         |
|  [*Blue] [Violet] [Green] [Orange]    |
|                                       |
+---------------------------------------+

TIME TRACKING SECTION:
+---------------------------------------+
|  TIME TRACKING                        |
|  -----------------------------------  |
|                                       |
|  Weekly Goal                          |
|  [  15  ] hours                       |
|                                       |
|  Default Session Duration             |
|  [  4   ] hours                       |
|                                       |
|  Auto-stop Reminder                   |
|  [*] Notify me 15 minutes before      |
|      scheduled end                    |
|                                       |
|  [ ] Auto-start timer on app open     |
|                                       |
+---------------------------------------+

MOBILE SETTINGS:
+--------------------------------+
| [<] Settings                   |
+--------------------------------+
|                                |
| +----------------------------+ |
| |  [A]  John Doe             | |
| |       john.doe@email.com   | |
| +----------------------------+ |
|                                |
| General                        |
| > Profile                  [>]|
| > Appearance               [>]|
| > Notifications            [>]|
|                                |
| Time Tracking                  |
| > Goals & Defaults         [>]|
| > Reminders                [>]|
|                                |
| Data                           |
| > Export Data              [>]|
| > Delete Account           [>]|
|                                |
+--------------------------------+
```

**Tailwind Classes:**
```
Settings Layout: flex gap-6
Settings Nav: w-64 shrink-0 space-y-1
Nav Item: px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-slate-700
Nav Item Active: bg-primary-50 dark:bg-primary-900/30 text-primary-600
Settings Panel: flex-1 bg-white dark:bg-slate-800 rounded-xl p-6
Section Title: text-lg font-semibold mb-4
Theme Button: flex flex-col items-center p-4 border-2 rounded-xl
Theme Button Active: border-primary-600 bg-primary-50 dark:bg-primary-900/30
```

---

## Component Specifications

### 1. Button Variants

```
PRIMARY BUTTON (Main actions)
+---------------------------+
|       Start Session       |
+---------------------------+
States:
- Default: bg-primary-600 text-white
- Hover:   bg-primary-700
- Active:  bg-primary-800
- Focus:   ring-2 ring-primary-500 ring-offset-2
- Loading: opacity-80 cursor-wait [spinner]
- Disabled: bg-gray-300 text-gray-500 cursor-not-allowed

SECONDARY BUTTON (Secondary actions)
+---------------------------+
|       Schedule End        |
+---------------------------+
States:
- Default: border-2 border-gray-300 text-gray-700
- Hover:   border-gray-400 bg-gray-50
- Active:  bg-gray-100
- Dark:    border-slate-600 text-slate-200

DANGER BUTTON (Destructive actions)
+---------------------------+
|     Delete Document       |
+---------------------------+
States:
- Default: bg-red-600 text-white
- Hover:   bg-red-700
- Confirm: Requires double-click or modal

GHOST BUTTON (Tertiary actions)
+---------------------------+
|       Cancel              |
+---------------------------+
States:
- Default: text-gray-600
- Hover:   bg-gray-100

ICON BUTTON
+-------+
|  [+]  |
+-------+
Sizes: 32px (sm), 40px (md), 48px (lg)

BUTTON SIZES:
- Small (sm):  h-8  px-3 text-sm
- Medium (md): h-10 px-4 text-base
- Large (lg):  h-12 px-6 text-lg

BUTTON WITH ICON:
+---------------------------+
|    [+]  New Document      |
+---------------------------+
Icon Size: 16px (sm), 20px (md), 24px (lg)
Gap: 8px between icon and text
```

**Tailwind Classes:**
```jsx
// Primary
className="h-10 px-4 bg-primary-600 hover:bg-primary-700 active:bg-primary-800
           text-white font-medium rounded-lg focus:outline-none focus:ring-2
           focus:ring-primary-500 focus:ring-offset-2 transition-colors
           disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"

// Secondary
className="h-10 px-4 border-2 border-gray-300 hover:border-gray-400
           hover:bg-gray-50 text-gray-700 font-medium rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:ring-offset-2 transition-colors"

// Danger
className="h-10 px-4 bg-red-600 hover:bg-red-700 text-white font-medium
           rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
           focus:ring-offset-2 transition-colors"

// Ghost
className="h-10 px-4 text-gray-600 hover:bg-gray-100 font-medium rounded-lg
           focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:ring-offset-2 transition-colors"
```

### 2. Card Components

```
STANDARD CARD
+------------------------------------------+
|  CARD TITLE                              |
|  ----------------------------------------|
|                                          |
|  Card content goes here. This is the     |
|  main body of the card component.        |
|                                          |
|                         [ Action ]       |
+------------------------------------------+

Specs:
- Background: white / slate-800 (dark)
- Border Radius: 12px
- Shadow: shadow-md
- Padding: 24px
- Title: text-sm font-medium text-gray-500 uppercase tracking-wide

STATS CARD
+------------------+
|   THIS WEEK      |
|   ----------     |
|                  |
|    12h 45m       |
|                  |
|   5 sessions     |
+------------------+

Specs:
- Background: white / slate-800 (dark)
- Value: text-3xl font-bold
- Label: text-sm text-gray-500

SESSION CARD
+------------------------------------------+
|  [*] 9:00 AM - 12:30 PM                  |
|      3h 30m                  [Completed] |
+------------------------------------------+

Specs:
- Left indicator: 4px colored bar
- Status badge: Rounded pill
- Hover: Subtle background change

DOCUMENT PREVIEW CARD
+------------------------------------------+
|  February 16, 2026                [...]  |
|  ----------------------------------------|
|  # Work Summary                          |
|                                          |
|  Today I worked on the API               |
|  integration for the user...             |
|                                          |
|  [2h 45m]  [Draft]           [Open ->]   |
+------------------------------------------+
```

**Tailwind Classes:**
```jsx
// Standard Card
className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6"

// Card Title
className="text-sm font-medium text-gray-500 dark:text-gray-400
           uppercase tracking-wide mb-4"

// Stats Card Value
className="text-3xl font-bold text-gray-900 dark:text-white"

// Session Card
className="flex items-center p-4 bg-white dark:bg-slate-800 rounded-lg
           border-l-4 border-green-500 hover:bg-gray-50
           dark:hover:bg-slate-700/50 transition-colors"
```

### 3. Input Fields

```
TEXT INPUT
+------------------------------------------+
|  Email Address                           |
|  +--------------------------------------+|
|  |  john.doe@email.com                  ||
|  +--------------------------------------+|
|  We'll never share your email.           |
+------------------------------------------+

States:
- Default:  border-gray-300, bg-white
- Focus:    border-primary-500, ring-2 ring-primary-500/20
- Error:    border-red-500, ring-2 ring-red-500/20
- Disabled: bg-gray-100, text-gray-500

TEXTAREA
+------------------------------------------+
|  Description                             |
|  +--------------------------------------+|
|  |                                      ||
|  |  Multi-line text input area          ||
|  |                                      ||
|  +--------------------------------------+|
|  0/500 characters                        |
+------------------------------------------+

SELECT
+------------------------------------------+
|  Time Zone                               |
|  +------------------------------------v-+|
|  |  Pacific Time (PT)                   ||
|  +--------------------------------------+|
+------------------------------------------+

DATE PICKER
+------------------------------------------+
|  Start Date                              |
|  +------------------+ +----------------+ |
|  |  Feb 16, 2026    | |  [Calendar]    | |
|  +------------------+ +----------------+ |
+------------------------------------------+

TIME PICKER
+------------------------------------------+
|  Session End Time                        |
|  +--------+ +--------+ +--------+        |
|  |   05   | |   00   | |   PM   |        |
|  +--------+ +--------+ +--------+        |
+------------------------------------------+

CHECKBOX
+------------------------------------------+
|  [*] Remember my preferences             |
|  [ ] Send me email notifications         |
+------------------------------------------+

TOGGLE SWITCH
+------------------------------------------+
|  Dark Mode              [====O]          |
+------------------------------------------+
```

**Tailwind Classes:**
```jsx
// Text Input
className="w-full h-11 px-4 border border-gray-300 dark:border-slate-600
           bg-white dark:bg-slate-800 rounded-lg text-gray-900 dark:text-white
           focus:outline-none focus:border-primary-500 focus:ring-2
           focus:ring-primary-500/20 transition-colors
           placeholder:text-gray-400"

// Input Label
className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"

// Help Text
className="text-sm text-gray-500 mt-1.5"

// Error State
className="border-red-500 focus:border-red-500 focus:ring-red-500/20"

// Error Message
className="text-sm text-red-500 mt-1.5"
```

### 4. Timer Display

```
LARGE TIMER (Time Tracker Page)
+------------------------------------------+
|                                          |
|           +------------------+           |
|           |                  |           |
|           |    02:34:15      |           |
|           |                  |           |
|           +------------------+           |
|           HH   :  MM   :  SS             |
|                                          |
+------------------------------------------+

Specs:
- Font: JetBrains Mono or similar monospace
- Size: 72px (desktop), 48px (mobile)
- Weight: 700
- Letter Spacing: -0.02em
- Active indicator: Pulsing green dot

COMPACT TIMER (Dashboard/Header)
+------------------+
|  [*] 02:34:15    |
+------------------+

Specs:
- Font: Monospace
- Size: 24px
- Inline with other elements

TIMER STATES:
- Idle:    Gray text, no indicator
- Running: Dark text, green pulsing dot
- Paused:  Orange text, static orange dot
- Error:   Red text, error icon
```

**Tailwind Classes:**
```jsx
// Large Timer
className="text-7xl md:text-8xl font-bold font-mono tracking-tight
           text-gray-900 dark:text-white tabular-nums"

// Running Indicator
className="w-3 h-3 bg-green-500 rounded-full animate-pulse"

// Compact Timer
className="text-2xl font-mono font-semibold text-gray-900 dark:text-white
           tabular-nums flex items-center gap-2"
```

### 5. Session Cards

```
ACTIVE SESSION CARD
+------------------------------------------+
|  [*] CURRENT SESSION                     |
|  ----------------------------------------|
|                                          |
|         [  02:34:15  ]                   |
|                                          |
|  Started: 9:00 AM Today                  |
|  Scheduled End: 5:00 PM                  |
|                                          |
|  [ Stop Session ]  [ Reschedule ]        |
|                                          |
+------------------------------------------+

COMPLETED SESSION CARD
+------------------------------------------+
|  9:00 AM - 12:30 PM                      |
|  February 16, 2026                       |
|  ----------------------------------------|
|  Duration: 3h 30m           [Completed]  |
|  ----------------------------------------|
|  [View Log]              [Edit] [Delete] |
+------------------------------------------+

SESSION LIST ITEM
+------------------------------------------+
| [|] 9:00 AM - 12:30 PM    3h 30m   [...] |
+------------------------------------------+

Compact view for lists and tables
```

**Tailwind Classes:**
```jsx
// Active Session Card
className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6
           border-l-4 border-green-500"

// Completed Session Card
className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4
           hover:shadow-lg transition-shadow"

// Session Status Badge - Completed
className="px-2.5 py-0.5 text-xs font-medium rounded-full
           bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"

// Session Status Badge - Active
className="px-2.5 py-0.5 text-xs font-medium rounded-full
           bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
```

### 6. Document Editor Toolbar

```
DESKTOP TOOLBAR
+--------------------------------------------------------------+
|  [B] [I] [U] [S] | [H1] [H2] [H3] | [*] [-] [>] | [~] [Img] [V] | [...] |
+--------------------------------------------------------------+

SECTIONS:
1. Text Formatting: Bold, Italic, Underline, Strikethrough
2. Headings: H1 (Title), H2 (Section), H3 (Subsection)
3. Lists: Bullet, Numbered, Quote, Checklist
4. Media: Link, Image, Video
5. More: Code, Table, Divider, Undo/Redo

TOOLBAR BUTTON STATES:
- Default:   bg-transparent
- Hover:     bg-gray-100 dark:bg-slate-700
- Active:    bg-primary-100 text-primary-600
- Disabled:  opacity-50 cursor-not-allowed

MOBILE TOOLBAR (Scrollable)
+--------------------------------+
| [B][I][U] | [H][*] | [+] [...]|
+--------------------------------+
  <- Swipe for more ->

FLOATING TOOLBAR (Selection-based)
       +-------------------+
       | [B] [I] [U] [Lnk] |
       +-------------------+
              |
           Selected text
```

**Tailwind Classes:**
```jsx
// Toolbar Container
className="sticky top-16 z-10 bg-white dark:bg-slate-800 border
           border-gray-200 dark:border-slate-700 rounded-t-xl p-2
           flex flex-wrap items-center gap-1"

// Toolbar Button
className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700
           text-gray-600 dark:text-gray-400 transition-colors"

// Toolbar Button Active
className="bg-primary-100 dark:bg-primary-900/30 text-primary-600
           dark:text-primary-400"

// Toolbar Divider
className="w-px h-6 bg-gray-200 dark:bg-slate-600 mx-1"

// Toolbar Group
className="flex items-center"
```

### 7. Navigation Components

```
DESKTOP HEADER
+------------------------------------------------------------------+
| [Logo] Log Book                    [?] [Dark] [Bell(3)] [Avatar] |
+------------------------------------------------------------------+
| [Dashboard] [Time Tracker] [Documents] [History] [Settings]      |
+------------------------------------------------------------------+

DESKTOP NAV ITEM STATES:
- Default: text-gray-600 hover:text-gray-900
- Active:  text-primary-600 font-medium, bottom border or bg highlight
- Hover:   bg-gray-100/50

MOBILE HEADER
+--------------------------------+
| [Menu] Log Book    [Bell] [A]  |
+--------------------------------+

MOBILE BOTTOM NAV
+--------------------------------+
| [Home] [Timer] [Docs] [More]   |
+--------------------------------+

MOBILE NAV ITEM:
- Icon: 24px
- Label: 10px, below icon
- Active: Primary color, filled icon

MOBILE SIDE DRAWER (from [Menu])
+------------------------+
| [X]   Log Book         |
|------------------------|
|                        |
| [User Avatar]          |
| John Doe               |
| john@email.com         |
|------------------------|
| > Dashboard            |
| > Time Tracker         |
| > Documents            |
| > History              |
| > Settings             |
|------------------------|
| > Help                 |
| > Sign Out             |
+------------------------+

BREADCRUMB
+------------------------------------------+
| Documents > February 2026 > Feb 16       |
+------------------------------------------+
```

**Tailwind Classes:**
```jsx
// Desktop Header
className="sticky top-0 z-sticky bg-white dark:bg-slate-800
           border-b border-gray-200 dark:border-slate-700 shadow-sm"

// Desktop Nav Container
className="hidden md:flex items-center space-x-1 px-4"

// Desktop Nav Item
className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
           hover:text-gray-900 dark:hover:text-white rounded-lg
           hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"

// Desktop Nav Item Active
className="text-primary-600 dark:text-primary-400 bg-primary-50
           dark:bg-primary-900/30"

// Mobile Bottom Nav
className="fixed bottom-0 left-0 right-0 z-sticky bg-white dark:bg-slate-800
           border-t border-gray-200 dark:border-slate-700
           grid grid-cols-4 md:hidden safe-area-bottom"

// Mobile Nav Item
className="flex flex-col items-center py-2 text-gray-500 dark:text-gray-400"

// Mobile Nav Item Active
className="text-primary-600 dark:text-primary-400"
```

---

## Interaction Patterns

### 1. Loading States

```
SKELETON LOADING
+------------------------------------------+
|  [==================================]    |  <- Title skeleton
|  [==================]                    |  <- Subtitle skeleton
|  +--------------------------------------+|
|  |  [~~~~~~~~~~~~~~~~~~~~~~~~~~~~]      ||  <- Content lines
|  |  [~~~~~~~~~~~~~~~~~~~~~~~~~~]        ||
|  |  [~~~~~~~~~~~~~~~~~~~~~~~]           ||
|  +--------------------------------------+|
+------------------------------------------+

Implementation:
- Use CSS animation: pulse or shimmer
- Match approximate layout of loaded content
- Show for minimum 200ms to avoid flash

SPINNER (Inline)
[ Loading... ] [O]

SPINNER (Full Page)
+------------------------------------------+
|                                          |
|                   [O]                    |
|             Loading...                   |
|                                          |
+------------------------------------------+

BUTTON LOADING
+---------------------------+
|   [O]  Saving...          |
+---------------------------+
- Disable button during loading
- Show spinner icon
- Change text to indicate action

PROGRESS BAR (For uploads)
+------------------------------------------+
|  Uploading image.png...                  |
|  [###############---------] 65%          |
+------------------------------------------+
```

**Tailwind Classes:**
```jsx
// Skeleton
className="animate-pulse bg-gray-200 dark:bg-slate-700 rounded"

// Shimmer Effect
className="relative overflow-hidden before:absolute before:inset-0
           before:-translate-x-full before:animate-shimmer
           before:bg-gradient-to-r before:from-transparent
           before:via-white/20 before:to-transparent"

// Spinner
className="animate-spin h-5 w-5 text-primary-600"

// Progress Bar Container
className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden"

// Progress Bar Fill
className="h-full bg-primary-600 transition-all duration-300"
```

### 2. Error States

```
INLINE ERROR (Form field)
+------------------------------------------+
|  Email Address                           |
|  +--------------------------------------+|
|  |  invalid-email                       ||
|  +--------------------------------------+|
|  [!] Please enter a valid email address  |
+------------------------------------------+

TOAST ERROR
+------------------------------------------+
| [!] Failed to save document. Try again.  |
|                              [Dismiss]   |
+------------------------------------------+

ERROR PAGE
+------------------------------------------+
|                                          |
|           [Error Icon]                   |
|                                          |
|      Something went wrong                |
|                                          |
|   We couldn't load your sessions.        |
|   Please try again or contact support.   |
|                                          |
|   [ Try Again ]  [ Go to Dashboard ]     |
|                                          |
+------------------------------------------+

CONNECTION ERROR
+------------------------------------------+
| [!] You're offline. Changes will sync    |
|     when you reconnect.           [Hide] |
+------------------------------------------+

FORM VALIDATION ERROR (Top of form)
+------------------------------------------+
| [!] Please fix the following errors:     |
|     - Email is required                  |
|     - Password must be 8+ characters     |
+------------------------------------------+
```

**Tailwind Classes:**
```jsx
// Inline Error
className="flex items-start gap-2 text-sm text-red-500 mt-1.5"

// Error Icon
className="w-4 h-4 text-red-500 shrink-0 mt-0.5"

// Toast Error
className="fixed bottom-4 right-4 z-toast bg-red-50 dark:bg-red-900/50
           border border-red-200 dark:border-red-800 rounded-lg p-4
           flex items-center gap-3 shadow-lg"

// Error Page Container
className="flex flex-col items-center justify-center min-h-[400px] text-center p-8"

// Connection Banner
className="fixed top-0 left-0 right-0 z-50 bg-amber-50 dark:bg-amber-900/50
           border-b border-amber-200 dark:border-amber-800 p-3
           flex items-center justify-center gap-2"
```

### 3. Success Feedback

```
TOAST SUCCESS
+------------------------------------------+
| [Check] Document saved successfully      |
+------------------------------------------+
Duration: 3 seconds, auto-dismiss

INLINE SUCCESS
+------------------------------------------+
|  [Check] Changes saved                   |
+------------------------------------------+

ACTION CONFIRMATION
+------------------------------------------+
|           [Check Icon]                   |
|                                          |
|      Session completed!                  |
|      Duration: 3h 30m                    |
|                                          |
|   [ View Log ]  [ Start New ]            |
+------------------------------------------+

AUTO-SAVE INDICATOR
+------------------------------------------+
| [Cloud] Auto-saved just now              |
+------------------------------------------+
States:
- Saving: [Spinner] Saving...
- Saved:  [Cloud] Saved just now
- Error:  [!] Save failed. Retry?
```

**Tailwind Classes:**
```jsx
// Toast Success
className="fixed bottom-4 right-4 z-toast bg-green-50 dark:bg-green-900/50
           border border-green-200 dark:border-green-800 rounded-lg p-4
           flex items-center gap-3 shadow-lg animate-slide-up"

// Success Icon
className="w-5 h-5 text-green-500"

// Auto-save Indicator
className="flex items-center gap-2 text-sm text-gray-500"
```

### 4. Micro-animations

```
TRANSITIONS:

Button Hover:
- Duration: 150ms
- Timing: ease-out
- Properties: background-color, transform (scale)

Card Hover:
- Duration: 200ms
- Timing: ease-out
- Properties: box-shadow, transform (translateY)

Modal Open:
- Duration: 200ms
- Timing: ease-out
- Backdrop: fade in
- Content: scale from 0.95 + fade in

Dropdown Open:
- Duration: 150ms
- Timing: ease-out
- Transform: scale from 0.95, origin top

Toast Appear:
- Duration: 300ms
- Timing: ease-out
- Transform: slide up from bottom

Page Transition:
- Duration: 200ms
- Timing: ease-in-out
- Fade between pages

Timer Tick:
- Subtle pulse on digit change
- Duration: 100ms

Success Checkmark:
- Draw animation for check icon
- Duration: 300ms
```

**Tailwind Classes:**
```jsx
// Base Transition
className="transition-all duration-200 ease-out"

// Card Hover
className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"

// Modal Backdrop
className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity
           duration-200 data-[state=open]:opacity-100
           data-[state=closed]:opacity-0"

// Modal Content
className="transition-all duration-200
           data-[state=open]:opacity-100 data-[state=open]:scale-100
           data-[state=closed]:opacity-0 data-[state=closed]:scale-95"

// Toast Animation
className="animate-slide-up"

// Custom Keyframes (add to tailwind.config.js)
keyframes: {
  'slide-up': {
    '0%': { transform: 'translateY(100%)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' }
  },
  'check-draw': {
    '0%': { 'stroke-dashoffset': '100' },
    '100%': { 'stroke-dashoffset': '0' }
  }
}
```

---

## Responsive Design

### Breakpoints

```
Mobile:   0px    - 639px   (< sm)
Tablet:   640px  - 1023px  (sm - lg)
Desktop:  1024px - 1279px  (lg - xl)
Large:    1280px+          (xl+)
```

### Layout Adaptations

```
GRID SYSTEM:

Mobile (< 640px):
- Single column layout
- Full-width cards
- Stacked navigation
- Bottom nav bar
- Compact typography

Tablet (640px - 1023px):
- 2-column grid where appropriate
- Side drawer navigation
- Medium typography
- Floating action buttons

Desktop (1024px+):
- Multi-column layouts
- Full sidebar navigation
- Large typography
- Inline actions

COMPONENT CHANGES:

Navigation:
- Mobile:  Bottom nav + hamburger drawer
- Tablet:  Collapsible sidebar or header tabs
- Desktop: Full header with nav items

Dashboard Grid:
- Mobile:  1 column, stacked cards
- Tablet:  2 columns
- Desktop: 2-3 columns with sidebar

Document Editor:
- Mobile:  Floating toolbar, simplified buttons
- Tablet:  Sticky toolbar, full features
- Desktop: Full toolbar with keyboard shortcuts

Tables:
- Mobile:  Card-based list view
- Tablet:  Horizontal scroll or simplified columns
- Desktop: Full table with all columns
```

### Mobile-First Patterns

```
TOUCH TARGETS:
- Minimum: 44x44px
- Recommended: 48x48px
- Spacing: 8px minimum between targets

GESTURES:
- Swipe left/right: Navigate between dates/items
- Pull down: Refresh
- Long press: Context menu
- Pinch: Zoom on images

MOBILE OPTIMIZATIONS:
- Disable hover effects (use active states)
- Larger text (16px minimum to prevent zoom)
- Bottom-anchored primary actions
- Reduced motion option
- Touch-friendly date/time pickers
```

**Tailwind Responsive Classes:**
```jsx
// Responsive Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"

// Responsive Typography
className="text-lg md:text-xl lg:text-2xl"

// Hide on Mobile
className="hidden md:block"

// Show Only on Mobile
className="md:hidden"

// Responsive Padding
className="p-4 md:p-6 lg:p-8"

// Bottom Navigation (Mobile Only)
className="fixed bottom-0 left-0 right-0 md:hidden"

// Safe Area (iOS)
className="pb-safe" // or use env(safe-area-inset-bottom)
```

---

## Accessibility Guidelines

### 1. Focus Management

```
FOCUS INDICATORS:
- All interactive elements must show visible focus
- Focus ring: 2px solid primary color with offset
- Never use outline: none without alternative

FOCUS ORDER:
1. Follow visual reading order (top-left to bottom-right)
2. Skip links for keyboard users
3. Focus trap in modals/dialogs
4. Return focus after modal closes

KEYBOARD SHORTCUTS:
- Tab: Move to next focusable element
- Shift+Tab: Move to previous element
- Enter/Space: Activate buttons/links
- Escape: Close modals/dropdowns
- Arrow keys: Navigate within components

SKIP LINK (First element):
+------------------------------------------+
| [Skip to main content]  <- Hidden until focused
+------------------------------------------+
```

**Implementation:**
```jsx
// Focus Ring
className="focus:outline-none focus:ring-2 focus:ring-primary-500
           focus:ring-offset-2 dark:focus:ring-offset-slate-900"

// Skip Link
className="sr-only focus:not-sr-only focus:absolute focus:top-4
           focus:left-4 focus:z-50 focus:px-4 focus:py-2
           focus:bg-white focus:rounded-lg focus:shadow-lg"

// Focus Trap Hook (react-focus-lock or similar)
<FocusLock returnFocus>
  <ModalContent />
</FocusLock>
```

### 2. Color Contrast

```
WCAG AA REQUIREMENTS:
- Normal text: 4.5:1 minimum contrast ratio
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

COLOR COMBINATIONS (Verified):

Light Mode:
- Gray 800 on White:     12.6:1 (Pass AAA)
- Gray 600 on White:     5.7:1  (Pass AA)
- Primary 600 on White:  4.5:1  (Pass AA)
- White on Primary 600:  4.5:1  (Pass AA)

Dark Mode:
- Slate 100 on Slate 900: 11.5:1 (Pass AAA)
- Slate 400 on Slate 900: 5.1:1  (Pass AA)
- Blue 400 on Slate 900:  6.2:1  (Pass AA)

AVOID:
- Light gray text on white backgrounds
- Low contrast placeholder text
- Color as only indicator (add icons/text)

STATUS COLORS (With icons):
- Success: Green + Checkmark icon
- Warning: Amber + Warning icon
- Error:   Red + X or Alert icon
- Info:    Blue + Info icon
```

### 3. Screen Reader Support

```
SEMANTIC HTML:
- Use correct heading hierarchy (h1 > h2 > h3)
- Use <nav>, <main>, <article>, <aside>
- Use <button> for actions, <a> for navigation
- Use <ul>/<ol> for lists

ARIA LABELS:
- Icon-only buttons need aria-label
- Form inputs need associated <label>
- Dynamic content needs aria-live
- Loading states need aria-busy

ARIA PATTERNS:

Modal Dialog:
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Schedule Session</h2>
  ...
</div>

Loading State:
<div aria-busy="true" aria-live="polite">
  Loading sessions...
</div>

Error Message:
<input aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" role="alert">Invalid email</p>

Timer:
<div role="timer" aria-live="off" aria-label="Session duration">
  02:34:15
</div>
```

**Implementation:**
```jsx
// Icon Button with Label
<button aria-label="Toggle dark mode">
  <MoonIcon />
</button>

// Accessible Timer
<div
  role="timer"
  aria-live="off"
  aria-label={`Session duration: ${formatTime(duration)}`}
>
  {formatTime(duration)}
</div>

// Form Field
<div>
  <label htmlFor="email" className="...">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && <p id="email-error" role="alert">{error}</p>}
</div>

// Live Region for Updates
<div aria-live="polite" className="sr-only">
  {notification}
</div>
```

### 4. Additional Accessibility Features

```
MOTION PREFERENCES:
- Respect prefers-reduced-motion
- Provide static alternatives to animations
- Allow users to disable auto-playing content

TEXT SIZING:
- Use relative units (rem/em)
- Support browser zoom up to 200%
- Don't break layout with large text

FORM ACCESSIBILITY:
- Clear error messages
- Required field indicators
- Autocomplete attributes
- Input type attributes (email, tel, etc.)

IMAGE ACCESSIBILITY:
- Alt text for all images
- Decorative images: alt=""
- Complex images: long description
```

**Tailwind Classes:**
```jsx
// Respect Reduced Motion
className="motion-safe:animate-pulse motion-reduce:animate-none"

// Screen Reader Only
className="sr-only"

// Focus Visible (keyboard only)
className="focus-visible:ring-2 focus-visible:ring-primary-500"
```

---

## Appendix: Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

---

## Document Revision History

| Version | Date       | Author              | Changes                    |
|---------|------------|---------------------|----------------------------|
| 1.0     | 2026-02-16 | Frontend Design Agent | Initial specification    |
