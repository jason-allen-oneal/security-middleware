# Security Middleware

Drop-in security linting middleware for Node.js and Next.js.  
Checks headers, CORS, dependencies, and surfaces issues in dev with console warnings or a floating overlay.

## Features

- **HTTP security header analyzer** – Detects missing `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.
- **CORS policy check** – Flags wildcard `*` origins and unsafe methods.
- **Dependency scanner hook** – Optionally runs `npm audit` (Node-only) to catch vulnerable packages.
- **Developer feedback** – Console warnings plus an optional in-browser overlay panel.
- **Framework support** – Works in Express, Next.js API routes, and Next.js middleware.

## Installation

```sh
npm install @bluedot/security-middleware
```

## Usage

## Express
```ts
import express from "express";
import { securityMiddleware } from "@bluedot/security-middleware";

const app = express();

app.use(securityMiddleware({
  environment: "dev",
  audit: { npm: true },
}));

app.get("/", (req, res) => {
  res.json({ hello: "world" });
});

app.listen(3000, () => console.log("listening on :3000"));
```

## NextJS API routes
```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { withSecurity } from "@bluedot/security-middleware";

function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ ok: true });
}

export default withSecurity(handler, {
  environment: "dev",
  audit: { npm: true },
});
```

## Configuration

- **environment**: `"dev" | "staging" | "prod"` (default: `"dev"`)
- **checks.headers**: `boolean` – enable/disable header analysis
- **checks.cors**: `boolean` – enable/disable CORS analysis
- **cors.trustedOrigins**: `string[]` – list of allowed origins
- **cors.allowlistWildcardInDev**: `boolean` – allow `*` origins in development
- **audit.npm**: `boolean` – run `npm audit` hook
- **audit.cacheMs**: `number` – cache audit results in milliseconds
- **logger**: `(issue: Issue) => void` – custom issue handler

## License

This project is licensed under the **MIT License**.  
See the LICENSE file for full license text.
