import { connection } from "./index.js";
const verifySessionToken = (req, res, next) => {
    const userSessionObject = req.session?.userSessionObject;
    if (userSessionObject !== null && userSessionObject.userId != null){
        req.userId = userSessionObject.userId;

        console.log(req.userId);
        next()
    }else{
        return res.status(401).json({error: "Unauthorized user"})
    }
}


const verifyRole = async (req, res, next) => {
    const {userId} = req;

    try{
        let [result] = await connection.query(`SELECT u.* FROM user u WHERE u.id = ${userId}`);

        console.log(result[0].role, "KDAODKOSAKDA");
        req.role = result[0].role;
        console.log(`verify role = ${req.role} `); 
        next();
    }catch(e){
        console.log(e)
        return res.status(401).json({error: "Unauthorized user"})
    }
    // get userId, search database query, then get role then pu trole in req then next() pero no database yet
}
export {verifySessionToken, verifyRole}