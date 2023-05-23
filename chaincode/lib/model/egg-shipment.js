/*
 * Representation of an Egg Shipment Asset
 * Author: MFK
 */

'use strict'

const shipmentStatus = {
    READY: 'READY',
    LOADED: 'LOADED',
    DELIVERED: 'DELIVERED'
};

const State = require('./state.js');

class EggShipment extends State {

    constructor(farmerId, shipperId, distributorId, shipmentCreation) {
        super('EggShipment');
        this.setFarmerId(farmerId);
        this.setShipperId(shipperId);
        this.setDistributorId(distributorId);
        this.setShipmentCreation(shipmentCreation);
        this.setReady();
        this.eggIds = [];
    }

    /* basic setters */

    setFarmerId(farmerId) {
        this.farmerId = farmerId;
    }

    setShipperId(shipperId) {
        this.shipperId = shipperId;
    }

    setDistributorId(distributorId) {
        this.distributorId = distributorId;
    }

    setShipmentCreation(shipmentCreation) {
        this.shipmentCreation = shipmentCreation;
    }

    setLoadTimestamp(loadTimestamp) {
        this.loadTimestamp = loadTimestamp;
    }

    setDeliveryDate(deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    addEggId(eggId) {
        this.eggIds.push(eggId);
    }

    /* basic getters */
    getFarmerId() {
        return this.farmerId;
    }
    
    getShipperId() {
        return this.shipperId;
    }

    getDistributorId() {
        return this.distributorId;
    }

    getShipmentCreation() {
        return this.shipmentCreation;
    }

    getLoadTimestamp() {
        return this.loadTimestamp;
    }

    getEggIds() {
        return this.eggIds;
    }

    /* Basic methods to encapsulate shipment status */

    setReady() {
        this.currentState = shipmentStatus.READY;
    }

    setLoaded() {
        this.currentState = shipmentStatus.LOADED;
    }

    setDelivered() {
        this.currentState = shipmentStatus.DELIVERED;
    }

    isReady() {
        return this.currentState === shipmentStatus.READY;
    }

    isLoaded() {
        return this.currentState === shipmentStatus.LOADED;
    }

    isDelivered() {
        return this.currentState === shipmentStatus.DELIVERED;
    }    

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const shipment = new EggShipment();
        Object.assign(shipment,values);  
        return shipment;
    }


}

module.exports = EggShipment;