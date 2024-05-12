import { Request, Response } from "express";
import {db} from "../../server";
import genOtp from "../utils/genOtp";
import sendMail from "../utils/sendMail";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import moment from "moment";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const [emailFound]: any = await db.execute(
      `SELECT email FROM userDetails where email = ?`,
      [email]
    );

    if (emailFound && emailFound.length > 0) {
      res.status(401).json({ message: "You are already signed up" });
    } else {
      req.app.locals.user = { name, email, password };
      const otp = await genOtp(4);
      req.app.locals.otp = otp;

      await sendMail(name, email, otp);

      res.status(200).json({ status: true });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const otpBody: string = req.body.otp;
    const otpSaved: string = req.app.locals.otp;

    if (otpBody === otpSaved) {
      const userDetails = req.app.locals.user;
      const hashedPassword = await bcrypt.hash(userDetails.password, 10);
      userDetails.password = hashedPassword;

      const [rows] = await db.execute(
        `INSERT INTO userDetails (name, email, password) VALUES (?, ?, ?)`,
        [userDetails.name, userDetails.email, userDetails.password]
      );
      // res.status(201).json({ message: 'User created successfully', user: rows });

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      let token =jwt.sign({ userId: userDetails._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      })
      res.status(200).json({
        status: true,
        message: "User registered successfully",
        token: token,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(401).json("Invalid credentials");
    }

    const [userFound]: any = await db.execute(
      `SELECT * FROM userDetails WHERE email = ?`,
      [email]
    );

    if (userFound.length > 0) {
      const user = userFound[0]; // Assuming there is only one user with the given email

      const hashedPassword = user.password;
      const passwordMatch = await bcrypt.compare(password, hashedPassword);
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      if (passwordMatch) {
        const token = jwt.sign({ userId: user.email }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        res.cookie('userJWT',token,{
          httpOnly: true,
          secure: false,
          sameSite: 'none',
          maxAge: 30 * 24 * 60 * 60 * 1000,
      });
        res
          .status(201)
          .json({ message: "Logined successfully", token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ message: "User not exists" });
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const addNote = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    console.log(req.body);
    
    let userId;
    const token = req.cookies.userJWT;
    console.log(token);
    

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      userId = decoded.userId;
    }

    const [userData]: any = await db.execute(
      `SELECT id FROM userDetails WHERE email = ?`,
      [userId]
    );

    const userRecord = userData[0];

    if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }
    const user_id = userRecord.id;
    console.log(user_id);
    

    const createdDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Insert the note into the database
    const [insertedNote]: any = await db.execute(
      `INSERT INTO notes (userId, title, content,createdAt) VALUES (?, ?, ?,?)`,
      [user_id, title, content, createdDate]
    );

    res.status(201).json({ message: "Note added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  try {
    let userId;
    const token = req.cookies.userJWT;
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      userId = decoded.userId;
      console.log(userId);
    }

    const [userData]: any = await db.execute(
      `SELECT id FROM userDetails WHERE email = ?`,
      [userId]
    );
    const userRecord = userData[0];
    console.log("dc", userRecord);
    const user_id = userRecord.id;
    console.log("userid", user_id);

    const search = req.query.search as string;
    const page = parseInt(req.query.page as string);

    const limit = 4;
    const skip = (page - 1) * limit;
    const countQuery = `SELECT COUNT(*) AS count FROM notes WHERE userId = ${user_id}`;
    const count: any = await db.execute(countQuery);
    console.log("sds", count);

    let docCount = count[0][0].count;
    console.log("docc", docCount);

    const totalPages = Math.ceil(docCount / limit);
    console.log(totalPages);

    let query = `SELECT * FROM notes WHERE userId = ${user_id} AND (title LIKE '%${search}%') ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${skip}`;

    const [allNotes] = await db.execute(
      // `SELECT * FROM notes WHERE userId=?`,[user_id]
      query
    );
    res.status(200).json({ allNotes, totalPages });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const getSingleNote = async (req: Request, res: Response) => {
  try {
    let userId;
    const token = req.cookies.userJWT;
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      userId = decoded.userId;
    }

    const [userData]: any = await db.execute(
      `SELECT id FROM userDetails WHERE email = ?`,
      [userId]
    );
    const userRecord = userData[0];
    const user_id = userRecord.id;

    const noteId = req.query.id as string;

    const [singleNotes] = await db.execute(
      `SELECT * FROM notes WHERE userId=? AND id=?`,
      [user_id, noteId]
    );
    res.status(200).json(singleNotes);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const editNote = async (req: Request, res: Response) => {
  try {
    let userId;
    const token = req.cookies.userJWT;
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      userId = decoded.userId;
    }

    const [userData]: any = await db.execute(
      `SELECT id FROM userDetails WHERE email = ?`,
      [userId]
    );
    const userRecord = userData[0];
    const user_id = userRecord.id;

    const { id, title, content } = req.body;

    const [editNote] = await db.execute(
      `UPDATE notes SET title=?, content=? WHERE id=?`,
      [title, content, id]
    );

    res.status(200).json({ message: "Edited successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const trashNote = async (req: Request, res: Response) => {
  try {
    let userId;
    const token = req.cookies.userJWT;
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      userId = decoded.userId;
    }

    const [userData]: any = await db.execute(
      `SELECT id FROM userDetails WHERE email = ?`,
      [userId]
    );
    const userRecord = userData[0];
    const user_id = userRecord.id;

    let notesid = req.query.id;
    const [trashnote] = await db.execute(
      `UPDATE notes SET isDeleted=1 WHERE userId=? AND id=?`,
      [user_id, notesid]
    );
    res.status(200).json({ message: "Note moved to bin..." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const restoreNote = async (req: Request, res: Response) => {
  try {
    let userId;
    const token = req.cookies.userJWT;
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      userId = decoded.userId;
    }

    const [userData]: any = await db.execute(
      `SELECT id FROM userDetails WHERE email = ?`,
      [userId]
    );
    const userRecord = userData[0];
    const user_id = userRecord.id;

    let notesid = req.query.id;
    const [restorenote] = await db.execute(
      `UPDATE notes SET isDeleted=0 WHERE userId =? AND id=?`,
      [user_id, notesid]
    );
    res.status(200).json({ message: "Note restore from bin..." });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    let userId;
    const token = req.cookies.userJWT;
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      userId = decoded.userId;
    }

    const [userData]: any = await db.execute(
      `SELECT id FROM userDetails WHERE email = ?`,
      [userId]
    );
    const userRecord = userData[0];
    const user_id = userRecord.id;

    const id = req.query.id;
    const [result] = await db.execute("DELETE FROM notes WHERE id = ?", [id]);
    res.status(200).json({ message: "Note deleted" });
  } catch (error) {
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("userJWT", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
