const assert = require('assert');
const { Player } = require('./player.js')

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
	}

	connectPlayer2(player2Socket, player2Pubkey)
	{
		assert.equal(this.status, PLAYER_ONE_CONNECTED);
		this.player2 = new Player(player2Socket, player2Pubkey);
		this.status = PLAYER_TWO_CONNECTED;
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
	}

	startGame()
	{
		assert.equal(this.status, GAME_READY);
		this.status = WHITE_TO_MOVE;
		this.playerToMove = this.white;
	}

	makeMove(player, _from, _to)
	{
		assert.equal(player, this.playerToMove);
		// let valid = chessEngine.isValid(_from, _to);
		let valid = true; 
		if (!valid) return [false, false];

		// let won = chessEngine.didWin(_from, _to);
		let won = false;
		if (won) {
			this.status = GAME_OVER;
			return [valid, won]
		}

		let decider = this.status = WHITE;
		this.playerToMove = decider ? this.white : this.black; 
		this.status = decider ? BLACK : WHITE;

		return [valid, won];
	}

}

exports.Game = Game;