'use strict';

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let eventHandler = require('./event-handler.js');
let network = require('./fabric/network.js');

/**
 * Register a participant
 * 
 * 
 * {"id":"F1","name":"Farmer 1","role":"Farmer"}
 */
app.post('/rest/participants', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);

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

        let invokeResponse = await network.createParticipant(networkObj, req.body.id, req.body.name, req.body.role);

        if (invokeResponse.error) {
            res.status(400).json({ message: invokeResponse.error });
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.status(201).send(invokeResponse);
        }
    }
});

/**
 * Pack eggs
 * 
 * {"farmerId":"F1","packingTimestamp":"20191124141755","quantity":"30"}
 */
app.post('/rest/participants/auth', async (req, res) => {
    let networkObj = await network.connectToNetwork(req.body.id);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    let invokeResponse = await network.getParticipant(networkObj, req.body.id);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});

/**
 * queryEggs
 * 
 */
app.get('/rest/participants/:participantId/eggboxes', async (req, res) => {
    let networkObj = await network.connectToNetwork(req.params.participantId);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    let invokeResponse = await network.query(networkObj, req.params.participantId, 'queryEggs');

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});

/**
 * queryShipments
 * 
 */
app.get('/rest/participants/:participantId/shipments', async (req, res) => {
    let networkObj = await network.connectToNetwork(req.params.participantId);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
        return;
    }

    let invokeResponse = await network.query(networkObj, req.params.participantId, 'queryShipments');

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(invokeResponse);
    }
});



/**
 * Pack eggs
 * 
 * {"farmerId":"F1","packingTimestamp":"20191124141755","quantity":"30"}
 */
app.post('/rest/eggboxes', async (req, res) => {
    let networkObj = await network.connectToNetwork(req.body.farmerId);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
    }

    let invokeResponse = await network.packEggs(networkObj, req.body.farmerId, req.body.packingTimestamp, req.body.quantity);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send(invokeResponse);
    }
});

/**
 * Report damaged
 * 
 * {"participantId":"F1"}
 */
app.put('/rest/eggboxes/:eggBoxId/damaged', async (req, res) => {
 
    let networkObj = await network.connectToNetwork(req.body.participantId);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
    }

    let invokeResponse = await network.reportDamage(networkObj, req.params.eggBoxId);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.status(200).json({ message: invokeResponse });
    }
});

/**
 * Create Shipment
 * 
 * {"farmerId":"F1","shipperId":"S1","distributorId":"D1","shipmentCreation":"20191124143231","min":"1","max":"30"}
 */
app.post('/rest/shipments', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);

    let networkObj = await network.connectToNetwork(req.body.farmerId);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
    }

    let invokeResponse = await network.createShipment(networkObj, req.body.farmerId, 
                                    req.body.shipperId, req.body.distributorId,
                                    req.body.shipmentCreation,req.body.min, req.body.max);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(201).send(invokeResponse);
    }
});

/**
 * Load Boxes
 * 
 * {"shipperId":"S1","loadTimestamp":"20191125081223"}
 */
app.post('/rest/shipments/:shipmentId/load', async (req, res) => {

    let networkObj = await network.connectToNetwork(req.body.shipperId);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
    }

    let invokeResponse = await network.loadBoxes(networkObj, req.params.shipmentId, 
                                    req.body.loadTimestamp);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.status(200).json({ message: invokeResponse });
    }
});

/**
 * Deliver Boxes
 * 
 * {"shipperId":"S1","deliveryDate":"20191125092447"}
 */
app.post('/rest/shipments/:shipmentId/delivery', async (req, res) => {

    let networkObj = await network.connectToNetwork(req.body.shipperId);

    if (networkObj.error) {
        res.status(400).json({ message: networkObj.error });
    }

    let invokeResponse = await network.deliverBoxes(networkObj, req.params.shipmentId, 
                                    req.body.deliveryDate);

    if (invokeResponse.error) {
        res.status(400).json({ message: invokeResponse.error });
    } else {
        res.status(200).json({ message: invokeResponse });
    }
});

const port = process.env.PORT || 8080; 
app.listen(port);

console.log(`listening on port ${port}`);

eventHandler.createWebSocketServer();
eventHandler.registerListener(network);
