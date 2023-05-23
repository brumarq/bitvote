/*
 * Representation of an Egg Box Asset
 * Author: MFK
 */

'use strict';

const boxStatus = {
    PACKED: 'PACKED',
    READY_FOR_SHIPMENT: 'READY',
    IN_TRANSIT: 'TRANSIT',
    IN_DISTRIBUTION_CENTRE: 'IN_DIST_CENTRE',
    DAMAGED: 'DAMAGED'
}

const State = require('./state.js');

class EggBox extends State {

    constructor(originId, packingTimestamp, quantity) {
        super('EggBox');
        this.setOriginId(originId);
        this.setPackingTimestamp(packingTimestamp);
        this.setQuantity(quantity);
        this.setHolderId(originId);
        this.setPacked();
    }

    /* Basic Getters */

    getOriginId() {
        return this.originId;
    }

    getPackingTimestamp() {
        return this.packingTimestamp;
    }

    getQuantity() {
        return this.quantity;
    }

    getHolderId() {
        return this.holderId;
    }

    /** basic setters */
    
    setOriginId(originId) {
        this.originId = originId;
    }

    setPackingTimestamp(packingTimestamp) {
        this.packingTimestamp = packingTimestamp;
    }

    setHolderId(holderId) {
        this.holderId = holderId;
    }

    setQuantity(quantity) {
        this.quantity = quantity;
    }

    /** Basic methods to encapsulate box status */

    setPacked() {
        this.currentState = boxStatus.PACKED;
    }

    setReadyForShipment() {
        this.currentState = boxStatus.READY_FOR_SHIPMENT;
    }

    setInTransit() {
        this.currentState = boxStatus.IN_TRANSIT;
    }

    setInDistributionCentre() {
        this.currentState = boxStatus.IN_DISTRIBUTION_CENTRE;
    }

    setDamaged() {
        this.currentState = boxStatus.DAMAGED;
    }

    isPacked() {
        return this.currentState === boxStatus.PACKED;
    }

    isReadyForShipment() {
        return this.currentState === boxStatus.READY_FOR_SHIPMENT;
    }

    isInTransit() {
        return this.currentState === boxStatus.IN_TRANSIT;
    }

    isInDistributionCentre() {
        return this.currentState === boxStatus.IN_DISTRIBUTION_CENTRE;
    }

    isDamaged() {
        return this.currentState === boxStatus.DAMAGED;
    }
    
    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const eggBox = new EggBox();
        Object.assign(eggBox,values);  
        return eggBox;
    }
}

module.exports = EggBox;