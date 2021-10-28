require('events').EventEmitter.defaultMaxListeners = 0;
const express = require('express')
const app = express()
process.on('message', msg => {
    app.listen(msg.port, () => {
        console.log('listening on *:', msg.port);
    });
    app.use(express.static(__dirname + '/index.html'));
});