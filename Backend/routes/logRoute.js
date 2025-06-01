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

export {router}