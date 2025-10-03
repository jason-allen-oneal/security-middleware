import type { NextApiRequest, NextApiResponse } from "next";
import { withSecurity, getIssues } from "@bluedot/security-middleware";

function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ issues: getIssues() });
}

export default withSecurity(handler, {
  environment: "dev",
  audit: { npm: true },
});
