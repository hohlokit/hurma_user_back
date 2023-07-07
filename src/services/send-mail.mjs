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
    const transporter = nodemailer.createTransport({
      service: 'GMail',
      // host: 'smtp.gmail.com',
      // port: 465,
      // secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

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

    const recipients = to.join(', ')

    const result = await transporter.sendMail({
      from: process.env.EMAIL,
      to: recipients,
      subject,
      template: templateId,
      context: templateProps,
      attachments,
    })

    return result
  } catch (error) {
    console.log(error)
    return null
  }
}
