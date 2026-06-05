# Smart Bookmark

A modern, full-stack bookmark manager that lets you save, organize, search, and revisit your favorite links. Built with **Next.js 16**, **Supabase**, **NextAuth**, and **shadcn/ui**.

## Features

- **Add bookmarks** with a title and URL
- **Edit and delete** bookmarks inline
- **Search** through your saved bookmarks
- **Pagination** for large bookmark collections
- **Authentication** with NextAuth (sign up / sign in)
- **Persistent storage** backed by Supabase
- **Real-time toasts** for action feedback
- **Responsive UI** with a clean, minimal design

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Supabase](https://supabase.com/) — database & client
- [NextAuth](https://next-auth.js.org/) — authentication
- [Tailwind CSS 4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form handling & validation
- [lucide-react](https://lucide.dev/) — icons
- [sonner](https://sonner.emilkowal.ski/) — toast notifications

## Project Structure

```
smart_schedule/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth routes
│   │   └── bookmarks/      # Bookmark CRUD API
│   ├── signup/             # Sign-up page
│   ├── globals.css         # Global styles
│   ├── layout.js           # Root layout
│   ├── page.js             # Home / dashboard
│   └── providers.js        # Context providers
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── Bookmarks.jsx       # Bookmark list, search, edit, delete
│   ├── header.js           # App header
│   └── inputbox.jsx        # Add-bookmark form
├── lib/                    # Utility helpers
├── public/                 # Static assets
├── components.json         # shadcn/ui config
├── next.config.mjs
├── tailwind config (via PostCSS)
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn
- A [Supabase](https://supabase.com/) project
- A [NextAuth](https://next-auth.js.org/) provider configured (e.g. Google, GitHub, Credentials)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd smart_schedule
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   # OAuth provider credentials (if used)
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   ```

4. **Set up the Supabase table**

   Run this SQL in the Supabase SQL editor:

   ```sql
   create table bookmarks (
     id uuid default gen_random_uuid() primary key,
     user_id text not null,
     title text not null,
     url text not null,
     created_at timestamp with time zone default now()
   );
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the development server      |
| `npm run build` | Build the app for production      |
| `npm run start` | Start the production server       |
| `npm run lint`  | Run ESLint to check code quality  |

## API Routes

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| GET    | `/api/bookmarks`      | List user bookmarks    |
| POST   | `/api/bookmarks`      | Create a new bookmark  |
| PUT    | `/api/bookmarks`      | Update a bookmark      |
| DELETE | `/api/bookmarks`      | Delete a bookmark      |
| *      | `/api/auth/*`         | NextAuth endpoints     |

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
