#!/usr/bin/env python3
"""
Skillsfr README Generation Engine
Reads directly from canonical Neon database (or registry/resources.json fallback),
organizes resources chronologically by first_indexed_at and last_updated_at,
formats Markdown sections:
  - Recently Indexed Resources (by kind: Skills, MCP Servers, Datasets, Benchmarks, Starter Packs)
  - Recently Updated Resources
Idempotently injects the rendered snapshot between:
<!-- SKILLSFR:REGISTRY:START -->
...
<!-- SKILLSFR:REGISTRY:END -->
If the generated content is identical to existing content, it exits with no diff.
"""

import os
import sys
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT_DIR / "registry"
RESOURCES_FILE = REGISTRY_DIR / "resources.json"
README_FILE = ROOT_DIR / "README.md"

load_dotenv(ROOT_DIR / ".env")
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

START_MARKER = "<!-- SKILLSFR:REGISTRY:START -->"
END_MARKER = "<!-- SKILLSFR:REGISTRY:END -->"

def load_resources() -> List[Dict[str, Any]]:
    # Try loading from Neon DB first
    if DATABASE_URL:
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            conn = psycopg2.connect(DATABASE_URL)
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, source, owner, repository, path, name, slug, kind,
                           description, author_name, author_url, source_url, repository_url,
                           source_revision, content_hash, license, stars, forks,
                           primary_category, secondary_categories, tags, install_command,
                           status, risk_level, risk_score, quality_score, popularity_score,
                           final_score, score_factors, first_indexed_at, last_seen_at, last_updated_at
                    FROM resources
                    ORDER BY first_indexed_at DESC;
                """)
                rows = cur.fetchall()
            conn.close()
            if rows:
                formatted = []
                for row in rows:
                    formatted.append({
                        "id": row["id"],
                        "source": row["source"],
                        "name": row["name"],
                        "slug": row["slug"],
                        "kind": row["kind"],
                        "description": row["description"] or "",
                        "author": {"name": row["author_name"], "url": row["author_url"]},
                        "sourceUrl": row["source_url"],
                        "license": row["license"] or "unknown",
                        "metrics": {"stars": row["stars"] or 0, "forks": row["forks"] or 0},
                        "primaryCategory": row["primary_category"] or "general",
                        "secondaryCategories": row["secondary_categories"] or [],
                        "tags": row["tags"] or [],
                        "installCommand": row["install_command"],
                        "status": row["status"],
                        "riskLevel": row["risk_level"],
                        "scores": row["score_factors"] or {"finalScore": float(row["final_score"] or 0)},
                        "firstIndexedAt": row["first_indexed_at"].isoformat() if row["first_indexed_at"] else "",
                        "lastUpdatedAt": row["last_updated_at"].isoformat() if row["last_updated_at"] else ""
                    })
                return formatted
        except Exception as e:
            print(f"[Neon DB Read] Fallback to resources.json: {e}")

    # Fallback to resources.json
    if RESOURCES_FILE.exists():
        with open(RESOURCES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    return []

def format_date(iso_str: str) -> str:
    if not iso_str:
        return "Unknown"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return iso_str[:10]

def render_table(items: List[Dict[str, Any]]) -> str:
    lines = [
        "| Resource | Author | Stars | Category | Indexed | Score |",
        "|---|---|---|---|---|---|"
    ]
    for r in items:
        name = r.get("name", "Unnamed")
        url = r.get("sourceUrl", "#")
        author_name = r.get("author", {}).get("name", "Community")
        stars = r.get("metrics", {}).get("stars", 0)
        stars_str = f"⭐ {stars:,}" if stars > 0 else "—"
        cat = r.get("primaryCategory", "general").replace("_", " ").title()
        indexed = format_date(r.get("firstIndexedAt", ""))
        score = r.get("scores", {}).get("finalScore", 0.0)
        score_str = f"`{score:.1f}`" if score > 0 else "—"
        
        lines.append(f"| [**{name}**]({url}) | {author_name} | {stars_str} | {cat} | {indexed} | {score_str} |")
    return "\n".join(lines)

def build_readme_section(resources: List[Dict[str, Any]]) -> str:
    # Sort chronologically by firstIndexedAt descending
    sorted_res = sorted(
        resources,
        key=lambda x: x.get("firstIndexedAt", ""),
        reverse=True
    )

    # Group by kind
    skills = [r for r in sorted_res if r.get("kind") == "skill"]
    mcps = [r for r in sorted_res if r.get("kind") == "mcp"]
    datasets = [r for r in sorted_res if r.get("kind") == "dataset"]
    benchmarks = [r for r in sorted_res if r.get("kind") == "benchmark"]
    kits = [r for r in sorted_res if r.get("kind") == "kit"]

    # Recently updated resources (where lastUpdatedAt differs significantly from firstIndexedAt)
    recently_updated = [
        r for r in sorted_res
        if r.get("lastUpdatedAt") and format_date(r.get("lastUpdatedAt")) != format_date(r.get("firstIndexedAt"))
    ][:10]

    out = []
    out.append("> **Live Canonical Registry Snapshot** (Synced with Neon PostgreSQL database & verified sources)")
    out.append("")
    out.append(f"- **Total Indexed Resources**: {len(resources)}")
    out.append(f"- **MCP Servers**: {len(mcps)} • **Agent Skills**: {len(skills)} • **Datasets**: {len(datasets)} • **Benchmarks**: {len(benchmarks)} • **Starter Kits**: {len(kits)}")
    out.append("")

    if kits:
        out.append("### 📦 Starter Packs & Curated Kits\n")
        out.append(render_table(kits))
        out.append("")

    if skills:
        out.append("### 🧠 Agent Skills & Workflows\n")
        out.append(render_table(skills))
        out.append("")

    if mcps:
        out.append("### 🔌 MCP Servers & Tool Integrations\n")
        out.append(render_table(mcps))
        out.append("")

    if datasets:
        out.append("### 📊 Datasets\n")
        out.append(render_table(datasets))
        out.append("")

    if benchmarks:
        out.append("### 🏆 Benchmarks & Evaluation Harnesses\n")
        out.append(render_table(benchmarks))
        out.append("")

    if recently_updated:
        out.append("### 🔄 Recently Updated Resources\n")
        out.append("| Resource | Author | Updated Date | Revision |")
        out.append("|---|---|---|---|")
        for u in recently_updated:
            out.append(f"| [**{u['name']}**]({u['sourceUrl']}) | {u.get('author',{}).get('name','')} | {format_date(u.get('lastUpdatedAt',''))} | `{u.get('sourceRevision','main')}` |")
        out.append("")

    return "\n".join(out)

def update_readme():
    print("📝 [README Generator] Building chronological documentation from canonical registry...")
    resources = load_resources()
    if not resources:
        print("⚠️ No resources loaded from database or file. Aborting README update.")
        return False

    generated_content = build_readme_section(resources)

    if not README_FILE.exists():
        print("❌ README.md not found.")
        return False

    with open(README_FILE, "r", encoding="utf-8") as f:
        readme_text = f.read()

    start_idx = readme_text.find(START_MARKER)
    end_idx = readme_text.find(END_MARKER)

    if start_idx == -1 or end_idx == -1:
        print("❌ Markers not found in README.md")
        return False

    existing_section = readme_text[start_idx + len(START_MARKER):end_idx].strip()
    new_section = generated_content.strip()

    # Idempotent check
    if existing_section == new_section:
        print("✓ README.md is already up-to-date with registry records. Zero diff.")
        return False

    updated_readme = (
        readme_text[:start_idx + len(START_MARKER)] + "\n\n" +
        new_section + "\n\n" +
        readme_text[end_idx:]
    )

    with open(README_FILE, "w", encoding="utf-8") as f:
        f.write(updated_readme)

    print(f"✓ Successfully regenerated README.md with {len(resources)} real categorized resources.")
    return True

if __name__ == "__main__":
    update_readme()
