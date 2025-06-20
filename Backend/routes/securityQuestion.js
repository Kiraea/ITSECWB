import express from 'express';
import { connection } from '../index.js';
import { verifySessionToken, verifyRole } from '../sessionUtils.js';
import { putToLogTable } from '../logUtils.js';



const router = express.Router()

router.get('/' , async (req, res) => {
    try {

        let sql = `SELECT s.* FROM security_question s;`
        const [rows, fields] = await connection.query(sql);
        return res.status(200).json({ message: "all questions received", status: "success", data: rows })


    } catch (err) {
        console.log(err);
        return res.status(400).json({message: "cannot get security question server error", status:"fail"})
    }

})

export { router }