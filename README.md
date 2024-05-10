# MemoMind - backend/server side
  A simple note taking web application built in React.js for the frontend and Express.js for the backend along with typescript.


## Technologies Used
-Express.js
-MySQL
-Typescript


## Clone project

## Node Mailer Local Setup Guide

This guide will help you set up and use Node Mailer to send emails locally using your email account. Node Mailer is a module for Node.js that allows you to send emails easily.-Get the app key of google


## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone or download this repository.

2. Navigate to the project directory in your terminal.

3. Install the required dependencies by running:


## Configuration

To send emails using Node Mailer locally, you need to configure your email account settings in the `sendMail.ts` file in the utils folder.

  
note: password is your google App key

```
const transporter: nodemailer.Transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your email here",
      pass: "password",
    },
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: "your email here",
    to: email,
    subject: "Email verification",
    text: `${email}, your verification code is: ${verif_code}`,
  };
```
## Setup
-Install dependencies: Run npm install in the backend directory to install all required dependencies.


PORT: this server is running on 3000.


Environment variables: Create a .env file in the backend directory and set the following variables:


-Change the database connection if you need in the file 'database.ts'
- database name: your database name(I given as 'notes')

  
-host: your host


-user: your root


-password : your password


## API end points
POST '/signup' :signing up the accound with name, email,password


post '/signin' : login to the account


post '/addnote ': Adding note with title and content


get '/getNote' : showing all notes of a particular user.


get '/singleNote' : Displaying each notes for editing.


put   '/editnote' : Edit the note.


put  '/trashnote' : Move the note to bin.


put  '/restorenote' :Restoring note from bin.


delete '/deletenote' : Deleting the note.

## Database
MySQL is used to store notes data.

Database Design
Before running it please make database and tables in your locally.

Creating db : ```CREATE DATABASE NOTEKEEPER; ```

switching db:``` USE NOTEKEEPER;```


creating tables
-userdetails : for storing user details
- notes : For storing notes
  
```
CREATE TABLE userDetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

```
```
CREATE TABLE notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    createdAt DATETIME,
    userId INT,
    FOREIGN KEY (userId) REFERENCES userDetails(id)
)
```

