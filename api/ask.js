const KNOWLEDGE = `
You are the Bed Guide for an older couple in Perth, Western Australia. Answer only from the following curated research. Use plain, calm English. Keep answers concise and practical. Never diagnose, prescribe treatment, or claim a bed/rail/mattress is clinically safe for a person. When individual clinical factors matter, say an OT, physiotherapist, discharge planner, doctor, or supplier should confirm them.

CORE RESEARCH
- The key requirement is genuine electric whole-bed/platform height adjustment, not just an adjustable head and foot.
- 4 Healthcare Solace: whole-bed height 25-70 cm, 200 kg patient capacity. Researched hire price $100/week with 4-week minimum. Standard memory-foam mattress plus Perth-metro delivery and collection were included in the researched hire package. Purchase price researched at $1,675, mattress extra when buying. Strong starting option for short post-surgical recovery.
- Unicare Xcel3Pro: 11-73.5 cm height range, 250 kg SWL, preset 43 cm exit position, one-touch braking and optional mobility rails. Stronger starting option where very-low sleeping position, higher falls risk, or substantial carer involvement matters. Live quote required; ask about a trial.
- Icare IC333: 22-66 cm whole-bed height, 200 kg SWL in long/king single. More domestic/home-like appearance. Perth base pricing researched around $3,475-$3,800 depending on retailer/configuration; mattress usually extra. Strong long-term purchase option where appearance matters.
- Mobility Store generic hire bed: 40-80 cm plus mattress, 180 kg capacity, researched at $70/week, two-week minimum, $200 refundable bond. Mattress and delivery/pickup extra.
- Solace hire-vs-buy comparison in the research used $2,170 purchase package ($1,675 bed + $495 pressure-care memory-foam mattress). Simple crossover against $100/week hire was about 21.7 weeks, roughly five months. This is a decision aid, not a quote.
- For a planned 4-8 week recovery, rental strongly favours flexibility and avoids storage/resale. Around four to six months, purchase of a lower-cost clinical bed can become competitive. Long-term premium homecare beds have different economics.
- Side rails are not automatically safer. A poorly matched rail, mattress and gap can create entrapment risk or hinder independent transfers. A short assist/mobility rail may suit transfers better than a full-length rail. Rail choice should be clinically assessed.
- The most important pre-order clinical details are safe top-of-mattress transfer height, height/weight, operation and restrictions, mobility aid, sit-to-stand ability, whether transfers are independent or assisted, access from one/both sides, and pressure-injury risk.
- Room measurements matter: doorway width, hallway turns, room dimensions, bed position, power point, stairs/steps, and clear space on the transfer side.
- Support at Home may be relevant for older people. Ask the assessor/provider specifically about an assessed/prescribed electric hi-low bed, appropriate mattress and clinically justified rail or transfer support. Do not assume reimbursement after buying privately; assessment first, supplier quote second, funding approval third.
- For someone applying after age 65, NDIS is not normally the new funding pathway; aged-care supports are generally the relevant route. Existing NDIS participants are a different case.
- DVA RAP may be relevant for eligible Gold Card or relevant White Card holders, with clinical prescription/assessment.
- Private health insurance varies by policy. Ask about home nursing equipment/durable medical equipment/aids and appliances, prescription requirements, approved suppliers, pre-authorisation and itemised invoices.
- Supplier questions: exact platform and top-of-mattress heights; exact mattress type; proposed rail dimensions and entrapment assessment; brake type; whether delivery includes bedroom placement, assembly, electrical check and demonstration; stairs/narrow access surcharges; rental inclusions, cleaning, repairs, collection and bond; separate warranties; earliest confirmed delivery date; and whether hire can be extended or converted toward purchase.
- Prices, stock and delivery terms can change. Treat all researched prices as indicative and confirm them directly with suppliers.

If asked something not covered by the research, say that the research does not answer it and suggest the most appropriate clinician, supplier, insurer, or aged-care provider to ask.
`;

function fallbackAnswer(q) {
  const s = q.toLowerCase();
  if (s.includes("rail")) return "The research says side rails are not automatically safer. A full rail can create entrapment risk or make transfers harder. Ask the OT or physiotherapist whether a short assist rail, full rail, or no rail is safest for the actual mattress and transfer setup.";
  if (s.includes("fund") || s.includes("aged care") || s.includes("support at home")) return "For an older person, the research points first to Support at Home. Ask for assessment of a prescribed electric hi-low bed, appropriate mattress and any clinically justified rail or transfer support. Get assessment and funding approval before assuming a private purchase will be reimbursed.";
  if (s.includes("cheapest") || s.includes("hire") || s.includes("buy") || s.includes("cost")) return "For short recovery, hire is usually the simplest starting point. The Solace was researched at $100/week with mattress, Perth-metro delivery and collection included, with a four-week minimum. The report's simple hire-vs-buy crossover was about five months, but confirm current prices.";
  if (s.includes("lowest") || s.includes("height")) return "Of the main shortlist, the Xcel3Pro goes lowest at 11 cm platform height. Solace is 25-70 cm and IC333 is 22-66 cm. The safest transfer height is individual and should be confirmed with an OT or physiotherapist.";
  if (s.includes("solace")) return "The Solace is the report's strongest short-term starting option: 25-70 cm whole-bed height, 200 kg capacity, and the researched hire package was $100/week with a four-week minimum, standard memory-foam mattress, Perth-metro delivery and collection.";
  if (s.includes("xcel")) return "The Xcel3Pro is the stronger starting option where very-low sleeping position, higher falls risk or regular carer involvement matters. Its researched height range is 11-73.5 cm with 250 kg SWL. Ask Unicare for a current quote and whether a trial is available.";
  if (s.includes("icare") || s.includes("ic333")) return "The IC333 is the more home-like long-term option in the research. It has genuine 22-66 cm whole-bed height adjustment and a researched Perth base price around $3,475-$3,800, with mattress usually extra.";
  return "I can help with the shortlisted beds, rails, hire versus buy, supplier questions and funding pathways from the research. For an individual clinical decision, an OT or physiotherapist should confirm the safe transfer height, mattress and rail setup.";
}

async function callProvider(url, key, model, messages, extraHeaders = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      ...extraHeaders
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      max_tokens: 600,
      stream: false
    })
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content;
  if (!answer || typeof answer !== "string") throw new Error("No answer returned");
  return answer.trim();
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";
  const allowed = origin === "https://designs.magicpath.ai" || origin.endsWith(".magicpath.ai");
  res.setHeader("Access-Control-Allow-Origin", allowed ? origin : "https://designs.magicpath.ai");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const question = String(req.body?.question || "").trim().slice(0, 700);
  const context = String(req.body?.context || "").trim().slice(0, 1200);
  if (!question) return res.status(400).json({ error: "Please ask a question." });

  const messages = [
    { role: "system", content: KNOWLEDGE },
    { role: "user", content: context ? `Current selections/context: ${context}\n\nQuestion: ${question}` : question }
  ];

  const attempts = [];
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const answer = await callProvider(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY,
        "openrouter/free",
        messages,
        {
          "HTTP-Referer": "https://designs.magicpath.ai",
          "X-Title": "Perth Hospital Bed Helper"
        }
      );
      return res.status(200).json({ answer, source: "AI" });
    } catch (e) { attempts.push("OpenRouter"); }
  }

  if (process.env.KILO_API_KEY) {
    try {
      const answer = await callProvider(
        "https://api.kilo.ai/api/gateway/chat/completions",
        process.env.KILO_API_KEY,
        "kilo-auto/free",
        messages
      );
      return res.status(200).json({ answer, source: "AI" });
    } catch (e) { attempts.push("Kilo"); }
  }

  return res.status(200).json({ answer: fallbackAnswer(question), source: "Built-in guide", fallback: true, attempted: attempts });
};
