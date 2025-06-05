

import cors from 'cors'
import 'dotenv/config'
import mysql from 'mysql2/promise';
import express from 'express'
import session from 'express-session'
import expressMySQLSession from 'express-mysql-session';




import { router as userRoutes } from './routes/userRoute.js';
import { router as postRoutes } from './routes/postRoute.js';

import { router as logRoutes} from './routes/logRoute.js';
const app = express()

app.use(cors({ 
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}))

app.use(express.json()); // 
app.use(express.urlencoded({extended:true}));




const options = {
	host: 'localhost',
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
};

const MySQLStore = expressMySQLSession(session);
const sessionStore = new MySQLStore(options);

app.use(session({
	key: 'user_sid',
	secret: process.env.SESSION_SECRET,
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

let connection;


  app.use('/api/users', userRoutes);
  app.use('/api/posts', postRoutes); 
  app.use('/api/logs', logRoutes); 



const runBackend = async () => {

    try {

        connection = await mysql.createConnection({
            host: 'localhost',
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

    } catch (err) {
        console.log(err);
    }

    app.listen(process.env.PORT, () => {
        console.log(process.env.PORT);
    });

    await connection.query(
        `DROP TABLE IF EXISTS user`
    )
    await connection.query(
        `DROP TABLE IF EXISTS post`
    )
    await connection.query(
        `DROP TABLE IF EXISTS log`
    )

    const userTable =
        `CREATE TABLE IF NOT EXISTS user (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(255) UNIQUE NOT NULL,
            display_name VARCHAR(50) NOT NULL,
            role ENUM('admin', 'manager', 'regular') NOT NULL
        );`


    await connection.query(userTable);



    const postTable = 
        `CREATE TABLE IF NOT EXISTS post (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT REFERENCES user(id),
            title VARCHAR(255),
            description TEXT,
            status ENUM('pending', 'accepted', 'rejected')
        );`

    await connection.query(postTable);


    const logTable = `
        CREATE TABLE IF NOT EXISTS log (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT REFERENCES user(id),
            user_role ENUM('admin', 'manager', 'regular'),
            message VARCHAR(255),
            status ENUM('success', 'fail'),
            timestamp DATETIME
        );
    `
    await connection.query(logTable);

    //predefined users
    await connection.query(
        `INSERT INTO user(username, password, display_name, role) 
        VALUES
            ('regular', '$argon2d$v=19$m=12,t=3,p=1$YXcwbXBybHNhN2owMDAwMA$KjX0TCkIrTxeBp0DjTQF8A', 'regular', 'regular'),
        ('manager', '$argon2d$v=19$m=12,t=3,p=1$emcyZnJ4c3JzbXQwMDAwMA$HdsNhHAOl1vqOH9sg84TYw', 'manager', 'manager'),
        ('admin2', '$argon2d$v=19$m=12,t=3,p=1$Y2V5cG52cTZ5d2kwMDAwMA$QCNItiwLtih/EoxP0/LuEw', 'admin2', 'admin');`
        
    )


} 

runBackend();
export {connection}




