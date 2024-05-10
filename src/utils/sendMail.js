"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendMail(firstName, email, verif_code) {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: 'aparnapie.2547@gmail.com',
            pass: process.env.EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: 'aparnapie.2547@gmail.com',
        to: email,
        subject: 'Email verification',
        text: `${email}, your verification code is: ${verif_code}`
    };
    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error(err);
        }
        else {
            console.log('Verification code sent successfully');
        }
    });
}
exports.default = sendMail;
