import type { Request, Response } from 'express';
import { db } from '../db/database';

export const workflowController = {
  getWorkflows(req: Request, res: Response) {
    const list = db.getWorkflows();
    res.json({ success: true, count: list.length, data: list });
  },

  getDepartments(req: Request, res: Response) {
    const deps = db.getDepartments();
    res.json({ success: true, count: deps.length, data: deps });
  },
};
