const { WebSocketServer } = require('ws');
require('dotenv').config()

const assert = require('assert');

const { Game }
const { splitMessage, MSG_DELIM } = require('./utils.js');

const wss = new WebSocketServer({ 
	port: process.env.SOCKET_PORT, 
});

let games = {};

wss.on('connection', client => {
	client.on('message', rawMsg => {
		let msg = rawMsg.toString();
		console.log(msg)
		let [cmd, arg] = splitMessage(msg);

		switch (cmd) {
			case "new_game": {
				let [pubkey, gameCode] = splitMessage(msg);
				let game = new Game(client, pubkey, gameCode);
				games[gameCode] = game;
				break;
			}

			case "join_game": {
				let [pubkey, gameCode] = splitMessage(msg);
				assert.equal(games.hasOwnProperty(gameCode), true);
				
				let game = games[gameCode]
				game.connectPlayer2(client, pubkey);

				game.assignColors();
				game.player1.socket.send(`color${MSG_DELIM}${game.player1.color}`);
				game.player2.socket.send(`color${MSG_DELIM}${game.player2.color}`);
			}
		}
	});

})