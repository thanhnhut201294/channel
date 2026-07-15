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
    const resp = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    const text = await resp.text(); // lấy raw text trước, không parse vội

    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch {
      // Không phải JSON -> trả về debug info để xem tikwm nói gì
      return res.status(502).json({
        error: "tikwm không trả về JSON",
        status: resp.status,
        preview: text.slice(0, 500), // 500 ký tự đầu để xem nội dung
      });
    }
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
