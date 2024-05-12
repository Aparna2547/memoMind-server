"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// app.ts
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const router_1 = __importDefault(require("./src/router/router"));
const dotenv_1 = __importDefault(require("dotenv"));
const promise_1 = __importDefault(require("mysql2/promise"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// app.use(cors());
app.use((0, cors_1.default)({
    origin: process.env.base_url,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}));
app.use("/api/users", router_1.default);
let dbDetails = {
    host: 'bj9jgt6het0le4fkfieo-mysql.services.clever-cloud.com',
    dbname: 'bj9jgt6het0le4fkfieo',
    user: 'ur2e19jfc38xea3j',
    password: process.env.DB_PASSWORD
};
exports.db = promise_1.default.createPool({
    host: dbDetails.host,
    database: dbDetails.dbname,
    user: dbDetails.user,
    password: dbDetails.password
});
exports.db.getConnection()
    .then((connection) => {
    "Connected to MySQL as ID " + connection.threadId;
    connection.release();
})
    .catch((err) => {
    console.error("Error connecting to MySQL: " + err.stack);
});
app.listen(port, () => {
    console.log("Server is running");
});
