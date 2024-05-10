"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const userDetailsQuery = `
CREATE TABLE userDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
)`;
const notesQuery = `CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL
)`;
// Execute the SQL query to create the table
database_1.default.query(userDetailsQuery, (err) => {
    if (err) {
        console.error('Error creating userDetails table:', err);
    }
    else {
        console.log('UserDetails table created successfully');
    }
});
database_1.default.query(notesQuery, (err) => {
    if (err) {
        console.error('Error creating notes table:', err);
    }
    else {
        console.log('Notes table created successfully');
    }
});
