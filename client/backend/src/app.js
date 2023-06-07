"use strict";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const OAuth2Data = require("./auth/oauth2.keys.json");

const app = express();
app.use(bodyParser.json());
app.use(cors());

let eventHandler = require("./event-handler.js");
let network = require("./fabric/network.js");

const oAuth2Client = new google.auth.OAuth2(
	OAuth2Data.web.client_id,
	OAuth2Data.web.client_secret,
	OAuth2Data.web.redirect_uris[0]
);

// Creating an Google OAuth2 client object

/**
 * Register a participant
 * An authentication token is mandatory
 *
 * {"id":"F1","name":"Farmer 1","role":"Farmer"}
 */
app.post("/rest/participants", async (req, res) => {
	const validToken = await network.validateToken(req, oAuth2Client, OAuth2Data);

	if (!validToken) {
		res.status(401).json({ message: "invalid token" });
		return;
	}

	// creating the identity for the user and add it to the wallet
	let response = await network.registerUser(req.body.id, req.body.name, req.body.role);

	if (response.error) {
		res.status(400).json({ message: response.error });
	} else {
		let adminUser = await network.getAdminUser();

		let networkObj = await network.connectToNetwork(adminUser);

		if (networkObj.error) {
			res.status(400).json({ message: networkObj.error });
		}

		let invokeResponse = await network.createParticipant(
			networkObj,
			req.body.id,
			req.body.name,
			req.body.role
		);

		if (invokeResponse.error) {
			res.status(400).json({ message: invokeResponse.error });
		} else {
			res.setHeader("Content-Type", "application/json");
			res.status(201).send(invokeResponse);
		}
	}
});

/**
 * Create Poll
 *
 * {"organizerId": "bruno.coimbra55@gmail.com","options":"['option1', 'option2']","open":"10-12-1999","closed":"12-12-2100"}
 */
app.post("/rest/poll", async (req, res) => {
	const userEmail = await network.validateToken(req, oAuth2Client, OAuth2Data);

	if (!userEmail) {
		res.status(401).json({ message: "invalid token" });
		return;
	}

	let networkObj = await network.connectToNetwork(userEmail);

	if (networkObj.error) {
		res.status(400).json({ message: networkObj.error });
	}

	let invokeResponse = await network.createPoll(
		networkObj,
		req.body.options,
		req.body.open,
		req.body.closed
	);

	if (invokeResponse.error) {
		const errorMessageRegex = /message=([^,]+)/g;
		const errorMessages = invokeResponse.error.match(errorMessageRegex).map(match => match.replace('message=', ''));

		res.status(400).json({ message: errorMessages[1] });
	} else {
		res.setHeader("Content-Type", "application/json");
		res.status(201).send(invokeResponse);
	}
});

/**
 * Create Vote
 *
 * {"voterId":"brunocm@pm.me","poll_ID":"poll:2","voteTimestamp":"10-12-2023","selection":"0"}
 */
app.post("/rest/vote", async (req, res) => {
	const userEmail = await network.validateToken(req, oAuth2Client, OAuth2Data);

	if (!userEmail) {
		res.status(401).json({ message: "invalid token" });
		return;
	}

	let networkObj = await network.connectToNetwork(userEmail);

	if (networkObj.error) {
		res.status(400).json({ message: networkObj.error });
	}

	let invokeResponse = await network.createVote(
		networkObj,
		req.body.poll_ID,
		new Date().getTime(),
		req.body.selection
	);

	if (invokeResponse.error) {
		res.status(400).json({ message: invokeResponse.error });
	} else {
		res.setHeader("Content-Type", "application/json");
		res.status(201).send(invokeResponse);
	}
});

/**
 * Get Poll Results
 */
app.get("/rest/results", async (req, res) => {
	const userEmail = await network.validateToken(req, oAuth2Client, OAuth2Data);

	if (!userEmail) {
		res.status(401).json({ message: "invalid token" });
		return;
	}

	let networkObj = await network.connectToNetwork(userEmail);

	if (networkObj.error) {
		res.status(400).json({ message: networkObj.error });
		return;
	}

	let invokeResponse = await network.query(networkObj, req.body.poll_ID, "reportResults");
	
	if (invokeResponse.error) {
		res.status(400).json({ message: invokeResponse.error });
	} else {
		res.setHeader("Content-Type", "application/json");
		res.status(200).send(invokeResponse);
	}
});

/**
 * Pack eggs
 * An authentication token is mandatory
 *
 * {"farmerId":"F1","packingTimestamp":"20191124141755","quantity":"30"}
 */
app.post("/rest/participants/auth", async (req, res) => {
	const validToken = await network.validateToken(req, oAuth2Client, OAuth2Data);

	if (!validToken) {
		res.status(401).json({ message: "invalid token" });
		return;
	}

	let networkObj = await network.connectToNetwork(req.body.id);

	if (networkObj.error) {
		res.status(400).json({ message: networkObj.error });
		return;
	}

	let invokeResponse = await network.getParticipant(networkObj, req.body.id);

	if (invokeResponse.error) {
		res.status(400).json({ message: invokeResponse.error });
	} else {
		res.setHeader("Content-Type", "application/json");
		res.status(200).send(invokeResponse);
	}
});

app.get("/rest/issuer/auth-url", async (req, res) => {
	const url = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: "https://www.googleapis.com/auth/userinfo.email",
	});

	const result = {
		url: url,
	};

	res.setHeader("Content-Type", "application/json");
	res.status(200).send(JSON.stringify(result));
});

app.post("/rest/issuer/validate-code", async (req, res) => {
	oAuth2Client.getToken(req.body.code, function (err, tokens) {
		if (err) {
			res.setHeader("Content-Type", "application/json");
			res.status(400).send({ error: "invalid token - " + err });
		} else {
			const tokenInfo = oAuth2Client.getTokenInfo(tokens.access_token).then((value) => {
				res.setHeader("Content-Type", "application/json");
				res.status(200).send({ email: value.email, "id-token": tokens.id_token });
			});
		}
	});
});

const port = process.env.PORT || 8080;
app.listen(port);

console.log(`listening on port ${port}`);

eventHandler.createWebSocketServer();
eventHandler.registerListener(network);
