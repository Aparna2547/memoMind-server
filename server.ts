// app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./src/config/database";
import router from "./src/router/router";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(cors());

app.use(
  cors({
    origin: ["http://localhost:8000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use("/api/users", router);

// Connect to MySQL
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
