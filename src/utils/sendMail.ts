import nodemailer from 'nodemailer';


function sendMail( firstName: string, email: string, verif_code: string): void {


    const transporter: nodemailer.Transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:'aparnapie.2547@gmail.com',
            pass: process.env.EMAIL_PASS,
        },
 });  


    const mailOptions: nodemailer.SendMailOptions = {
        from: 'aparnapie.2547@gmail.com',
        to: email,
        subject: 'Email verification',
        text: `${email}, your verification code is: ${verif_code}`
    };
    transporter.sendMail(mailOptions, (err: Error | null) => {
        if (err) {
            
            console.error(err);
        } else {
            console.log('Verification code sent successfully');
        }
    });
}


export default sendMail