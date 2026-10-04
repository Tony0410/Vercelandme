async function ping(url, key, model) {
  if (!key) return { configured: false, ok: false };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with exactly OK" }],
        max_tokens: 8,
        temperature: 0,
        stream: false
      })
    });
    const text = await r.text();
    if (!r.ok) return { configured: true, ok: false, status: r.status };
    let data = {};
    try { data = JSON.parse(text); } catch {}
    const reply = data?.choices?.[0]?.message?.content || "";
    return { configured: true, ok: true, status: r.status, reply: String(reply).slice(0, 40) };
  } catch (e) {
    return { configured: true, ok: false, error: "request_failed" };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Use GET" });
  res.setHeader("Cache-Control", "no-store");
  const [openrouter, kilo] = await Promise.all([
    ping("https://openrouter.ai/api/v1/chat/completions", process.env.OPENROUTER_API_KEY, "openrouter/free"),
    ping("https://api.kilo.ai/api/gateway/chat/completions", process.env.KILO_API_KEY, "kilo-auto/free")
  ]);
  res.status(200).json({
    openrouter,
    kilo,
    nvidiaConfigured: !!process.env.NVIDIA_NIM_API_KEY
  });
};