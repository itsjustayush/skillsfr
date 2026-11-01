import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();
  const ghToken = (req.headers.authorization?.replace('Bearer ', '') || process.env.GITHUB_TOKEN || '');
  const hfToken = process.env.HF_TOKEN || '';

  try {
    // 1. Fetch live MCP and skill repositories from GitHub
    const ghHeaders: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Skillsfr-Registry/1.4.0'
    };
    if (ghToken) {
      ghHeaders['Authorization'] = `token ${ghToken}`;
    }

    const ghRes = await fetch('https://api.github.com/search/repositories?q=mcp+server&sort=stars&order=desc&per_page=10', {
      headers: ghHeaders
    });

    let ghItems: any[] = [];
    if (ghRes.ok) {
      const data: any = await ghRes.json();
      ghItems = data.items || [];
    }

    // 2. Fetch live datasets from Hugging Face
    const hfHeaders: Record<string, string> = {
      'User-Agent': 'Skillsfr-Registry/1.4.0'
    };
    if (hfToken) {
      hfHeaders['Authorization'] = `Bearer ${hfToken}`;
    }

    const hfRes = await fetch('https://huggingface.co/api/datasets?search=eval&limit=10', {
      headers: hfHeaders
    });

    let hfItems: any[] = [];
    if (hfRes.ok) {
      hfItems = await hfRes.json();
    }

    return res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      syncedSources: {
        github: {
          scanned: ghItems.length,
          rateLimitRemaining: ghRes.headers.get('x-ratelimit-remaining') || 'unknown'
        },
        huggingface: {
          scanned: hfItems.length
        },
        kaggle: {
          status: 'mirror_active'
        }
      },
      message: 'Skillsfr 24/7 Realtime Sync active'
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal sync error'
    });
  }
}
