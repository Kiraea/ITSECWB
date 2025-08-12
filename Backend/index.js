

import cors from 'cors'
import 'dotenv/config'
import mysql from 'mysql2/promise';
import express from 'express'
import session from 'express-session'
import expressMySQLSession from 'express-mysql-session';




import { router as userRoutes } from './routes/userRoute.js';
import { router as postRoutes } from './routes/postRoute.js';

import { router as logRoutes} from './routes/logRoute.js';
import { router as questionRoutes} from './routes/securityQuestion.js';
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
  app.use('/api/questions', questionRoutes); 



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
    await connection.query(
        `DROP TABLE IF EXISTS security_answer`
    )
    await connection.query(
        `DROP TABLE IF EXISTS security_question`
    )


    const userTable =
        `CREATE TABLE IF NOT EXISTS user (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) UNIQUE NOT NULL,
            display_name VARCHAR(50) NOT NULL,
            role ENUM('admin', 'manager', 'regular') NOT NULL,
            no_of_attempts INT DEFAULT 0,
            locked_out_until DATETIME,
            password_last_changed DATETIME DEFAULT NULL,
            last_login_attempt DATETIME,
            last_successful_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`


    await connection.query(userTable);


    const securityQuestionsTable = `
        CREATE TABLE security_question (
            id INT PRIMARY KEY AUTO_INCREMENT,
            question VARCHAR(255) UNIQUE NOT NULL
        );
    `
    await connection.query(securityQuestionsTable);


    const insertQuestions = `
    INSERT IGNORE INTO security_question (question) VALUES 
    (?), (?), (?), (?), (?);
    `;

    const questions = [
        "What is the first name of your favorite childhood teacher?",
        "What was the name of your first childhood pet?",
        "What city were you born in?",
        "What is your oldest sibling’s middle name?",
        "Where was the destination of your most memorable school field trip?"
    ];

    await connection.execute(insertQuestions, questions);



    const securityAnswersTable = `
        CREATE TABLE security_answer (
        id INT PRIMARY KEY AUTO_INCREMENT,
        question_id INT NOT NULL REFERENCES security_question(id) ON DELETE CASCADE,
        user_username VARCHAR(50) NOT NULL REFERENCES user(username) ON DELETE CASCADE,
        answer VARCHAR(255) NOT NULL
        );
    `
    await connection.query(securityAnswersTable);


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
            message TEXT,
            status ENUM('success', 'fail'),
            timestamp DATETIME
        );
    `
    await connection.query(logTable);

    //predefined users
    await connection.query(
        `INSERT INTO user(username, password, display_name, role) 
        VALUES
            ('regular', '$argon2d$v=19$m=12,t=3,p=1$ZXoycWpwdmxoZ2IwMDAwMA$WtLJ+mfTkr4sBFmc/VApKw', 'regular', 'regular'),
        ('manager', '$argon2d$v=19$m=12,t=3,p=1$Njh6bjR2dXB2aGswMDAwMA$MfrFWX0BYjBg+eaUu0VFtg', 'manager', 'manager'),
        ('admin2', '$argon2d$v=19$m=12,t=3,p=1$a3M5MmRnZWhtN2owMDAwMA$4nkX1auj6b4gypGiJg90Yw', 'admin2', 'admin');`
        
    )


} 

runBackend();
export {connection}




