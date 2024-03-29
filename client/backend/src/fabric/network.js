"use strict";

const { Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const { Gateway, X509WalletMixin } = require("fabric-network");
const path = require("path");
const fs = require("fs");

// get the configuration
const configPath = path.join(process.cwd(), "./config.json");
const configJSON = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(configJSON);

// let userName = config.userName;
let gatewayDiscovery = config.gatewayDiscovery;
let appAdmin = config.appAdmin;

// connect to the connection file
const ccpPath = path.resolve(process.env.FABRIC_PATH, config.connectionProfile);
const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

exports.getAdminUser = async function () {
	return appAdmin;
};

exports.createPoll = async function (networkObj, options, open, closed) {
	try {
		console.log(options);
		let response = await networkObj.contract.submitTransaction(
			"createPoll",
			options,
			open,
			closed
		);

		await networkObj.gateway.disconnect();
		return response;
	} catch (error) {
		let response = {
			error: "the following errors ocurred: " + error.message ? error.message : error,
		};
		return response;
	}
};

exports.createVote = async function (networkObj, poll_ID, timestamp, selection) {
	try {
		let response = await networkObj.contract.submitTransaction(
			"createVote",
			poll_ID,
			timestamp,
			selection
		);

		await networkObj.gateway.disconnect();
		return response.toString();
	} catch (error) {
		let response = {
			error: "the following errors ocurred: " + error.message ? error.message : error,
		};
		return response;
	}
};

exports.registerUser = async function (userId, name, role) {
	if (!userId || !name || !role) {
		let response = {};
		response.error = "all fields are mandatory";
		return response;
	}

	try {
		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(process.cwd(), "wallet");
		const wallet = await Wallets.newFileSystemWallet(walletPath);

		// Check to see if we've already enrolled the user.
		const userCheck = await wallet.get(userId);
		if (userCheck) {
			let response = {
				error: `Error! An identity for the user ${userId} already exists in the wallet. Please enter a different id`,
			};
			return response;
		}

		// Check to see if we've already enrolled the admin user.
		const adminIdentity = await wallet.get(appAdmin);
		if (!adminIdentity) {
			let response = {
				error: `An identity for the admin user ${appAdmin} does not exist in the wallet`,
			};
			return response;
		}

		// Create a new gateway for connecting to our peer node.
		// const gateway = new Gateway();
		// await gateway.connect(ccp, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

		// Create a new CA client for interacting with the CA.
		const caURL = ccp.certificateAuthorities["ca.org1.example.com"].url;
		const ca = new FabricCAServices(caURL);

		// build a user object for authenticating with the CA
		const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
		const adminUser = await provider.getUserContext(adminIdentity, "admin");

		// const adminIdentity = gateway.getCurrentIdentity();

		const user = {
			affiliation: "org1",
			enrollmentID: userId,
			role: "client",
			attrs: [
				{ name: "id", value: userId, ecert: true },
				{ name: "name", value: name, ecert: true },
				{ name: "role", value: role, ecert: true },
			],
		};

		// Register the user, enroll the user, and import the new identity into the wallet.
		const secret = await ca.register(user, adminUser);

		const enrollmentData = {
			enrollmentID: userId,
			enrollmentSecret: secret,
			attr_reqs: [
				{ name: "id", optional: false },
				{ name: "name", optional: false },
				{ name: "role", optional: false },
			],
		};

		const enrollment = await ca.enroll(enrollmentData);

		const x509Identity = {
			credentials: {
				certificate: enrollment.certificate,
				privateKey: enrollment.key.toBytes(),
			},
			mspId: "Org1MSP",
			type: "X.509",
		};
		await wallet.put(userId, x509Identity);

		let response = `Successfully registered user ${name}. Use userId ${userId} to login above.`;
		return response;
	} catch (error) {
		let response = {
			error: "the following errors ocurred: " + error.message ? error.message : error,
		};
		return response;
	}
};

exports.connectToNetwork = async function (userName) {
	const gateway = new Gateway();

	try {
		const walletPath = path.join(process.cwd(), "wallet");
		const wallet = await Wallets.newFileSystemWallet(walletPath);

		const userCheck = await wallet.get(userName);
		if (!userCheck) {
			console.log(
				"An identity for the user " + userName + " does not exist in the wallet"
			);
			let response = {
				error:
					"An identity for the user " +
					userName +
					" does not exist in the wallet. Register " +
					userName +
					" first",
			};
			return response;
		}

		await gateway.connect(ccp, {
			wallet,
			identity: userName,
			discovery: gatewayDiscovery,
		});

		// Connect to our local fabric
		const network = await gateway.getNetwork("mychannel");

		// Get the contract we have installed on the peer
		const contract = await network.getContract("voting-contract");

		let networkObj = {
			contract: contract,
			network: network,
			gateway: gateway,
		};

		return networkObj;
	} catch (error) {
		let response = {
			error: "the following errors ocurred: " + error.message ? error.message : error,
		};
		return response;
	} finally {
		console.log("Done connecting to network.");
	}
};

exports.createParticipant = async function (networkObj, id, name, role) {
	try {
		let response = await networkObj.contract.submitTransaction(
			"createParticipant",
			id,
			name,
			role
		);
		await networkObj.gateway.disconnect();
		return response.toString();
	} catch (error) {
		console.log("error", error);
		let response = { error: "the following errors ocurred: " };
		for (var key in error) {
			response.error += key + " - " + error[key];
		}
		return response;
	}
};

exports.query = async function (networkObj, id, query) {
	try {
		let response = await networkObj.contract.submitTransaction(query, id);
		await networkObj.gateway.disconnect();
		return response.toString();
	} catch (error) {
		let response = { error: "the following errors ocurred: " };
		for (var key in error) {
			response.error += key + " - " + error[key];
		}
		return response;
	}
};

exports.getParticipant = async function (networkObj, participantId) {
	try {
		let response = await networkObj.contract.evaluateTransaction(
			"getParticipant",
			participantId
		);
		await networkObj.gateway.disconnect();
		return response.toString();
	} catch (error) {
		console.log(error);
		let response = { error: "the following errors ocurred: " };
		for (var key in error) {
			response.error += key + " - " + error[key];
		}
		return response;
	}
};

exports.validateToken = async function (req, oAuth2Client, OAuth2Data) {
	var token = req.headers["authorization"];

	if (!token) {
		return false;
	}

	token = token.replace("Bearer ", "");

	try {
		let ticket = await oAuth2Client.verifyIdToken({
			idToken: token,
			audience: OAuth2Data.web.client_id,
		});

		return ticket.payload.email;
	} catch (error) {
		console.error("error", error);
		return false;
	}
};
