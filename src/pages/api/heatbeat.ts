// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: string;
};

export default function handler(_req: NextApiRequest, res: NextApiResponse<Data>): void {
  res.status(200).json({ status: "alive" });
}
