# Austin Rifle Club Website

A modern, full-stack web application for the Austin Rifle Club - a private shooting sports organization in Manor, Texas since 1894.

## Tech Stack

### Backend (API)
- **Runtime**: Cloudflare Workers
- **Framework**: [Hono](https://hono.dev) - Fast, lightweight web framework
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://better-auth.com)
- **Storage**: Cloudflare R2
- **Email**: Resend
- **Payments**: Stripe

### Frontend (Web)
- **Framework**: [Astro](https://astro.build) with React islands
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages

## Project Structure

```
austinrifleclub.org/
├── src/                    # API source code
│   ├── db/                 # Database schema and connection
│   ├── lib/                # Shared utilities
│   ├── middleware/         # Hono middleware
│   └── routes/             # API route handlers
├── web/                    # Frontend source code
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── layouts/        # Astro layouts
│   │   └── pages/          # Astro pages
│   └── public/             # Static assets
├── drizzle/                # Database migrations
├── docs/                   # Documentation
└── .github/                # CI/CD workflows
```

## Features

- **Membership Management**: Applications, renewals, profiles
- **Event System**: Registration, calendar, waitlists
- **Range Status**: Real-time status updates
- **Guest Sign-in**: Member guest management
- **Volunteer Tracking**: Hours logging and credit redemption
- **Admin Panel**: Full administrative dashboard
- **Certifications**: Safety certifications tracking
- **Payments**: Stripe integration for dues and events

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Cloudflare account
- Wrangler CLI: `npm install -g wrangler`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/austinrifleclub/austinrifleclub.org.git
   cd austinrifleclub.org
   ```

2. Install dependencies:
   ```bash
   npm install
   cd web && npm install && cd ..
   ```

3. Set up environment variables:
   ```bash
   # Copy example files
   cp .dev.vars.example .dev.vars
   cp web/.env.example web/.env
   ```

4. Set up local database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start development servers:
   ```bash
   # Terminal 1: API
   npm run dev

   # Terminal 2: Web
   cd web && npm run dev
   ```

The API will be available at `http://localhost:8787` and the web app at `http://localhost:4321`.

## Development

### API Development

```bash
# Run API dev server
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Generate migrations
npm run db:generate

# Apply migrations locally
npm run db:migrate
```

### Web Development

```bash
cd web

# Run dev server
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## Deployment

### Staging

Push to `main` branch to automatically deploy to staging:
- API: `https://api-staging.austinrifleclub.org`
- Web: `https://staging.austinrifleclub.org`

### Production

Create a GitHub release to deploy to production:
- API: `https://api.austinrifleclub.org`
- Web: `https://austinrifleclub.org`

### Manual Deployment

```bash
# Deploy API to staging
npm run deploy:staging

# Deploy API to production
npm run deploy:production
```

## Configuration

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for detailed environment setup instructions.

### Required Services

| Service | Purpose | Required |
|---------|---------|----------|
| Cloudflare | Hosting, D1, R2, KV | Yes |
| Stripe | Payments | Yes |
| Resend | Email | Yes |
| Twilio | SMS notifications | No |

## API Documentation

API documentation is available at `/api-docs` when running the application.

OpenAPI specification: `/api/openapi.json`

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /api/auth/*` | Authentication |
| `GET /api/members/me` | Current member profile |
| `GET /api/events` | List events |
| `GET /api/range-status` | Range status |
| `POST /api/applications` | Submit application |

## Testing

```bash
# Run API tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass: `npm test`
4. Ensure types pass: `npm run typecheck`
5. Submit a pull request

## Security

- Report security vulnerabilities to security@austinrifleclub.org
- See [SECURITY.md](SECURITY.md) for security policy

## License

Copyright (c) 2024 Austin Rifle Club, Inc. All rights reserved.

Private software - not for redistribution.
