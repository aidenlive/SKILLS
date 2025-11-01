

# Claude Skills Packaging Guide

**Complete guide to packaging and uploading skills to Claude.ai, Claude Desktop, Claude Code, and the Claude API**

---

## Table of Contents

1. [Understanding Skill Structure](#understanding-skill-structure)
2. [Packaging for Claude.ai (Web)](#packaging-for-claudeai-web)
3. [Packaging for Claude Desktop](#packaging-for-claude-desktop)
4. [Installing in Claude Code](#installing-in-claude-code)
5. [Using with Claude API](#using-with-claude-api)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Understanding Skill Structure

Every Claude Skill must have a specific structure:

```
skill-name/
├── SKILL.md              # Required: Core instructions with YAML frontmatter
├── resources/            # Optional: Supporting documentation
│   ├── examples.md
│   └── reference.md
├── scripts/              # Optional: Executable helpers
│   └── helper.py
└── templates/            # Optional: Reusable templates
    └── template.txt
```

### SKILL.md Format

Every `SKILL.md` must start with YAML frontmatter:

```markdown
---
name: skill-name
description: Clear, specific description that triggers skill invocation. Include keywords users would mention when needing this skill.
version: 1.0.0
---

# Skill Title

## Purpose
Brief explanation of what this skill does.

## When to Use This Skill
Clear triggers for when Claude should use this skill.

## Instructions
Step-by-step guidance...
```

**Critical Requirements:**
- YAML frontmatter must be first thing in file
- `name`, `description`, and `version` are required
- Description should be specific and include trigger keywords
- Keep under 200 lines (move detailed content to `resources/`)

---

## Packaging for Claude.ai (Web)

### Prerequisites

- Claude Pro, Max, Team, or Enterprise plan
- Code execution enabled (Settings → Features)
- For Team/Enterprise: Admin must enable Skills organization-wide

### Step 1: Package the Skill

From the repository root:

```bash
# Navigate to the skill directory
cd frontend/static-web-guide

# Create ZIP file (include all subdirectories)
zip -r static-web-guide.zip .

# Verify contents
unzip -l static-web-guide.zip
```

**Important:**
- ZIP the contents, not the directory itself
- Include `resources/`, `scripts/`, and `templates/` folders if present
- File should be named after the skill

### Step 2: Upload to Claude.ai

1. **Navigate to Skills Settings:**
   - Go to https://claude.ai
   - Click your profile icon (bottom left)
   - Select "Settings"
   - Click "Capabilities" → "Skills"

2. **Enable Skills:**
   - Toggle "Enable Skills" to ON
   - (First time only)

3. **Upload Custom Skill:**
   - Click "Upload Custom Skill"
   - Select your ZIP file
   - Wait for upload to complete

4. **Verify Upload:**
   - Skill should appear in your skills list
   - Toggle should be enabled by default
   - Test in a new chat

### Step 3: Test the Skill

Start a new chat and ask Claude to do something that matches the skill description:

```
For static-web-guide:
"Create a static HTML page with semantic markup and OKLCH colors"

For fastapi-guide:
"Build a FastAPI endpoint with Pydantic validation"
```

Claude should automatically invoke the skill (you'll see it mentioned in the response).

### Managing Skills in Claude.ai

**View Installed Skills:**
- Settings → Capabilities → Skills
- Shows all uploaded and system skills

**Disable a Skill:**
- Toggle off the skill in settings
- Skill remains installed but won't be invoked

**Remove a Skill:**
- Click trash icon next to skill
- Permanent deletion (need to re-upload to restore)

---

## Packaging for Claude Desktop

### Prerequisites

- Claude Desktop app installed
- Same plan requirements as Web (Pro, Max, Team, Enterprise)

### Step 1: Package the Skill

Same as Claude.ai - create a ZIP file:

```bash
cd backend/fastapi-guide
zip -r fastapi-guide.zip .
```

### Step 2: Upload to Claude Desktop

1. **Open Settings:**
   - Launch Claude Desktop
   - Click "Claude" menu (Mac) or "File" (Windows)
   - Select "Settings" or press `Cmd+,` (Mac) / `Ctrl+,` (Windows)

2. **Navigate to Skills:**
   - Click "Skills" in sidebar
   - Or search "skills" in settings search

3. **Upload Skill:**
   - Click "Upload Skill" button
   - Select your ZIP file
   - Wait for upload confirmation

4. **Verify:**
   - Skill appears in list
   - Toggle is enabled

### Step 3: Test in Desktop

Open a new chat and test with relevant prompts:

```
For nodejs-api-guide:
"Create a Node.js REST API with TypeScript and Zod validation"
```

### Managing Skills in Desktop

Skills are stored locally and persist across app restarts:

**Location:**
- macOS: `~/Library/Application Support/Claude/skills/`
- Windows: `%APPDATA%\Claude\skills\`
- Linux: `~/.config/Claude/skills/`

**Enable/Disable:**
- Toggle in Settings → Skills

**Remove:**
- Click remove button in Settings
- Or manually delete from skills directory

---

## Installing in Claude Code

Claude Code uses a **directory-based** approach (no ZIP files needed).

### Three Installation Levels

#### 1. Personal Skills (Global)

Available in all your projects:

```bash
# Create personal skills directory
mkdir -p ~/.claude/skills

# Copy skill directory
cp -r /path/to/claude-skills-stack/design-system/oklch-tokens ~/.claude/skills/

# Verify
ls ~/.claude/skills/
```

**Use for:**
- Personal workflow preferences
- Skills you use across all projects
- Custom shortcuts and patterns

#### 2. Project Skills (Version Controlled)

Shared with team via Git:

```bash
# In your project directory
mkdir -p .claude/skills

# Copy skill directory
cp -r /path/to/claude-skills-stack/fullstack/architecture-guide .claude/skills/

# Commit to Git
git add .claude/skills/
git commit -m "Add architecture-guide skill"
git push

# Team members get it automatically
git pull  # Skill now available
```

**Use for:**
- Project-specific conventions
- Team-shared workflows
- Capabilities tied to codebase

#### 3. Plugin Skills (Marketplace)

Installed via plugin system:

```bash
# Install from marketplace
/plugin marketplace add anthropics/skills

# Install from directory
/plugin add /path/to/skill-directory

# List installed plugins
claude plugin list
```

### Directory Structure in Claude Code

```
~/.claude/                    # Personal skills
└── skills/
    ├── oklch-tokens/
    └── my-custom-skill/

/project-root/.claude/        # Project skills (Git tracked)
└── skills/
    └── architecture-guide/

/project-root/plugins/        # Plugin skills
└── some-plugin/
    └── skills/
        └── plugin-skill/
```

### Skill Priority

If skills with same name exist at multiple levels:
1. Project skills (highest priority)
2. Personal skills
3. Plugin skills (lowest priority)

### Creating Skills in Claude Code

You can create skills directly:

```bash
# Create new skill
mkdir -p ~/.claude/skills/my-skill

# Create SKILL.md
cat > ~/.claude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: My custom workflow helper
version: 1.0.0
---

# My Skill

## Instructions
1. Step one
2. Step two
EOF

# Test in Claude Code
claude
# Ask Claude to use the skill
```

### Managing Skills in Claude Code

**List all skills:**
```bash
# In Claude Code session
/help skills
```

**Reload skills:**
Skills are loaded at session start. To reload:
```bash
# Exit and restart Claude Code
exit
claude
```

**Remove skills:**
```bash
# Personal skill
rm -rf ~/.claude/skills/skill-name

# Project skill
rm -rf .claude/skills/skill-name
git commit -am "Remove skill-name skill"
```

---

## Using with Claude API

The API offers three deployment methods.

### Method 1: Using Anthropic-Provided Skills

```python
import anthropic

client = anthropic.Anthropic(api_key="your-api-key")

response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": "Create a PowerPoint presentation about Q3 results"
    }],
    container={
        "enabled": ["code-execution"],
        "skills": [
            {
                "type": "skill_id",
                "skill_id": "pptx",
                "version": "1.0"
            }
        ]
    }
)
```

**Available skill IDs:**
- `pptx` - PowerPoint manipulation
- `docx` - Word document manipulation
- `xlsx` - Excel spreadsheet manipulation
- `pdf` - PDF manipulation

### Method 2: Upload Custom Skills

```python
import anthropic
import zipfile
import os

client = anthropic.Anthropic(api_key="your-api-key")

# Create skill ZIP
def create_skill_zip(skill_dir, output_path):
    with zipfile.ZipFile(output_path, 'w') as zf:
        for root, dirs, files in os.walk(skill_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, skill_dir)
                zf.write(file_path, arcname)

# Package skill
create_skill_zip('./frontend/static-web-guide', 'skill.zip')

# Upload skill
with open('skill.zip', 'rb') as f:
    skill_response = client.skills.create(
        name="static-web-guide",
        description="Guide for static HTML/CSS/JS projects",
        file=f
    )

skill_id = skill_response.id
print(f"Skill uploaded: {skill_id}")

# Use the skill
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": "Create a static website with semantic HTML"
    }],
    container={
        "enabled": ["code-execution"],
        "skills": [
            {"type": "skill_id", "skill_id": skill_id}
        ]
    }
)
```

### Method 3: Inline Skill Content

```python
response = client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": "Format this data..."
    }],
    container={
        "enabled": ["code-execution"],
        "skills": [
            {
                "type": "inline",
                "content": """---
name: custom-formatter
description: Custom data formatting rules
version: 1.0.0
---

# Custom Formatter

Format data according to these rules:
1. Sort by date
2. Group by category
3. Calculate totals
"""
            }
        ]
    }
)
```

### Managing API Skills

```python
# List all skills
skills = client.skills.list()
for skill in skills.data:
    print(f"{skill.name} (v{skill.version}): {skill.id}")

# Get specific skill
skill = client.skills.retrieve(skill_id="skill_abc123")
print(skill)

# Update skill (creates new version)
with open('updated-skill.zip', 'rb') as f:
    updated = client.skills.versions.create(
        skill_id="skill_abc123",
        file=f
    )

# Delete skill
client.skills.delete(skill_id="skill_abc123")
```

---

## Troubleshooting

### Skill Not Invoking

**Problem:** Claude doesn't use your skill

**Solutions:**

1. **Check description specificity:**
   ```yaml
   # ❌ Too vague
   description: Helps with web development

   # ✅ Specific
   description: Create static HTML/CSS/JS projects with semantic markup, OKLCH tokens, and mobile-first design. Use when building static websites or landing pages.
   ```

2. **Validate YAML frontmatter:**
   ```bash
   # Check for syntax errors
   head -n 10 SKILL.md
   ```

3. **Be explicit in prompt:**
   ```
   "Use the static-web-guide skill to create a landing page"
   ```

4. **Verify skill is enabled:**
   - Web/Desktop: Check Settings → Skills
   - Code: Skill directory exists and session restarted

### Upload Fails

**Problem:** ZIP upload fails or skill doesn't appear

**Solutions:**

1. **Check ZIP structure:**
   ```bash
   unzip -l skill.zip
   # Should see SKILL.md at root, not in subfolder
   ```

2. **Repackage correctly:**
   ```bash
   cd skill-directory
   zip -r ../skill-name.zip .
   # NOT: zip -r skill-name.zip skill-directory/
   ```

3. **Verify SKILL.md format:**
   - YAML frontmatter must be first
   - Three dashes before and after YAML
   - Required fields present

4. **Check file size:**
   - Keep under 5 MB
   - Move large resources to external links

### Skill Conflicts

**Problem:** Multiple skills triggering or conflicting

**Solutions:**

1. **Make descriptions distinct:**
   - Each skill should have unique trigger keywords
   - Avoid overlapping use cases

2. **Disable unused skills:**
   - In Settings → Skills, toggle off skills not needed

3. **Use explicit skill references:**
   - Mention skill by name in prompt

### Permission Errors (Claude Code)

**Problem:** Can't write to `.claude/skills/`

**Solutions:**

```bash
# Check permissions
ls -la ~/.claude/

# Fix permissions
chmod 755 ~/.claude
chmod 755 ~/.claude/skills

# Create if doesn't exist
mkdir -p ~/.claude/skills
```

---

## Best Practices

### Skill Design

1. **Clear Descriptions:**
   - Include keywords users would mention
   - Specify when to use (and when not to use)
   - Keep under 200 characters

2. **Modular Structure:**
   - One skill, one purpose
   - Compose multiple skills for complex workflows
   - Keep SKILL.md under 200 lines

3. **Resource Organization:**
   - Detailed examples in `resources/`
   - Executable tools in `scripts/`
   - Templates in `templates/`

4. **Version Management:**
   - Use semantic versioning (1.0.0)
   - Document changes in SKILL.md
   - Increment version on updates

### Testing

1. **Test on Multiple Platforms:**
   - Web (if applicable)
   - Desktop (if applicable)
   - Code (if applicable)

2. **Test with Varied Prompts:**
   - Direct mention of skill
   - Related keywords
   - Similar but distinct tasks

3. **Verify Skill Loading:**
   - Check Claude mentions skill in response
   - Verify instructions are followed

### Sharing

**For Individuals:**
- Share ZIP files directly
- Include README with upload instructions

**For Teams:**
- Use Claude Code with Git
- Commit to `.claude/skills/` directory
- Document in project README

**For Organizations:**
- Use API with programmatic management
- Centralize skill repository
- Version control and governance

### Maintenance

1. **Keep Skills Updated:**
   - Review quarterly
   - Update for new best practices
   - Incorporate user feedback

2. **Monitor Usage:**
   - Track which skills are invoked
   - Identify unused skills
   - Refine descriptions based on usage

3. **Document Changes:**
   - Maintain version history in SKILL.md
   - Use Git for change tracking (Code)

---

## Quick Reference

### Packaging Commands

```bash
# Create ZIP for Web/Desktop
cd skill-directory
zip -r skill-name.zip .

# Copy to Claude Code (personal)
cp -r skill-directory ~/.claude/skills/

# Copy to Claude Code (project)
cp -r skill-directory .claude/skills/

# Verify ZIP contents
unzip -l skill-name.zip

# Extract ZIP to test
unzip skill-name.zip -d test-dir/
```

### Platform Locations

**Claude.ai:**
- Upload via Settings → Capabilities → Skills
- No local storage (cloud-based)

**Claude Desktop:**
- macOS: `~/Library/Application Support/Claude/skills/`
- Windows: `%APPDATA%\Claude\skills\`
- Linux: `~/.config/Claude/skills/`

**Claude Code:**
- Personal: `~/.claude/skills/`
- Project: `.claude/skills/`
- Plugins: `plugins/*/skills/`

---

## Example Workflow

### Packaging All Skills

```bash
#!/bin/bash
# Package all skills in repository

OUTPUT_DIR="packaged-skills"
mkdir -p "$OUTPUT_DIR"

# Frontend skills
cd frontend
for skill in */; do
  skill_name="${skill%/}"
  echo "Packaging $skill_name..."
  cd "$skill_name"
  zip -r "../../$OUTPUT_DIR/${skill_name}.zip" .
  cd ..
done
cd ..

# Backend skills
cd backend
for skill in */; do
  skill_name="${skill%/}"
  echo "Packaging $skill_name..."
  cd "$skill_name"
  zip -r "../../$OUTPUT_DIR/${skill_name}.zip" .
  cd ..
done
cd ..

# Repeat for other categories...

echo "All skills packaged in $OUTPUT_DIR/"
```

---

## Support

**Issues or Questions:**

- **Documentation:** Re-read this guide
- **Claude Code:** Run `/help` in Claude Code
- **Web/Desktop:** Visit Claude Help Center
- **API:** Check [API documentation](https://docs.claude.com/en/api/skills-guide)

**Community Resources:**

- [Awesome Claude Skills](https://github.com/travisvn/awesome-claude-skills)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)

---

**You're now ready to package and upload Claude Skills!**

Start with one skill, test thoroughly, then scale to your full collection.
