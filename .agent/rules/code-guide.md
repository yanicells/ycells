---
trigger: always_on
---

Project Specific Rules

- Tech Stack Priority: Always use shadcn/ui with Base UI primitives and Lucide icons. If a required component is missing from @/components/ui, immediately install the pnpm dlx shadcn@latest add <component> command before writing the code.
- Layout Focus: Design with the main focus for Desktop/iPad (MD/LG breakpoints). Use a "sidebar-first" approach that maximizes screen real estate.
- Functionality > Aesthetics: Prioritize Utility over Polish.
- No complex Framer Motion or <AnimatePresence>.
- No custom CSS for glassmorphism or gradients.
- Yes to standard Tailwind hover states (hover:bg-accent) and focus rings for accessibility.
- Efficient Code: Use Server Components by default. Keep client-side logic minimal. Use Lucide icons consistently for visual cues without adding labels if the icon is industry-standard (e.g., a trash can for delete).
- Workflow: If a task requires a new library (e.g., date-fns, zod), list the installation command at the top of the response.
- Updates: For areas where the code reads from the database, have a refresh button to manually refresh that. So manual updates. However, when creating or updating something from the database, revaliate those paths that are affected by that data. Essentially - manual refresh - refresh when doing crud operations.
- Component File Structure: Separate custom components specific to a page in a separate folder (e.g. components/dashboard) while adding shared components in a shared folder inside the components folder (e.g. components/shared).
- DB File Structure: Separate database queries (db/queries) and actions (lib/actions) into their own folder.
- Instant UI & Loading States: Implement Skeleton Loading patterns for all data-driven sections. Use React Suspense with @/components/ui/skeleton to ensure the static layout (sidebar/header) renders instantly while background data fetching occurs. For manual refreshes, provide a visual loading indicator within the specific component being updated to maintain a responsive feel without blocking the entire UI. (e.g. components/dashboard/data-view.tsx: The component that calls the DB query. components/dashboard/data-skeleton.tsx: The static fallback UI.)
