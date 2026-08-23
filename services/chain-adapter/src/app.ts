import express from "express";
import * as anchor from "./controllers/anchor.controller.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", anchor.getHealth);
app.post("/anchor/trade", anchor.postAnchorTrade);
app.get("/trade/:transactionId", anchor.getTrade);
app.get("/exporter/:exporterId/reputation", anchor.getExporterReputation);

app.use((_req, res) => {
  res.status(404).json({ ok: false, code: "NOT_FOUND", message: "No such route" });
});

const PORT = Number(process.env.PORT ?? 3001);
const BIND_HOST = process.env.BIND_HOST ?? "127.0.0.1";

app.listen(PORT, BIND_HOST, () => {
  console.log(`[chain-adapter] listening on http://${BIND_HOST}:${PORT}`);
});
