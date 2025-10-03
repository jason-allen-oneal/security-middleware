import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { securityMiddleware } from "@bluedot/security-middleware";

const app = express();

// Enable security middleware with audit
app.use(
  securityMiddleware({
    environment: "dev",
    audit: { npm: true, cacheMs: 300000 },
  })
);

// -------------------------------------------------
// Overlay setup
// -------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static overlay script
app.use(
  "/__security-static",
  express.static(path.join(__dirname, "public"))
);

// Inject overlay script into any HTML response
app.use((req, res, next) => {
  const originalSend = res.send.bind(res);
  res.send = function (body: any) {
    if (
      typeof body === "string" &&
      body.includes("<html") &&
      process.env.NODE_ENV !== "production"
    ) {
      body = body.replace(
        "</body>",
        `<script src="/__security-static/security-overlay.js"></script></body>`
      );
    }
    return originalSend(body);
  };
  next();
});

// -------------------------------------------------
// Test routes
// -------------------------------------------------

app.get("/cors", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Security Middleware Test</title></head>
      <body>
        <h1>Hello world</h1>
      </body>
    </html>
  `);
});

// -------------------------------------------------

app.listen(3001, () => {
  console.log("🚀 Express dev server running on http://localhost:3001");
});
