import nodemailer from 'nodemailer';


const sendEmail = async (receiver, subject, html) => {

  let transporter = nodemailer.createTransport({
    host: process.env.HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
    
  });

  try {
    await transporter.sendMail({
      from: `"MadeCodeRD" ${process.env.USER}`,
      to: receiver,
      subject,
      text: "Thank you for joining, let's build an amazing community", // plain text body
      html,
    });
  } catch (error) {
    console.log('Something went wrong!', error);
  }
};

export { sendEmail };
