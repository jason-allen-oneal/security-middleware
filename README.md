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
  issueEndpoint: { enabled: true },
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

- **enabled**: `boolean` – enable/disable all middleware collection and audit work (default: `true`)
- **environment**: `"dev" | "staging" | "prod"` (inferred from `NODE_ENV`; production maps to `"prod"`, otherwise `"dev"`)
- **checks.headers**: `boolean` – enable/disable header analysis
- **checks.cors**: `boolean` – enable/disable CORS analysis
- **cors.trustedOrigins**: `string[]` – list of allowed origins
- **cors.allowlistWildcardInDev**: `boolean` – allow `*` origins in development
- **audit.npm**: `boolean` – run `npm audit` hook
- **audit.cacheMs**: `number` – cache audit results in milliseconds
- **state.maxIssues**: `number` – maximum unique issues retained per middleware instance (default: `100`)
- **state.maxAgeMs**: `number` – maximum issue age in milliseconds (default: one hour)
- **issueEndpoint.enabled**: `boolean` – explicitly expose the issue endpoint in `dev` only (default: `false`)
- **issueEndpoint.path**: `string` – issue endpoint path (default: `"/__security"`)
- **logger**: `(issue: Issue) => void` – custom issue handler

The issue endpoint is disabled by default and cannot be exposed in `staging` or
`prod`, even when `issueEndpoint.enabled` is set. Each endpoint reads only its
middleware instance's bounded store. For backwards compatibility, the exported
`addIssues`, `getIssues`, and `clearIssues` helpers remain a bounded,
process-wide aggregate and should not be used for tenant isolation.

### Browser overlay

The published package includes `overlay/security-overlay.js`. Serve or copy that
file into your application's public assets, enable the development endpoint,
and load it only in development:

```html
<script src="/security-overlay.js" data-security-endpoint="/__security"></script>
```

The overlay is intended for middleware instances that expose the configured
development endpoint. Edge/Proxy bundles have isolated memory and report their
findings through their configured logger instead. The overlay renders issue
fields with DOM text nodes rather than HTML injection.

## License

This project is licensed under the **MIT License**.  
See `LICENSE.md` for the full license text.
