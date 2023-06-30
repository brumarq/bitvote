# Table of contents

- [1. Use Case Description:](#1-use-case-description)
- [2. Data and Transaction Model:](#2-data-and-transaction-model)
  - [2.1 Modeling Participants, Assets, and Transactions:](#21-modeling-participants-assets-and-transactions)
- [3. Logic (Smart Contracts):](#3-logic-smart-contracts)
  - [3.1 Business Rules:](#31-business-rules)
  - [3.2 Types of Events and Event Consumers:](#32-types-of-events-and-event-consumers)
- [4. Privacy and Security:](#4-privacy-and-security)
  - [4.1 Authentication and Authorization:](#41-authentication-and-authorization)
- [5. Integration:](#5-integration)
  - [5.1 Interaction with External Systems:](#51-interaction-with-external-systems)
- [6. Architecture Organization:](#6-architecture-organization)
  - [6.2 Consensus/Endorsement Mechanism:](#62-consensusendorsement-mechanism)
- [7. Network hosting](#7-network-hosting)
- [8. Individual contribution table](#8-individual-contribution-table)
- [9. Setup Instructions](#9-setup-instructions)
  - [9.1 Setup Hyperledger:](#91-setup-hyperledger)
  - [9.2 Setup Backend:](#92-setup-backend)
  - [9.3 Setup Frontend:](#93-setup-frontend)
    
# 1. Use Case Description

The use case revolves around the development of a voting platform named "BitVote," which focuses on providing organizations with a secure and transparent voting system. The platform's primary objective is to ensure that the voting processes are conducted in a manner that is both secure and transparent. BitVote allows organizations to establish voting pools, enabling users to vote securely.

To provide security and control, the application has access controls and customizable features for pool creation. 
For example, 
- Organizations can set deadlines for pool closure.
- Voter can only vote once.

Using blockchain, BitVote ensures the immutability and transparency of the voting process. Blockchain serves as a decentralized and tamper-resistant ledger, recording each vote in a transparent and permanent manner.

The ultimate goal of BitVote is to create a user-friendly and straightforward application that facilitates secure and transparent voting. The platform seeks to provide an intuitive interface that simplifies the voting process for users, ensuring a positive and accessible experience. Through the combination of security, transparency, privacy, and user-friendliness, BitVote aims to provide people with a better voting solution.

# 2. Data and Transaction Model

## 2.1 Modeling Participants, Assets, and Transactions

In the BitVote platform, various entities are modeled to ensure the smooth functioning of the voting system:

- **Participants** : This entity encompasses different individuals and organizations involved in the voting process. It includes registered **voters**, **organizations** hosting the elections, and **administrators** responsible for managing the platform. Each participant is uniquely identified within the blockchain network through a specific address with google authentication.

- **Assets** : The platform has multiple assets, which are:
   -    **Vote**: Each vote is associated with a specific voter and a particular voting poll. The vote displays which decision was made by the user and which poll was selected. Additionally, other assets may exist within the system to facilitate authorization or access control.
   -    **Poll**: A poll contains an array of options that the voter can vote for, it also contains an opening date and closing date of the poll, which enables or disables users to vote for it.

- **Transactions** : Transactions include:
   - **Vote** : Registered voter submits their vote to a specific voting pool. This transaction is what registers and processes the votes securely and transparently.
   - **CreatePoll**: Allows organizations to create new voting pools, and define pool closure to and poll opening.
   - **GetResults**: This transactions allows organizations to retrieve the results of the poll. The results tell you which option won and who voted for which option. For now the votes **are not encrypted**.

<img width="1000" alt="image" src="https://github.com/brumarq/bitvote/assets/44119479/abee5522-acdc-4aa9-b686-a0b837a6ea27">

# 3. Logic (Smart Contracts)

## 3.1 Business Rules

The following business rules govern the BitVote platform:

- Each user can participate in multiple voting pools.
- A user can submit only one vote per voting pool.
- Only authorised administrators can create and manage voting pools.
- Only voters can vote in a poll
- Only organizers can create polls
- Voters can only vote in the defined timeframe by the organizers.

## 3.2 Types of Events and Event Consumers

Within the BitVote application no type of events have been developed. However, in the future it would be an opportunity to provide the user with a event that tells him that a new poll has been opened.

# 4. Privacy and Security

## 4.1 Authentication and Authorization

The BitVote platform places a strong emphasis on privacy and security,this is why we used google as a third-party provider to authenticate and authorize aour users.

- **Authentication** : To ensure that only authorized participants can engage with the platform, authentication is enforced. Users can register themselves using their google account.

- **Authorization** : Access controls play a crucial role in maintaining the security of the platform. While creating an account, users can select their role. Obviously in a real world application this would be limited. However, in this case we can either create a voter or organizer.

# 5. Integration

## 5.1 Interaction with External Systems

To be able to interact with the Hyperledger application we created a REST API that can be used with any web application or API platform. To have access to the API calls the user has to attach the Bearer token provided by google, if not, permission denied will be received.

API Calls:
- `/rest/vote`: This call is a POST request that only allows voters to create a vote.
- `/rest/poll`: This call is a POST request that only allows organizers to create a poll.
- `/rest/results`: This is a GET request that allows users to make a request of the results of a certain poll.

[Here is the link to the Postman folder](https://elements.getpostman.com/redirect?entityId=17458453-69e92250-8de6-4a71-a687-52169c6f1e91&entityType=collection)

# 6. Architecture Organization
## 6.1 Peers and organizations
In the BitVote voting system, peers and organizations play important roles.

Each peer stores the voting records and verify each vote before adding it to the system, and each peer belongs to an organization. In the BitVote system, there are multiple organizations, such as org1.example.com and org2.example.com. Each organization operates its own peer, like peer0.org1.example.com and peer0.org2.example.com.

In conclusion, we are using a **Multi-peer and Multi-organisation** network organization

![image](https://github.com/brumarq/bitvote/assets/44119479/1d53b01b-92f9-42c8-bd17-e8e75b609900)

## 6.2 Consensus/Endorsement Mechanism

As stated previously, the network consists of two organizations, which each operate its own peer. When one peer receives a new vote from the client (the online voting dashboard), this will invoke the `createVote` method. The same applies when a new poll is created using `createPoll`.

Whenever either of these methods is invoked, a new transaction is created. At this stage, the transaction is a transaction 'proposal', it is not yet finalized or included in the blockchain. The peer will submit this transaction proposal to the other peer on the network, which will then verify that the transaction is correct, has not been submitted previously, and adheres to the business rules set by the network.

If the transaction proposal was validated correctly, it is broadcast to the ordering service, together with the signature of the node that received the transaction proposal. The ordering node takes in the new (endorsed) transaction, 'orders' it into a block, and delivers the new block(s) to both peers on the network. These blocks are immutable and its transaction cannot be changed from this point.

Since this application is a proof-of-concept, there are only two organizations. In a real-life scenario, there would likely be more organizations and peers, and each peer would have to attest to the proposed transactions in order to reach a majority consensus before the transaction can be included in a block.

# 7. Network hosting

For the Hyperledger BitVote application, we are currently using Docker containers to run it. However, in the future, we hope to deploy it to IBM for even better performance and scalability.

# 8. Individual contribution table

A table containing a description of the contribution per participant. Students should inform which task they were responsible for. Evidence and explanations of the activity are mandatory.

| Bruno Marques | Task | Evidence | Explanation |
| --- | --- | --- | --- |
| | Chaincode | [Commit1](https://github.com/brumarq/bitvote/commit/28060ba5d9846ae12f3b6e36fd429f18b5d39a7f)  [Commit2](https://github.com/brumarq/bitvote/commit/a6f58f838cb49eaa1071a8f75782b92a00fe6c20) | Setup the cahin code to be able to create polls and votes.
| | API calls | [Commit1](https://github.com/brumarq/bitvote/commit/a6f58f838cb49eaa1071a8f75782b92a00fe6c20#diff-d2f13051fdd5cb77b2d5945a9f10a621d7691950ddfe936c6d1d8d85c0b6bdda)  [Commit2](https://github.com/brumarq/bitvote/commit/c342aec1ea0ab6533ce555b4685f494fa911d619) | Setup the api calls to create votes and polls.

| Wietze Bronkema | Task | Evidence | Explanation |
| --- | --- | --- | --- |
| | Voting results | [Commit](https://github.com/brumarq/bitvote/commit/9f188d7ada147585b48025611157beba3ee87159) | Worked together with various teammates to retrieve the results of a given poll through a REST endpoint.
| | Consensus documentation | [Commit](https://github.com/brumarq/bitvote/commit/426c35cb98bdde78516d12a8b62003dc45cf6fd2) | Provided information about the consensus mechanism of the application.

| Sander Harks | Task | Evidence | Explanation |
| --- | --- | --- | --- |
| | Voting results | [Commit](https://github.com/brumarq/bitvote/commit/e831f57b3bc74773376c8ea1445a7e4ec6334127) | Worked together with various teammates to retrieve the results of a given poll through a REST endpoint.

| Mike Fels | Task | Evidence | Explanation |
| --- | --- | --- | --- |
| | Documentation | [Commit](https://github.com/brumarq/bitvote/tree/59f86da81e069bc7ddf462b0a6e6c123bcfb2e11) | Worked on the documentation.
| | Voting results | ... | Supporting various teammates to retrieve the results of a given poll through a REST endpoint.



# 9. Setup Instructions

## 9.1 Setup Hyperledger

   a. Navigate to test-network:   
   `cd [pathToFabricSamples]/fabric-samples/test-network`
   
   b. Turn off all containers:   
   `./network.sh down`
   
   c. Start containers:   
   `./network.sh up createChannel -ca -s couchdb`
   
   d. Build chaincode:   
   `./network.sh deployCC -ccn voting-contract -ccp /[PathToRepo]/bitvote/chaincode -ccv 1 -ccs 1 -ccl javascript`

## 9.2 Setup Backend

   a. Navigate to backend:   
   `cd [pathToRepo]/client/backend`
   
   b. Install packages:   
   `npm i`
   
   c. Setup path variable:  
   `export FABRIC_PATH=[pathToFabricSamples]/fabric-samples/`
   
   d. Replace the client/backend/src/auth/oauth2.keys.json with the one given to you
   
   e. Create admin:  
   `node src/enrollAdmin.js`
   
   f. Start server:  
   `npm start`

## 9.3 Setup Frontend

   a. Navigate to frontend:  
   `cd [pathToRepo]/client/frontend2`
   
   b. Install packages:  
   `npm i`
   
   c. Install Angular globally:   
   _find out how to_
   
   d. Run `npm install` to install dependencies for the frontend.
   
   e. `ng serve` to run angular server


