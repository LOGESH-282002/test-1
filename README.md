# NotesApp - Secure Note-Taking Platform

A modern, full-stack note-taking application with encryption, autosave, and sharing capabilities built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🔐 **Dual Authentication**: Email/password and Google OAuth
- 📝 **CRUD Operations**: Create, read, update, and delete notes
- 💾 **Auto-Save**: Automatic saving of drafts as you type
- 🔒 **Client-Side Encryption**: Secure your sensitive notes with encryption
- 🌐 **Public/Private Notes**: Control note visibility and sharing
- 🔗 **Secure Sharing**: Share public notes with secure links
- 👤 **User Profiles**: User registration and profile management
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- 🔒 **Secure**: JWT tokens and Row Level Security (RLS)
- ⚡ **Fast**: Built with Next.js 14 App Router
- 📱 **Mobile-Friendly**: Fully responsive design

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js + Custom JWT
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-notes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env` file and update with your credentials:
   ```bash
   cp .env .env.local
   ```

   Update `.env.local` with your actual values:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # JWT Secret (generate a secure random string)
   JWT_SECRET=your_jwt_secret

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Set up the database**
   
   Run the SQL schema in your Supabase SQL editor:
   ```bash
   # Copy the contents of database/schema.sql and run it in Supabase
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── notes/         # Notes endpoints
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── create/            # Create note page
│   │   ├── notes/             # Note pages
│   │   ├── layout.js          # Root layout
│   │   ├── page.js            # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── Navbar.js          # Navigation component
│   │   ├── NoteCard.js        # Note preview component
│   │   ├── NoteForm.js        # Note creation/editing form
│   │   └── Providers.js       # Context providers
│   ├── contexts/              # React contexts
│   │   └── AuthContext.js     # Authentication context
│   └── lib/                   # Utility libraries
│       ├── auth.js            # Authentication utilities
│       ├── encryption.js      # Client-side encryption
│       ├── supabase.js        # Supabase client
│       └── validation.js      # Input validation
├── database/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
├── scripts/
│   └── setup.js              # Setup script
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Notes
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/[id]` - Get single note (by ID or public link)
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note
- `POST /api/notes/autosave` - Auto-save note draft

## Authentication Flow

The app supports two authentication methods:

1. **Email/Password**: Traditional registration and login
2. **Google OAuth**: Sign in with Google account

Both methods integrate seamlessly and provide JWT tokens for API access.

## Database Schema

The application uses the following main tables:

- **users**: User accounts and profiles
- **notes**: Notes with encryption, privacy, and sharing features

See `database/schema.sql` for the complete schema.

## Development

### Running Tests
```bash
npm test
npm run test:watch
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS
- DigitalOcean

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- All contributors and users of this project