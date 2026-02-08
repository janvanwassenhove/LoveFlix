# GitHub Copilot Instructions for Architecture Documentation

## Purpose

This file provides specific guidelines for GitHub Copilot to maintain and update the 4+1 architecture documentation in `docs/architecture/`. These instructions ensure architecture docs stay synchronized with code changes and follow consistent standards.

## Critical Rule

⚠️ **ALWAYS UPDATE ARCHITECTURE DOCUMENTATION WHEN MAKING CODE CHANGES**

When you modify code that affects architecture, you MUST update the corresponding architecture documents in the same commit or pull request.

## Architecture Documentation Structure

```
docs/architecture/
├── README.md                  # Overview and navigation
├── 01-logical-view.md         # Classes, objects, design patterns
├── 02-process-view.md         # Runtime behavior, IPC, concurrency
├── 03-development-view.md     # Modules, build, dependencies
├── 04-physical-view.md        # Deployment, network, storage
└── 05-scenarios.md            # Use cases, workflows
```

## When to Update Each View

### 01-logical-view.md

Update when:
- ✅ Adding new classes or modules
- ✅ Changing class relationships or dependencies
- ✅ Modifying data models (Movie data, TMDB data, Settings)
- ✅ Implementing new design patterns
- ✅ Adding extension points (new AI models, languages, views)
- ✅ Changing IPC handler structure

**Examples**:
- Adding new IPC handler → Update "Key IPC Handlers" section
- Adding new AI model option → Update "Extension Points" and "Key Components"
- Modifying data model → Update "Data Models" section

### 02-process-view.md

Update when:
- ✅ Changing IPC communication patterns
- ✅ Modifying async/await flows
- ✅ Adding or removing API calls
- ✅ Changing concurrency model (sequential vs. parallel)
- ✅ Updating error handling strategies
- ✅ Modifying progress reporting
- ✅ Changing timing or performance characteristics

**Examples**:
- Making API calls parallel → Update sequence diagrams and "Concurrency Characteristics"
- Adding retry logic → Update "Error Handling and Recovery"
- New progress events → Update "Movie Transformation Process" diagram

### 03-development-view.md

Update when:
- ✅ Adding or removing dependencies (npm packages, Python libraries)
- ✅ Modifying build configuration
- ✅ Changing folder structure
- ✅ Updating build scripts or commands
- ✅ Adding new configuration files
- ✅ Changing development workflow
- ✅ Updating version numbers

**Examples**:
- Running `npm install new-package` → Update "Dependency Management" section
- Adding new script to package.json → Update "Build Commands"
- Creating new folder → Update "Project Structure"

### 04-physical-view.md

Update when:
- ✅ Changing deployment architecture
- ✅ Modifying network communication (new APIs, protocols)
- ✅ Updating system requirements
- ✅ Changing storage locations or formats
- ✅ Modifying security mechanisms
- ✅ Adding new external service dependencies
- ✅ Changing installer configuration

**Examples**:
- Adding new API endpoint → Update "Network Architecture" and "Cloud Dependency Architecture"
- Changing file storage location → Update "Storage Architecture"
- New installer options → Update "Installation and Distribution"

### 05-scenarios.md

Update when:
- ✅ Adding new features or capabilities
- ✅ Changing user workflows
- ✅ Modifying UI flows or navigation
- ✅ Adding new error scenarios
- ✅ Implementing new use cases
- ✅ Changing functional requirements

**Examples**:
- New feature → Add new use case (UC-XX)
- Changed workflow → Update existing use case steps
- New error handling → Add alternative flow

## Update Checklist

When making code changes, go through this checklist:

```
For each code change, ask:
[ ] Does this add/modify classes or modules? → Update 01-logical-view.md
[ ] Does this change runtime behavior or IPC? → Update 02-process-view.md
[ ] Does this affect build or dependencies? → Update 03-development-view.md
[ ] Does this change deployment or networking? → Update 04-physical-view.md
[ ] Does this change user workflows? → Update 05-scenarios.md
[ ] Does this require README.md updates? → Update docs/architecture/README.md
```

## Documentation Format Standards

### Section Headers
- Use clear, descriptive headers
- Follow existing hierarchy (##, ###, ####)
- Be consistent with existing sections

### Diagrams
Use ASCII art for diagrams with these conventions:
- Boxes: `┌─┐ └─┘ │ ─`
- Arrows: `→ ← ↑ ↓`
- Connections: `├ ┤ ┬ ┴ ┼`

**Example**:
```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dependency │
└─────────────┘
```

### Code Examples
- Use proper markdown code fences with language identifiers
- Keep examples concise and relevant
- Show actual code from the project when possible

### Cross-References
- Link to other views when mentioning related concepts
- Use relative links: `[Logical View](01-logical-view.md)`
- Reference specific sections: `[Component Architecture](01-logical-view.md#component-architecture)`

### Metadata
Every document must have footer metadata:
```markdown
---

**Last Updated**: YYYY-MM-DD  
**Maintainer**: See `.github/architecture-copilot-instructions.md` for update guidelines
```

Update the date when making changes.

## Common Update Scenarios

### Scenario 1: Adding a New Feature

**Example**: Adding a "Favorites" feature to save preferred collections

**Updates Required**:
1. **01-logical-view.md**:
   - Add Favorites component to component architecture
   - Document Favorites data model
   - Add to extension points

2. **02-process-view.md**:
   - Add IPC flow for adding/removing favorites
   - Update state management section

3. **03-development-view.md**:
   - Update module organization if new files added
   - Update folder structure diagram

4. **04-physical-view.md**:
   - Update storage architecture with favorites.json location

5. **05-scenarios.md**:
   - Add UC-11: Mark Collection as Favorite
   - Add UC-12: View Favorite Collections
   - Update use case dependencies diagram

### Scenario 2: Changing API Integration

**Example**: Switching from OpenAI to Azure OpenAI Service

**Updates Required**:
1. **01-logical-view.md**:
   - Update OpenAIClient class description
   - Update API endpoint references

2. **02-process-view.md**:
   - Update API communication sequence diagrams
   - Update authentication flow

3. **03-development-view.md**:
   - Update dependencies (new SDK package)
   - Update configuration management

4. **04-physical-view.md**:
   - Update cloud dependency architecture diagram
   - Update network architecture with new endpoints
   - Update security architecture

5. **05-scenarios.md**:
   - Update UC-02 (API key configuration)
   - Update authentication-related scenarios

### Scenario 3: Refactoring Code Structure

**Example**: Splitting renderer.js into multiple modules

**Updates Required**:
1. **01-logical-view.md**:
   - Update component architecture
   - Show new module relationships

2. **03-development-view.md**:
   - Update project structure
   - Update module organization diagram
   - Update module dependencies

### Scenario 4: Optimizing Performance

**Example**: Implementing parallel API calls

**Updates Required**:
1. **02-process-view.md**:
   - Update sequence diagrams (parallel arrows)
   - Update concurrency characteristics
   - Update performance characteristics

2. **05-scenarios.md**:
   - Update UC-01 with new timing
   - Update performance scenarios

## Automation Guidelines

### For Simple Changes
If the code change is small and localized:
1. Identify affected view(s) using checklist
2. Update only the specific sections impacted
3. Update "Last Updated" date
4. Commit architecture changes with code

### For Complex Changes
If the code change affects multiple views:
1. Create todo list of required doc updates
2. Update each view systematically
3. Ensure consistency across all views
4. Update README.md if navigation changes
5. Review all cross-references still work
6. Commit architecture changes with code

### For New Features
When implementing entirely new features:
1. Start by drafting use case in 05-scenarios.md
2. Work backwards to determine required architecture changes
3. Update all relevant views
4. Add new sections as needed
5. Update README.md with links to new sections

## Quality Standards

### Completeness
- ✅ All diagrams are up to date
- ✅ All code examples reflect current codebase
- ✅ All cross-references are valid
- ✅ All new components documented
- ✅ All new workflows documented

### Accuracy
- ✅ Technical details match actual implementation
- ✅ Diagrams show actual structure/flow
- ✅ Dependencies are current versions
- ✅ File paths are correct
- ✅ API endpoints are correct

### Consistency
- ✅ Same terminology used across all views
- ✅ Same formatting conventions
- ✅ Same level of detail
- ✅ Coherent narrative across views

### Clarity
- ✅ Diagrams are easy to understand
- ✅ Explanations are concise
- ✅ Technical jargon explained
- ✅ Examples are helpful

## Integration with Main Copilot Instructions

This file supplements `.github/copilot-instructions.md`. When both apply:
1. Follow main copilot-instructions.md for general development
2. Follow this file for architecture documentation specifics
3. In case of conflict, this file takes precedence for architecture docs

## Special Considerations

### Breaking Changes
When making breaking changes to APIs or architecture:
1. Document the old architecture first (if not already documented)
2. Document the new architecture
3. Add migration notes in affected views
4. Update scenarios to reflect new workflows

### Experimental Features
When adding experimental or optional features:
1. Mark them clearly in documentation with 🧪 emoji
2. Document current status and future plans
3. Update "Future Architecture Considerations" in README.md

### Deprecated Features
When deprecating features:
1. Mark as deprecated in relevant views with ⚠️ emoji
2. Document replacement or migration path
3. Keep documentation until feature is fully removed
4. Remove documentation when feature is deleted from code

## Review Checklist for Architecture Updates

Before committing architecture documentation changes:

```
[ ] All affected views have been updated
[ ] Diagrams reflect current implementation
[ ] Cross-references are valid
[ ] Code examples are from actual codebase
[ ] "Last Updated" dates are current
[ ] Formatting is consistent with existing docs
[ ] No broken links
[ ] Technical accuracy verified
[ ] Terminology is consistent across views
[ ] Changes align with code changes in same commit
```

## Examples of Good Architecture Updates

### Example 1: Adding TMDB Integration

**Code Changes**:
- Added TMDB API client in main.js
- Added Top 10 view in index.html
- Added IPC handler for fetchTop10

**Architecture Documentation Updates**:

**01-logical-view.md**:
```markdown
## Key Components

**main.js (Main Process)**
- **Responsibilities**:
  ...
  - TMDB API Integration  // <-- ADDED
  ...
- **Key IPC Handlers**:
  ...
  - `fetch-top10` - Fetch trending movies/shows by country  // <-- ADDED
```

**02-process-view.md**:
```markdown
### 2. TMDB Top 10 Fetch Process

[Sequence diagram showing complete flow]  // <-- ADDED ENTIRE SECTION

**Concurrency Characteristics**:
- Parallel API calls to TMDB (movies and TV shows)
- Uses `Promise.all()` for concurrent fetching
```

**03-development-view.md**:
```markdown
"dependencies": {
  "axios": "^1.6.2",  // <-- ADDED
  ...
}
```

**04-physical-view.md**:
```markdown
2. **api.themoviedb.org** (Optional)  // <-- ADDED
   - Purpose: Trending movies/shows data
   - Fallback: Feature unavailable
   - Timeout: 10 seconds
```

**05-scenarios.md**:
```markdown
### UC-04: Discover Trending Movies (Top 10)  // <-- ADDED ENTIRE USE CASE
```

## Troubleshooting

### Problem: Forgot to update docs with code change
**Solution**: 
1. Review the update checklist above
2. Identify which views were affected
3. Make a separate commit with architecture updates
4. Add note in commit message referencing original code commit

### Problem: Unsure which views to update
**Solution**:
1. Use the "When to Update Each View" section
2. Check similar past changes for guidance
3. When in doubt, update more rather than less
4. Better to over-document than under-document

### Problem: Diagrams are difficult to maintain
**Solution**:
1. Use simple ASCII art diagrams
2. Focus on clarity over beauty
3. Consider tools like Mermaid for complex diagrams (future)
4. Document the "what" not just the "how"

---

**Remember**: Architecture documentation is code's long-term memory. Keep it accurate, complete, and up to date!

**Last Updated**: 2026-02-08  
**Maintainer**: Development Team
