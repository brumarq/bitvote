/*
 * Representation of an Vote Asset
 * Author: BCM
 */

'use strict';

const State = require('./state.js');

class Vote extends State {

    constructor(id, voter_ID, poll_ID, voteTimestamp, selection) {
        super('Vote');
        this.setId(id);
        this.setVoter_ID(voter_ID);
        this.setPoll_ID(poll_ID);
        this.setVoteTimestamp(voteTimestamp);
        this.setSelection(selection);
    }

    /* Basic Getters */

    getId() {
        return this.id;
    }

    getVoter_ID() {
        return this.voter_ID;
    }

    getVoteTimestamp() {
        return this.voteTimestamp;
    }

    getSelection() {
        return this.selection;
    }

    getPoll_ID() {
        return this.poll_ID;
    }

    /** basic setters */
    
    setId(id) {
        this.id = id;
    }

    setVoter_ID(voter_ID) {
        this.voter_ID = voter_ID;
    }

    setVoteTimestamp(voteTimestamp) {
        this.voteTimestamp = voteTimestamp;
    }

    setSelection(selection) {
        this.selection = selection;
    }

    setPoll_ID(poll_ID) {
        this.poll_ID = poll_ID;
    }

    /**
     * Returns an object from a buffer. Normally called after a getState
     * @param {*} buffer
     */
    static deserialise(buffer) {
        const values = JSON.parse(buffer.toString());
        const vote = new Vote();
        Object.assign(vote,values);  
        return vote;
    }
}

module.exports = Vote;