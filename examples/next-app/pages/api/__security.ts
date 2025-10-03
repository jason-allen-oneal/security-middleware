import type { NextApiRequest, NextApiResponse } from "next";
import { getIssues } from "@bluedot/security-middleware";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ issues: getIssues() });
}
