const express = require('express');
const app = express();
const port = 9067;

var deterministic = true;

app.use(express.json())

app.get('/farmer/:id', (req,res) => {

   let stamp;

   if(deterministic) {
      stamp = `${req.params.id}-161803398875`;
   } else {
      stamp = `${req.params.id}-${new Date().getTime()}`;
   }

   console.log(`received request from ${req.connection.remoteAddress}:${req.connection.remotePort} stamp=${stamp}`);

   res.json({ id: `${req.params.id}`, 'stamp' : stamp});
});

app.put('/config', (req,res) => {
    deterministic = req.body.deterministic;
    console.log('deterministic : ' + deterministic);
    res.end();
});

app.listen(port, () => console.log(`server running on port ${port}`))
