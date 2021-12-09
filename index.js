const { WebSocketServer } = require('ws');
require('dotenv').config()

const assert = require('assert');

const { splitMessage, MSG_DELIM } = require('./utils.js');

const wss = new WebSocketServer({ 
	port: process.env.SOCKET_PORT, 
});


wss.on('connection', client => {
	client.on('message', rawMsg => {
		let msg = rawMsg.toString();
		console.log(msg)
		let [cmd, arg] = splitMessage(msg);

		switch (cmd) {

		}
	});
})