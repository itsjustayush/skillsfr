#!/usr/bin/env python3
"""
Skillsfr Classification Engine
Applies deterministic multi-category scoring C(r, k) according to registry/taxonomy.yml.
Assigns:
  - primary_category (highest score >= 0.70)
  - secondary_categories (scores between 0.45 and 0.69)
  - capability_tags
Updates Neon PostgreSQL and registry/resources.json.
"""

import os
import sys
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple
import yaml
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    import psycopg2
    from psycopg2.extras import Json
    HAVE_POSTGRES = True
except ImportError:
    HAVE_POSTGRES = False

ROOT_DIR = Path(__file__).resolve().parent.parent
REGISTRY_DIR = ROOT_DIR / "registry"
RESOURCES_FILE = REGISTRY_DIR / "resources.json"
TAXONOMY_FILE = REGISTRY_DIR / "taxonomy.yml"

load_dotenv(ROOT_DIR / ".env")
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

def get_db_connection():
    if not HAVE_POSTGRES or not DATABASE_URL:
        return None
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception:
        return None

def load_taxonomy() -> Dict[str, Any]:
    with open(TAXONOMY_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def tokenize_text(text: str) -> set:
    if not text:
        return set()
    cleaned = re.sub(r"[^a-zA-Z0-9_\-\s]", " ", text.lower())
    return set(cleaned.split())

def calculate_category_score(resource: Dict[str, Any], category_spec: Dict[str, Any]) -> float:
    # 1. Text tokenization of name, description, slug
    content_tokens = tokenize_text(resource.get("name", "")) | tokenize_text(resource.get("description", "")) | tokenize_text(resource.get("slug", ""))
    
    # Keyword score (0.40)
    keywords = set(category_spec.get("keywords", []))
    matched_keywords = content_tokens & keywords
    keyword_score = min(1.0, len(matched_keywords) / max(1, min(4, len(keywords))))

    # Manifest pattern score (0.25)
    manifest_patterns = category_spec.get("manifest_patterns", [])
    manifest_matches = sum(1 for p in manifest_patterns if p in resource.get("name", "").lower() or p in resource.get("path", "").lower() or p in resource.get("slug", "").lower())
    manifest_score = min(1.0, manifest_matches / max(1, min(2, len(manifest_patterns))))

    # Repository topic score (0.15)
    cat_topics = set(category_spec.get("topics", []))
    res_topics = set([t.lower() for t in resource.get("tags", [])])
    matched_topics = cat_topics & res_topics
    topic_score = min(1.0, len(matched_topics) / max(1, min(3, len(cat_topics))))

    # Dependency score (0.10)
    cat_deps = set(category_spec.get("dependencies", []))
    dep_score = 0.0
    desc_text = (resource.get("description") or "").lower()
    cmd_text = (resource.get("installCommand") or "").lower()
    for dep in cat_deps:
        if dep in desc_text or dep in cmd_text:
            dep_score = 1.0
            break

    # Historical feedback score (0.10) - defaults to 0.5 (neutral)
    historical_feedback_score = 0.5

    # C(r, k) = 0.40 * kw + 0.25 * manifest + 0.15 * topic + 0.10 * dep + 0.10 * feedback
    score = (
        0.40 * keyword_score +
        0.25 * manifest_score +
        0.15 * topic_score +
        0.10 * dep_score +
        0.10 * historical_feedback_score
    )

    return round(score, 4)

def extract_capability_tags(resource: Dict[str, Any], categories: List[Dict[str, Any]]) -> List[str]:
    tags = set([t.lower() for t in resource.get("tags", [])])
    name_and_desc = (resource.get("name", "") + " " + resource.get("description", "")).lower()

    standard_capabilities = [
        "react", "nextjs", "typescript", "python", "mcp", "agent", "accessibility",
        "responsive-design", "evaluation", "benchmark", "sql", "postgres", "browser-automation",
        "security-audit", "docker", "testing", "ui", "ux", "rest-api", "vector-search"
    ]

    for cap in standard_capabilities:
        if cap in name_and_desc or cap in tags:
            tags.add(cap)

    return sorted(list(tags))

def run_classification():
    print("🏷️ [Classification Job] Commencing categorization across active resources...")
    taxonomy = load_taxonomy()
    categories = taxonomy.get("categories", [])

    if not RESOURCES_FILE.exists():
        print("❌ No resources.json file found to classify.")
        return []

    with open(RESOURCES_FILE, "r", encoding="utf-8") as f:
        resources = json.load(f)

    classified_count = 0

    for r in resources:
        scores: List[Tuple[str, float]] = []
        for cat in categories:
            cat_id = cat["id"]
            s = calculate_category_score(r, cat)
            scores.append((cat_id, s))

        # Sort categories by score descending
        scores.sort(key=lambda x: x[1], reverse=True)

        # Primary category: highest score >= 0.70 (or highest overall if none reach 0.70)
        primary = scores[0][0] if scores and scores[0][1] >= 0.45 else "agent_architecture"
        
        # Secondary categories: scores between 0.45 and 0.69 (excluding primary)
        secondaries = [cat_id for cat_id, sc in scores if 0.45 <= sc < 0.70 and cat_id != primary]

        r["primaryCategory"] = primary
        r["secondaryCategories"] = secondaries[:3]
        r["capabilityTags"] = extract_capability_tags(r, categories)
        r["categoryScoreBreakdown"] = {cat_id: sc for cat_id, sc in scores[:4]}
        classified_count += 1

    # Save to JSON
    with open(RESOURCES_FILE, "w", encoding="utf-8") as f:
        json.dump(resources, f, indent=2)

    # Persist to Neon DB
    db_conn = get_db_connection()
    if db_conn:
        try:
            with db_conn.cursor() as cur:
                for r in resources:
                    cur.execute("""
                        UPDATE resources
                        SET primary_category = %s,
                            secondary_categories = %s,
                            tags = %s
                        WHERE id = %s;
                    """, (
                        r["primaryCategory"],
                        Json(r["secondaryCategories"]),
                        Json(r["capabilityTags"]),
                        r["id"]
                    ))
            db_conn.commit()
            print("✓ Updated categorized taxonomy in Neon PostgreSQL.")
        except Exception as e:
            print(f"[Neon DB] Error updating categories: {e}")
        finally:
            db_conn.close()

    print(f"✨ [Classification Complete] Processed {classified_count} resources with primary & secondary assignments.")
    return resources

if __name__ == "__main__":
    run_classification()
