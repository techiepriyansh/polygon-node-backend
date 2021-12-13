class Player {
	constructor(socket, pubkey)
	{
		this.pubkey = pubkey;
		this.socket = socket;
	}
}
exports.Player = Player;