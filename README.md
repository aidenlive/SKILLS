# Claude Skills Stack

**Production-ready Claude Skills for modern web development**

A comprehensive collection of uploadable Skills for Claude.ai and Claude Desktop, covering frontend, backend, full-stack, design systems, and validation patterns. Transformed from battle-tested agent references into portable, reusable capabilities.

**Version:** 1.0.0
**Last Updated:** October 2025

---

## What Are Claude Skills?

Claude Skills are self-contained capability packages that extend Claude's functionality across all Anthropic platforms. They combine instructions, executable code, and resources in a format that Claude can discover and load dynamically.

**Key Benefits:**
- **Composable:** Skills automatically stack together for complex workflows
- **Portable:** Same format works across Claude.ai, Claude Code, and API
- **Efficient:** Each skill uses only 30-50 tokens until loaded
- **Discoverable:** Claude autonomously decides when to invoke them

---

## Repository Structure

```
claude-skills-stack/
├── frontend/
│   ├── static-web-guide/          # Static HTML/CSS/JS projects
│   ├── react-vite-guide/          # React + Vite applications
│   └── component-library/         # Reusable UI components
├── backend/
│   ├── fastapi-guide/             # Python FastAPI APIs
│   ├── nodejs-api-guide/          # Node.js REST APIs
│   └── api-validation/            # Zod/Pydantic validation
├── fullstack/
│   ├── architecture-guide/        # Full-stack architecture
│   └── integration-patterns/      # Frontend-backend integration
├── design-system/
│   ├── oklch-tokens/              # OKLCH color tokens
│   ├── monochrome-palette/        # Monochrome design system
│   └── mobile-first-layouts/      # Responsive layout patterns
├── validation/
│   ├── accessibility-check/       # WCAG compliance
│   ├── performance-audit/         # Performance optimization
│   └── security-review/           # Security best practices
├── README.md                      # This file
└── PACKAGING-GUIDE.md             # How to package and upload
```

---

## Skills Catalog

### Frontend Skills

#### **static-web-guide**
> Guide for creating modular static HTML/CSS/JS projects with OKLCH tokens, zero build step, semantic markup, and mobile-first design.

**Use when:**
- Building static websites or landing pages
- Creating projects without build tooling
- Implementing semantic markup and accessibility patterns

#### **react-vite-guide**
> Standards for React + Vite applications with OKLCH tokens, functional components, hooks patterns, and mobile-first design.

**Use when:**
- Building React applications or SPAs
- Creating component-driven user interfaces
- Working with modern React patterns

#### **component-library**
> Create reusable UI components following OKLCH token system, no flex-wrap rule, and monochrome aesthetic.

**Use when:**
- Designing component libraries or design systems
- Building reusable UI component collections
- Implementing design tokens and theming

### Backend Skills

#### **fastapi-guide**
> FastAPI microservices with async operations, Pydantic validation, and auto-generated docs.

**Use when:**
- Building Python REST APIs or microservices
- Creating FastAPI applications with async patterns
- Implementing typed models with Pydantic

#### **nodejs-api-guide**
> Node.js REST APIs with TypeScript, Zod validation, and modular routing.

**Use when:**
- Building Node.js APIs or microservices
- Creating Express/Fastify applications
- Working with TypeScript backends

#### **api-validation**
> Comprehensive API validation patterns using Zod (Node.js) or Pydantic (Python) with structured error responses.

**Use when:**
- Implementing input validation for APIs
- Defining API contracts and schemas
- Creating request/response validation

### Full-Stack Skills

#### **architecture-guide**
> Full-stack architecture with shared design tokens, unified conventions, and modular structure.

**Use when:**
- Architecting full-stack applications
- Setting up monorepo structures
- Integrating frontend and backend systems

#### **integration-patterns**
> Frontend-backend integration patterns with type safety, error handling, and consistent data flow.

**Use when:**
- Connecting frontend and backend systems
- Designing API contracts
- Implementing data fetching patterns

### Design System Skills

#### **oklch-tokens**
> OKLCH color token system for perceptually uniform monochrome palettes with light/dark theme support.

**Use when:**
- Designing color systems or palettes
- Implementing theme systems (light/dark mode)
- Creating design tokens

#### **monochrome-palette**
> Monochrome aesthetic with grayscale values, spatial hierarchy, and purposeful minimalism.

**Use when:**
- Designing minimal interfaces
- Establishing visual identity through hierarchy
- Creating elegant, focused designs

#### **mobile-first-layouts**
> Mobile-first layouts (320-1440px) with 24-column grid, 4px spacing scale, no flex-wrap.

**Use when:**
- Designing responsive layouts
- Creating page templates
- Implementing mobile-first design strategies

### Validation Skills

#### **accessibility-check**
> WCAG compliance checklist covering ARIA, keyboard navigation, focus management, and semantic HTML.

**Use when:**
- Auditing accessibility compliance
- Implementing inclusive design patterns
- Validating WCAG conformance

#### **performance-audit**
> Performance optimization covering bundle size, lazy loading, image optimization, and Core Web Vitals.

**Use when:**
- Optimizing application performance
- Preparing for production deployment
- Auditing performance metrics

#### **security-review**
> Security best practices covering XSS, CSRF, authentication, authorization, and data validation.

**Use when:**
- Reviewing application security
- Implementing authentication systems
- Auditing for vulnerabilities

---

## Quick Start

### For Claude.ai (Web Application)

1. **Package a skill:**
   ```bash
   cd frontend/static-web-guide
   zip -r static-web-guide.zip .
   ```

2. **Upload to Claude.ai:**
   - Go to Settings → Capabilities → Skills
   - Toggle "Enable Skills" to on
   - Click "Upload Custom Skill"
   - Select your ZIP file
   - Save and activate

### For Claude Desktop

1. **Package a skill:**
   ```bash
   cd backend/fastapi-guide
   zip -r fastapi-guide.zip .
   ```

2. **Upload to Claude Desktop:**
   - Open Settings → Skills
   - Click "Upload Skill"
   - Select your ZIP file
   - Skill is now available in all chats

### For Claude Code

1. **Clone this repository:**
   ```bash
   git clone https://github.com/your-org/claude-skills-stack.git
   cd claude-skills-stack
   ```

2. **Install skills (project-level):**
   ```bash
   # In your project directory
   mkdir -p .claude/skills
   cp -r /path/to/claude-skills-stack/frontend/react-vite-guide .claude/skills/
   ```

3. **Install skills (personal-level):**
   ```bash
   mkdir -p ~/.claude/skills
   cp -r /path/to/claude-skills-stack/design-system/oklch-tokens ~/.claude/skills/
   ```

4. **Use in Claude Code:**
   - Skills are automatically discovered
   - Claude will invoke them when relevant to your task

### For Claude API

See [PACKAGING-GUIDE.md](PACKAGING-GUIDE.md) for API usage examples.

---

## Design Philosophy

All skills in this repository follow a unified design philosophy:

**OKLCH-Driven Design**
- Perceptually uniform color system
- Monochrome first, color as signal
- Light and dark theme support

**Zero Visual Bloat**
- Purposeful minimalism
- Hierarchy through space and scale
- No decoration without function

**Production-Ready Always**
- WCAG 2.1 Level AA accessibility
- Core Web Vitals optimization
- Security best practices built-in

**Conventions**
- Mobile-first layouts (320-1440px)
- 24-column grid system
- 4px base spacing scale
- No flex-wrap (use scroll or truncation)
- Semantic HTML and ARIA patterns
- Type-safe validation (Zod/Pydantic)

---

## How Claude Uses Skills

### Discovery Phase
Claude preloads only the `name` and `description` of every installed skill. This keeps context efficient (30-50 tokens per skill).

### Loading Phase
When a task matches a skill's description, Claude loads the full `SKILL.md` and references additional resources as needed.

### Autonomous Invocation
Claude decides when to use skills based on:
- User's request matching skill description
- Task requirements aligning with skill capabilities
- Explicit mention of skill by name

---

## Platform Comparison

| Feature | Claude.ai | Claude Desktop | Claude Code | API |
|---------|-----------|----------------|-------------|-----|
| **Format** | ZIP upload | ZIP upload | Directory | ZIP/strings/IDs |
| **Discovery** | Automatic | Automatic | Automatic | Manual |
| **Sharing** | Manual | Manual | Git (automatic) | Programmatic |
| **Version Control** | Manual | Manual | Git-integrated | API versioning |

**Recommendation:**
- **Individual use:** Claude.ai or Desktop
- **Team collaboration:** Claude Code (Git-based)
- **Production apps:** API (programmatic control)

---

## Skill Naming Conventions

All skills follow consistent naming:
- **Directory name:** `kebab-case` (e.g., `static-web-guide`)
- **Skill name in YAML:** Matches directory (e.g., `name: static-web-guide`)
- **Version:** Semantic versioning (e.g., `version: 1.0.0`)

---

## Contributing

Want to add or improve skills?

1. Follow the existing skill structure
2. Include YAML frontmatter with `name`, `description`, `version`
3. Keep SKILL.md under 200 lines
4. Add detailed examples in `resources/` directory
5. Test with multiple platforms (Web, Desktop, Code)

---

## Version History

**v1.0.0** (October 2025)
- Initial release with 13 core skills
- Frontend: 3 skills
- Backend: 3 skills
- Full-stack: 2 skills
- Design system: 3 skills
- Validation: 3 skills

---

## Resources

**Official Documentation:**
- [Claude Skills Documentation](https://docs.claude.com/en/docs/claude-code/skills)
- [Using Skills with the API](https://docs.claude.com/en/api/skills-guide)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

**Community:**
- [Awesome Claude Skills](https://github.com/travisvn/awesome-claude-skills)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)

**This Repository:**
- [Packaging Guide](PACKAGING-GUIDE.md) - Detailed packaging and upload instructions
- [Agent References](@AGENTS-REFERENCE/) - Original agent source files

---

## License

This repository is provided as-is for use with Claude by Anthropic.

---

## Support

For issues or questions:
- **Documentation:** See [PACKAGING-GUIDE.md](PACKAGING-GUIDE.md)
- **Claude Code:** Run `/help` in Claude Code
- **Web/Desktop:** Visit Claude Help Center

---

**Built with Claude, for Claude.**

*Transform your development workflow with production-ready skills.*
