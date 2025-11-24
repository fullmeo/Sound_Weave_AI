# GitHub Actions Workflows

Automated CI/CD pipelines for SoundWeave.

## 📋 Workflows Overview

### 1. **CI Pipeline** (`ci.yml`)
**Triggers:** Push to `main`/`develop`, Pull Requests
**Purpose:** Automated testing and build verification

**Jobs:**
- ✅ **Test Suite** - Runs on Node 18.x & 20.x
  - Executes all unit tests
  - Generates coverage reports
  - Uploads to Codecov (optional)

- ✅ **Build Verification**
  - Validates syntax in all JS files
  - Checks package.json integrity
  - Verifies imports

- ✅ **Integration Tests**
  - Tests CLI functionality
  - Validates example files
  - Checks configuration loading

**Duration:** ~3-5 minutes

---

### 2. **Code Quality** (`code-quality.yml`)
**Triggers:** Push to `main`/`develop`, Pull Requests
**Purpose:** Enforce code quality standards

**Jobs:**
- ✅ **ESLint Check**
  - Runs linting rules
  - Generates JSON report
  - Uploads artifacts

- ✅ **Prettier Check**
  - Validates code formatting
  - Checks all .js files
  - Fails if formatting issues found

- ✅ **Complexity Analysis**
  - Analyzes code complexity
  - Generates metrics report
  - Uploads for review

- ✅ **Dependency Check**
  - Lists outdated dependencies
  - Checks for vulnerabilities
  - Generates dependency tree

**Duration:** ~2-3 minutes

---

### 3. **Security Audit** (`security-audit.yml`)
**Triggers:**
- Push to `main`/`develop`
- Pull Requests
- **Weekly schedule** (Mondays 9 AM UTC)

**Purpose:** Continuous security monitoring

**Jobs:**
- ✅ **npm Audit**
  - Scans for vulnerable dependencies
  - Generates audit report
  - Fails on high-severity issues

- ✅ **Secret Scanning**
  - Detects exposed API tokens
  - Checks for committed .env files
  - Prevents secret leaks

- ✅ **Code Security Analysis**
  - Verifies path traversal protection
  - Checks input validation
  - Detects hardcoded credentials

- ✅ **Dependency Review** (PR only)
  - Reviews new dependencies
  - Checks licenses (denies GPL-3.0, AGPL-3.0)
  - Flags security issues

**Duration:** ~2-4 minutes

---

### 4. **Release** (`release.yml`)
**Triggers:** Push tag matching `v*.*.*` (e.g., `v1.0.0`)
**Purpose:** Automated release creation

**Jobs:**
- ✅ **Create Release**
  - Runs full test suite
  - Generates changelog from commits
  - Creates GitHub Release with notes

- ✅ **Publish to npm** (optional)
  - Publishes package to npm registry
  - Requires `NPM_TOKEN` secret
  - Only for repository owner

**Duration:** ~4-6 minutes

---

## 🚀 Setup Instructions

### Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

#### Optional (for enhanced features):
- `CODECOV_TOKEN` - For coverage reports (get from https://codecov.io)
- `NPM_TOKEN` - For npm publishing (get from https://www.npmjs.com)

### Repository Settings

1. **Enable GitHub Actions:**
   - Go to Settings → Actions → General
   - Set "Actions permissions" to "Allow all actions"

2. **Branch Protection (recommended):**
   - Settings → Branches → Add rule for `main`
   - ✅ Require status checks before merging
   - ✅ Require branches to be up to date
   - Select: `Test Suite`, `ESLint Check`, `npm Audit`

3. **Dependency Review (recommended):**
   - Settings → Code security and analysis
   - Enable "Dependency graph"
   - Enable "Dependabot alerts"

---

## 📊 Workflow Badges

Add these to your README.md:

```markdown
![CI Pipeline](https://github.com/fullmeo/Sound_Weave_AI/actions/workflows/ci.yml/badge.svg)
![Code Quality](https://github.com/fullmeo/Sound_Weave_AI/actions/workflows/code-quality.yml/badge.svg)
![Security Audit](https://github.com/fullmeo/Sound_Weave_AI/actions/workflows/security-audit.yml/badge.svg)
```

---

## 🔄 Workflow Triggers

### Automatic Triggers

| Workflow | Push to main/develop | Pull Request | Schedule | Tag Push |
|----------|---------------------|--------------|----------|----------|
| CI Pipeline | ✅ | ✅ | ❌ | ❌ |
| Code Quality | ✅ | ✅ | ❌ | ❌ |
| Security Audit | ✅ | ✅ | ✅ Weekly | ❌ |
| Release | ❌ | ❌ | ❌ | ✅ |

### Manual Triggers

Run workflows manually from the Actions tab:
1. Go to Actions → Select workflow
2. Click "Run workflow"
3. Select branch
4. Click "Run workflow"

---

## 🐛 Troubleshooting

### CI Pipeline Fails

**Problem:** Tests failing
**Solution:**
```bash
# Run tests locally first
npm test

# Check specific test file
node --test tests/storage.test.js
```

**Problem:** Build verification fails
**Solution:**
```bash
# Check syntax locally
node --check src/index.js

# Validate all files
find src -name "*.js" -exec node --check {} \;
```

### Code Quality Fails

**Problem:** ESLint errors
**Solution:**
```bash
# Run lint locally
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

**Problem:** Prettier formatting
**Solution:**
```bash
# Check formatting
npm run format -- --check

# Auto-format
npm run format
```

### Security Audit Fails

**Problem:** Vulnerable dependencies
**Solution:**
```bash
# Check vulnerabilities
npm audit

# Auto-fix (if available)
npm audit fix

# Manual fixes
npm update <package-name>
```

**Problem:** Secret detected
**Solution:**
1. Remove secret from code
2. Add to `.env.example` (without actual value)
3. Update documentation
4. Rotate the exposed secret

### Release Workflow Issues

**Problem:** npm publish fails
**Solution:**
1. Verify `NPM_TOKEN` is set in secrets
2. Check package name is available on npm
3. Ensure you have publish permissions

**Problem:** Release notes empty
**Solution:**
1. Use conventional commits (feat:, fix:, docs:)
2. Write descriptive commit messages
3. Tag format must be `v1.2.3`

---

## 📈 Workflow Optimization

### Speed Improvements

1. **Use npm ci instead of npm install**
   - Already configured ✅
   - 2-3x faster installation

2. **Cache dependencies**
   - Already configured ✅
   - Uses `cache: 'npm'` in setup-node

3. **Run jobs in parallel**
   - All independent jobs run concurrently
   - Reduces total pipeline time

### Cost Optimization

GitHub Actions is free for public repositories with limits:
- **Free tier:** 2,000 minutes/month
- **Current usage:** ~10-15 minutes per PR
- **Estimated capacity:** ~130-200 PRs/month

**Tips to reduce usage:**
- Skip CI on documentation-only changes
- Use `[skip ci]` in commit messages when appropriate
- Optimize test suite for speed

---

## 🔒 Security Best Practices

### Secrets Management

✅ **DO:**
- Store sensitive data in GitHub Secrets
- Use environment variables in workflows
- Rotate secrets regularly
- Use separate secrets for dev/prod

❌ **DON'T:**
- Hardcode secrets in workflow files
- Echo secrets in logs
- Share secrets between unrelated workflows
- Commit secrets to repository

### Workflow Security

```yaml
# Limit permissions (recommended)
permissions:
  contents: read

# Only for specific needs
permissions:
  contents: write  # For releases
  pull-requests: write  # For PR comments
```

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Security Best Practices](https://docs.github.com/en/actions/security-guides)
- [npm Publishing](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages)

---

## 🔄 Versioning & Releases

### Creating a Release

1. **Update version in package.json:**
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Push tag to trigger release:**
   ```bash
   git push origin v1.0.1
   ```

3. **GitHub Actions will:**
   - Run full test suite
   - Generate changelog
   - Create GitHub Release
   - Publish to npm (if configured)

### Semantic Versioning

Follow [SemVer](https://semver.org/):
- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes

---

## 📞 Support

**Issues with workflows?**
- Check workflow logs in Actions tab
- Review this README for troubleshooting
- Open an issue with the `ci/cd` label

---

**Status:** All workflows configured and ready ✅
