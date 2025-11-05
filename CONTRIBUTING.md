# Contributing Guide

Thank you for your interest in contributing to this project! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- Docker (for testing deployment)

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nx-mono-repo-deployment-test.git
   cd nx-mono-repo-deployment-test
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/nx-mono-repo-deployment-test.git
   ```
4. Install dependencies:
   ```bash
   npm install
   npm run install:all
   ```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 2. Make Changes

- Write clean, maintainable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Test API locally
npm run api:dev

# Test Web locally
npm run web:dev

# Test with Docker
npm run docker:build
npm run docker:up
```

### 4. Commit Changes

Follow conventional commit messages:

```bash
git commit -m "type: brief description"
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

Examples:
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve API timeout issue"
git commit -m "docs: update deployment guide"
```

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR template
5. Submit for review

## Code Style Guidelines

### JavaScript/Node.js

- Use ES6+ features
- Use async/await over callbacks
- Use meaningful variable names
- Keep functions small and focused
- Add JSDoc comments for functions

Example:
```javascript
/**
 * Fetches user data from API
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User data
 */
async function getUserData(userId) {
  // Implementation
}
```

### React/Next.js

- Use functional components
- Use hooks appropriately
- Keep components small and reusable
- Use PropTypes or TypeScript
- Follow React best practices

Example:
```jsx
function MyComponent({ title, onAction }) {
  const [state, setState] = useState(initialState)
  
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### CSS

- Use CSS Modules
- Follow BEM naming convention
- Keep styles organized
- Use variables for colors/sizes

## Testing

### Writing Tests

```javascript
describe('Feature name', () => {
  test('should do something', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

### Running Tests

```bash
npm test
```

## Documentation

### Updating Documentation

- Update README.md for user-facing changes
- Update DEPLOYMENT.md for deployment changes
- Add comments in code for complex logic
- Update API documentation

### Writing Documentation

- Use clear, concise language
- Include code examples
- Add screenshots if helpful
- Keep it up-to-date

## Pull Request Guidelines

### PR Checklist

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No linting errors
- [ ] All tests pass
- [ ] Commits follow convention
- [ ] PR description is clear

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
Steps to test the changes

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

## Review Process

1. Automated checks run (CI)
2. Code review by maintainers
3. Address feedback
4. Approval and merge

## Need Help?

- Check existing issues
- Ask in discussions
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

