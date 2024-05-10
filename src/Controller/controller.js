"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.deleteNote = exports.restoreNote = exports.trashNote = exports.editNote = exports.getSingleNote = exports.getNotes = exports.addNote = exports.signIn = exports.verifyOtp = exports.signUp = void 0;
const database_1 = __importDefault(require("../config/database"));
const genOtp_1 = __importDefault(require("../utils/genOtp"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const moment_1 = __importDefault(require("moment"));
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const [emailFound] = yield database_1.default.execute(`SELECT email FROM userDetails where email = ?`, [email]);
        if (emailFound && emailFound.length > 0) {
            res.status(401).json({ message: "You are already signed up" });
        }
        else {
            req.app.locals.user = { name, email, password };
            const otp = yield (0, genOtp_1.default)(4);
            req.app.locals.otp = otp;
            yield (0, sendMail_1.default)(name, email, otp);
            res.status(200).json({ status: true });
        }
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.signUp = signUp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const otpBody = req.body.otp;
        const otpSaved = req.app.locals.otp;
        if (otpBody === otpSaved) {
            const userDetails = req.app.locals.user;
            const hashedPassword = yield bcrypt_1.default.hash(userDetails.password, 10);
            userDetails.password = hashedPassword;
            const [rows] = yield database_1.default.execute(`INSERT INTO userDetails (name, email, password) VALUES (?, ?, ?)`, [userDetails.name, userDetails.email, userDetails.password]);
            // res.status(201).json({ message: 'User created successfully', user: rows });
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined in environment variables");
            }
            res.status(200).json({
                status: true,
                message: "User registered successfully",
                token: jsonwebtoken_1.default.sign({ userId: userDetails._id }, process.env.JWT_SECRET, {
                    expiresIn: "1d",
                }),
            });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.verifyOtp = verifyOtp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(401).json("Invalid credentials");
        }
        const [userFound] = yield database_1.default.execute(`SELECT * FROM userDetails WHERE email = ?`, [email]);
        if (userFound.length > 0) {
            const user = userFound[0]; // Assuming there is only one user with the given email
            const hashedPassword = user.password;
            const passwordMatch = yield bcrypt_1.default.compare(password, hashedPassword);
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined in environment variables");
            }
            if (passwordMatch) {
                const token = jsonwebtoken_1.default.sign({ userId: user.email }, process.env.JWT_SECRET, {
                    expiresIn: "1d",
                });
                res
                    .status(201)
                    .cookie("userJWT", token)
                    .json({ message: "Logined successfully", token });
            }
            else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        }
        else {
            res.status(401).json({ message: "User not exists" });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.signIn = signIn;
const addNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        let userId;
        const token = req.cookies.userJWT;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
        // Retrieve the user's ID based on their email
        const [userData] = yield database_1.default.execute(`SELECT id FROM userDetails WHERE email = ?`, [userId]);
        //   // Extract the user ID from the userData result
        const userRecord = userData[0];
        if (!userRecord) {
            return res.status(404).json({ error: "User not found" });
        }
        const user_id = userRecord.id;
        const createdDate = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss');
        // Insert the note into the database
        const [insertedNote] = yield database_1.default.execute(`INSERT INTO notes (userId, title, content,createdAt) VALUES (?, ?, ?,?)`, [user_id, title, content, createdDate]);
        res.status(201).json({ message: "Note added successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.addNote = addNote;
const getNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        const token = req.cookies.userJWT;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
            console.log(userId);
        }
        const [userData] = yield database_1.default.execute(`SELECT id FROM userDetails WHERE email = ?`, [userId]);
        const userRecord = userData[0];
        console.log("dc", userRecord);
        const user_id = userRecord.id;
        console.log("userid", user_id);
        const search = req.query.search;
        const page = parseInt(req.query.page);
        const limit = 4;
        const skip = (page - 1) * limit;
        const countQuery = `SELECT COUNT(*) AS count FROM notes WHERE userId = ${user_id}`;
        const count = yield database_1.default.execute(countQuery);
        console.log("sds", count);
        let docCount = count[0][0].count;
        console.log("docc", docCount);
        const totalPages = Math.ceil(docCount / limit);
        console.log(totalPages);
        let query = `SELECT * FROM notes WHERE userId = ${user_id} AND (title LIKE '%${search}%') ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${skip}`;
        const [allNotes] = yield database_1.default.execute(
        // `SELECT * FROM notes WHERE userId=?`,[user_id]
        query);
        console.log("fdfsf");
        res.status(200).json({ allNotes, totalPages });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getNotes = getNotes;
const getSingleNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        const token = req.cookies.userJWT;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
        const [userData] = yield database_1.default.execute(`SELECT id FROM userDetails WHERE email = ?`, [userId]);
        const userRecord = userData[0];
        const user_id = userRecord.id;
        const noteId = req.query.id;
        const [singleNotes] = yield database_1.default.execute(`SELECT * FROM notes WHERE userId=? AND id=?`, [user_id, noteId]);
        res.status(200).json(singleNotes);
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getSingleNote = getSingleNote;
const editNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        const token = req.cookies.userJWT;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
        const [userData] = yield database_1.default.execute(`SELECT id FROM userDetails WHERE email = ?`, [userId]);
        const userRecord = userData[0];
        const user_id = userRecord.id;
        const { id, title, content } = req.body;
        const [editNote] = yield database_1.default.execute(`UPDATE notes SET title=?, content=? WHERE id=?`, [title, content, id]);
        res.status(200).json({ message: "Edited successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.editNote = editNote;
const trashNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        const token = req.cookies.userJWT;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
        const [userData] = yield database_1.default.execute(`SELECT id FROM userDetails WHERE email = ?`, [userId]);
        const userRecord = userData[0];
        const user_id = userRecord.id;
        let notesid = req.query.id;
        const [trashnote] = yield database_1.default.execute(`UPDATE notes SET isDeleted=1 WHERE userId=? AND id=?`, [user_id, notesid]);
        res.status(200).json({ message: "Note moved to bin..." });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.trashNote = trashNote;
const restoreNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        const token = req.cookies.userJWT;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
        const [userData] = yield database_1.default.execute(`SELECT id FROM userDetails WHERE email = ?`, [userId]);
        const userRecord = userData[0];
        const user_id = userRecord.id;
        let notesid = req.query.id;
        const [restorenote] = yield database_1.default.execute(`UPDATE notes SET isDeleted=0 WHERE userId =? AND id=?`, [user_id, notesid]);
        res.status(200).json({ message: "Note restore from bin..." });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.restoreNote = restoreNote;
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId;
        const token = req.cookies.userJWT;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
        }
        const [userData] = yield database_1.default.execute(`SELECT id FROM userDetails WHERE email = ?`, [userId]);
        const userRecord = userData[0];
        const user_id = userRecord.id;
        const id = req.query.id;
        const [result] = yield database_1.default.execute("DELETE FROM notes WHERE id = ?", [id]);
        res.status(200).json({ message: "Note deleted" });
    }
    catch (error) {
        throw error;
    }
});
exports.deleteNote = deleteNote;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie("userJWT", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.log(error);
    }
});
exports.logout = logout;
