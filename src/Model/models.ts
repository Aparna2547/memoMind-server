import db from "../config/database";

const userDetailsQuery  = 
`
CREATE TABLE userDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
)`;


const notesQuery  = 

`CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL
)`;

// Execute the SQL query to create the table
db.query(userDetailsQuery, (err: Error | null) => {
    if (err) {
        console.error('Error creating userDetails table:', err);
    } else { 
        console.log('UserDetails table created successfully');
    }
});

db.query(notesQuery, (err: Error | null) => {
    if (err) {
        console.error('Error creating notes table:', err);
    } else {
        console.log('Notes table created successfully');
    }
});