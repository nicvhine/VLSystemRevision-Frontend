# ⚡ VLSystem Frontend

This folder contains the **Next.js** frontend for **VLSystem** — a modern web application built with a powerful React-based stack.

First, run the development server:
# VLSystem Frontend

This folder contains the Next.js frontend for VLSystem.

Tech stack
- Next.js (App Router) v15
- React 19
- TypeScript
- Tailwind CSS (v4)
- Various UI and utility libraries (axios, framer-motion, react-chartjs-2, leaflet, etc.)

Quick start (development)
```powershell
cd VLSystem-Frontend
# install node dependencies
npm install
# run dev server
npm run dev
```

Production
```powershell
cd VLSystem-Frontend
npm install --production
npm run build
npm run start
```

Scripts
- `npm run dev` — start Next.js dev server (uses turbopack)
- `npm run build` — build for production
- `npm run start` — run built app
- `npm run lint` — run next lint

Dependencies (from `package.json`)
Run `npm install` will install these main dependencies. For reference, the project includes:

- @headlessui/react
- axios
- chart, chart.js, react-chartjs-2
- date, date-fns
- emailjs-com
- face-api.js
- framer-motion
- html2canvas
- jsonwebtoken, jwt-decode
- jspdf
- leaflet, react-leaflet
- lucide-react, react-icons
- mongodb (client lib used in some utilities)
- next, react, react-dom
- react-big-calendar
- react-circular-progressbar
- react-datepicker
- react-hot-toast
- react-to-print
- swiper

Dev dependencies (main ones):

- @tailwindcss/postcss
- @types/leaflet, @types/node, @types/react, @types/react-dom
- tailwindcss
- typescript

Notes
- Default dev URL: `http://localhost:3000`
- The frontend expects the backend API to be available at `http://localhost:3001` for many endpoints (see `app/commonComponents/*` where `fetch('http://localhost:3001/...')` is used).
- `next.config.ts` includes remote image patterns for `http://localhost:3001` and Cloudinary.

Environment variables
You can add a `.env.local` or `.env` in the frontend folder to declare public variables used at build/runtime; example:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

