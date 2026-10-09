import { db } from '../db/database';
export const workflowController = {
    getWorkflows(req, res) {
        const list = db.getWorkflows();
        res.json({ success: true, count: list.length, data: list });
    },
    getDepartments(req, res) {
        const deps = db.getDepartments();
        res.json({ success: true, count: deps.length, data: deps });
    },
};
