/* todo: improve primitive test */

'use strict';

const EggShipment = require('./lib/model/egg-shipment.js');

let eggShipment = new EggShipment('F1', 'S1', 'D1', '20191123');

eggShipment.addEggId('E1');
eggShipment.addEggId('E2');

console.log(eggShipment);

console.log(eggShipment.getFarmerId());
console.log(eggShipment.getDistributorId());
console.log(eggShipment.getShipperId());
console.log(eggShipment.isReady());

const EggBox = require('./lib/model/egg-box.js');

let eggBox = new EggBox('F1','20191123',30);

console.log(eggBox);

console.log(isAdmin('x509::/C=US/ST=North Carolina/O=Hyperledger/OU=client/CdN=admin::/C=US/ST=California/L=San Francisco/O=org1.example.com/CN=ca.org1.example.com'));

function isAdmin(idString) {
    var match =  idString.match('.*CN=(.*)::');
    return match !== null && match[1] === 'admin';
  }
