/*
 * Representation of a participant
 * Author: Bruno Coimbra Marques
 */

'use strict';

const State = require('./state.js');

class Participant extends State {

    constructor(id, name, role) {
        super('Participant');
        this.setId(id);
        this.setName(name);
        this.setRole(role);
    }

    /* Basic Getters */

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getRole() {
        return this.role;
    }

    /** basic setters */
    
    setId(id) {
        this.id = id;
    }

    setName(name) {
        this.name = name;
    }

    setRole(role) {
        this.role = role;
    }

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const participant = new Participant();
        Object.assign(participant,values);  
        return participant;
    }
}

module.exports = Participant;