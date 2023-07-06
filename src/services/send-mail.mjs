import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'

export default async ({
  subject,
  to = [],
  attachments = [],
  templateId,
  templateProps = {},
}) => {
  try {
    console.log(1)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'login',
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    console.log(2)
    transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          layoutsDir: 'src/templates/',
          defaultLayout: false,
          partialsDir: 'src/templates/',
        },
        viewPath: 'src/templates/',
        extName: '.hbs',
      })
    )

    console.log(3)
    const recipients = to.join(', ')

    const result = transporter.sendMail({
      from: process.env.EMAIL,
      to: recipients,
      subject,
      template: templateId,
      context: templateProps,
      attachments,
    })

    console.log(4, result)
    return result
  } catch (error) {
    console.log(error)
    return null
  }
}
