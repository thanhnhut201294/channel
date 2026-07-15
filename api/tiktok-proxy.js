export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  const { unique_id, count = 12, cursor = 0 } = req.query;
  if (!unique_id) {
    return res.status(400).json({ error: "Missing unique_id" });
  }

  const targetUrl = `https://www.tikwm.com/api/user/posts?unique_id=${encodeURIComponent(unique_id)}&count=${count}&cursor=${cursor}`;

  try {
    const resp = await fetchWithRetry(targetUrl, 3);
    const data = await resp.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}

async function fetchWithRetry(url, retries) {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });
      if (resp.status === 429 || resp.status >= 500) {
        throw new Error(`HTTP ${resp.status}`);
      }
      return resp;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
