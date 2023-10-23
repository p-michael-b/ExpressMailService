// Load environment variables from a .env file
require('dotenv').config();

// Import the Express.js framework
const express = require('express');

// Import morgan middleware for request logging (for debugging and monitoring)
const morgan = require('morgan');

// Import cors middleware for enabling Cross-Origin Resource Sharing
const cors = require('cors');

// Import helmet middleware for enhancing security by setting various HTTP headers
const helmet = require('helmet');

// Define the port for your Express app, allowing it to be set through an environment variable
const PORT = process.env.SERVER_PORT || 5002;

// Creating an Express application instance.
const app = express();

// Creating an HTTP server instance to serve our Express app.
const server = require('http').Server(app);

// Importing the SendGrid library for sending email notifications.
const sendgrid = require('@sendgrid/mail');


// Importing the JSON Web Token (JWT) library for authentication and authorization.
const jwt = require('jsonwebtoken');

//Importing the environment variables and making sure they are all available
const requiredEnvVars = ['SENDGRID_API_KEY', 'JWT_SECRET', 'SENDER', 'SERVER_PORT'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

// Parsing incoming JSON data in requests using Express middleware.
app.use(express.json());

// Configuring Cross-Origin Resource Sharing (CORS) middleware with credentials and origin options.
// credentials flag allows the client to send the session info in the header
// origin flag allows the server to reflect (enable) the requested origin in the CORS response
app.use(cors({credentials: true, origin: true}))

// Custom Morgan token to log the request body as a JSON string.
morgan.token('body', (req) => JSON.stringify(req.body));

// Setting up Morgan middleware to log Mail Service requests.
app.use(morgan('\n********** MAIL SERVICE REQUEST **********\n' +
    'Date       :date[iso]\n' +
    'Request    :method :url\n' +
    'Status     :status\n' +
    'Response   :response-time ms\n' +
    'Remote IP  :remote-addr\n' +
    'HTTP ver.  :http-version\n' +
    'Referrer   :referrer\n' +
    'User Agent :user-agent\n' +
    '********** END REQUEST **********\n\n'));

// Enhancing security by applying Helmet middleware for HTTP header protection.
app.use(helmet());

// Setting up SendGrid API key
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, error: 'No token sent' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET, function (error, decoded) {
            if (error) {
                return res.status(401).json({ success: false, error: 'Invalid Token' });
            } else {
                req.user = decoded;
                next();
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Error verifying token' });
    }
};

// Health Route to check if service is running
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'The Mail Service',
    });
})

// Endpoint to send email
app.post('/sendmail', verifyToken, async (req, res) => {
    try {
        const {mailRecipient, mailSubject, mailText} = req.body;
        const msg = {
            to: mailRecipient,
            from: process.env.SENDER,
            subject: mailSubject,
            text: mailText,
        };
        await sendgrid.send(msg)
        return res.status(200).json({
            success: true,
            message: 'Email sent',
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({success: false, error: 'Error sending email'});
    }
});

// Starting the server and listening on the specified port, logging the listening status.
server.listen(PORT, () => console.log(`server listening on port ${PORT}`));





