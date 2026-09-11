/* Stands in for Resend's /emails endpoint so the email path can be exercised
   end to end. Logs one line per message received, which is how a test asserts
   that exactly one went out. */
import { createServer } from "node:http";
import { writeFileSync, appendFileSync } from "node:fs";

const port = Number(process.argv[2] ?? 4546);
const out = process.argv[3] ?? "/tmp/mock-resend.jsonl";
writeFileSync(out, "");

createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.url?.endsWith("/emails") && req.method === "POST") {
      const m = JSON.parse(body || "{}");
      appendFileSync(out, JSON.stringify({
        to: m.to, subject: m.subject, replyTo: m.reply_to,
        htmlBytes: (m.html || "").length, textBytes: (m.text || "").length,
        at: new Date().toISOString(),
      }) + "\n");
      // Also drop the rendered bodies next to the log so they can be inspected.
      writeFileSync(out.replace(/\.jsonl$/, "") + "-last.html", m.html || "");
      writeFileSync(out.replace(/\.jsonl$/, "") + "-last.txt", m.text || "");
      console.log("RECEIVED", m.subject, "->", m.to);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id: "mock_" + Math.random().toString(36).slice(2, 10) }));
      return;
    }
    res.writeHead(404).end("{}");
  });
}).listen(port, () => console.log(`mock resend on :${port}`));
