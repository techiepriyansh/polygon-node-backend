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
		console.log("Play 1 connected, status code ",this.status)
	}

	connectPlayer2(player2Socket, player2Pubkey)
	{
		assert.equal(this.status, PLAYER_ONE_CONNECTED);
		this.player2 = new Player(player2Socket, player2Pubkey);
		this.status = PLAYER_TWO_CONNECTED;
		console.log("Player 2 is connected,status code ",this.status)
	}

	assignColors()
	{
		assert.equal(this.status, PLAYER_TWO_CONNECTED);

		let decider = Math.random() > 0.5;
		this.player1.color = decider ? WHITE : BLACK;
		this.player2.color = decider ? BLACK : WHITE;

		this.white = decider ? this.player1 : this.player2; 
		this.black = decider ? this.player2 : this.player1; 

		this.status = GAME_READY;
		console.log("Game ready, status code ",this.status)
	}

	startGame()
	{
		assert.equal(this.status, GAME_READY);
		this.chessGame = new jsChessEngine.Game();
		this.status = WHITE_TO_MOVE;
		this.playerToMove = this.white;
		console.log("White to move ",this.status)
	}

	makeMove(player, _from, _to)
	{
		assert.equal(player, this.playerToMove);

		let valid = true;
		try 
		{
			this.chessGame.move(_from, _to);
		} catch (e) 
		{
			return [false, null, null];
		}

		let {isFinished, checkMate} = this.chessGame.board.configuration;
		if (isFinished) 
		{
			this.status = GAME_OVER;
			return [valid, isFinished, checkMate];
		}

		let decider = this.status == WHITE;
		this.playerToMove = decider ? this.white : this.black; 
		this.status = decider ? BLACK : WHITE;

		return [valid, isFinished, checkMate];
	}

}

exports.Game = Game;