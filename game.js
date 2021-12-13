const jsChessEngine = require('js-chess-engine');

const assert = require('assert');

const {Player} = require("./player")

const WHITE = 0;
const BLACK = 1;

const PLAYER_ONE_CONNECTED                = 0;
const PLAYER_TWO_CONNECTED                = 1;
const GAME_READY                          = 2;
const WHITE_TO_MOVE                       = 3;
const BLACK_TO_MOVE                       = 4;
const GAME_OVER                           = 5;


class Game 
{
	constructor(hostSocket, hostPubkey, gameCode)
	{
		this.player1 = new Player(hostSocket, hostPubkey);
		this.code = gameCode;
		this.status = PLAYER_ONE_CONNECTED;
		console.log("Player 1 connected, status code ", this.status)
	}

	connectPlayer2(player2Socket, player2Pubkey)
	{
		if (this.status != PLAYER_ONE_CONNECTED)
			console.err("Player 1 not connected yet!");

		this.player2 = new Player(player2Socket, player2Pubkey);
		this.status = PLAYER_TWO_CONNECTED;
		console.log("Player 2 is connected, status code ", this.status)
	}

	assignColors()
	{
		if (this.status != PLAYER_TWO_CONNECTED)
			console.err("Player two not connected yet!");

		let decider = Math.random() > 0.5;
		this.player1.color = decider ? WHITE : BLACK;
		this.player2.color = decider ? BLACK : WHITE;

		this.white = decider ? this.player1 : this.player2; 
		this.black = decider ? this.player2 : this.player1; 

		this.status = GAME_READY;
		console.log("Game ready, status code ", this.status)
	}

	startGame()
	{
		if (this.status != GAME_READY)
			console.err("Game not ready yet!")

		this.chessGame = new jsChessEngine.Game();
		this.status = WHITE_TO_MOVE;
		this.playerToMove = this.white;
		console.log("Game started, white to move");
	}

	makeMove(playerSocket, _from, _to)
	{
		if (playerSocket != this.playerToMove.socket) 
			console.err("Not this player's move");

		let valid = true;
		try 
		{
			this.chessGame.move(_from, _to);
		} catch (e) 
		{
			return [false, null, null];
		}

		let json = this.chessGame.exportJson();
		let {isFinished, checkMate} = json;
		if (isFinished) 
		{
			this.status = GAME_OVER;
			return [valid, isFinished, checkMate];
		}

		let decider = this.status == WHITE_TO_MOVE;
		this.playerToMove = decider ? this.black : this.white; 
		this.status = decider ? BLACK_TO_MOVE : WHITE_TO_MOVE;

		return [valid, isFinished, checkMate];
	}

}

exports.Game = Game;