# Contributing to Film Mania 🎬

Thank you for your interest in contributing to Film Mania! This guide will help you get started with contributing to our open-source subscription-based movie streaming platform.

## 🌟 Getting Started

### Prerequisites

- Node.js 18.x or higher
- Yarn 4.x (via Corepack)
- Git
- Docker and Docker Compose (for testing deployment)
- PostgreSQL 14+ (or use Docker)

### Setup Development Environment

1. **Fork the repository**
   - Go to [https://github.com/pasindusampath/film-mania](https://github.com/pasindusampath/film-mania)
   - Click the "Fork" button in the top right corner

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/film-mania.git
   cd film-mania
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/pasindusampath/film-mania.git
   ```

4. **Enable Corepack and install dependencies:**
   ```bash
   corepack enable
   yarn install
   ```

5. **Set up environment variables**
   
   Create `apps/api/.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=film_mania
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   
   # JWT
   JWT_SECRET=your-secret-key-change-in-production
   JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
   JWT_EXPIRY=24h
   JWT_REFRESH_EXPIRY=7d
   
   # Stripe (optional for local development)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # TMDB (optional for local development)
   TMDB_API_KEY=your-tmdb-api-key
   
   # CORS
   CORS_ORIGIN=http://localhost:3001,http://localhost:3000
   ```

   Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

6. **Set up the database**
   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d postgres
   
   # Or use your existing PostgreSQL instance
   # Then run the schema
   psql -U postgres -d film_mania -f database/schema.sql
   ```

## 🔄 Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/add-watchlist`)
- `fix/` - Bug fixes (e.g., `fix/subscription-renewal-bug`)
- `docs/` - Documentation updates (e.g., `docs/update-api-docs`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `test/` - Adding tests (e.g., `test/movie-service-tests`)
- `style/` - Code style changes (e.g., formatting)
- `chore/` - Maintenance tasks (e.g., dependency updates)

### 2. Make Changes

- Write clean, maintainable code following TypeScript best practices
- Follow existing code style and patterns
- Add JSDoc comments for functions and complex logic
- Update documentation if needed
- Ensure your code integrates well with the monorepo structure

### 3. Test Your Changes

```bash
# Test API locally
yarn api:dev
# API will run on http://localhost:3000

# Test Web locally (in another terminal)
yarn web:dev
# Web app will run on http://localhost:3001

# Run type checking
yarn type-check

# Test with Docker
yarn docker:build
yarn docker:up
yarn docker:logs

# Build all projects
yarn build:all
```

### 4. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
git commit -m "type: brief description"
```

**Commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code restructuring without changing functionality
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, dependency updates, etc.
- `perf:` - Performance improvements
- `ci:` - CI/CD changes

**Examples:**
```bash
git commit -m "feat: add user watchlist functionality"
git commit -m "fix: resolve subscription renewal issue"
git commit -m "docs: update API authentication documentation"
git commit -m "refactor: optimize movie search query"
```

### 5. Keep Your Branch Updated

Before pushing, make sure your branch is up to date with the main branch:

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push Changes

```bash
git push origin feature/your-feature-name
```

If you've already pushed and rebased, you may need to force push (use with caution):
```bash
git push --force-with-lease origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to [https://github.com/pasindusampath/film-mania](https://github.com/pasindusampath/film-mania)
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template (see below)
5. Submit for review

## 📝 Code Style Guidelines

### TypeScript/Node.js (Backend)

- Use TypeScript strict mode
- Use async/await over callbacks
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add JSDoc comments for public functions
- Use proper error handling with try-catch blocks
- Follow Sequelize ORM patterns for database operations

**Example:**
```typescript
/**
 * Fetches movie data from the database
 * @param {string} movieId - The movie ID
 * @returns {Promise<Movie | null>} Movie data or null if not found
 * @throws {Error} If database query fails
 */
async function getMovieById(movieId: string): Promise<Movie | null> {
  try {
    const movie = await MovieModel.findByPk(movieId);
    return movie;
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error);
    throw new Error('Failed to fetch movie');
  }
}
```

### React/Next.js (Frontend)

- Use functional components with hooks
- Use TypeScript for type safety
- Keep components small and reusable
- Use Next.js App Router patterns (Server Components when possible)
- Use `next/link` for navigation instead of `<a>` tags
- Use `next/image` for optimized images
- Follow React best practices and hooks rules

**Example:**
```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
  onSelect?: (movie: Movie) => void;
}

export default function MovieCard({ movie, onSelect }: MovieCardProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Component logic
  }, []);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### CSS/Styling

- Use CSS Modules for component-specific styles
- Follow consistent naming conventions
- Keep styles organized and maintainable
- Use CSS variables for colors and sizes
- Ensure responsive design for mobile devices

### Database/Sequelize

- Use Sequelize models for all database operations
- Add proper indexes for frequently queried fields
- Use transactions for multi-step operations
- Validate data before database operations
- Follow the existing model patterns

## 🧪 Testing

### Writing Tests

We encourage adding tests for new features. Use the following structure:

```typescript
describe('Feature name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  test('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Running Tests

```bash
# Run all tests (when implemented)
yarn test

# Run tests for specific workspace
yarn workspace api test
yarn workspace web test
```

## 📚 Documentation

### Updating Documentation

- Update `README.md` for user-facing changes
- Update `docs/requirements.md` for requirement changes
- Update `docs/technical-feasibility.md` for architecture changes
- Add inline code comments for complex logic
- Update API documentation in code comments

### Writing Documentation

- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI changes
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

## 🔍 Pull Request Guidelines

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style and conventions
- [ ] TypeScript types are properly defined
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated
- [ ] No linting errors (`yarn type-check` passes)
- [ ] All builds succeed (`yarn build:all`)
- [ ] Commits follow conventional commit format
- [ ] PR description is clear and comprehensive
- [ ] Branch is up to date with main
- [ ] No merge conflicts

### PR Description Template

```markdown
## Description
Brief description of the changes and why they were needed.

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ✨ New feature (non-breaking change adding functionality)
- [ ] 💥 Breaking change (fix or feature causing existing functionality to change)
- [ ] 📚 Documentation update
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] ✅ Test addition/update

## Changes Made
- List of specific changes
- More details about implementation

## How to Test
1. Step-by-step instructions to test the changes
2. Include test cases or scenarios
3. Expected behavior

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
Fixes #456
Related to #789

## Additional Notes
Any additional context or information
```

## 🔄 Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
   - TypeScript type checking
   - Linting
   - Build verification

2. **Code Review**: Maintainers review your PR
   - Feedback will be provided in comments
   - Address all requested changes

3. **Approval**: Once approved, your PR will be merged
   - Maintainers will squash commits if needed
   - Your contribution will be merged to main

## 🎯 Areas Where Contributions Are Welcome

### High Priority
- 🐛 Bug fixes and error handling improvements
- 📚 Documentation improvements
- 🧪 Test coverage improvements
- ⚡ Performance optimizations

### Features
- 🎥 Video player with subtitle support
- 🤖 AI subtitle translation implementation
- 📱 Mobile responsiveness improvements
- 🔍 Advanced search and filtering
- ⭐ User watchlist and favorites
- 💡 Movie recommendations

### Infrastructure
- 🐳 Docker improvements
- 🔒 Security enhancements
- 📊 Monitoring and logging
- 🚀 CI/CD improvements

## ❓ Need Help?

- **Check existing issues**: Look through [GitHub Issues](https://github.com/pasindusampath/film-mania/issues)
- **Ask questions**: Open a discussion or issue
- **Contact maintainers**: Reach out via GitHub
- **Read documentation**: Check the `docs/` folder

## 📄 License

By contributing to Film Mania, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 🙏 Thank You!

Thank you for taking the time to contribute to Film Mania! Your contributions help make this project better for everyone. We appreciate your effort and look forward to your pull requests!

---

**Happy Coding! 🎬**
