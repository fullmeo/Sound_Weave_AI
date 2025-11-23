# SoundWeave Tests

## Running Tests

```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --test-reporter=spec

# Run specific test file
node --test tests/storage.test.js

# Run tests with coverage (requires c8)
npx c8 npm test
```

## Test Structure

### `storage.test.js`
Tests for StorageService including:
- Path security (path traversal protection)
- Metadata management (CRUD operations)
- Caching behavior
- Statistics calculation
- Delete operations

### `validation.test.js`
Tests for input validation including:
- Prompt validation (length, format)
- Duration validation (range, type)
- Model validation (allowed values)
- Model info retrieval

## Test Coverage

Current test coverage focuses on:
- ✅ Security vulnerabilities (path traversal)
- ✅ Input validation
- ✅ Core business logic
- ✅ Metadata operations
- ✅ Caching performance

## Adding New Tests

When adding new tests:
1. Create test file in `tests/` directory
2. Use Node.js built-in test runner (`node:test`)
3. Follow existing naming convention: `*.test.js`
4. Add cleanup in `after()` hooks
5. Test both success and failure cases

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:
- No external dependencies (uses Node 18+ built-in test runner)
- Automatic cleanup after tests
- Exit codes for pass/fail
- Fast execution (< 5 seconds typical)

## Future Test Additions

Consider adding:
- Integration tests with mock Replicate API
- API endpoint tests (routes.js)
- CLI tests (musicgen-cli.js)
- Performance benchmarks
- Load testing
