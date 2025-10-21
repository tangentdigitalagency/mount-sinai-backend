# Mount Sinai Backend

A TypeScript Node.js Express backend application with Supabase integration.

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **Database:** Supabase
- **AI:** OpenAI
- **Validation:** Zod
- **HTTP Client:** Axios
- **Utilities:** Lodash

## Project Structure

```
mount-sinai-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── environment.ts
│   │   ├── middleware.ts
│   │   ├── openai.ts
│   │   └── supabase.ts
│   ├── routes/           # API route handlers
│   │   └── index.ts
│   ├── types/            # TypeScript types and Zod schemas
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── async-handler.ts
│   │   └── logger.ts
│   └── index.ts          # Application entry point
├── migrations/           # Database migration files
├── documentation/        # API endpoint documentation
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your actual credentials:

   - Supabase URL and keys
   - OpenAI API key
   - Other configuration values

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server runs on `http://localhost:3000` by default.

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Run the compiled application:

```bash
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript in production
- `npm run lint` - Run linter (to be configured)
- `npm test` - Run tests (to be configured)

## API Endpoints

### Health Check

**Endpoint:** `GET /health`

Checks server health status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T12:00:00.000Z",
  "environment": "development"
}
```

### API Info

**Endpoint:** `GET /api`

Returns basic API information.

**Response:**

```json
{
  "message": "Mount Sinai Backend API",
  "version": "1.0.0"
}
```

## Environment Variables

| Variable                    | Description                                  | Required                  |
| --------------------------- | -------------------------------------------- | ------------------------- |
| `PORT`                      | Server port number                           | No (default: 3000)        |
| `NODE_ENV`                  | Environment (development/production/test)    | No (default: development) |
| `SUPABASE_URL`              | Supabase project URL                         | Yes                       |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key                       | Yes                       |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key                    | Yes                       |
| `OPENAI_API_KEY`            | OpenAI API key                               | Yes                       |
| `ALLOWED_ORIGINS`           | Comma-separated list of allowed CORS origins | No                        |

## Coding Standards

### Naming Conventions

- **Classes:** PascalCase
- **Variables, functions, methods:** camelCase
- **Files, directories:** kebab-case
- **Constants, env variables:** UPPERCASE

### Type Safety

- Use Zod schemas for validation
- Infer TypeScript types from Zod schemas
- Avoid using `any` type
- Use `import type` for type-only imports

### Code Organization

- Keep files focused and single-purpose
- Split large files into smaller modules
- Follow SOLID principles
- Document API endpoints in `documentation/` directory

## Database Migrations

Create migration files in the `migrations/` directory. These files can be copied and pasted into Supabase SQL editor.

Example migration file structure:

```
migrations/
└── 001_create_users_table.sql
```

## Contributing

1. Follow the TypeScript and Node.js best practices
2. Write tests for new features
3. Document API endpoints
4. Use conventional commit messages
5. Follow the project's code review checklist

## License

ISC
# mount-sinai-backend
