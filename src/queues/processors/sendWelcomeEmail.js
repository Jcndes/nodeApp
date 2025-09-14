const nodemailer = require('nodemailer');

module.exports = async function (job) {
  const { userId, name, email } = job.data;

  console.log(`📧 Enviando email de boas-vindas para ${email} (userId: ${userId})`);

  try {
    // Transporter (usando SMTP, pode ser Gmail, Mailtrap etc.)
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Conteúdo do e-mail
    await transporter.sendMail({
      from: `"Equipe Suporte" <${process.env.MAIL_FROM}>`,
      to: email,
      subject: "Bem-vindo ao sistema 🚀",
      text: `Olá ${name}, bem-vindo(a) ao nosso sistema!`,
      html: `<p>Olá <b>${name}</b>, seja muito bem-vindo(a) ao nosso sistema! 🎉</p>`,
    });

    console.log(`✅ E-mail enviado com sucesso para ${email}`);
    return { status: 'ok' };
  } catch (err) {
    console.error(`❌ Falha ao enviar e-mail: ${err.message}`);
    throw err;
  }
};
