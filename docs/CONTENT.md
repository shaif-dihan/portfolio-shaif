# Content

How to update the content on shaif.dev. Each section is a single `.astro` file in `src/components/` — open the file, edit the data array at the top, save. The dev server hot-reloads.

## Adding or editing a project

**File:** [`src/components/Projects.astro`](../src/components/Projects.astro)

Projects live in the `groups` array, organized by category. To add a project to an existing category, push a new object into that group's `projects` array:

```ts
{
  name: "MyApp",
  description: "One-line description (1–2 lines max).",
  highlights: ["Standout feature", "Another feature"],  // optional, shown as ★ chips
  tags: ["Flutter", "Firebase"],                         // tech stack, shown subtly
  platforms: ["Android", "iOS"],                         // shown as monospaced pills
  links: [{ label: "myapp.com", url: "https://..." }],   // optional, shown next to name
}
```

To add a **new category**, push a new group:

```ts
{
  category: "New Category Name",
  projects: [/* ... */],
}
```

Update the `15 apps shipped...` summary text near the top of the section if the count changes.

## Adding or editing experience

**File:** [`src/components/Experience.astro`](../src/components/Experience.astro)

Edit the `jobs` array. Each job:

```ts
{
  company: "Company Name",
  role: "Role Title",
  period: "Month YYYY – Month YYYY",  // or "– Present"
  points: [
    "Bullet — short, action-led, one line",
    "Another bullet",
  ],
}
```

Bullets beyond the first **4** auto-collapse behind a "Show N more" button. Adjust `VISIBLE_BULLETS` at the bottom of the frontmatter to change that threshold.

## Editing skills

**File:** [`src/components/Skills.astro`](../src/components/Skills.astro)

Edit the `categories` array. Each category renders as a heading + flat list of tags:

```ts
{
  title: "Category Name",
  skills: ["Skill 1", "Skill 2", "Skill 3"],
}
```

Reorder by moving objects in the array. Categories layout is responsive (1/2/3 columns).

## Editing the hero

**File:** [`src/components/Hero.astro`](../src/components/Hero.astro)

Direct edits — change the `<h1>`, the tagline `<p>`, or the social icon URLs. Bolded keywords inside the tagline use `<span class="font-medium text-gray-800 dark:text-gray-200">`.

## Editing highlights

**File:** [`src/components/Highlights.astro`](../src/components/Highlights.astro)

Edit the `highlights` array (4 items). Each:

```ts
{
  title: "Card title",
  description: "2–3 sentence pitch.",
  icon: "mobile",  // one of: mobile, shield, wallet, compass
}
```

To add a new icon, add an SVG path entry to the `icons` map in the same file.

## Editing education

**File:** [`src/components/Education.astro`](../src/components/Education.astro)

Single card; edit the markup directly. Add more cards by duplicating the `<div class="rounded-xl ...">` block.

## Editing contact

**File:** [`src/components/Contact.astro`](../src/components/Contact.astro)

Edit the email, LinkedIn URL, GitHub URL, and the two phone `tel:` links inline.

## Editing activities

**File:** [`src/components/Activities.astro`](../src/components/Activities.astro)

Two arrays:

```ts
const activities = [{ role: "...", org: "..." }, ...];
const achievements = ["...", "..."];
```

## Updating navigation

**File:** [`src/components/Nav.astro`](../src/components/Nav.astro)

Edit the `links` array at the top. Each link's `href` should match a section's `id`. Same array drives both desktop and mobile menus.

## Adding a new section

1. Create `src/components/MySection.astro` — wrap content in `<section id="my-section" class="px-6 py-24">`.
2. Import and render it in `src/pages/index.astro` between existing sections.
3. Add a nav link in `src/components/Nav.astro` (`{ label: "My Section", href: "#my-section" }`).
4. Alternate background color: use `bg-gray-50/50 dark:bg-gray-900/50` for visual rhythm between sections.

## Updating SEO / metadata

**File:** [`src/layouts/Layout.astro`](../src/layouts/Layout.astro)

The `description` constant at the top drives `<meta description>`, OG tags, and Twitter cards. Page title is passed via the `title` prop from `index.astro`.

## Updating the favicon

**File:** [`public/favicon.svg`](../public/favicon.svg)

Replace the SVG. It's referenced in `Layout.astro` as `/favicon.svg`. To use a PNG, drop it in `public/` and update the `<link rel="icon">` tag.

## Theme colors / fonts

**File:** [`tailwind.config.mjs`](../tailwind.config.mjs)

- `fontSize` overrides the entire scale (currently 1.3× default)
- `fontFamily` defines `font-sans` (Inter) and `font-mono` (JetBrains Mono)
- Add custom colors under `theme.extend.colors`

If you change fonts, also update the Google Fonts `<link>` in `Layout.astro`.
