const MSG_DELIM = '::';

function splitMessage(msg)
{
	let delimIdx = msg.indexOf(MSG_DELIM);
	if (delimIdx == -1) return [msg, ""]
	let cmd = msg.substring(0, delimIdx);
	let arg = msg.substring(delimIdx + MSG_DELIM.length);
	return [cmd, arg];
}

exports.MSG_DELIM = MSG_DELIM;
exports.splitMessage = splitMessage;