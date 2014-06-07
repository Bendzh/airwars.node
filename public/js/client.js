window.onload = function () {
    var IO = {

        init: function () {
            IO.socket = io.connect();
            IO.eventListeners();
        },

        eventListeners: function () {
            IO.socket.on('newServerGameCreated', IO.serverGameCreated);
            IO.socket.on('deleteStartScreen', IO.deleteStartScreen);
            IO.socket.on('playerJoinedRoom', IO.addPlayerInGame);
            IO.socket.on('joinedPlayersList', IO.viewPlayersList);

            IO.socket.on('debug', function (data) {
                console.log(data);
            });

            IO.socket.on('room', function (data) {
                console.log(data.room);
            });
        },

        viewPlayersList: function (data) {
            APP.viewPlayersList(data);
        },

        serverGameCreated: function (data) {
            APP.showWaitingScreen();
            APP.initGame();
            APP.hostJoinPlayer(data);
        },

        deleteStartScreen: function () {
            APP.hideStartScreen();
        },

        addPlayerInGame: function (data) {
            APP.addPlayerInGame(data);
        }

    };

    var APP = {

        game: WarWorld,
        gameId: 0,
        mySocketId: '',
        myNick: '',
        ready: 0,
        airplanesInBattle: 0,

        init: function () {
            APP.eventListeners();
        },

        eventListeners: function () {
            document.getElementById('startBtn').onclick = function () {
                APP.createServerGame();
            };
        },

        showWaitingScreen: function () {
            var tableInfo = document.getElementById('tableInfo');
            document.getElementById('setInfo').style.display = 'none';
            tableInfo.style.display = 'inline-block';
        },

        hideStartScreen: function () {
            document.getElementById('startScreen').style.display = 'none';
        },

        createServerGame: function () {
            IO.socket.emit('newServerGame');
        },

        hostJoinPlayer: function (data) {
            var nick = $('#nick').val();
            APP.myNick = nick;

            IO.socket.emit('hostJoinPlayer', {gameId: data.gameId, nick: nick});
        },

        initGame: function () {
            APP.game.beginGame();
//IO.socket.emit('gameWasStarted');
        },

        viewPlayersList: function (data) {

            var table = '';
            for (var id in data)
                if (id != 'length') {
                    for (var player in data[id]) {
                        APP.game.addPlayer();
                        table += '<tr><td>' + data[id][player].nick + '</td>';
                        var status = data[id][player]['status'] ? 'ready' : 'gone';
                        table += '<td>' + status + '</td>';
                        table += '</tr>';
                    }
                }
            $('#tableInfo tbody').append(table);

        },

        addPlayerInGame: function (data) {

            var table = '';
            APP.game.addPlayer();
            table += '<tr><td>' + data.nick + '</td>';
            var status = data['status'] ? 'ready' : 'gone';
            table += '<td>' + status + '</td>';
            table += '</tr>';
            APP.ready = 1;
            $('#tableInfo tbody').append(table);
            IO.socket.emit('playerWasJoined');

        }

    };
    IO.init();
    APP.init();
};
