// app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// import db from "./src/config/database";
import router from "./src/router/router";
import dotenv from "dotenv";
import mysql from 'mysql2/promise'
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(cors());

app.use(
  cors({
    origin: process.env.base_url,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use("/api/users", router);



let dbDetails={
  host: 'bj9jgt6het0le4fkfieo-mysql.services.clever-cloud.com',
  dbname : 'bj9jgt6het0le4fkfieo',
  user : 'ur2e19jfc38xea3j',
  password : process.env.DB_PASSWORD
}


export const db = mysql.createPool({
  host: dbDetails.host,
  database: dbDetails.dbname,
  user: dbDetails.user,
  password: dbDetails.password
});

db.getConnection()
  .then((connection) => {
    "Connected to MySQL as ID " + connection.threadId;
    connection.release(); // Release the connection after obtaining the threadId
  })
  .catch((err) => {
    console.error("Error connecting to MySQL: " + err.stack);
  });





app.listen(port, () => {
  console.log("Server is running");
});
