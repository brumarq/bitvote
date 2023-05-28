/*
 * Egg Tracking Smart Contract
 * Author: MFK
 */

'use strict';

//import Hyperledger Fabric SDK
const { Contract } = require('fabric-contract-api');
const Poll = require('./model/poll.js');
const Vote = require('./model/vote.js');

// import Participant
const Participant = require('./model/participant.js');

class EggTrackingContract extends Contract {

  counter = 0;

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
  isVoter(identity) {
    return identity.assertAttributeValue('role', 'Voter');
  }

  /**
   * Utility function checking if a user is a distributor
   * @param {*} identity - the identity object
   */
  isOrganizer(identity) {
    return identity.assertAttributeValue('role', 'Organizer');
  }

  /**
   * Utility function to get the id of the participant
   * @param {*} id - the id of the participant
   */
  getParticipantId(identity) {
    return identity.getAttributeValue('id');
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

  
  /**
   * Report Results
   *
   * This transaction is used to report the results of a poll.
   *
   * @param ctx - The transaction context object
   * @param pollID - The ID of the poll
   * @returns The results of the poll
   */
  async reportResults(ctx, pollID) {
    let identity = ctx.clientIdentity;

    // Check if the participant is an organizer
    if (!this.isOrganizer(identity)) {
      throw new Error("Only organizers can report poll results");
    }

    // Get the poll from the world state
    const pollBuffer = await ctx.stub.getState(pollID);

    if (!pollBuffer || pollBuffer.length === 0) {
      throw new Error(`Poll with ID ${pollID} does not exist`);
    }

    const poll = JSON.parse(pollBuffer.toString());

    // Prepare the query to retrieve the votes for the given poll
    let queryString = {
        selector: {
          type: 'Vote',
          Poll_ID: pollID
        }
      };

    // Execute the query to retrieve the votes for the given poll
    const resultsIterator = await ctx.stub.getQueryResult(
      JSON.stringify(queryString)
    );

    let resultSummary = {};

    // Process the votes and summarize the results
    while (true) {
      const res = await resultsIterator.next();

      if (res.value && res.value.value.toString()) {
        const vote = JSON.parse(res.value.value.toString());

        if (resultSummary[poll.options[vote.selection]]) {
          resultSummary[poll.options[vote.selection]]++;
        } else {
          resultSummary[poll.options[vote.selection]] = 1;
        }
      }

      if (res.done) {
        await resultsIterator.close();
        break;
      }
    }

    // Prepare the report object
    const report = {
      pollID,
      resultSummary,
    };

    return report;
  }

  /**
   * Create Vote
   *
   * This transaction is used to create a new vote.
   *
   * @param ctx - The transaction context object
   * @param poll_ID - The poll_ID of the vote
   * @param voteTimestamp - The timestamp of the vote
   * @param selection - The selected option
   * @returns The created vote
   */
  async createVote(ctx, poll_ID, voteTimestamp, selection) {
    let identity = ctx.clientIdentity;
  
    // Check if the participant is a voter
    if (!this.isVoter(identity)) {
      throw new Error("Only voters can create votes");
    }
  
    // Get the participant ID
    const participantId = identity.getAttributeValue("id");
  
    if (!participantId) {
      throw new Error("Participant ID not found");
    }
  
    // Get the poll from the world state
    const pollBuffer = await ctx.stub.getState(poll_ID);
  
    if (!pollBuffer || pollBuffer.length === 0) {
      throw new Error(`Poll with ID ${poll_ID} does not exist`);
    }
  
    const poll = JSON.parse(pollBuffer.toString());
  
    // Check if the poll is open
    const currentTimestamp = new Date().getTime();
    const openTimestamp = new Date(poll.open).getTime();
    const closedTimestamp = new Date(poll.closed).getTime();
  
    if (currentTimestamp < openTimestamp) {
      throw new Error("The poll is not open yet");
    }
  
    if (currentTimestamp > closedTimestamp) {
      throw new Error("The poll is closed");
    }
  
    // Generate a unique vote ID
    const voteID = "vote:" + this.counter;
  
    // Create the vote object
    const vote = new Vote(
      voteID,
      participantId,
      poll_ID,
      voteTimestamp,
      selection
    );
  
    // Increment the counter
    this.counter++;
  
    // Store the vote in the world state
    await ctx.stub.putState(voteID, vote.serialise());
  
    return vote;
  }
  /**
   * Create Poll
   *
   * This transaction is used to create a new poll.
   * Only an organizer can create a poll.
   *
   * @param ctx - The transaction context object
   * @param options - The list of poll options
   * @param open - The opening date of the poll
   * @param closed - The closing date of the poll
   * @returns The created poll
   */
  async createPoll(ctx, options, open, closed) {
    let identity = ctx.clientIdentity;

    // Check if the participant is an organizer
    if (!this.isOrganizer(identity)) {
      throw new Error("Only voters can create votes");
    }

    // Generate a unique poll ID
    this.counter++;

    const pollID = "poll:"+this.counter;

    // Create the poll object
    const poll = new Poll(pollID, options, open, closed);

    await ctx.stub.putState(pollID, poll.serialise());
    // Store the poll in the world state

    return JSON.stringify(poll);
  }
}


module.exports = EggTrackingContract;