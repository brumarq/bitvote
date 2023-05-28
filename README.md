# BitVote Setup Instructions

## 1. Setup Hyperledger:

   a. Navigate to test-network:   
   `cd [pathToFabricSamples]/fabric-samples/test-network`
   
   b. Turn off all containers:   
   `./network.sh down`
   
   c. Start containers:   
   `./network.sh up createChannel -ca -s couchdb`
   
   d. Build chaincode:   
   `./network.sh deployCC -ccn egg-tracking -ccp /[PathToRepo]/bitvote -ccv 1 -ccs 1 -ccl javascript`

## 2. Setup Backend:

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

## 3. Setup Frontend:

   a. Navigate to frontend:  
   `cd [pathToRepo]/client/frontend2`
   
   b. Install packages:  
   `npm i`
   
   c. Install Angular globally:   
   _find out how to_
   
   d. Run `npm install` to install dependencies for the frontend.
