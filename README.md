# 🎯 DevSight

**A job seeker developer's advisor** - Build a portfolio that recruiters love with AI-powered analysis and personalized recommendations.

## 📋 Overview

DevSight is a Next.js application that helps developers improve their chances of getting hired by analyzing their profiles and providing personalized recommendations for their portfolios, resumes, and job search strategies.

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with GitHub OAuth
- **AI Integration**: OpenAI, Google AI
- **Package Manager**: pnpm

## ⚡ Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm (will be installed automatically if not present)
- PostgreSQL database (Supabase recommended)
- GitHub OAuth App credentials

### 🎬 One-Command Setup

Run the automated setup script that handles everything:

```bash
./start.sh
```

This script will:
- ✅ Install all dependencies
- ✅ Set up environment variables
- ✅ Test database connectivity
- ✅ Set up database schema and migrations
- ✅ Build the application
- ✅ Start the development server

### 🔧 Manual Setup

If you prefer to set up manually:

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd dev-sight
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp example.env .env
   # Edit .env with your actual values
   ```

3. **Set up the database:**
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

## 🌐 Environment Variables

Create a `.env` file with the following variables:

```env
# Authentication
AUTH_SECRET="your-auth-secret-here"
AUTH_GITHUB_ID="your-github-app-id"
AUTH_GITHUB_SECRET="your-github-app-secret"

# Database (Supabase PostgreSQL)
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# AI APIs (Optional)
OPENAI_API_KEY="your-openai-key"
GOOGLE_AI_API_KEY="your-google-ai-key"
```

### 📝 Required Setup Steps:

1. **Generate AUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

2. **Create GitHub OAuth App:**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App with callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Set up Supabase Database:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your database connection strings from Project Settings > Database

## 🎛️ Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm prisma studio` | Open database admin UI |
| `pnpm prisma db push` | Push schema changes |
| `pnpm prisma migrate dev` | Create and apply migration |
| `pnpm prisma generate` | Generate Prisma client |

## 🗄️ Database Management

### Prisma Studio
Access your database with a visual interface:
```bash
pnpm prisma studio
```
Opens at: http://localhost:5555

### Migrations
```bash
# Create new migration
pnpm prisma migrate dev --name your-migration-name

# Apply pending migrations
pnpm prisma migrate deploy

# Reset database (⚠️ deletes all data)
pnpm prisma migrate reset
```

## 🏗️ Project Structure

```
dev-sight/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (login)/           # Login page
│   │   ├── chat/              # Chat interface
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   └── lib/                   # Utilities and configs
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── assistant-prompts/         # AI assistant prompts
└── start.sh                   # Setup script
```

## 🔧 Development

### Adding New Features
1. Create components in `src/components/`
2. Add pages in `src/app/`
3. Update database schema in `prisma/schema.prisma`
4. Run `pnpm prisma db push` to apply changes

### Styling
- Uses Tailwind CSS for styling
- Custom components in `src/components/ui/`
- Global styles in `src/app/globals.css`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the application: `pnpm build`
2. Set environment variables
3. Start with: `pnpm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request


## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
