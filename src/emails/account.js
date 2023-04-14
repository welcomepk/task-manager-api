const sgMail = require('@sendgrid/mail')

const api_key = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(api_key)

// sgMail
//     .send(msg)
//     .then(() => {
//         console.log('Email sent')
//     })
//     .catch((error) => {
//         console.error(error)
//     })



function sendWelcomeEmail(email, name) {
    const msg = {
        to: email, // Change to your recipient
        from: 'kamblepramod806@gmail.com', // Change to your verified sender
        subject: 'Thank for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
        // html: '<strong>and easy to do anywhere, even with Node.js 😄 </strong>',
    }
    sgMail.send(msg)
}

function sendCancellationEmail(email, name) {
    const msg = {
        to: email, // Change to your recipient
        from: 'kamblepramod806@gmail.com', // Change to your verified sender
        subject: 'Sorry to see you go!',
        text: `Goodbye, ${name}. I hope to see you back sometime soon.`,
        // html: '<strong>and easy to do anywhere, even with Node.js 😄 </strong>',
    }
    sgMail.send(msg)
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}