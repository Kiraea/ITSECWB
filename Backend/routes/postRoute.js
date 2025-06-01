import express from 'express';
import { connection } from '../index.js';
import { verifySessionToken, verifyRole } from '../sessionUtils.js';
import { putToLogTable } from '../logUtils.js';



const router = express.Router()

router.get('/', verifySessionToken, verifyRole, async (req,res) => {

    const {status, userId} = req.query;
    console.log(userId, status, " GET METHOD");
    try {

        let sql = `SELECT p.*, u.display_name, u.id AS user_id FROM post p JOIN user u ON p.user_id = u.id`
        let conditions = []
        let params = []

        if (status !== undefined){
            conditions.push(`status = ?`) 
            params.push(status)
        }


        if (userId !== undefined) {
            conditions.push(`user_id = ?`)
            params.push(userId)
        }

        if (conditions.length > 0){
            sql += ` WHERE ` + conditions.join(" AND ");
        }
        console.log(sql);

        const [rows, fields] = await connection.execute(sql, params);




        return res.status(200).json({message: "all posts received", status: "success", data: rows})
    } catch (err) {
        console.log(err);
    }

})

router.post('/', verifySessionToken, verifyRole, async (req,res)=> {
    let status;
    let userId = req.userId;
    let role = req.role;
    if (role === 'manager'){
        status = 'accepted'
    }else{
        status = 'pending'
    }

    const {title, description} = req.body;
    try {
        const sql = `INSERT INTO post(title, description, user_id, status) VALUES (?,?,?,?);`;
        
        console.log(title, description, userId, status);
        const [result, fields] = await connection.execute(sql,[title, description, userId, status]);



        try{
            let currDate = new Date()
            console.log("THIS RUN");
           await putToLogTable(userId, `user ${userId} created a post`, role,  "success", currDate) 
        }catch(e){
            console.log(e)
        }



        return res.status(200).json({message: "sucesfully made a post", status:"success"})
    } catch (err) {

        return res.status(500).json({message:"error, please try again later", status:"fail"})
        console.log(err);
    }
})


router.patch('/changeStatus/:id', verifySessionToken, verifyRole, async (req,res) => {
    if (req.role !== 'manager'){
        return res.status(401).json({message: "not authorized", status:"fail"});
    }

    const {id} = req.params
    const {status} = req.body

    try{
        const changeStatusQuery = `UPDATE post SET status = ? WHERE id = ?;`
       
        const [result] = await connection.query(changeStatusQuery,[status, id]);
        if (result.affectedRows > 0){



            try {
                let currDate = new Date()
                await putToLogTable(userId, `user ${userId} modified postId ${id}`, req.role, "success", currDate)
            } catch (e) {
                console.log(e)
            }





            return res.status(200).json({message: "modified post status", status:"success"})
        }else{


            try {
                let currDate = new Date()
                await putToLogTable(userId, `user ${userId} tried to modify postId ${id} but did not work`, req.role,  "fail", currDate)
            } catch (e) {
                console.log(e)
            }

            return res.status(400).json({message: "did not modify anything", status:"fail"})
        }
    }catch(e){
        return res.status(500).json({message:"error, please try again later", status:"fail"})
    }


})

router.delete('/:id', verifySessionToken, verifyRole, async (req,res)=> {

    const {id} = req.params
    const userId = req.userId
    const role = req.role;


    try{

        let deleteQuery;
        let params = []

        if (role === 'manager'){
            deleteQuery = `DELETE FROM post WHERE id = ?`
            params.push(id)
        }

        else if (role === 'regular'){
            deleteQuery = `DELETE FROM post where id = ? AND user_id = ?`
            params.push(id, userId)
        } else{

            try {
                let currDate = new Date()
                await putToLogTable(userId, `user ${userId} tried to delete postId ${id} but not authorized`, role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }





            return res.status(403).json({message: "Not Authorized", status:"fail"});
        }

        let [result] = await connection.execute(deleteQuery, params);
        if (result.affectedRows > 0) {

            try {
                let currDate = new Date()
                await putToLogTable(userId, `user ${userId} Deleted postId ${id} `, role,  "success", currDate)
            } catch (e) {
                console.log(e)
            }



            return res.status(200).json({ message: "post deleted", status: "success" });
        } else {


            try {
                let currDate = new Date()
                await putToLogTable(userId, `user ${userId} tried to delete postId ${id} but post not found`, role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }

            return res.status(404).json({ message: "post not found ", status: "fail" });
        }

    }catch(e){



        try {
            let currDate = new Date()
            await putToLogTable(userId, `user ${userId} tried to delete postId ${id} but failed due to server error`, role, "fail", currDate)
        } catch (e) {
            console.log(e)
        }





        console.log(e)
        return res.status(500).json({ message: "server error, please try again later ", status: "fail" });
    }

})



export {router}
