"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// app.ts
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./src/config/database"));
const router_1 = __importDefault(require("./src/router/router"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// app.use(cors());
app.use((0, cors_1.default)({
    origin: ["http://localhost:8000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}));
app.use('/api/users', router_1.default);
// Connect to MySQL
database_1.default.getConnection()
    .then(connection => {
    ('Connected to MySQL as ID ' + connection.threadId);
    connection.release(); // Release the connection after obtaining the threadId
})
    .catch(err => {
    console.error('Error connecting to MySQL: ' + err.stack);
});
app.listen(port, () => {
    console.log('Server is running');
});
