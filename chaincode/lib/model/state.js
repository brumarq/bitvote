/*
 * Common State Class. Used as a basis for model classes
 * Author: MFK
 */

'use strict'

class State {

    constructor(type) {
        this.setType(type);
    }

    setType(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }

    serialise() {
        return Buffer.from(JSON.stringify(this));
    }    
}

module.exports = State;