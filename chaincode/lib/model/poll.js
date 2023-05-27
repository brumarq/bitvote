/*
 * Representation of a Poll Asset
 * Author: BCM
 */

'use strict';

const State = require('./state.js');

class Poll extends State {

    constructor(poll_ID, options, open, closed) {
        super('Poll');
        this.setPoll_ID(poll_ID);
        this.setOptions(options);
        this.setOpen(open);
        this.setClosed(closed);
    }

    /* Basic Getters */

    getPoll_ID() {
        return this.poll_ID;
    }

    getOptions() {
        return this.options;
    }

    getOpen() {
        return this.open;
    }

    getClosed() {
        return this.closed;
    }

    /* Basic Setters */

    setPoll_ID(poll_ID) {
        this.poll_ID = poll_ID;
    }

    setOptions(options) {
        this.options = options;
    }

    setOpen(open) {
        this.open = open;
    }

    setClosed(closed) {
        this.closed = closed;
    }

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialize(buffer) {
        const values = JSON.parse(buffer.toString());
        const poll = new Poll();
        Object.assign(poll, values);
        return poll;
    }
}

module.exports = Poll;
