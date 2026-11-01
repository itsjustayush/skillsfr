#!/usr/bin/env python3
"""
Skillsfr Ranking & Quality Signal Engine
Calculates:
  - Freshness using type-specific half-life decay
  - Multiplicative quality: relevance * compatibility * maintenance * verification * documentation * authority * safety
  - Logarithmic popularity bonus: log(1 + stars) / log(1 + 25000)
  - Risk gating score
  - Final score = 100 * quality * (0.85 + 0.15 * popularity)
Persists factor breakdowns to Neon PostgreSQL and registry/resources.json.
"""

import os
import sys
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any
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

load_dotenv(ROOT_DIR / ".env")
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()

def get_db_connection():
    if not HAVE_POSTGRES or not DATABASE_URL:
        return None
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception:
        return None

def calculate_log_popularity(stars: int, max_ref: int = 25000) -> float:
    if stars <= 0:
        return 0.0
    return min(1.0, math.log(1 + stars) / math.log(1 + max_ref))

def calculate_maintenance_freshness(last_updated_iso: str, kind: str) -> float:
    # Half-life per dimension
    half_lives = {
        "mcp": 90.0,
        "skill": 180.0,
        "workflow": 180.0,
        "plugin": 120.0,
        "tool": 180.0,
        "dataset": 365.0,
        "benchmark": 365.0,
        "kit": 365.0
    }
    half_life = half_lives.get(kind, 180.0)

    try:
        dt = datetime.fromisoformat(last_updated_iso.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        days = max(0.0, (now - dt).total_seconds() / 86400.0)
    except Exception:
        days = 30.0

    freshness = math.pow(2.0, -days / half_life)
    # Combined with recent release activity baseline
    maintenance = 0.60 * freshness + 0.25 * (1.0 if days < 45 else 0.5) + 0.15 * 0.8
    return round(min(1.0, max(0.1, maintenance)), 4)

def calculate_risk_and_safety(resource: Dict[str, Any]) -> tuple[float, float, str]:
    """
    risk_score =
      0.25 * permission_breadth
    + 0.20 * arbitrary_code_execution
    + 0.20 * credential_access
    + 0.15 * suspicious_install_scripts
    + 0.10 * missing_license
    + 0.10 * unresolved_security_reports
    """
    kind = resource.get("kind", "")
    desc = resource.get("description", "").lower()
    license_val = resource.get("license", "unknown")

    perm_breadth = 0.1
    code_exec = 0.0
    cred_access = 0.0
    suspicious_install = 0.0
    missing_lic = 1.0 if license_val == "unknown" or license_val == "NOASSERTION" else 0.0
    unresolved_reports = 0.0

    if kind == "mcp":
        # MCP tools might execute shell or access database
        if "shell" in desc or "bash" in desc or "exec" in desc:
            code_exec = 0.8
            perm_breadth = 0.7
        if "sql" in desc or "postgres" in desc or "auth" in desc:
            cred_access = 0.4

    risk_score = (
        0.25 * perm_breadth +
        0.20 * code_exec +
        0.20 * cred_access +
        0.15 * suspicious_install +
        0.10 * missing_lic +
        0.10 * unresolved_reports
    )
    risk_score = round(min(1.0, max(0.0, risk_score)), 4)

    # Policy
    if risk_score >= 0.75:
        risk_level = "high"
    elif risk_score >= 0.45:
        risk_level = "medium"
    else:
        risk_level = "low"

    safety = round(1.0 - (risk_score * 0.85), 4)
    return risk_score, safety, risk_level

def calculate_multiplicative_ranking(resource: Dict[str, Any]) -> Dict[str, Any]:
    stars = resource.get("metrics", {}).get("stars", 0)
    kind = resource.get("kind", "skill")
    last_updated = resource.get("lastUpdatedAt") or datetime.now(timezone.utc).isoformat()
    author = resource.get("author", {})

    # 1. Authority (0.75 - 1.0 if verified org)
    authority = 0.95 if author.get("verified") or author.get("name") in ["anthropics", "vercel-labs", "github", "modelcontextprotocol"] else 0.75

    # 2. Verification status signal
    status = resource.get("status", "indexed")
    verification_map = {
        "security-reviewed": 1.0,
        "runtime-tested": 0.95,
        "install-tested": 0.90,
        "metadata-checked": 0.85,
        "parsed": 0.80,
        "indexed": 0.75,
        "stale": 0.50,
        "broken": 0.20,
        "delisted": 0.05
    }
    verification = verification_map.get(status, 0.75)

    # 3. Documentation quality
    desc_len = len(resource.get("description", ""))
    doc_score = min(1.0, max(0.5, desc_len / 120.0))

    # 4. Maintenance
    maintenance = calculate_maintenance_freshness(last_updated, kind)

    # 5. Risk & Safety
    risk_score, safety, risk_level = calculate_risk_and_safety(resource)

    # 6. Compatibility baseline
    compatibility = 0.95 if kind in ["skill", "mcp", "dataset", "benchmark"] else 0.85

    # 7. Relevance baseline (general registry quality)
    relevance = 0.90

    # Multiplicative Quality:
    # quality(r) = relevance * compatibility * maintenance * verification * documentation * authority * safety
    quality = relevance * compatibility * maintenance * verification * doc_score * authority * safety
    quality = round(min(1.0, max(0.01, quality)), 4)

    # Popularity Bonus:
    popularity = round(calculate_log_popularity(stars), 4)

    # final_score(r) = 100 * quality(r) * (0.85 + 0.15 * popularity(r))
    final_score = round(100.0 * quality * (0.85 + 0.15 * popularity), 2)

    return {
        "relevance": relevance,
        "compatibility": compatibility,
        "maintenance": maintenance,
        "verification": verification,
        "documentation": round(doc_score, 4),
        "authority": authority,
        "safety": safety,
        "popularity": popularity,
        "quality": quality,
        "finalScore": final_score,
        "riskScore": risk_score,
        "riskLevel": risk_level
    }

def run_ranking():
    print("⚖️ [Ranking Job] Calculating multiplicative quality signals and logarithmic popularity...")
    if not RESOURCES_FILE.exists():
        print("❌ No resources.json file found to rank.")
        return []

    with open(RESOURCES_FILE, "r", encoding="utf-8") as f:
        resources = json.load(f)

    ranked_count = 0
    for r in resources:
        score_res = calculate_multiplicative_ranking(r)
        r["riskScore"] = score_res["riskScore"]
        r["riskLevel"] = score_res["riskLevel"]
        r["scores"] = score_res
        ranked_count += 1

    # Sort descending by finalScore
    resources.sort(key=lambda x: x.get("scores", {}).get("finalScore", 0.0), reverse=True)

    # Save to JSON
    with open(RESOURCES_FILE, "w", encoding="utf-8") as f:
        json.dump(resources, f, indent=2)

    # Persist to Neon DB
    db_conn = get_db_connection()
    if db_conn:
        try:
            with db_conn.cursor() as cur:
                for r in resources:
                    sc = r["scores"]
                    cur.execute("""
                        INSERT INTO scores (
                            resource_id, relevance, compatibility, maintenance,
                            verification, documentation, authority, safety,
                            popularity, final_score, calculated_at
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
                        )
                        ON CONFLICT (resource_id) DO UPDATE SET
                            relevance = EXCLUDED.relevance,
                            compatibility = EXCLUDED.compatibility,
                            maintenance = EXCLUDED.maintenance,
                            verification = EXCLUDED.verification,
                            documentation = EXCLUDED.documentation,
                            authority = EXCLUDED.authority,
                            safety = EXCLUDED.safety,
                            popularity = EXCLUDED.popularity,
                            final_score = EXCLUDED.final_score,
                            calculated_at = NOW();
                    """, (
                        r["id"], sc["relevance"], sc["compatibility"], sc["maintenance"],
                        sc["verification"], sc["documentation"], sc["authority"], sc["safety"],
                        sc["popularity"], sc["finalScore"]
                    ))
                    cur.execute("""
                        UPDATE resources
                        SET risk_score = %s,
                            risk_level = %s,
                            quality_score = %s,
                            popularity_score = %s,
                            final_score = %s,
                            score_factors = %s
                        WHERE id = %s;
                    """, (
                        sc["riskScore"], sc["riskLevel"], sc["quality"], sc["popularity"],
                        sc["finalScore"], Json(sc), r["id"]
                    ))
            db_conn.commit()
            print("✓ Synchronized quality scores & rankings to Neon PostgreSQL.")
        except Exception as e:
            print(f"[Neon DB] Error updating scores: {e}")
        finally:
            db_conn.close()

    print(f"✨ [Ranking Complete] Calculated scores for {ranked_count} resources. Top: {resources[0]['name']} ({resources[0]['scores']['finalScore']}/100)")
    return resources

if __name__ == "__main__":
    run_ranking()
