# Contributing to SoundWeave

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check existing issues first to avoid duplicates
2. Provide a clear, descriptive title
3. Include reproduction steps
4. Describe expected vs actual behavior
5. Include error logs and environment info

**Template:**
```
Title: [BUG] Brief description

Environment:
- Node.js version:
- OS:

Steps to reproduce:
1.
2.
3.

Expected behavior:
Actual behavior:

Error logs:
```

### Suggesting Features

1. Check existing discussions
2. Describe the use case
3. Provide examples if possible
4. Consider backwards compatibility

**Template:**
```
Title: [FEATURE] Brief description

Use case:
Why this matters:

Proposed solution:
Alternative approaches:
```

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests and linting: `npm run lint`
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request with description

**PR Template:**
```
## Description
Brief description of changes

## Type
- [ ] Bug fix
- [ ] Feature
- [ ] Documentation
- [ ] Performance improvement

## Changes
- Change 1
- Change 2

## Testing
- [ ] Tested locally
- [ ] No breaking changes
- [ ] Backwards compatible

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
```

## Development Setup

```bash
# Clone
git clone https://github.com/fullmeo/soundweave.git
cd soundweave

# Install
npm install

# Configure
cp .env.example .env
# Add REPLICATE_API_TOKEN

# Run
npm start

# Dev mode
npm run dev

# Lint
npm run lint

# Format
npm run format
```

## Code Style

- Use ES6+ modules
- Clear variable names
- Comments for complex logic
- Consistent formatting
- Follow existing patterns

```javascript
// Good
const generateMusic = async (params) => {
  validateInput(params);
  const result = await musicGen.generate(params);
  return result;
};

// Avoid
const gen = async (p) => {
  const r = await mg.gen(p);
  return r;
};
```

## Commit Messages

Use clear, descriptive commit messages:

```
Format: [TYPE] Brief description (max 50 chars)

Optional body (explain what and why, not how)
- Bullet points are okay
- Reference issues: Fixes #123

Types: feat, fix, docs, style, refactor, perf, test, chore
```

Examples:
```
feat: Add melody-guided generation
fix: Correct timeout handling in pollPrediction
docs: Update API reference
refactor: Simplify error handling
```

## Testing

- Test your changes locally
- Verify all endpoints work
- Test error scenarios
- Check rate limiting
- Validate error messages

```bash
# Test generation
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","duration":10}'

# Test CLI
node cli/musicgen-cli.js generate --prompt "test music"

# Test storage
node cli/musicgen-cli.js list
```

## Documentation

Update relevant docs when making changes:

- `README.md` - Setup and basic usage
- Code comments - Complex logic
- `.env.example` - New config variables
- Architecture docs - Major changes

## Performance Considerations

- Consider memory usage
- Optimize API calls
- Minimize file I/O
- Test with large datasets
- Document performance impact

## Security

- Never commit `.env` files
- Don't expose API keys
- Validate all user input
- Use HTTPS in production
- Follow OWASP guidelines

## Questions?

- Check documentation first
- Search existing issues
- Open a discussion issue
- Ask respectfully

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree your contributions are licensed under the MIT License.

---

Thank you for making SoundWeave better! 🎵
