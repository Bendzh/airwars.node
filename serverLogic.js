var server = {

    io: null,
    gameSocket: null,
    games: [],

    currentGame: function(){ return server.games.length - 1; }

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

    data.mySocketId = sock.id;

    sock.join(data.gameId.toString());

    data.countPlayers = server.games[ server.currentGame() ].countPlayers += 1;

    console.log('Player joinde to ' + data.gameId);

    server.io.sockets.in(data.gameId).emit('playerJoinedRoom', data);
}

function hideStartScreen() {
    this.emit('deleteStartScreen');
}

function newServerGame() {
    var gameId;
    var game = {};

    if (server.games.length == 0) {
        gameId = game['gameId'] = ( Math.random() * 100000 ) | 0;
        server.games.push(game);
        server.games[ server.currentGame() ].countPlayers = 0;

        //this.emit('debug', {obj: server.games, obj2: game});
    }
    else
        gameId = server.games[ server.currentGame() ].gameId;

    this.emit('newServerGameCreated', {gameId: gameId, mySocketId: this.id});
    this.join(gameId.toString());
}

exports._init = _init;