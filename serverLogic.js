var server = {

    io: null,
    gameSocket: null,
    games: { length: 0 },
    players: { length: 0 },
    playersCoords: {
        0: {
            x: 0,
            x: 0,
            y: 0
        },
        1: {
            x: 0,
            x: 0,
            y: 0
        }
    },

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
    server.gameSocket.on('startTimer', startTimer);
    server.gameSocket.on('updatePlayer', updatePlayer);
    server.gameSocket.on('disconnect', onDisconnect);
}

function updatePlayer(data){

    var sock = this;
    var gameId = data.gameId;

    sock.broadcast.to(gameId).emit('updatePlayerCoords', data.dataStr);
}

function onDisconnect() {
    var gameId;

    for (var id in server.players) {
        for (var player in server.players[id]) {
            if (server.players[id][player].socketId == this.id) {
                gameId = id;
                server.games[gameId].countPlayers -= 1;
                this.broadcast.to(gameId).emit('playerLeaveRoom', server.players[gameId][player].socketId);
                delete server.players[gameId][player];
                server.players[gameId]['length'] -= 1;
                break;
            }
        }
    }

    this.leave(gameId.toString());

}

function joinPlayerInRoom(data) {
    var sock = this;

    var nick = data.nick;
    var player = {};

    player.nick = nick;
    player.status = 1;
    player.socketId = sock.id;
    player.x = server.playersCoords[server.players[data.gameId]['length']].x;
    player.y = server.playersCoords[server.players[data.gameId]['length']].y;
    player.z = server.playersCoords[server.players[data.gameId]['length']].z;

    server.players[data.gameId][nick] = player;
    server.players[data.gameId]['length'] += 1;

    sock.join(data.gameId.toString());
    sock.emit('joinedPlayersList', {players: server.players[data.gameId], nick: player.nick});

    server.games[data.gameId].countPlayers += 1;

    sock.broadcast.to(data.gameId).emit('playerJoinedRoom', player);

    checkPlayersCount(data.gameId);
}

function hideStartScreen() {
    this.emit('deleteStartScreen');
}

function checkPlayersCount(gameId) {
    if (server.games[gameId].countPlayers == 2) {
        server.games[gameId].status = 1;
        server.io.sockets.in(gameId).emit('generateWorld', {players: server.players[gameId], gameId: gameId});
    }

}

function newServerGame() {
    var gameId;
    var game = {};

    if (server.games.length == 0) {
        gameId = ( Math.random() * 100000 ) | 0;

        game.gameId = gameId;
        game.countPlayers = 0;

        server.games[gameId] = game;
        server.games.length++;

        server.players[gameId] = {};
        server.players[gameId]['length'] = 0;

        server.playersCoords[0].x = 0;
        server.playersCoords[0].y = 20.5;
        server.playersCoords[0].z = -3;

        server.playersCoords[1].x = 0;
        server.playersCoords[1].y = 20.5;
        server.playersCoords[1].z = -10;

    }
    else
        for (var elem in server.games)
            if (server.games[elem].countPlayers < 5 && elem != 'length') {
                gameId = server.games[elem].gameId;
                break;
            }

//    this.emit('debug', server.games);

    this.emit('newServerGameCreated', {gameId: gameId, mySocketId: this.id});
    this.join(gameId.toString());
}

function startTimer(gameId){
    var tCount = 10;
    var t = setInterval(function(){

        if(!tCount){
            server.io.sockets.in(gameId).emit('renderGame');
            clearInterval(t);
        }

        server.io.sockets.in(gameId).emit('timerCount', tCount--);

    }, 1000);
}

exports._init = _init;