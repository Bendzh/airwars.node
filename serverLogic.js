var server = {

    io: null,
    gameSocket: null,
    games: { length: 0 },
    players: { length: 0 },

    currentGame: function () {
        return server.games.length - 1;
    }

};

_init = function (sIo, socket) {
    server.io = sIo;
    server.gameSocket = socket;

    server.gameSocket.on('newServerGame', newServerGame);
    server.gameSocket.on('gameWasStarted', hideStartScreen);
    server.gameSocket.on('hostJoinPlayer', joinPlayerInRoom);
}


function joinPlayerInRoom(data) {
    var sock = this;
    var nick = data.nick;
    var player = {};

    player.nick = nick;
    player.status = 1;

    server.players[data.gameId][nick] = player;
    server.players.length += 1;

    sock.join(data.gameId.toString());

    server.games[data.gameId].countPlayers += 1;
    //data.countPlayers = server.games[data.gameId].countPlayers;

    server.io.sockets.in(data.gameId).emit('playerJoinedRoom', server.players);
}

function hideStartScreen() {
    this.emit('deleteStartScreen');
}

function newServerGame() {
    var gameId;
    var game = {};

    if(server.games.length == 0){
        gameId = ( Math.random() * 100000 ) | 0;

        game.gameId = gameId;
        game.countPlayers = 0;

        server.games[gameId] = game;
        server.games.length++;

        server.players[gameId] = {};
    }
    else
        for(var elem in server.games)
            if(server.games[elem].countPlayers < 5 && elem != 'length'){
                gameId = server.games[elem].gameId;
                break;
            }

//    this.emit('debug', server.games);

    this.emit('newServerGameCreated', {gameId: gameId, mySocketId: this.id});
    this.join(gameId.toString());
}

exports._init = _init;