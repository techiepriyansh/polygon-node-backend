const { WebSocketServer } = require("ws");
const Chess = require("./build.eth/contracts/Chess.json");
require("dotenv").config();
var Web3 = require("web3");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env.MNEMONIC;
const clientURL = process.env.CLIENT_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const walletAddress = process.env.WALLET_ADDRESS;
const assert = require("assert");
const provider = new HDWalletProvider(mnemonic, clientURL);
var web3 = new Web3(provider);
var chessContract = new web3.eth.Contract(Chess.abi, contractAddress);
const { splitMessage, MSG_DELIM } = require("./utils.js");
const { Game } = require("./game");
const wss = new WebSocketServer({
	port: process.env.SOCKET_PORT,
});

let games = {};

wss.on("connection", (client) => {
	client.on("message", (rawMsg) => {
		try {
			let msg = rawMsg.toString();
			console.log(msg);
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
					if (!games.hasOwnProperty(gameCode))
						console.err(
							`The game with game code ${gameCode} does not exist`
						);

					let game = games[gameCode];
					game.connectPlayer2(client, pubkey);

					game.assignColors();
					game.player1.socket.send(
						`color${MSG_DELIM}${game.player1.color}`
					);
					game.player2.socket.send(
						`color${MSG_DELIM}${game.player2.color}`
					);
					game.startGame();
					break;
				}

				case "move": {
					let [gameCode, move] = splitMessage(arg);
					assert.equal(games.hasOwnProperty(gameCode), true);

					let game = games[gameCode];
					let [_from, _to] = splitMessage(move);
					let [valid, isFinished, checkMate] = game.makeMove(
						client,
						_from,
						_to
					);

					if (isFinished && checkMate) {
						var result;
						let winnerPubkey = game.playerToMove.pubkey;
						console.log(`The winner is ${winnerPubkey}`);
						(async () => {
							result = await chessContract.methods
								.declareWinner(parseInt(gameCode), winnerPubkey)
								.send({ from: walletAddress });
						})();
						(async () => {
							result = await chessContract.methods
								.settleBet(parseInt(gameCode), winnerPubkey)
								.send({ from: walletAddress });
						})();
					} else if (isFinished && !checkMate) {
						// draw
					}
					let currentFEN = game.chessGame.exportFEN();
					if (valid) {
						let opponent =
							client == game.player1.socket
								? game.player2.socket
								: game.player1.socket;
						console.log(
							`opponent_move${MSG_DELIM}${_from}${MSG_DELIM}${_to}`
						);
						opponent.send(
							`opponent_move${MSG_DELIM}${_from}${MSG_DELIM}${_to}`
						);
						wss.clients.forEach(function each(c) {
							/*c.send(
								`stream${MSG_DELIM}${gameCode}${MSG_DELIM}${currentFEN}`
							);*/
							c.send(
								`stream${MSG_DELIM}${gameCode}${MSG_DELIM}${_from}${MSG_DELIM}${_to}`
							);
						});
					}
					break;
				}

				case "get_game": {
					try {
						let game = games[arg];
						let currentFEN = game.chessGame.exportFEN();
						client.send(
							`init_game${MSG_DELIM}${arg}${MSG_DELIM}${currentFEN}${MSG_DELIM}${game.white.pubkey}${MSG_DELIM}${game.black.pubkey}`
						);
						break;
					} catch (e) {
						console.log(e);
					}
				}

				case "chat": {
					wss.clients.forEach(function each(c) {
						c.send(msg);
					});
					break;
				}

				case "get_active_games": {
					try {
						for (const property in games) {
							x = games[property];
							client.send(
								`active${MSG_DELIM}${x.code}${MSG_DELIM}${x.player1.pubkey}${MSG_DELIM}${x.player2.pubkey}`
							);
						}
					} catch (e) {
						console.log(e);
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
	});
});
