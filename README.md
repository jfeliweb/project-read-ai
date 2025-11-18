# Project Read AI

A Next.js 16 application with App Router, TypeScript, Tailwind CSS 4, Drizzle ORM, and comprehensive development tooling.

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Tailwind CSS 4
- 📘 TypeScript
- 🗄️ Drizzle ORM with PostgreSQL
- 🧪 Vitest for unit testing
- 🎭 Playwright for E2E testing
- 📚 Storybook for component development
- 🔒 Arcjet for security and bot protection
- 📊 Sentry for error monitoring
- 📝 ESLint + Prettier for code quality
- 🪝 Husky + lint-staged for Git hooks
- 📦 Bundle analyzer

## Getting Started

### Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd project-read-ai
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN (optional)
- `ARCJET_KEY` - Arcjet API key (optional)
- Other service keys as needed

4. Set up the database:

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/        # React components
│   ├── db/               # Database schemas and migrations
│   ├── libs/             # Utility libraries
│   └── utils/            # Helper functions
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   └── e2e/              # E2E tests
├── .storybook/           # Storybook configuration
└── migrations/           # Database migrations
```

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Type check with TypeScript
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run E2E tests
- `npm run test:coverage` - Run tests with coverage

### Database

- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database

### Storybook

- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook

### Other

- `npm run analyze` - Analyze bundle size

## Database Migration from MongoDB

This project has been migrated from MongoDB to PostgreSQL using Drizzle ORM. The database schema is defined in `src/db/schema/index.ts`.

To migrate existing data:

1. Export data from MongoDB
2. Transform data to match the new schema
3. Import into PostgreSQL using Drizzle migrations

## Testing

### Unit Tests

Unit tests are written with Vitest and React Testing Library:

```bash
npm run test
```

### E2E Tests

E2E tests are written with Playwright:

```bash
npm run test:e2e
```

## Storybook

View and develop components in isolation:

```bash
npm run storybook
```

## Monitoring and Security

### Sentry

Error monitoring is configured via Sentry. Set `NEXT_PUBLIC_SENTRY_DSN` in your environment variables.

### Arcjet

Security and bot protection is configured via Arcjet. Set `ARCJET_KEY` in your environment variables.

### Better Stack (Logtail)

Logging is configured via Better Stack (Logtail). Set `BETTER_STACK_SOURCE_TOKEN` in your environment variables.

### Checkly

Monitoring is configured via Checkly. Set `CHECKLY_API_KEY` and `CHECKLY_ACCOUNT_ID` in your environment variables.

## Code Quality

This project uses:

- ESLint for linting
- Prettier for code formatting
- Husky for Git hooks
- lint-staged for pre-commit checks
- commitlint for commit message validation

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)

## License

MIT
