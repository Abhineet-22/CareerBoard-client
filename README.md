# CareerBoard — Client

> The React frontend for the CareerBoard job-board platform. Built with Vite, React 19, and React Router 7, it delivers a role-aware UI for two distinct user types — Candidates browsing and applying to jobs, and Recruiters posting and managing their listings.

**Live app:** https://career-board-client.vercel.app  
**Backend repo:** https://github.com/Abhineet-22/CareerBoard-server

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Routing & Access Control](#routing--access-control)
- [Pages](#pages)
  - [AuthPage](#authpage--auth)
  - [JobListings](#joblistings--)
  - [ApplyJob](#applyjob--applyid)
  - [PostJob](#postjob--post-job)
  - [RecruiterJobs](#recruiterjobs--recruiterjobs)
- [Components](#components)
  - [Navbar](#navbar)
  - [JobCard](#jobcard)
  - [FilterSidebar](#filtersidebar)
- [State Management & Auth](#state-management--auth)
  - [AuthContext](#authcontext)
  - [authStorage utility](#authstorage-utility)
- [API Layer](#api-layer)
- [Styling](#styling)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
  - [Building for Production](#building-for-production)
- [Deployment](#deployment)

---

## Overview

CareerBoard Client is a single-page application (SPA) that connects job seekers with recruiters. The UI adapts entirely based on the authenticated user's role:

- **Candidates** land on the job listings page, can filter and search openings, and submit detailed multi-step applications with a resume upload.
- **Recruiters** land on their personal job dashboard, can post new listings through a guided 3-step form, and edit or delete their existing postings inline.

Unauthenticated visitors are redirected to the login/register page. Once logged in, users are automatically routed to the correct experience for their role.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios v1 |
| Linting | ESLint 9 with `eslint-plugin-react-hooks` |
| Styling | Plain CSS with CSS custom properties (variables) |
| Deployment | Vercel |

---

## Project Structure

```
CareerBoard-client/
├── index.html                        # Vite HTML shell
├── vite.config.js                    # Vite config — React plugin
├── eslint.config.js                  # ESLint flat config
├── package.json
│
├── public/
│   ├── blue_books_binders_12413.ico  # Favicon
│   ├── favicon.svg
│   └── icons.svg                     # SVG icon sprite
│
└── src/
    ├── main.jsx                      # React entry point — mounts App in StrictMode
    ├── App.jsx                       # Router setup, route guards, layout
    ├── App.css                       # Global component and layout styles
    ├── index.css                     # CSS custom properties (design tokens)
    │
    ├── api/
    │   └── index.js                  # Axios instance + all API call functions
    │
    ├── context/
    │   └── AuthContext.jsx           # Auth state, login/register/logout, useAuth hook
    │
    ├── utils/
    │   └── authStorage.js            # localStorage helpers for JWT token
    │
    ├── components/
    │   ├── Navbar.jsx                # Top navigation bar (role-aware links)
    │   ├── JobCard.jsx               # Individual job card for candidate view
    │   └── FilterSidebar.jsx        # Reusable filter sidebar component
    │
    ├── pages/
    │   ├── AuthPage.jsx              # Login / Register page
    │   ├── JobListings.jsx           # Candidate job feed with search & filters
    │   ├── ApplyJob.jsx              # 3-step job application form
    │   ├── PostJob.jsx               # 3-step job posting form (Recruiter)
    │   └── RecruiterJobs.jsx         # Recruiter's posted jobs dashboard
    │
    └── assets/
        └── hero.png                  # Hero section background image
```

---

## Routing & Access Control

Routes are defined in `App.jsx` using React Router v7. Three custom route guard wrappers enforce role-based access:

| Guard Component | Behaviour |
|---|---|
| `CandidateOnlyRoute` | Requires auth. Redirects unauthenticated users to `/auth`. Redirects Recruiters to `/recruiter/jobs`. |
| `RecruiterOnlyRoute` | Requires auth. Redirects unauthenticated users to `/auth`. Redirects Candidates to `/`. |
| `AuthOnlyRoute` | Renders children only for unauthenticated users. Redirects logged-in users to their role's home. |

All guards check `loading` from `AuthContext` before redirecting, preventing flash-of-wrong-content during the initial token validation request.

### Route Table

| Path | Page | Guard | Accessible By |
|---|---|---|---|
| `/` | `JobListings` | `CandidateOnlyRoute` | Candidates only |
| `/apply/:id` | `ApplyJob` | `CandidateOnlyRoute` | Candidates only |
| `/auth` | `AuthPage` | `AuthOnlyRoute` | Unauthenticated only |
| `/post-job` | `PostJob` | `RecruiterOnlyRoute` | Recruiters only |
| `/recruiter/jobs` | `RecruiterJobs` | `RecruiterOnlyRoute` | Recruiters only |

---

## Pages

### AuthPage — `/auth`

A unified login and registration page with a toggle between modes.

**Behaviour:**
- Defaults to `login` mode. A toggle button switches to `register` mode and back.
- Login form collects `email` and `password`.
- Register form adds `name` and a `role` dropdown (`Candidate` / `Recruiter`).
- On success, calls `login()` or `register()` from `AuthContext`, which stores the JWT and sets user state, then navigates to the appropriate role home (`/` for Candidates, `/recruiter/jobs` for Recruiters).
- Inline `error-banner` displays API error messages (e.g. wrong password, duplicate email).
- Submit button shows `"Please wait…"` while the request is in flight.

---

### JobListings — `/`

The main candidate-facing page. Displays all available jobs with live filtering and full-text search.

**Features:**
- **Hero search bar** — searches across `jobTitle`, `companyName`, and `skills`. Triggers on Enter keypress or clicking the Search button.
- **Filter sidebar** — checkboxes for Category, Experience level, Job type, and Work arrangement. All filters are multi-select and combine with the search query.
- **Live filtering** — filters are sent as query parameters to `GET /api/jobs`. The job list re-fetches automatically whenever any filter changes.
- **Results count** — shows the number of matching jobs in real time.
- **Loading skeletons** — three animated `SkeletonCard` placeholders render while the fetch is in progress.
- **Empty state** — a message and "Clear filters" button when no jobs match.
- **Error state** — an error banner with a "Retry" button if the API call fails.
- **Clear all** — resets both search text and all filter checkboxes simultaneously.

**Query param mapping:**

| Filter | API param |
|---|---|
| Search text | `q` |
| Category | `category` (comma-separated) |
| Experience | `experience` (comma-separated) |
| Job type | `type` (comma-separated) |
| Work arrangement | `workArrangement` (comma-separated) |

---

### ApplyJob — `/apply/:id`

A 3-step application form for candidates to apply to a specific job.

**Step 1 — Your profile:**
- First name, last name, email, phone, location (all required)
- LinkedIn profile URL, portfolio / GitHub URL (optional, validated with regex)
- Resume upload (required) — click-to-upload zone accepting PDF, DOC, DOCX up to 5 MB. Validates file extension and size client-side before upload.

**Step 2 — Experience & skills:**
- Total experience (dropdown), current/last role, current/last company (all required)
- Skills tag input — type a skill and press Enter or comma to add; up to 12 tags; minimum 2 required
- Notice period (dropdown, required)
- Expected salary (optional text + unit selector)

**Step 3 — Cover message:**
- Cover message textarea (required, min 100 characters) with live character counter
- How did you hear about this role? (optional dropdown)
- Referral name (optional)
- Privacy consent checkbox (required to submit)

**UX details:**
- `StepBar` component shows progress with numbered circles and connecting lines; completed steps show a ✓ tick.
- A `JobBanner` at the top of the page shows the target job's title, company, location, and tags.
- A `ProgressBar` strip below the banner fills proportionally (33% / 66% / 100%) as steps advance.
- Per-field validation runs on blur (as the user leaves each field); full step validation runs on "Continue".
- On success, a `SuccessScreen` replaces the form, confirming the applicant's name, email, notice period, and a short application ID derived from the MongoDB `_id`.
- The form is submitted as `multipart/form-data` to support the file upload; `skills` is JSON-stringified before appending.

---

### PostJob — `/post-job`

A 3-step form for Recruiters to create a new job listing.

**Step 1 — Company:**
- Company name (required), website (optional, URL validated), industry (dropdown, required), company size (dropdown, required), contact email (required)

**Step 2 — Role:**
- Job title (required, 3–120 chars), category (dropdown, required), experience level (dropdown, required)
- Job description textarea (required, 80–1200 chars) with live character counter
- Required skills tag input — press Enter or comma to add; up to 10 tags; minimum 1 required

**Step 3 — Details:**
- Job type (dropdown), work arrangement (dropdown), location (required)
- Salary range — min and max fields + currency selector (INR / USD), all optional
- Additional notes textarea (optional, max 500 chars)

**UX details:**
- Same `StepBar` pattern as `ApplyJob` with labels "Company", "Role", "Details".
- Inline validation on blur with real-time error clearing when the user corrects a field.
- On success, a `SuccessScreen` confirms the posted job's details with options to "Post another job" or "View listings".
- A "Reset" action returns to step 1 with all fields cleared for posting another job.

---

### RecruiterJobs — `/recruiter/jobs`

The recruiter's dashboard showing all their posted jobs with inline edit and delete.

**Features:**
- Fetches the recruiter's own jobs from `GET /api/jobs/mine`. Falls back to `GET /api/jobs` filtered by `recruiterId` or `contactEmail` if the `/mine` endpoint returns 404 (graceful degradation).
- Each `RecruiterJobCard` displays the job title, company, description preview, tags (category, experience, type, arrangement), location, and posting date.
- **Edit** — clicking "Edit" on a card opens an inline edit panel at the top of the page with fields for: job title, category, experience level, job type, work arrangement, location, and description. Changes are saved with `PUT /api/jobs/:id`. The job list updates optimistically in place without a full refetch.
- **Delete** — clicking "Delete" shows a confirmation dialog (`window.confirm`). On confirmation, calls `DELETE /api/jobs/:id` and removes the card from the list.
- **Empty state** — prompts with a "Post your first job" link when the recruiter has no listings.
- Error messages from the API are displayed in an `error-banner` above the list.

---

## Components

### Navbar

A sticky top navigation bar (`position: sticky; top: 0; z-index: 100`) that adapts its links based on authentication state:

| State | Links shown |
|---|---|
| Unauthenticated | Login |
| Authenticated — Candidate | Browse Jobs |
| Authenticated — Recruiter | My Jobs, Post a Job |
| Authenticated (any) | Role label, Logout button |

The `CareerBoard` brand name links back to `/`. Logout calls `logout()` from `AuthContext`, which clears the stored token and resets user state.

---

### JobCard

A presentational card component used in the candidate job feed. Receives a single `job` object as a prop.

Displays:
- Auto-generated company logo placeholder (first 2 letters of company name, uppercased)
- Job title and company name
- Description snippet
- Tag pills for experience level, job type, Remote badge (if applicable), and the first 3 required skills
- Location, salary range (formatted as `₹min to ₹max LPA` when both values are present), and posting date (formatted for Indian locale)
- An "Apply" button that navigates to `/apply/:job._id`

---

### FilterSidebar

A standalone presentational sidebar component defining four filter groups:

| Group | Options |
|---|---|
| Category | Engineering, Design, Product, Data & Analytics, Marketing, Sales, Operations |
| Experience level | Entry Level, Mid Level, Senior, Lead / Manager |
| Job type | Full-time, Part-time, Contract, Internship, Freelance |
| Work arrangement | On-site, Remote, Hybrid |

Each option is a checkbox. Selections are stored as arrays in the parent's `filters` state object. Toggling an already-selected value deselects it. A "Clear all filters" button appears when any filter is active and calls the `onClear` prop.

> **Note:** `JobListings.jsx` contains an inline version of the filter sidebar with slightly different category/experience label wording. The standalone `FilterSidebar.jsx` in `components/` exists as a reusable variant.

---

## State Management & Auth

### AuthContext

`src/context/AuthContext.jsx` provides app-wide authentication state via React Context. Wrap the entire app in `<AuthProvider>` (done in `App.jsx`).

**State:**

| Property | Type | Description |
|---|---|---|
| `user` | `object \| null` | The authenticated user `{ id, name, email, role }` or `null` |
| `loading` | `boolean` | `true` while the initial `/auth/me` verification is in flight |
| `isAuthenticated` | `boolean` | Derived: `!!user` |
| `isRecruiter` | `boolean` | Derived: `user?.role === 'Recruiter'` |

**Methods:**

| Method | Description |
|---|---|
| `login(payload)` | Calls `POST /auth/login`, stores token, sets user state. Returns the user object. |
| `register(payload)` | Calls `POST /auth/register`, stores token, sets user state. Returns the user object. |
| `logout()` | Clears token from localStorage, sets `user` to `null`. |

**Initialisation flow:** On mount, `AuthProvider` reads any existing token from localStorage and calls `GET /auth/me` to validate it. If the request succeeds, the user is restored to state. If it fails (expired or invalid token), the token is cleared and the user remains logged out. This means page refreshes preserve the session without requiring a re-login.

The context value is memoised with `useMemo` to prevent unnecessary re-renders of consumers when unrelated state changes occur.

**Usage:**

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isRecruiter, login, logout } = useAuth();
  // ...
}
```

---

### authStorage utility

`src/utils/authStorage.js` provides three thin wrappers around `localStorage` for managing the JWT:

| Function | Description |
|---|---|
| `getAuthToken()` | Returns the stored token string, or `''` if none exists |
| `setAuthToken(token)` | Stores the token; calls `removeItem` if `token` is falsy |
| `clearAuthToken()` | Removes the token from storage |

All three functions guard against SSR environments with a `typeof window === 'undefined'` check.

The token is stored under the key `"auth_token"`.

---

## API Layer

`src/api/index.js` creates a single Axios instance pointed at `VITE_API_BASE_URL` (falling back to `http://localhost:5000/api` for local development).

A **request interceptor** automatically attaches the JWT as a `Bearer` token to every outgoing request:

```
Authorization: Bearer <token>
```

### Exported functions

| Function | HTTP | Endpoint | Auth required |
|---|---|---|---|
| `fetchJobs(params)` | GET | `/jobs` | Yes |
| `createJob(data)` | POST | `/jobs` | Yes (Recruiter) |
| `fetchRecruiterJobs()` | GET | `/jobs/mine` | Yes (Recruiter) |
| `updateRecruiterJob(jobId, data)` | PUT | `/jobs/:jobId` | Yes (Recruiter) |
| `deleteRecruiterJob(jobId)` | DELETE | `/jobs/:jobId` | Yes (Recruiter) |
| `applyToJob(formData)` | POST | `/applications` | No (open) |
| `registerUser(data)` | POST | `/auth/register` | No |
| `loginUser(data)` | POST | `/auth/login` | No |
| `fetchMe()` | GET | `/auth/me` | Yes |

`applyToJob` sends `multipart/form-data` by explicitly setting the `Content-Type` header, which is required for the resume file upload.

---

## Styling

Styles are split across two files:

- **`src/index.css`** — defines CSS custom properties (design tokens) on `:root` such as `--color-text-primary`, `--color-background-primary`, `--color-border-tertiary`, etc. These are referenced throughout the component styles for consistent theming and easy future dark/light mode switching.
- **`src/App.css`** — all component-level styles including layout classes (`.page-bg`, `.layout`, `.main`, `.sidebar`), form styles (`.form-card`, `.field`, `.btn`, `.btn-primary`, `.error-banner`), job card styles (`.job-card`, `.job-tags`, `.tag`, `.tag-remote`), application form styles (`.steps`, `.step-circle`, `.upload-zone`, `.skills-container`, `.skill-tag`), and skeleton loading animation styles (`.skeleton`, `.sk-line`).

The colour palette is centred on dark backgrounds (`#16171d`) with a blue accent (`#185FA5`), styled for a modern dark-theme job board aesthetic.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Base URL of the CareerBoard backend API
VITE_API_BASE_URL=http://localhost:5000/api
```

For production, set this to the deployed server URL:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

> All Vite environment variables must be prefixed with `VITE_` to be accessible in client-side code via `import.meta.env`.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- The [CareerBoard Server](https://github.com/Abhineet-22/CareerBoard-server) running locally or deployed

### Installation

```bash
# Clone the repository
git clone https://github.com/Abhineet-22/CareerBoard-client.git
cd CareerBoard-client

# Install dependencies
npm install
```

### Running the App

```bash
# Start the Vite dev server (default: http://localhost:5173)
npm run dev
```

The app will hot-reload on any file change. Make sure the backend server is running and `VITE_API_BASE_URL` points to it.

### Building for Production

```bash
# Type-check and build to dist/
npm run build

# Preview the production build locally
npm run preview
```

The built output goes to `dist/` and is ready to be served by any static host.

---

## Deployment

The app is deployed on **Vercel**. The production URL is configured as an allowed CORS origin in the backend server.

To deploy your own instance:

1. Push the repository to GitHub.
2. Import the repository in Vercel.
3. Set the `VITE_API_BASE_URL` environment variable in Vercel's project settings to point to your deployed backend.
4. Deploy — Vercel auto-detects Vite and runs `npm run build` with the `dist/` folder as the output.

For SPA routing to work correctly on Vercel (so that direct navigation to `/apply/123` doesn't 404), add a `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
