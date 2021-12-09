const assert = require('assert');
const { Player } = require('./player.js')

const WHITE = 0;
const BLACK = 1;

const PLAYER_ONE_CONNECTED                = 0;
const PLAYER_TWO_CONNECTED                = 1;
const GAME_READY                          = 2;


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
		player1.color = decider ? WHITE : BLACK;
		player2.color = decider ? BLACK : WHITE;
		this.status = GAME_READY;
	}


}

exports.Game = Game;