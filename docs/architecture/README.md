# LoveFlix Architecture Documentation

## Overview

This directory contains comprehensive architectural documentation for LoveFlix using the **4+1 Architectural View Model**. This model provides multiple perspectives on the system architecture to address the concerns of different stakeholders.

## What is the 4+1 Model?

The 4+1 architectural view model organizes the description of a software architecture using five concurrent views:

```
                    ┌─────────────────┐
                    │   Scenarios     │
                    │   (Use Cases)   │
                    │      "+1"       │
                    └────────┬────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
        ┌────────▼──────┐    │    ┌─────▼──────────┐
        │   Logical     │    │    │    Physical    │
        │     View      │    │    │      View      │
        │  (Structure)  │    │    │  (Deployment)  │
        └───────────────┘    │    └────────────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
        ┌────────▼──────┐    │    ┌─────▼──────────┐
        │   Process     │    │    │  Development   │
        │     View      │    │    │      View      │
        │  (Runtime)    │    │    │    (Modules)   │
        └───────────────┘    │    └────────────────┘
                             │
                    The Scenarios tie
                    all views together
```

## Documentation Structure

### [01 - Logical View](01-logical-view.md) 📐
**Purpose**: Describes the system's structure and key abstractions

**Contents**:
- Component architecture for Python CLI and Electron desktop app
- Key classes and their responsibilities
- Design patterns used (MVC, Bridge, Strategy, Repository)
- Data models and class relationships
- Extension points for future development

**Stakeholders**: Developers, Architects

---

### [02 - Process View](02-process-view.md) ⚡
**Purpose**: Describes the runtime behavior and communication

**Contents**:
- Multi-process architecture (Electron)
- IPC communication patterns
- Sequence diagrams for key workflows
- Concurrency and synchronization
- Performance characteristics
- Error handling strategies

**Stakeholders**: Developers, Performance Engineers

---

### [03 - Development View](03-development-view.md) 🔧
**Purpose**: Describes the software module organization

**Contents**:
- Project structure and folder layout
- Module dependencies
- Build system configuration
- Development workflow
- Configuration management
- Testing strategy
- Documentation standards

**Stakeholders**: Developers, Build Engineers, DevOps

---

### [04 - Physical View](04-physical-view.md) 🖥️
**Purpose**: Describes the deployment and hardware topology

**Contents**:
- Deployment architectures (CLI, Desktop, Cloud dependencies)
- System requirements
- Installation and distribution
- Network architecture and protocols
- Storage layout
- Security architecture
- Scalability considerations

**Stakeholders**: System Administrators, DevOps, Security Teams

---

### [05 - Scenarios (Use Cases)](05-scenarios.md) 🎬
**Purpose**: Ties all views together through real-world usage scenarios

**Contents**:
- Primary use cases (UC-01 through UC-05)
- Secondary use cases (UC-06 through UC-10)
- Alternative and error flows
- Non-functional scenarios (performance, security, reliability)
- Traceability matrix linking scenarios to other views

**Stakeholders**: All stakeholders, Product Managers, QA

---

## How to Use This Documentation

### For New Developers
1. Start with **[Scenarios](05-scenarios.md)** to understand what the system does
2. Read **[Logical View](01-logical-view.md)** to understand the code structure
3. Review **[Development View](03-development-view.md)** to set up your environment
4. Consult other views as needed for specific concerns

### For Architects
1. Review all views to understand the complete architecture
2. Use as reference when making architectural decisions
3. Update relevant views when architecture changes

### For Operations/DevOps
1. Focus on **[Physical View](04-physical-view.md)** for deployment
2. Reference **[Development View](03-development-view.md)** for build processes
3. Check **[Process View](02-process-view.md)** for runtime characteristics

### For Product Managers
1. Read **[Scenarios](05-scenarios.md)** to understand user workflows
2. Consult **[Physical View](04-physical-view.md)** for deployment options
3. Reference other views for technical constraints and possibilities

## Architecture Principles

### 1. Security by Design
- **Process Isolation**: Electron's main/renderer separation
- **Minimal Privileges**: Renderer has no direct Node.js access
- **Secure Communication**: IPC via contextBridge only
- **API Key Protection**: Environment variables preferred

### 2. Simplicity
- **Minimal Dependencies**: Only essential libraries
- **Flat Structure**: Easy to navigate codebase
- **Direct Communication**: No complex middleware
- **Local-First**: All data stored locally

### 3. User Experience
- **Responsive UI**: Non-blocking operations
- **Progress Feedback**: Real-time transformation updates
- **Error Clarity**: Clear error messages with guidance
- **Netflix Aesthetic**: Familiar, polished interface

### 4. Extensibility
- **Plugin Points**: Easy to add new AI models
- **Language Support**: Extensible language options
- **View System**: Easy to add new UI sections
- **API Abstraction**: Easy to swap or add APIs

## Technology Stack

### Python CLI
- **Runtime**: Python 3.8+
- **API Client**: OpenAI SDK
- **HTTP**: requests library
- **Images**: Pillow

### Electron Desktop
- **Framework**: Electron 28+
- **Runtime**: Node.js 18+
- **API Clients**: OpenAI SDK, axios
- **Storage**: electron-store
- **UI**: Vanilla HTML/CSS/JS

## Key Design Decisions

### Decision 1: Local-First Architecture
**Rationale**: Simplicity, privacy, and offline capabilities
- No backend server required
- All data stored on user's machine
- No database setup needed
- User has full control of data

### Decision 2: Electron for Desktop
**Rationale**: Cross-platform with modern UI
- Single codebase for Windows, macOS, Linux
- Leverages web technologies
- Easy to build Netflix-style UI
- Good developer experience

### Decision 3: Sequential API Calls
**Rationale**: Simplicity and context preservation
- Title generated first
- Summary uses generated title for context
- Poster uses both title and summary
- Clear progress indication (33%, 66%, 100%)
- **Trade-off**: Longer total time vs. better quality

### Decision 4: File-Based Collections
**Rationale**: Simplicity and portability
- No database setup required
- Easy to backup (just copy folder)
- Human-readable (README.md)
- Easy to share collections
- **Trade-off**: Slower loading for many collections

## Future Architecture Considerations

### Potential Enhancements

1. **Parallel API Calls**
   - Generate title and summary concurrently
   - Reduce total transformation time by 30-50%
   - Trade-off: Summary may not reference exact romantic title

2. **Database Integration**
   - SQLite for faster collection queries
   - Enable searching and filtering
   - Track transformation history
   - Trade-off: Increased complexity

3. **Cloud Sync**
   - Optional cloud backup of collections
   - Sync across multiple devices
   - Share collections with others
   - Trade-off: Privacy concerns, cost

4. **Content Delivery Network (CDN)**
   - Cache generated posters
   - Reduce redundant API calls
   - Share popular transformations
   - Trade-off: Centralized service needed

5. **Microservices Architecture**
   - Separate API gateway
   - Dedicated transformation service
   - Rate limiting and queue management
   - Trade-off: Much higher complexity

## Maintenance Guidelines

### When to Update Architecture Docs

**You MUST update architecture documentation when**:
- Adding new features or capabilities
- Changing IPC communication patterns
- Modifying data models or storage
- Adding or removing dependencies
- Changing deployment architecture
- Updating build processes
- Changing security mechanisms

**How to update**:
See **[`.github/architecture-copilot-instructions.md`](../../.github/architecture-copilot-instructions.md)** for detailed guidelines on maintaining architecture documentation with GitHub Copilot's assistance.

### Documentation Ownership

- **Overall Architecture**: Development team collectively
- **Specific Views**: See "Last Updated" and "Maintainer" in each document
- **Automation**: GitHub Copilot via architecture-copilot-instructions.md

## Quick Reference

| View | Focus | Key Diagrams | Update Frequency |
|------|-------|-------------|------------------|
| Logical | Classes & Objects | Component diagrams, Class relationships | With code structure changes |
| Process | Runtime Behavior | Sequence diagrams, IPC flows | With concurrency changes |
| Development | Modules & Build | Folder structure, Dependencies | With build changes |
| Physical | Deployment | Network topology, Storage layout | With deployment changes |
| Scenarios | Use Cases | Use case flows, Traceability matrix | With feature changes |

## Related Documentation

- **[Main README](../../README.md)**: Project overview and quick start
- **[Electron App README](../../electron-app/README.md)**: Desktop app details
- **[TMDB Integration](../../TMDB_INTEGRATION.md)**: TMDB feature documentation
- **[Copilot Instructions](../../.github/copilot-instructions.md)**: AI assistant guidelines
- **[Architecture Copilot Instructions](../../.github/architecture-copilot-instructions.md)**: Architecture doc maintenance

## Contributing to Architecture Docs

When contributing to these architecture documents:

1. **Be Consistent**: Follow the existing format and style
2. **Be Comprehensive**: Cover all aspects of the change
3. **Be Visual**: Include diagrams where helpful
4. **Be Clear**: Write for readers unfamiliar with the code
5. **Cross-Reference**: Link to related views and documents
6. **Update Metadata**: Change "Last Updated" date in modified documents

## Document History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-08 | 1.0 | Initial 4+1 architecture documentation | GitHub Copilot |

---

**For questions or suggestions about this architecture documentation, please open an issue on GitHub.**

**Last Updated**: 2026-02-08  
**Maintainer**: See `.github/architecture-copilot-instructions.md` for update guidelines
