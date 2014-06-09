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
            IO.socket.on('generateWorld', IO.startGenerate);
            IO.socket.on('playerLeaveRoom', IO.deletePlayer);
            IO.socket.on('timerCount', IO.timer);
            IO.socket.on('renderGame', IO.renderGame);
            IO.socket.on('updatePlayerCoords', IO.updatePlayerCoords);

            IO.socket.on('debug', function (data) {
                console.log(data);
            });

            IO.socket.on('room', function (data) {
                console.log(data.room);
            });
        },

        updatePlayerCoords: function(data){
            APP.updatePlayerCoords(data);
        },

        renderGame: function(){
            APP.renderGame();
        },

        timer: function(data){
            APP.timer(data);
        },

        deletePlayer: function(sockId){
            APP.deletePlayer(sockId);
        },

        startGenerate: function(data){
            APP.startGenerate(data);
        },

        viewPlayersList: function (data) {
            APP.viewPlayersList(data);
        },

        serverGameCreated: function (data) {
            APP.showWaitingScreen();
            //APP.initGame();
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
            APP.game.beginGame(IO, APP.gameId, APP.myNick);
//IO.socket.emit('gameWasStarted');
        },

        viewPlayersList: function (data) {
            var pList = data.players;
            APP.myNick = data.nick;

            var table = '';
                    for (var player in pList) {
                        if(player != 'length'){
                            console.log(pList[player].socketId);
                            //APP.game.addPlayer();
                            table += '<tr id="'+pList[player].socketId+'"><td>' + pList[player].nick + '</td>';
                            var status = pList[player]['status'] ? 'ready' : 'gone';
                            table += '<td>' + status + '</td>';
                            table += '</tr>';
                        }
                    }
            $('#tableInfo tbody').append(table);

        },

        addPlayerInGame: function (data) {

            var table = '';
            //APP.game.addPlayer();
            table += '<tr id="'+data.socketId+'"><td>' + data.nick + '</td>';
            var status = data['status'] ? 'ready' : 'gone';
            table += '<td>' + status + '</td>';
            table += '</tr>';
            APP.ready = 1;
            $('#tableInfo tbody').append(table);

        },

        startGenerate: function(data){

            IO.socket.emit('startTimer', data.gameId);
            $('#tableInfo').remove();

//            var playerCount = data.players['length'];
            APP.gameId = data.gameId;
            APP.initGame();

            console.log(data.players[APP.myNick]);

            APP.game.addPlayer(
                data.players[APP.myNick].x,
                data.players[APP.myNick].y,
                data.players[APP.myNick].z,
                APP.myNick);

            for(var player in data.players){
                if(player != 'length' && player != APP.myNick){
                    APP.game.addPlayer(
                        data.players[player].x,
                        data.players[player].y,
                        data.players[player].z,
                        player);


                }
            }

            APP.game._initRenderer();
            APP.game.worldRender();

        },

        deletePlayer: function(sockId){
            $('#tableInfo tr[id='+sockId+']').remove();
        },

        timer: function(count){

            var t = $('#timerScreen');

            if(t.css('display') == 'none')
                t.show();

            $('div', t).text(count);
        },

        renderGame: function(){

            $('#startScreen').hide();
            $('#webgl').show();

        },

        updatePlayerCoords: function(dataStr){

            var data = dataStr.split(',');

            var coords = data.coords;
            var rotation = data.rotation;

            for(var i = 1; i < APP.game.airPlanes.length; i++){
                if(APP.game.airPlanes[i].nick == data[7]){
                    APP.game.airPlanes[i].position.set(parseFloat(data[0]),parseFloat(data[1]),parseFloat(data[2]));
                    APP.game.airPlanes[i].rotation.set(parseFloat(data[3]),parseFloat(data[4]),parseFloat(data[5]));
                    console.log('Update'+data[7]);
                    break;
                }
            }

        }

    };
    IO.init();
    APP.init();
};