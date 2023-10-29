# ExpressMailService
Minimalistic Express Mail Microservice Using Sendgrid API and JWT authentication

In order for this to work you must set up a SendGrid account and get the API key for it.
Also, you must set the environment variables in the .env file accordingly

all required to rund the mail service on PORT specified in .env is to clone the repository and run
```javascript
npm install
```


The caller of the microservice should look something like this:
```javascript
//importing JSON Web Token library
const jwt = require('jsonwebtoken');

// Define API URL based on the environment .
const apiUrl = (process.env.NODE_ENV === 'development') ? 'http://localhost:5002/sendmail' : 'https://YOURDOMAINGOESHERE/sendmail';


const sendMail = async (mailRecipient, mailSubject, mailText) => {
    const jwtToken = jwt.sign({}, process.env.JWT_SECRET, {expiresIn: '1h'});
    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt_token}` // pass token to mail service
            },
            body: JSON.stringify({mailRecipient, mailSubject,mailText})
        })
        return response;
    } catch (error) {
        // Handle network errors or other exceptions here        
    }
}
```
and have the same JWT_SECRET implemented in the .env file.




