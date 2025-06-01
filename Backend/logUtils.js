import { connection } from "./index.js"

const putToLogTable = async  (userId, message, role, status, timestamp) => {
    
    if (!userId || !role || !message || !status || !timestamp){
        throw new  Error(`Missing Required Fields`);
    }


    console.log("LOG ROUTE", role);
    try{
        let [result] = await connection.execute(`
        INSERT INTO log (user_id, user_role, message, status, timestamp) VALUES
        (?, ?, ?, ?, ?)  
        ;`, [userId, role, message, status, timestamp]);

        if (result.affectedRows === 1) {
            console.log("Logged")
        } else {
            console.log("Didnt log due to some error")
        }
    }catch(e){
        console.log(e, "log error");
    }

}


export {putToLogTable};