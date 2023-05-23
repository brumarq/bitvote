/*
 * Egg Tracking Smart Contract
 * Author: MFK
 */

'use strict';

//import Hyperledger Fabric SDK
const { Contract } = require('fabric-contract-api');

// import EggBox resources
const EggBox = require('./model/egg-box.js');

// import EggShipment
const EggShipment = require('./model/egg-shipment.js');

// import Participant
const Participant = require('./model/participant.js');

class EggTrackingContract extends Contract {

  /**
   * Pack EggBoxes
   * 
   * This transaction is started by the farmer that collected eggs
   * and stored them in a box
   *     
   * @param farmedId - The farmer identifier
   * @param packingTimestamp - the moment where the package was assembled
   * @param quantity - the quantity of eggs in the box
   * @returns the new eggbox
   */
  async packEggs(ctx, farmerId, packingTimestamp, quantity) {

    let identity = ctx.clientIdentity;

    if (!this.isFarmer(identity) && !this.isAdmin(identity)) {
      throw new Error(`Egg boxes can only be packed by farmers or administrators`);
    }

    // Generate an eggbox representation
    let eggBox = new EggBox(farmerId, packingTimestamp, quantity);

    // generate the key for the eggbox
    let key = eggBox.getType() + ":" + eggBox.getOriginId() + ":" + eggBox.getPackingTimestamp();

    // check if the eggbox already exists
    let eggBoxExists = await this.assetExists(ctx, key);

    if (eggBoxExists) {
      throw new Error(`Egg box with key ${key} already exists`);
    }

    // add key to help users finding object
    eggBox.eggBoxId = key;

    // update state with new egg box
    await ctx.stub.putState(key, eggBox.serialise())

    // create a packedEggs event
    const event = {
      eventName: 'packedEggs',
      targetAudience: [eggBox.getOriginId()], // suggested targetAudience
      eggBoxId: eggBox.eggBoxId
    };

    await ctx.stub.setEvent(event.eventName, Buffer.from(JSON.stringify(event)));

    // Return the newly created eggbox
    return JSON.stringify(eggBox);
  }

  /**
   * createShipment
   * 
   * This transaction is started by the farmer. A number of boxes are selected
   * for shipment to the distribution centre.
   *     
   * @param farmedId - The farmer identifier
   * @param shipperId - The shipper that will transport boxes to the distribution centre
   * @param distributorId - The id of the distribution centre
   * @param shipmentCreation - the shipment request date
   * @param min - the minumum amount of boxes
   * @param max - the maximum amount of boxes
   * @returns the new shipment
   */
  async createShipment(ctx, farmerId, shipperId, distributorId, shipmentCreation, min, max) {

    let identity = ctx.clientIdentity;

    if (!this.isFarmer(identity) && !this.isAdmin(identity)) {
      throw new Error(`Shipment can only be created by farmers or administrators`);
    }

    max = parseInt(max);
    min = parseInt(min);

    // create a shipment representation
    let shipment = new EggShipment(farmerId, shipperId, distributorId, shipmentCreation);

    // generate the key for the egg shipment
    let key = shipment.getType() + ":" + shipment.getFarmerId() + ":"
      + shipment.getDistributorId() + ":" + shipment.getShipmentCreation();

    // check if the shipment already exists in the ledger
    let eggShipmentExists = await this.assetExists(ctx, key);

    if (eggShipmentExists) {
      throw new Error(`Shipment with key ${key} already exists`);
    }

    // query of boxes (limit max)
    let eggBoxes = await this.queryPackedEggs(ctx, farmerId, max);

    // minimum amount of boxes
    if (eggBoxes.length < min) {
      throw new Error(`Insufficient amount of egg boxes ${eggBoxes.length} for the shipment. Minimum amount is ${min}`);
    }

    // add eggboxes to the shipment
    eggBoxes.forEach(eggBox => {
      shipment.addEggId(eggBox.key);
    });

    // update all eggbox status (ready for shipment)
    for (let i = 0; i < eggBoxes.length; i++) {
      let eggBox = new EggBox();
      Object.assign(eggBox, eggBoxes[i].record);
      eggBox.setReadyForShipment();

      // update the world state (eggbox)
      await ctx.stub.putState(eggBoxes[i].key, eggBox.serialise())
    }

    // add key to help users finding object
    shipment.shipmentId = key;

    // update state with new shipment
    await ctx.stub.putState(key, shipment.serialise())

    // create a shipmentCreated event
    const event = {
      eventName: 'shipmentCreated',
      targetAudience: [shipment.getFarmerId(),shipment.getShipperId(), shipment.getDistributorId()], // suggested targetAudience
      shippmentId: shipment.shipmentId
    };

    await ctx.stub.setEvent(event.eventName, Buffer.from(JSON.stringify(event)));

    // Return the newly created shipment
    return JSON.stringify(shipment);

  }

  /**
   * Utility function checking if a user is an admin
   * @param {*} idString - the identity object
   */
  isAdmin(identity) {
    var match = identity.getID().match('.*CN=(.*)::');
    return match !== null && match[1] === 'admin';
  }

  /**
   * Utility function checking if a user is a farmer
   * @param {*} identity - the identity object
   */
  isFarmer(identity) {
    return identity.assertAttributeValue('role', 'Farmer');
  }

  /**
   * Utility function checking if a user is a distributor
   * @param {*} identity - the identity object
   */
  isDistributor(identity) {
    return identity.assertAttributeValue('role', 'Distributor');
  }

  /**
   * Utility function checking if a user is a shipper
   * @param {*} identity - the identity object
   */
  isShipper(identity) {
    return identity.assertAttributeValue('role', 'Shipper');
  }

  /**
   * Utility function to get the id of the participant
   * @param {*} id - the id of the participant
   */
  getParticipantId(identity) {
    return identity.getAttributeValue('id');
  }

  /**
   * Query available eggs for shipment
   * 
   * This transaction is executed by the farmer or the pack eggs transaction. 
   * It should return a list of available eggboxes limited to max
   *     
   * @param farmedId - The farmer identifier
   * @param max - the maximum amount of boxes to return
   * @returns a list of key-value pairs (id and eggbox object)
   */
  async queryPackedEggs(ctx, farmerId, max) {

    // filtering only packed eggboxes, limited to max
    let queryString = {
      selector: {
        type: 'EggBox',
        holderId: farmerId,
        currentState: 'PACKED' 
      }
    };

    let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

    let allResults = [], count = 0;

    while (true) {
      let res = await resultsIterator.next();
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        jsonRes.key = res.value.key;
        jsonRes.record = JSON.parse(res.value.value.toString('utf8'));
        allResults.push(jsonRes);
      }

      if (res.done || ++count === max) {
        await resultsIterator.close();
        break;
      }
    }
    return allResults;
  }

  /**
   * loadBoxes
   * 
   * This transaction is executed by the shipper as soon as the truck is loaded with boxes
   *     
   * @param shipmentId - The unique identifier of the shipment
   * @param loadTimestamp - the timestamp of the event
   * @returns none
   */
  async loadBoxes(ctx, shipmentId, loadTimestamp) {

    let identity = ctx.clientIdentity;

    if (!this.isShipper(identity) && !this.isAdmin(identity)) {
      throw new Error(`Shipment can only be loaded by shippers or administrators`);
    }

    // Get shipment from the keystore
    const buffer = await ctx.stub.getState(shipmentId);

    // if shipment was not found
    if (!buffer || buffer.length == 0) {
      throw new Error(`Shipment ID ${shipmentId} not found`);
    }

    // get object from buffer
    const eggShipment = EggShipment.deserialise(buffer);

    // shipment must be in ready state to be loaded
    if (!eggShipment.isReady()) {
      throw new Error(`Shipment ID ${shipmentId} is not ready`);
    }

    // update all eggbox status (in-transit)
    for (let i = 0; i < eggShipment.getEggIds().length; i++) {

      const key = eggShipment.getEggIds()[i];

      // retrieve eggbox from the key-pair
      const bufferEggBox = await ctx.stub.getState(key);
      const eggBox = EggBox.deserialise(bufferEggBox);

      // Only change the status of ready boxes
      if (eggBox.isReadyForShipment()) {
        // update eggbox status
        eggBox.setInTransit();

        // change holder
        eggBox.setHolderId(eggShipment.getShipperId());

        // update world state
        await ctx.stub.putState(key, eggBox.serialise());
      }
    }

    // Change shipment status to in transit with load timestamp
    eggShipment.setLoaded();
    eggShipment.setLoadTimestamp(loadTimestamp);

    // add key to help users finding object
    eggShipment.shipmentId = shipmentId;


    // update world state
    await ctx.stub.putState(shipmentId, eggShipment.serialise());

    // create a packedEggs event
    const event = {
      eventName: 'boxesLoaded',
      targetAudience: [eggShipment.getFarmerId(),eggShipment.getShipperId(),eggShipment.getDistributorId()], // suggested targetAudience
      shippmentId: shipmentId
    };

    await ctx.stub.setEvent(event.eventName, Buffer.from(JSON.stringify(event)));    

    return "ok";
  }

  /**
   * Deliver Boxes
   * 
   * This transaction is executed by the shipper as soon as the boxes
   * are delivered to the distribution centre. 
   *     
   * @param shipmentId - The unique identifier of the shipment
   * @param deliveryDate - the timestamp of the event
   * @returns none
   */
  async deliverBoxes(ctx, shipmentId, deliveryDate) {

    let identity = ctx.clientIdentity;

    if (!this.isShipper(identity) && !this.isAdmin(identity)) {
      throw new Error(`Shipment can only be delivered by shippers or administrators`);
    }

    // Get shipment from the keystore
    const buffer = await ctx.stub.getState(shipmentId);

    // if shipment was not found
    if (!buffer || buffer.length == 0) {
      throw new Error(`Shipment ID ${shipmentId} not found`);
    }

    // get object from key-pair
    const eggShipment = EggShipment.deserialise(buffer);

    // shipment must be in ready state to be loaded
    if (!eggShipment.isLoaded()) {
      throw new Error(`Shipment ID ${shipmentId} is not loaded`);
    }

    // update all eggbox status (in-transit)
    for (let i = 0; i < eggShipment.getEggIds().length; i++) {

      const key = eggShipment.getEggIds()[i];

      // retrieve eggbox from the key-pair        
      const bufferEggBox = await ctx.stub.getState(key);
      const eggBox = EggBox.deserialise(bufferEggBox);

      // update eggbox status (only in transit)
      if (eggBox.isInTransit()) {
        eggBox.setInDistributionCentre();

        // change holder
        eggBox.setHolderId(eggShipment.getDistributorId());

        // update world state
        await ctx.stub.putState(key, eggBox.serialise());
      }
    }

    // Change shipment status to in transit with load timestamp
    eggShipment.setDelivered();
    eggShipment.setDeliveryDate(deliveryDate);

    // add key to help users finding object
    eggShipment.shipmentId = shipmentId;


    // update world state
    await ctx.stub.putState(shipmentId, eggShipment.serialise());

    // create a boxesDelivered event
    const event = {
      eventName: 'boxesDelivered',
      targetAudience: [eggShipment.getFarmerId(),eggShipment.getShipperId(),eggShipment.getDistributorId()], // suggested targetAudience
      shippmentId: shipmentId
    };

    await ctx.stub.setEvent(event.eventName, Buffer.from(JSON.stringify(event)));    

    return "ok";
  }

  /**
   * Report damage
   * 
   * This transaction is executed by the participant in possession of the box
   * when a package is damaged
   *     
   * @param eggBoxId - The unique identifier of the egg box
   * @returns none
   */

  async reportDamage(ctx, eggBoxId) {

    // Get eggbox from the keystore
    const buffer = await ctx.stub.getState(eggBoxId);

    // if eggbox was not found
    if (!buffer || buffer.length == 0) {
      throw new Error(`EggBox with ID ${eggBoxId} not found`);
    }

    // get object from key-pair
    const eggBox = EggBox.deserialise(buffer);

    // should not be already damaged
    if (eggBox.isDamaged()) {
      throw new Error(`EggBox with ID ${eggBoxId} is already damaged`);
    }

    eggBox.setDamaged();

    // update world state
    await ctx.stub.putState(eggBoxId, eggBox.serialise());

    return "ok";

  }

  /**
   *
   * assetExists
   *
   * Checks to see if a key exists in the world state. 
   * @param assetId - the key of the asset to read
   * @returns boolean indicating if the asset exists or not. 
   */
  async assetExists(ctx, assetId) {

    const buffer = await ctx.stub.getState(assetId);
    return (!!buffer && buffer.length > 0);
  }

  /**
   * Create Participant
   * 
   * This transaction is started by the participant during sign-up
   *     
   * @param id - The participant identifier
   * @param name - The participant name
   * @param role - Farmer, Shipper, or Distributor
   * @returns the newly created participant
   */
  async createParticipant(ctx, id, name, role) {

    let identity = ctx.clientIdentity;

    if (!this.isAdmin(identity)) {
      throw new Error(`Only administrators can create participants`);
    }

    // Generate a participant representation
    let participant = new Participant(id, name, role);

    // generate the key for the participant
    let key = participant.getType() + ":" + participant.getId();

    // check if the participant already exists
    let exists = await this.assetExists(ctx, key);

    if (exists) {
      throw new Error(`Participant with id ${key} already exists`);
    }

    // update state with new participant
    await ctx.stub.putState(key, participant.serialise())

    // Return the newly created shipment
    return JSON.stringify(participant);
  }

  /**
   * Query Eggs
   * 
   * Used to get a list of egg packages
   *     
   * @param id - The participant identifier
   * @returns a list of egg packages
   */
  async queryEggs(ctx, id) {

    // filtering only eggboxes that are in possession or are originated from id
    let queryString = {
      selector: {
        type: 'EggBox',
        $or: [{ originId: id }, { holderId: id }]
      }
    };

    let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

    let allResults = [], count = 0;

    while (true) {
      let res = await resultsIterator.next();
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        jsonRes.key = res.value.key;
        jsonRes.record = JSON.parse(res.value.value.toString('utf8'));
        allResults.push(jsonRes);
      }

      if (res.done) {
        await resultsIterator.close();
        break;
      }
    }
    return JSON.stringify(allResults);
  }

  /**
   * Query Shipment
   * 
   * Used to get a list of egg shipments
   *     
   * @param id - The participant identifier
   * @returns a list of egg shipments
   */
  async queryShipments(ctx, id) {

    // filtering only shipments that are related to the id
    let queryString = {
      selector: {
        type: 'EggShipment',
        $or: [{ farmerId: id }, { shipperId: id }, { distributorId: id }]
      }
    };

    let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

    let allResults = [], count = 0;

    while (true) {
      let res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        jsonRes.key = res.value.key;
        jsonRes.record = JSON.parse(res.value.value.toString('utf8'));
        allResults.push(jsonRes);
      }

      if (res.done) {
        await resultsIterator.close();
        break;
      }
    }
    return JSON.stringify(allResults);
  }

  /**
   * Get participant
   * 
   * This transaction is started by the farmer that collected eggs
   * and stored them in a box
   *     
   * @param id - The participant identifier
   * @returns the participant
   */
  async getParticipant(ctx, id) {

    let identity = ctx.clientIdentity;

    if (!id === this.getParticipantId(identity) && !this.isAdmin(identity)) {
      throw new Error(`Only administrators can query other participants. Regular participants can get information of their own account`);
    }

    // get participant
    const buffer = await ctx.stub.getState('Participant:'+id);

    // if participant was not found
    if (!buffer || buffer.length == 0) {
      throw new Error(`Participant with id ${id} was not found`);
    }

    // get object from buffer
    const participant = Participant.deserialise(buffer);

    // Return the newly created eggbox
    return JSON.stringify(participant);
  }


}

module.exports = EggTrackingContract;