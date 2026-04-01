import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/analyze", analyzeRouter);

app.post("/api/verify-password", (req, res) => {
  const { password } = req.body;
  const expected = process.env.APP_PASSWORD;

  if (!expected) {
    res.json({ success: false, error: "Password not configured" });
    return;
  }

  res.json({ success: password === expected });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
