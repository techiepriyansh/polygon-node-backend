const { WebSocketServer } = require('ws');
import Chess from "./build.eth/contracts/Chess.json"
require('dotenv').config()
var Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = process.env.MNEMONIC
const clientURL = process.env.CLIENT_URL
const contractAddress = process.env.CONTRACT_ADDRESS
const walletAddress=process.env.WALLET_ADDRESS
const assert = require('assert');
const provider = new HDWalletProvider(mnemonic, clientURL);
var web3 = new Web3(provider);
var chessContract = new web3.eth.Contract(Chess.abi, contractAddress);
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
				let [pubkey, gameCode] = splitMessage(arg);
				let game = new Game(client, pubkey, gameCode);
				games[gameCode] = game;
				break;
			}

			case "join_game": {
				let [pubkey, gameCode] = splitMessage(arg);
				assert.equal(games.hasOwnProperty(gameCode), true);
				
				let game = games[gameCode];
				game.connectPlayer2(client, pubkey);

				game.assignColors();
				game.player1.socket.send(`color${MSG_DELIM}${game.player1.color}`);
				game.player2.socket.send(`color${MSG_DELIM}${game.player2.color}`);
				game.startGame();
			}

			case "move": {
				let [gameCode, move] = splitMessage(arg);
				assert.equal(games.hasOwnProperty(gameCode), true);

				let game = games[gameCode];
				let [_from, _to] = splitMessage(move); 
				let [valid, isFinished, checkMate] = game.makeMove(client, _from, _to);
				if (isFinished && checkMate)
				{
					
					let winnerPubkey = game.playerToMove.pubkey // <- this player won
					await chessContract.methods.declareWinner(gameCode,winnerPubkey,{from:walletAddress})
				}
				else if (isFinished && (!checkMate))
				{
					// draw
				}		
						
				if (valid) {
					let opponent = client == game.player1 ? game.player2 : game.player1;
					opponent.send(`opponent_move${MSG_DELIM}${_from}${MSG_DELIM}${_to}`);
				}
			}
		}
	});

})