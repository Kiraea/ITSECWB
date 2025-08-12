import express from 'express';
import { connection } from '../index.js';
import { verifySessionToken, verifyRole } from '../sessionUtils.js';
import { putToLogTable } from '../logUtils.js';



const router = express.Router()

router.get('/', verifySessionToken, verifyRole, async (req, res) => {
    if (req.role !== 'admin'){

        return res.status(401).json({ message: "unauthorized", status: "fail"})
    }
    const { status, userId } = req.query;
    try {

        let sql = `SELECT l.* FROM log l;`

        const [rows, fields] = await connection.query(sql);

        return res.status(200).json({ message: "all logs received", status: "success", data: rows })
    } catch (err) {
        console.log(err);
    }

})




router.post("/log", async (req, res) => {
    const userId = req.userId; // Comes from your auth middleware
    const { message, role, status, timestamp } = req.body;

    if (!userId || !role || !message || !status || !timestamp) {
        return res.status(400).json({ error: "Missing Required Fields" });
    }

    try {
        const [result] = await connection.execute(`
            INSERT INTO log (user_id, user_role, message, status, timestamp)
            VALUES (?, ?, ?, ?, ?)
        `, [userId, role, message, status, timestamp]);

        if (result.affectedRows === 1) {
            return res.status(201).json({ message: "Log saved successfully" });
        } else {
            return res.status(500).json({ error: "Log was not saved" });
        }
    } catch (err) {
        console.error("Log error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

export {router}