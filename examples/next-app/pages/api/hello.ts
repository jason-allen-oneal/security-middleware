import type { NextApiRequest, NextApiResponse } from "next";
import { withSecurity } from "@bluedot/security-middleware";

function handler(req: NextApiRequest, res: NextApiResponse) {
  // Intentionally missing headers to trigger warnings
  res.status(200).json({ message: "Hello from secured API" });
}

export default withSecurity(handler, {
  environment: "dev",
  audit: { npm: true },
});
