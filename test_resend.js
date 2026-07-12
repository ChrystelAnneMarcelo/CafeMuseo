const { Resend } = require('resend');
const resend = new Resend('re_M15LDqgB_F73Zidpqsuwh1owvshbUwhSj');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'pleiadesfoodservice@gmail.com',
  subject: 'Test API Email',
  html: '<p>Testing</p>'
}).then(console.log).catch(console.error);
