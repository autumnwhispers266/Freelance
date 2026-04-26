
# Worklin — Work. Linked.

A minimal, corporate-grade freelance marketplace. Off-white background, deep navy accents, Inter typography, 8px grid, real editorial photography, no gradients or decorative shapes. Pointer cursor on every interactive element.

## Stack & Foundations

- **Auth & data**: Lovable Cloud (real email/password auth, role-based routing).
- **Roles**: `freelancer`, `client`, `admin` stored in a separate `user_roles` table (security-best-practice). Login redirects:
  - admin → `/admin`
  - freelancer → `/dashboard`
  - client → `/dashboard` (same shell, client-relevant items)
- **Design tokens** in `styles.css`: bg `#F8F8F6`, surface `#FFFFFF`, border `#E4E4E4`, primary navy `#1B2A4A`, slate `#6B7280`, red `#DC2626`, green `#16A34A`, amber `#D97706`. Shadow capped at `0 2px 4px rgba(0,0,0,0.08)`. Border radius 4px on buttons/cards.
- **Global rule**: every `<button>`, `<a>`, role="button", icon button, card-selector, sidebar item, pagination button, bookmark icon → `cursor: pointer` via base CSS layer.
- **Photography**: Curated editorial Unsplash photos for hero, category cards, and dashboard empty states (workspaces, code editors, microphones, etc.). No smiling-people stock.
- **Typography**: Inter only, weights 400/600/700, body line-height 1.6.

## Database (Lovable Cloud)

- `profiles` — id, full_name, phone, avatar_initials, primary_category, bio, hourly_rate, paypal_email, theme, email_notifications, status (`active`|`restricted`), created_at.
- `user_roles` — user_id, role (`admin`|`freelancer`|`client`), with `has_role()` security-definer function.
- `freelancer_profiles` — skills[], test_score, verified (bool), pending_verification.
- `categories` — slug, name, description, image_url, image_filename (admin-editable).
- `jobs` — title, description, category_id, rate_min, rate_max, status (`open`|`under_review`|`filled`|`archived`), client_id, posted_at.
- `bids` — job_id, freelancer_id, proposed_rate, cover_note, status (`under_review`|`engaged`|`not_selected`|`approved`|`declined`), submitted_at.
- `favourites` — user_id, job_id.
- `portfolio_items` — user_id, title, description, image_url, external_link, category.
- `notifications` — user_id, message, read, created_at.
- `broadcasts` — admin_id, recipient_group, message, sent_at.
- `transcription_attempts` — user_id, test_number, score, passed, attempt_number.

All tables RLS-protected. Roles checked via `has_role(auth.uid(), 'admin')`.

## Routes (TanStack file-based)

```
/                              Landing
/jobs                          Job listings (filters + pagination)
/jobs/$jobId                   Job detail + bid form
/how-it-works                  Static info page
/categories                    Category browse
/about                         About
/login                         Login
/signup                        Sign up (with role selector card)
/onboarding                    3-step onboarding
/transcription-test            English comprehension test (3 audio clips)
/restricted                    Account Restricted page (no nav/footer)

/_authenticated/dashboard                  Overview
/_authenticated/dashboard/bids             My Bids
/_authenticated/dashboard/active           Active Jobs
/_authenticated/dashboard/earnings         Earnings
/_authenticated/dashboard/favourites       Saved jobs
/_authenticated/dashboard/notifications    Notifications
/_authenticated/dashboard/portfolio        Portfolio grid + add modal

/_admin/admin                       Overview
/_admin/admin/verify                Verify Freelancers table
/_admin/admin/bids                  Manage Bids
/_admin/admin/jobs                  Job Management
/_admin/admin/payouts               Payouts
/_admin/admin/accounts              Accounts
/_admin/admin/broadcast             Broadcast composer
/_admin/admin/content               Content Manager (Categories | Service Descriptions tabs)
```

`_authenticated` and `_admin` are pathless layout routes guarding via `beforeLoad` + `redirect()`.

## Page-by-page scope

1. **Global Nav** — Fixed top nav, navy wordmark left, center links, right side swaps between Login/Get Started buttons (logged out) and bell+badge + initials avatar dropdown (logged in). Mobile hamburger. Avatar opens the slide-out Profile Settings panel.

2. **Landing** — Two-column hero (heading + Browse Jobs CTA + bordered workspace photo). Horizontal category tabs (active = navy filled). Featured Jobs carousel with two flat outlined arrow buttons (no scrollbar; clicking arrows shifts a window of 3 cards). How It Works 3-column with large light-grey numerals behind headings. 3×2 photographic category grid with bottom dark overlay strip. Footer with wordmark + 4 link columns.

3. **Sign Up** — Centered white card. Email, Password (working eye toggle), Confirm Password (independent working eye toggle). Two large clickable role-selector cards (Freelancer / Client) — selected card gets navy border + light navy tint. Create Account button. Link to Login.

4. **Login** — Email, Password (eye toggle), Remember me, Forgot password. After login, navigation immediately reflects logged-in state.

5. **Onboarding (3 steps)** — Numbered progress with connecting line.
   - Step 1: Full Name, Phone.
   - Step 2: Category dropdown, Skills multi-select with removable tags, Bio textarea (160-char counter), Hourly Rate. If category = Transcription, show flat amber banner about the comprehension test.
   - Step 3: PayPal Email + helper note + Skip for Now link.

6. **Transcription Test** — 3 short royalty-free MP3 clips (hosted as static assets). Numbered progress (Test 1/2/3 of 3). Custom flat audio player: square play button, grey scrubber bar with navy progress fill, duration label. Textarea + char counter. Scoring by normalized string similarity vs hidden reference; pass threshold ≥ 80% per clip. Up to 3 attempts. Results screen with large percentage + Pass (green) / Fail (red) and next-step button.

7. **Job Listings** — 260px filter sidebar (search, category checkboxes, budget min/max + Apply, skills tags multi-select, Clear All). Main area: results count + Sort By, then card grid with status badges. Filled jobs show grey overlay + replacement label. Pagination bar. Mobile: filters become a drawer; tabs scroll horizontally.

8. **Job Detail** — 860px main column + 300px sticky sidebar (rate, Place Bid, Save to Favourites). Bid form with Proposed Rate, Cover Note (300-char counter), Submit. Filled job hides sidebar buttons + bid form, shows grey banner.

9. **Freelancer Dashboard** — 240px sidebar with active-state 3px navy left border + tint. Overview: 4 stat cards (Bids Submitted, Jobs Active, Earnings This Month, Unread Notifications). Recent Bids table with alternating row shading and status badges. Saved Jobs preview row + View All link.

10. **Favourites Page** — Grid of saved jobs (filled navy bookmark = saved; click removes + card disappears). View Job outlined button per card. Empty state: line bookmark icon + heading + Browse Jobs CTA.

11. **Portfolio Page** — Grid of cards (thumbnail or grey block, title, description, Edit/Remove). Add Portfolio Item button opens modal (Title, Description, drag-and-drop upload, External Link, Category, Save/Cancel). Uploads stored in Lovable Cloud storage.

12. **Profile Settings Panel** — 380px right slide-out triggered by avatar click. Avatar initials, name, primary category. Inline-editable Phone and PayPal Email (pencil icon). Theme toggle (Light/Dark, flat rectangular switch — applies dark mode but default stays light). Email Notifications toggle. Separator + muted-red Logout text button → returns to landing in logged-out state.

13. **Admin Dashboard** — Sidebar (Overview, Verify Freelancers, Manage Bids, Job Management, Payouts, Accounts, Broadcast, Content Manager). Each page is a properly designed table with action buttons (Verify/Reject, Approve/Decline, Mark as Filled/Archive, Suspend/Terminate). Broadcast: recipient dropdown + textarea + Send.

14. **Content Manager** — Two tabs:
    - **Category Cards**: 2×3 grid of editable cards — thumbnail preview, name, description, Change Image (modal with drag-and-drop upload, writes to storage + updates `categories.image_url`), Edit Description (inline textarea + Save/Cancel). Filename label below thumb. Helper note at top.
    - **Service Descriptions**: list rows with Edit button → inline textarea with char counter, Save / Discard. Only one row editable at a time; opening another prompts confirm.
    Changes reflect immediately on landing + listings (categories table is the source of truth).

15. **Account Restricted** — Standalone page (no nav/footer): wordmark, amber-tinted banner with 3px left border, body copy, outlined Contact Support button. Triggered when `profiles.status = 'restricted'` (admin Suspend action sets this and a guard redirects on next navigation).

## Seed data (rich)

- 6 categories (Creative & Design, Writing & Content, Web & IT, Marketing & Admin, Media & Production, Transcription) with editorial photos.
- ~20 jobs spread across categories with mixed statuses.
- 8 sample freelancers (varied skills, 2 pending verification, 1 transcription-tested).
- 2 clients, 1 admin (`admin@worklin.test`).
- Sample bids in each status, ~5 saved favourites, ~6 portfolio items, recent notifications, recent admin activity feed.

## Out of scope (this build)

- Real payouts/Stripe — Earnings shown as seeded numbers only.
- Real email delivery for Broadcast/Notifications — written to DB and shown in-app.
- File virus scanning on uploads.

After approval I'll scaffold the schema + RLS, build the design system tokens, then ship the routes in the order above.
