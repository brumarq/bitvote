const { google } = require('googleapis');
const express = require('express');
const OAuth2Data = require('./oauth2.keys.json');

const app = express();

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

app.get('/auth',(req, res) => {

    const url = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/userinfo.email'
    });

    console.log(url);

    const result = {
        url: url
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(result));

});

app.get('/auth/google/callback', function (req, res) {
    try {
        const code = req.query.code
        if (code) {
            // Get an access token based on our OAuth code
            oAuth2Client.getToken(code, function (err, tokens) {
                if (err) {
                    console.log('Error authenticating')
                    console.log(err);
                } else {
                    console.log('Successfully authenticated',tokens);

                    const tokenInfo = oAuth2Client.getTokenInfo(tokens.access_token).then(
                        (value) => {
                            console.log(value);
                        }
                    ).catch((error) => {
                        console.error(error);
                    })
                    //oAuth2Client.setCredentials(tokens);
                    //authed = true;
                    res.redirect('/')
                }
            });
        }
    } catch(error) {
        console.log(error);
    }
});

const port = process.env.port || 4200
app.listen(port, () => console.log(`Server running at ${port}`));