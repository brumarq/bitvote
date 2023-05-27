/*
 * Voting System Smart Contract
 * Author: Bruno Marques
 */

"use strict";

// Import Hyperledger Fabric SDK
const { Contract } = require("fabric-contract-api");

// Import UUID library
const { v4: uuidv4 } = require("uuid");

const Participant = require("./model/participant.js");
const Vote = require("./model/vote.js");
const Poll = require("./model/poll.js");

class VotingContract extends Contract {
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
    // Check if the participant is a voter
    const participant = await this.getParticipant(ctx);
    if (participant.role !== "Voter") {
      throw new Error("Only voters can create votes");
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
    const voteID = uuidv4();
  
    // Create the vote object
    const vote = new Vote(
      voteID,
      participant.participantID,
      poll_ID,
      voteTimestamp,
      selection
    );
  
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
    // Check if the participant is an organizer
    const participant = await this.getParticipant(ctx);
    if (participant.role !== "Organizer") {
      throw new Error("Only organizers can create polls");
    }

    // Generate a unique poll ID
    const pollID = uuidv4();

    // Create the poll object
    const poll = new Poll(pollID, options, open, closed);

    // Store the poll in the world state
    await ctx.stub.putState(pollID, poll.serialise());

    return poll;
  }


  // NOT SURE IF THIS IS NEEDED, BUT I'M LEAVING IT HERE FOR NOW
  /**
   * Create Voter (User)
   *
   * This transaction is used to create a new voter (user).
   *
   * @param ctx - The transaction context object
   * @param name - The name of the voter
   * @returns The created voter (user)
   */
  async createVoter(ctx, name) {
    // Check if the participant is an organizer
    const participant = await this.getParticipant(ctx);
    if (participant.role !== "Organizer") {
      throw new Error("Only organizers can create polls");
    }

    // Generate a unique participant ID
    const participantID = uuidv4();

    // Create the voter (user) object

    const voter = new Participant(participantID, name, "Voter");

    // Store the voter (user) in the world state
    await ctx.stub.putState(participantID, voter.serialise());

    return voter;
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
    // Check if the participant is an organizer
    const participant = await this.getParticipant(ctx);
    if (participant.role !== "Organizer") {
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
   * Get Participant
   *
   * Helper function to get the participant (user or organizer) from the transaction context.
   *
   * @param ctx - The transaction context object
   * @returns The participant object
   */
  async getParticipant(ctx) {
    const participantID = ctx.clientIdentity.getID();

    // Retrieve the participant from the world state
    const participantBuffer = await ctx.stub.getState(participantID);

    if (!participantBuffer || participantBuffer.length === 0) {
      throw new Error(`Participant with ID ${participantID} does not exist`);
    }

    return JSON.parse(participantBuffer.toString());
  }
}

module.exports = VotingContract;
