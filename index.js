require('events').EventEmitter.defaultMaxListeners = 0;
const cluster = require('cluster');
const express = require('express');
const request = require('request');
const app = express();
//setting
const thread = 36;
const start_port = 9000;
const loadserver_port = 80;
const serveraddr = "http://localhost";
//setting
var portlist = [];
let loadurl = 0;
let reqs = 0

if (cluster.isMaster) {
    for (let index = 0; index < thread; index++) {
        var proxy_port = start_port + index;
        portlist.push(":" + proxy_port);
        cluster.fork().setMaxListeners(0).send({ "port": proxy_port, "thread_number": index + 1 });
    }
    app.get('/counts', (req, res) => {
        res.status(200).send({ counts: reqs });
    });
    app.get('*', (req, res) => {
        loadurl = (loadurl + 1) % portlist.length;
        req.pipe(request({ url: serveraddr + portlist[loadurl] + req.url })).pipe(res);
        reqs++;
    });
    app.listen(loadserver_port, () => {
        console.log("Start [HTTP] Server *:" + loadserver_port);
        console.log(`
╦ ╦╔═╗╔╗ ╔═╗╦╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╦═╗╔╦╗
║║║║╣ ╠╩╗╚═╗║ ║ ║╣   ╚═╗ ║ ╠═╣╠╦╝ ║ 
╚╩╝╚═╝╚═╝╚═╝╩ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩╩╚═ ╩`)
    });
} else {
    require("./server.js");
}