import express from 'express';
import { connection } from '../index.js';
import argon from 'argon2'; 
import { verifySessionToken,verifyRole } from '../sessionUtils.js';
import { putToLogTable } from '../logUtils.js';

import { z } from "zod/v4";


const UserRegisterSchema = z.object({

//edited this part for data validation
//===============================================
//  2.3.2 Validate data range
//  2.3.3 Validate data length
//===============================================
        username: z.string()
        .min(5, "Username must be at least 5 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter") //should have lowercase
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter") //should have uppercase 
        .regex(/\d/, "Password must contain at least one number"), //should have at least one digit

        password: z.string()
        .min(8, "Password must be at least 8 characters") //min 8 length
        .max(64, "Password must be at most 64 characters") //max 20 length
        .regex(/[a-z]/, "Password must contain at least one lowercase letter") //should have lowercase
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter") //should have uppercase 
        .regex(/\d/, "Password must contain at least one number") //should have at least one digit
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"), //should have special char 

        displayName: z.string()
        .min(3, "Display name must be at least 3 characters")
        .max(20, "Display name must be at most 20 characters")
});


const router = express.Router()

router.post('/register', async (req, res) => {
    let { username, password, displayName, securityQuestionId, answer } = req.body;

    // --- FIX 1: Send an array for this error ---
    if (!username || !password || !displayName) {
        // Always use the `messages` key with an array
        return res.status(400).json({ messages: ["Incomplete fields"], status: "fail" });
    }

    securityQuestionId = Number(securityQuestionId);

    // --- FIX 2: Send an array for this error ---
    if (!securityQuestionId || isNaN(securityQuestionId)) {
        // Always use the `messages` key with an array
        return res.status(400).json({ messages: ["Invalid security question ID"], status: "fail" });
    }

//================================================================================================
//  2.3.1 All validation failures should result in input rejection. Sanitizing should not be used
//  2.3.2 Validate data range
//  2.3.3 Validate data length
//================================================================================================
 
//Edits to include the Username, Password, and DisplayName Validation
        //Checks if username uses a-z, A-Z and numbers 0-9
        if (typeof username !== 'string' || username.length < 5 || username.length > 20 || !/^[a-zA-Z0-9]+$/.test(username)) {
            return res.status(400).json({ error: 'Username must be 5–20 characters, and only inlcudes letters and numbers.' });
        }

        //Checks if password is 8–64 chars, includes uppercase, lowercase, numbers, and special character
        if (typeof password !== 'string' || password.length < 8 || password.length > 64 ||
            !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
            return res.status(400).json({ error: 'Password must be 8–64 chars, include a uppercase letter, lowercase letter, a number, and a special character.' });
        }

        //Checks if displpayname is at least be 3 but cannot be more than 20
        if (typeof displayName !== 'string' || displayName.length < 3 || displayName.length > 20) {
            return res.status(400).json({ error: 'Display name must be 3–20 characters and only inlcudes letters and numbers' });
        }
//Until Here


    try {
        const input = { username, password, displayName };
        UserRegisterSchema.parse(input);

        // ... your success logic here ...

    } catch (e) {
        if (e instanceof z.ZodError) {
            // This part is already correct! It sends a `messages` array.
            const flattenedErrors = e.flatten().fieldErrors;
            const errorMessages = Object.values(flattenedErrors).flat();
            
            // DO NOT do this: const errorMessages = Object.values(flattenedErrors).flat().join(';');
            // Send the raw array as you are doing now.
            return res.status(400).json({ messages: errorMessages, status: "fail" });
        }

        console.error(e);
        return res.status(500).json({ messages: ["An unexpected server error occurred."], status: "fail" });
    }

    try{
        let checkIfExistQuery = `SELECT u.* FROM user u WHERE u.username = ?`
        let [checkIfExist] = await connection.query(checkIfExistQuery, [username]);

        if (checkIfExist.length > 0){


            try {
                let currDate = new Date()
                await putToLogTable(null, `someone tried to register but username already taken`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }




            return res.status(400).json({message: "invalid register details", status:"fail"});
        }


        let checkIfExistQuery2 = `SELECT u.* FROM user u WHERE u.display_name = ?`
        let [checkIfExist2] = await connection.query(checkIfExistQuery2,[displayName]);

        if (checkIfExist2.length > 0 ){


            try {
                let currDate = new Date()
                await putToLogTable(null, `someone tried to register but display name already taken`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }



            return res.status(400).json({message: "invalid register details", status:"fail"});
        }

        let hashedPassword = await argon.hash(password);

        let createUserQuery = 'INSERT INTO user (username, password, display_name, role) VALUES (?, ? ,?, ?)';
        
        let [results] = await connection.query(createUserQuery, [username, hashedPassword, displayName, "regular"]);

        const insertedId = results.insertId;

        let [userResults] = await connection.query(
            `SELECT * FROM user WHERE id = ?`,
            [insertedId]
        );

        console.log(userResults[0]);

            try {
                let currDate = new Date()
                await putToLogTable(null, `${userResults[0].username} created an account succesfully `, null, "success", currDate)
            } catch (e) {
                console.log(e)
            }


        // after creating user bind the securityy question

        let createSecurityQuestionUser = `
        INSERT INTO security_answer (question_id, user_username, answer) 
        VALUES (?, ?, ?);
        `;

        let [securityResult] = await connection.query(createSecurityQuestionUser, [securityQuestionId, userResults[0].username, answer]);

        if (securityResult.affectedRows === 0) {
            return res.status(400).json({ message: "cannot create security question", status: "fail" });
        } else {
            console.log("register: created security questions");
        }

        return res.status(200).json({ message: "created everything sucesfully", status: "success" });



    }catch(e){  
            try {
                let currDate = new Date()
                await putToLogTable(null, `someone tried to register but display name already taken`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }


        console.log(e);

        return res.status(200).json({message: "Server error, please try again next time", status:"fail"});
    }
})





// FOR ADMINS ONLY
router.post('/createUser', verifySessionToken, verifyRole, async (req, res) => {
    if (req.role !== 'admin'){

            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} tried to createUser but is not authorized`, req.role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }



        return res.status(403).json({message: "unauthorized", status:"fail"});
    }


    const { username, password, displayName, role } = req.body;

    if (!username || !password || !displayName || !role){


            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} tried to createUser but is incomplete fields`, req.role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }



        return res.status(400).json({message: "incomplete details", status:"fail"});
    }


    try {
        let checkIfExistQuery = `SELECT u.* FROM user u WHERE u.username = ?`
        let [checkIfExist] = await connection.query(checkIfExistQuery, [username]);

        if (checkIfExist.length > 0) {

            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} tried to createUser but username already exist`, req.role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }




            return res.status(400).json({ message: "user already exist", status: "fail" });
        }


        let checkIfExistQuery2 = `SELECT u.* FROM user u WHERE u.display_name = ?`
        let [checkIfExist2] = await connection.query(checkIfExistQuery2, [displayName]);

        if (checkIfExist2.length > 0) {


            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} tried to createUser but display name already exist`, req.role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }


            return res.status(400).json({ message: "display name already taken", status: "fail" });
        }

        let hashedPassword = await argon.hash(password);


        let createUserQuery = 'INSERT INTO user (username, password, display_name, role) VALUES (?, ? ,?, ?)';

        let [results] = await connection.query(createUserQuery, [username, hashedPassword, displayName, role]);
        console.log(results)



            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} succesfully created a user`, req.role, "true", currDate)
            } catch (e) {
                console.log(e)
            }

        return res.status(200).json({ message: "successfully created priveleged user", status: "success" });
    } catch (e) {


            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} tried to create a user but server error`, req.role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }



        return res.status(200).json({ message: "Server error, please try again next time", status: "fail" });
        console.log(e);
    }
})



//================================================================================================
//  2.3.1 All validation failures should result in input rejection. Sanitizing should not be used
//  2.3.2 Validate data range
//  2.3.3 Validate data length
//================================================================================================

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

            try {
                let currDate = new Date()
                await putToLogTable(null, `someone tried to login but wrong username/password`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }

        return res.status(400).json({message: "wrong username or password", status: "fail"})
    }

    let existingUser = results[0]
    // 1. Check if account is still locked
    if (existingUser.locked_out_until && existingUser.locked_out_until > new Date()) {
        return res.status(400).json({
            message: "Your account is locked. Try again after 15 minutes.",
            status: "fail"
        });
    }

    // 2. If lockout has expired (i.e., old timestamp in DB), reset the counter
    if (existingUser.locked_out_until && existingUser.locked_out_until <= new Date()) {
        await connection.execute(
            `UPDATE user SET no_of_attempts = 0, locked_out_until = NULL WHERE username = ?`,
            [username]
        );
    }



    if (await argon.verify(existingUser.password, password)){


            try {
                let currDate = new Date()
                await putToLogTable(existingUser.id, `user ${existingUser.id} logged in`, existingUser.role, "success", currDate)
            } catch (e) {
                console.log(e)
            }


        req.session.userSessionObject = {userId: existingUser.id, role: existingUser.role};
        res.status(200).json({status: "success", message: "succesfully login", data: {displayName: existingUser.display_name, role: existingUser.role}})
    }else{

            try {
                let currDate = new Date()
                await putToLogTable(null, `someone tried to login but wrong username/password`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }



        const IncrementLockQuery = 'UPDATE user SET no_of_attempts = no_of_attempts + 1 WHERE username = ?';

        try {
            // 1. Increment attempt counter
            const [IncrementLockResult] = await connection.execute(IncrementLockQuery, [username]);

            // 3. Check current attempt count
            const [verify] = await connection.execute(
                'SELECT no_of_attempts, locked_out_until FROM user WHERE username = ?',
                [username]
            );
            console.log('Current attempts:', verify[0].no_of_attempts);

            // 4. lockout if 5
            if (verify[0].no_of_attempts >= 5) {
                const lockoutMinutes = 1;
                const lockoutTime = new Date(Date.now() + lockoutMinutes * 60000);

                await connection.execute(
                    'UPDATE user SET locked_out_until = ? WHERE username = ?',
                    [lockoutTime, username]
                );
                console.log(`Account locked until ${lockoutTime}`);
            }

            // 5. log the stuff 
            const [finalCheck] = await connection.execute(
                'SELECT no_of_attempts, locked_out_until FROM user WHERE username = ?',
                [username]
            );
            console.log('Final state - Attempts:', finalCheck[0].no_of_attempts,
                'Lock until:', finalCheck[0].locked_out_until);

        } catch (e) {
            console.error("Error in incrementing attempts:", e);
            }
 

        // normal return
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

router.post('/logout', verifySessionToken, verifyRole, async (req, res) => {
    req.session.destroy(async (err) => {
        if (err) {
            console.error('Failed to destroy session:', err);


            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} tried to log out but failed`, req.role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }


            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('user_sid'); // clear the session cookie (if using default cookie name)


            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} logged out succesfully`, req.role, "success", currDate)
            } catch (e) {
                console.log(e)
            }


        res.status(200).json({ message: 'Logged out successfully' });
    });
});


// ONLY ADMIN CAN ACCESS
router.get('/', verifySessionToken, verifyRole, async (req,res)=> {
    let userId = req.userId
    if (req.role !== 'admin'){

            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${userId} tried to get user accounts but is unauthorized`, req.role, "fail", currDate)
            } catch (e) {
                console.log(e)
            }


        return res.status(402).json({ message: 'unauthorized', status: 'fail' });
    }

    let getUserQuery = `SELECT u.username, u.display_name, u.role, u.id FROM user u;`

    let [result] = await connection.query(getUserQuery);
    console.log(result);


    try {
        let currDate = new Date()
        await putToLogTable(req.userId, `user ${userId} succesfully gotten user account details`, req.role, "success", currDate)
    } catch (e) {
        console.log(e)
    }




    return res.status(200).json({message:"succesfully gotten users", status:"success", data: result});
})


router.patch('/:id/modifyRole', verifySessionToken, verifyRole, async (req,res) => {
    console.log(req.role);
    if (req.role !== 'admin') {
            try {
                let currDate = new Date()
                await putToLogTable(req.userId, `user ${req.userId} tried to modify role but is unauthorized`, req.role, "success", currDate)
            } catch (e) {
                console.log(e)
            }
        return res.status(401).json({ message: 'unauthorized', status: 'fail' });
    }

    const {id} = req.params
    const {role} = req.body

    console.log(id, role, "DWKLOADKWOA");
    if(!id||  !role){


        try {
            let currDate = new Date()
            await putToLogTable(req.userId, `user ${req.userId} tried to modify role but incomplete fields`, req.role, "fail", currDate)
        } catch (e) {
            console.log(e)
        }
        return res.status(400).json({ message: 'incomplete fields', status: 'fail' });
    }

    try{
        let modifyRoleQuery = "UPDATE `user` SET role = ? WHERE id = ?;";

        let [result] = await connection.query(modifyRoleQuery, [role, id]);

        try {
            let currDate = new Date()
            await putToLogTable(req.userId, `user ${req.userId} succesfully modified the role of ${id} to ${role}`, req.role, "success", currDate)
        } catch (e) {
            console.log(e)
        }

        return res.status(200).json({ message: "succesfully modified ", status: "success", data: { result } });
    }catch(e){

        try {
            let currDate = new Date()
            await putToLogTable(req.userId, `user ${req.userId} tried to modified user ${id} to ${role} but failed due to server error`, req.role, "fail", currDate)
        } catch (e) {
            console.log(e)
        }
        console.log(e);

        return res.status(500).json({ message: 'server error', status: 'fail' });
    }

})


router.post('/forgotPassword', async (req,res)=>  {

    const {username, securityQuestionId, answer, newPassword} = req.body;
    console.log("FORGOT PASSWORD", username, securityQuestionId, answer, newPassword);
    if (!username || !securityQuestionId || !answer || !newPassword) {
        return res.status(400).json({ message: "Missing required fields", status: "fail" });
    }

    // check if user exist
    try{
        let findUserQuery = `
        SELECT u.*
        FROM user u 
        WHERE u.username = ?
        `
        let [results] = await connection.execute(findUserQuery, [username]);

        if (results.length === 0) {


            try {
                let currDate = new Date()
                await putToLogTable(null, `someone tried to forgot password but no user found`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }

            return res.status(400).json({ message: 'invalid please try again', status: 'fail' });
        }
    }catch(e){
        console.log(e)

            try {
                let currDate = new Date()
                await putToLogTable(null, `someone tried to forgot password but server error`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }
        return res.status(500).json({ message: 'server error, please try again', status: 'fail' });
    }



    //check if user answered correclty

    try{
        let checkSecurityAnswerQuery = `
        SELECT s.*
        FROM security_answer s 
        WHERE s.user_username = ? AND question_id = ? AND answer = ?;
        `
        let [results2] = await connection.execute(checkSecurityAnswerQuery, [username, securityQuestionId, answer]);

        if (results2.length === 0) {

            try {
                let currDate = new Date()
                await putToLogTable(null, `username of ${username} tried to forgot password but invalid credentials`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }
            return res.status(400).json({ message: 'invalid please try again', status: 'fail' });
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({ message: 'server error, please try again', status: 'fail' });
    }

    // update the password
    
    let hashedPassword = await argon.hash(newPassword);
    try{
        let result3 = await connection.execute('UPDATE user SET password = ? WHERE username = ? ', [hashedPassword, username]);

            try {
                let currDate = new Date()
                await putToLogTable(null, `username of ${username} succesfully changed their password`, null, "fail", currDate)
            } catch (e) {
                console.log(e)
            }
        return res.status(200).json({ message: 'password succesfully updated ', status: 'success' });
    }catch(e){

        try {
            let currDate = new Date()
            await putToLogTable(null, `username of ${username} tried to change their password but server error`, null, "fail", currDate)
        } catch (e) {
            console.log(e)
        }

        console.log(e)
        return res.status(500).json({ message: 'server error, please try again', status: 'fail' });
    }


})



// Add this new route to userRoute.js
router.post('/changePassword', verifySessionToken, verifyRole, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
            message: "Current password and new password are required", 
            status: "fail" 
        });
    }

    try {
        // Get user details including password_last_changed
        const [userResults] = await connection.query(
            `SELECT * FROM user WHERE id = ?`, 
            [userId]
        );

        if (userResults.length === 0) {
            return res.status(404).json({ message: "User not found", status: "fail" });
        }

        const user = userResults[0];

        // 2.1.11 - Check if password is at least 1 day old
        const now = new Date();
        const passwordAge = now - new Date(user.password_last_changed);
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (passwordAge < oneDayInMs) {
            const hoursLeft = Math.ceil((oneDayInMs - passwordAge) / (60 * 60 * 1000));
            
            try {
                await putToLogTable(userId, `User ${userId} tried to change password but it's too recent`, user.role, "fail", new Date());
            } catch (e) {
                console.log(e);
            }

            return res.status(400).json({ 
                message: `Password can only be changed once every 24 hours. Try again in ${hoursLeft} hours.`, 
                status: "fail" 
            });
        }

        // 2.1.13 - Re-authenticate user by verifying current password
        const isCurrentPasswordValid = await argon.verify(user.password, currentPassword);
        if (!isCurrentPasswordValid) {
            try {
                await putToLogTable(userId, `User ${userId} failed password change - incorrect current password`, user.role, "fail", new Date());
            } catch (e) {
                console.log(e);
            }

            return res.status(400).json({ 
                message: "Current password is incorrect", 
                status: "fail" 
            });
        }

        // Hash new password and update
        const hashedNewPassword = await argon.hash(newPassword);
        await connection.query(
            `UPDATE user SET password = ?, password_last_changed = CURRENT_TIMESTAMP WHERE id = ?`,
            [hashedNewPassword, userId]
        );

        try {
            await putToLogTable(userId, `User ${userId} successfully changed password`, user.role, "success", new Date());
        } catch (e) {
            console.log(e);
        }

        return res.status(200).json({ 
            message: "Password changed successfully", 
            status: "success" 
        });

    } catch (error) {
        console.error('Password change error:', error);
        
        try {
            await putToLogTable(userId, `User ${userId} password change failed - server error`, req.role, "fail", new Date());
        } catch (e) {
            console.log(e);
        }

        return res.status(500).json({ 
            message: "Server error, please try again", 
            status: "fail" 
        });
    }
});


export {router}
