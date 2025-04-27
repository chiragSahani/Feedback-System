
# User Feedback System

A beautiful, professional-grade feedback system built with React, Supabase, and TypeScript. Collect, manage, and visualize user feedback with ease.

## Deployed Link

Check out the live application here: [User Feedback System](https://user-feedback-management.netlify.app/)

## Features

- 💬 Feedback submission form with real-time validation
- 📊 Admin dashboard to view, filter, search, and sort feedback
- 📱 Fully responsive design for all devices
- 📈 Feedback analytics with category breakdown and trends
- 🔒 Secure data storage with Supabase and PostgreSQL
- 🎨 Modern UI with Tailwind CSS

## Admin Dashboard Access

To access the admin dashboard, use the following credentials:

- **Username**: `admin`
- **Password**: `admin123`

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL)
- Routing: React Router
- Notifications: React Hot Toast
- Date Formatting: date-fns
- Icons: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A Supabase account and project

### Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the database migrations:
   - Go to your Supabase project dashboard
   - Navigate to SQL editor
   - Copy and paste the contents of `supabase/migrations/create_feedback_table.sql`
   - Run the SQL query to create the necessary tables and policies

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── supabase/
│   └── migrations/        # Database migrations
├── .env.example           # Example environment variables
└── README.md              # Project documentation
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the built files from the `dist` directory to your preferred hosting service (Vercel, Netlify, etc.).

## License

MIT
