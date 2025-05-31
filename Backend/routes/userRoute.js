import express from 'express';
import { connection } from '../index.js';
import argon from 'argon2'; 
import { verifySessionToken,verifyRole } from '../sessionUtils.js';



const router = express.Router()

router.post('/register', async (req, res) => {

    const {username, password, displayName} = req.body;
    console.log(username, password, displayName)

    try{
        let checkIfExistQuery = `SELECT u.* FROM user u WHERE u.username = ?`
        let [checkIfExist] = await connection.query(checkIfExistQuery, [username]);

        if (checkIfExist.length > 0){
            return res.status(400).json({message: "user already exist", status:"fail"});
        }


        let checkIfExistQuery2 = `SELECT u.* FROM user u WHERE u.display_name = ?`
        let [checkIfExist2] = await connection.query(checkIfExistQuery2,[displayName]);

        if (checkIfExist2.length > 0 ){
            return res.status(400).json({message: "display name already taken", status:"fail"});
        }

        let hashedPassword = await argon.hash(password);


        let createUserQuery = 'INSERT INTO user (username, password, display_name, role) VALUES (?, ? ,?, ?)';
        
        let [results] = await connection.query(createUserQuery, [username, hashedPassword, displayName, "regular"]);
        console.log(results)

        
        return res.status(200).json({message: "successfully created user", status:"success"});
        



    }catch(e){

        return res.status(200).json({message: "Server error, please try again next time", status:"fail"});
        console.log(e);
    }
})





// FOR ADMINS ONLY
router.post('/createUser', verifySessionToken, verifyRole, async (req, res) => {
    if (req.role !== 'admin'){
        return res.status(403).json({message: "unauthorized", status:"fail"});
    }


    const { username, password, displayName, role } = req.body;

    if (!username || !password || !displayName || !role){
        return res.status(400).json({message: "incomplete details", status:"fail"});
    }


    try {
        let checkIfExistQuery = `SELECT u.* FROM user u WHERE u.username = ?`
        let [checkIfExist] = await connection.query(checkIfExistQuery, [username]);

        if (checkIfExist.length > 0) {
            return res.status(400).json({ message: "user already exist", status: "fail" });
        }


        let checkIfExistQuery2 = `SELECT u.* FROM user u WHERE u.display_name = ?`
        let [checkIfExist2] = await connection.query(checkIfExistQuery2, [displayName]);

        if (checkIfExist2.length > 0) {
            return res.status(400).json({ message: "display name already taken", status: "fail" });
        }

        let hashedPassword = await argon.hash(password);


        let createUserQuery = 'INSERT INTO user (username, password, display_name, role) VALUES (?, ? ,?, ?)';

        let [results] = await connection.query(createUserQuery, [username, hashedPassword, displayName, role]);
        console.log(results)


        return res.status(200).json({ message: "successfully created priveleged user", status: "success" });
    } catch (e) {

        return res.status(200).json({ message: "Server error, please try again next time", status: "fail" });
        console.log(e);
    }
})





router.post('/login', async (req, res) => {
    const {username, password} = req.body
    console.log(username, password, "KDOSAKDOA")
    let findUserQuery = `
        SELECT u.*
        FROM user u 
        WHERE u.username = ?
    `
    let [results] = await connection.query(findUserQuery, [username]);

    if (results.length === 0){
        console.log("this happens 1")
        return res.status(400).json({message: "wrong username or password", status: "fail"})
    }

    let existingUser = results[0]
    
    if (await argon.verify(existingUser.password, password)){
        req.session.userSessionObject = {userId: existingUser.id, role: existingUser.role};
        res.status(200).json({status: "success", message: "succesfully login", data: {displayName: existingUser.display_name, role: existingUser.role}})
    }else{
        return res.status(400).json({message: "wrong username or password.", status: "fail"});
    }
})


router.post('/checkSession', verifySessionToken, verifyRole, async(req,res)=> {

    return res.status(200).json({message:"verified", status:"success", data: {isLoggedIn: true, role: req.role, userId: req.userId}})

})

router.get('/publicInfo', verifySessionToken, verifyRole, async (req,res)=> {

    let userId = req.userId

    let [result] = await connection.execute(`SELECT u.display_name, u.role FROM user u WHERE u.id = ?`, [userId]);
    return res.status(200).json({message:"succesfully gotten public details", status:"success", data: {display_name: result[0].display_name, role: result[0].role}});
})

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Failed to destroy session:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('user_sid'); // clear the session cookie (if using default cookie name)
        res.status(200).json({ message: 'Logged out successfully' });
    });
});


// ONLY ADMIN CAN ACCESS
router.get('/', verifySessionToken, verifyRole, async (req,res)=> {
    if (req.role !== 'admin'){
        return res.status(402).json({ message: 'unauthorized', status: 'fail' });
    }

    let getUserQuery = `SELECT u.username, u.display_name, u.role, u.id FROM user u;`

    let [result] = await connection.query(getUserQuery);
    console.log(result);
    return res.status(200).json({message:"succesfully gotten users", status:"success", data: result});
})


router.patch('/:id/modifyRole', verifySessionToken, verifyRole, async (req,res) => {
    console.log(req.role);
    if (req.role !== 'admin') {

        return res.status(401).json({ message: 'unauthorized', status: 'fail' });
    }

    const {id} = req.params
    const {role} = req.body

    console.log(id, role, "DWKLOADKWOA");
    if(!id||  !role){
        return res.status(400).json({ message: 'incomplete fields', status: 'fail' });
    }

    try{
        let modifyRoleQuery = "UPDATE `user` SET role = ? WHERE id = ?;";

        let [result] = await connection.query(modifyRoleQuery, [role, id]);

        return res.status(200).json({ message: "succesfully modified ", status: "success", data: { result } });
    }catch(e){
        console.log(e);

        return res.status(500).json({ message: 'server error', status: 'fail' });
    }

})
export {router}
