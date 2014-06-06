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

            IO.socket.on('debug', function(data){
                console.log(data);
            });

            IO.socket.on('room', function(data){
                console.log(data.room);
            });
        },

        serverGameCreated: function (data) {
            APP.initGame(data);
            //APP.hostJoinPlayer();
        },

        deleteStartScreen: function () {
            APP.hideStartScreen();
        },

        addPlayerInGame: function (data) {
            APP.addPlayerInGame(data);
        }

    };

    var APP = {

        games:[],
        gameId: 0,
        mySocketId: '',
        airplanesInBattle: 0,

        init: function () {
            APP.eventListeners();
        },

        eventListeners: function () {
            document.getElementById('startBtn').onclick = function () {
                APP.createServerGame();
            };
        },

        hideStartScreen: function () {
            document.getElementById('startScreen').style.display = 'none';
        },

        createServerGame: function () {
            IO.socket.emit('newServerGame');
        },

        hostJoinPlayer: function () {
            IO.socket.emit('hostJoinPlayer', {gameId: APP.games[ APP.currentGame() ].gameId});
            console.log('Player joinde to ' + APP.games[ APP.currentGame() ].gameId);
        },

        initGame: function (data) {
            var game = {};

            game.game = WarWorld;
            game.gameId = data.gameId;

            APP.games.push(game);

            APP.mySocketId = data.mySocketId;
            APP.games[ APP.currentGame() ].game.beginGame();

            IO.socket.emit('gameWasStarted');
        },

        addPlayerInGame: function(data){
            console.log(data);

            var count = data.countPlayers;
            var inQueue = count - APP.airplanesInBattle;

            while(inQueue){
                APP.games[ APP.currentGame() ].game.addPlayer();
                APP.airplanesInBattle += 1;
                inQueue -= 1;
            }

            IO.socket.emit('playerWasJoined');


        },

        currentGame: function(){ return APP.games.length - 1; }

    };
    IO.init();
    APP.init();
};
