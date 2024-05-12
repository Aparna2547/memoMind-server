"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
// MySQL Connection
// const db = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   password: '123456',
//   database: 'notes',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
let db = promise_1.default.createPool({
    host: 'bj9jgt6het0le4fkfieo-mysql.services.clever-cloud.com',
    database: 'bj9jgt6het0le4fkfieo',
    user: 'ur2e19jfc38xea3j',
    password: '6dR4CzmRmaYDTPCG6YPb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.default = db;
