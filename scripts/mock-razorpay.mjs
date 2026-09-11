/* A stand-in for Razorpay's /orders endpoint. It echoes back what the server
   asked for, so a test can assert the amount our server sent — proving the
   price came from the catalog and not from the browser. */
import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 4545);

createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    if (req.url?.endsWith("/orders") && req.method === "POST") {
      const sent = JSON.parse(body || "{}");
      console.log("RECEIVED " + JSON.stringify({ amount: sent.amount, receipt: sent.receipt, notes: sent.notes?.items }));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        id: "order_MOCK123",
        amount: sent.amount,
        currency: "INR",
        receipt: sent.receipt,
        status: "created",
      }));
      return;
    }
    res.writeHead(404).end("{}");
  });
}).listen(port, () => console.log(`mock razorpay on :${port}`));
