const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const bodyParser = require('body-parser');
const randomstring = require('randomstring');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.urlencoded({extended: true}));

let marker = '';
let rooms = [];
let users = [];

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/game-mode', (req, res) => {
    marker = req.body.marker;
    if (req.body.gameMode === 'vs-cpu') {
        res.json({ gameMode: 'vs-cpu' });
    } else if (req.body.gameMode === 'vs-player') {
        const randomStr = randomstring.generate(10);
        rooms.push({ roomId: randomStr });
        res.json({ gameMode: 'vs-player', roomId: randomStr });
    } else {
        res.json({ gameMode: 'join-room'});
    }
});

app.get('/vs-cpu', (req, res) => {
    let marker_opposite = '';
    if (marker === '') {
        res.redirect('/');
    } else if (marker === 'O') {
        marker_opposite = 'X';
    } else if (marker === 'X') {
        marker_opposite = 'O';
    }
    res.render('vs-cpu', { marker, marker_opposite });
});

app.get('/vs-player/:roomId', (req, res) => {
    let room = rooms.find(room => room.roomId === req.params.roomId);
    if (!room) {
        res.redirect('/');
    } else {
        res.render("vs-player", { roomId: room.roomId });
    }
});

app.post('/join', (req, res) => {
    const roomId = req.body.roomId;
    let room = rooms.find(room => room.roomId === roomId);
    if (room) {
        if (room.players.length === 2) {
            res.json({ roomExist: true, roomFull: true });
        } else {
            res.json({ roomExist: true, roomFull: false });
        }
    } else {
        res.json({ roomExist: false });
    }
})

io.on('connection', (socket) => {
    socket.on("create-room", ({ roomId }) => {  
        socket.join(roomId);
    })

    socket.on("find-room", ({ roomId }) => {
        let room = rooms.find(room => room.roomId === roomId); 
        socket.emit("room-found", { room });
    })

    socket.on("enter-room", ({ player, roomId }) => {
        let room = rooms.find(room => room.roomId === roomId);
        if (!room.hasOwnProperty('players')) {
            room.players =[{ player }];
            socket.join(roomId);
            io.to(roomId).emit("room-entered", ({ room }));
        } else if (room.players.length === 2) {
            socket.emit("room-is-full");
        } else {
            room.players.push({ player });
            socket.join(roomId);
            io.to(roomId).emit("room-entered", ({ room }));
        }
    })

    socket.on("startGame", ({ roomId }) =>{
        io.to(roomId).emit("gameStarted");
    })

    socket.on("click", ({ player, id, roomId }) => {
        io.to(roomId).emit("clicked", { player, id });
    })

    socket.on("go-next-round", ({ roomId, winner }) => {
        io.to(roomId).emit("moved-to-next-round", { winner });
    })

    socket.on("change-player-info", ({ playerInfo, roomId }) => {
        let room = rooms.find(room => room.roomId === roomId);
        room.players[0] = playerInfo;
    })

    socket.on("quit", ({ roomId }) => {
        io.to(roomId).emit("disconnect-by-pressing-quit");
        socket.disconnect();
    })
    
    socket.on('disconnect', () => {
        let playerId = socket.id;

        for (let i = 0; i < rooms.length; i++) {
            let players = rooms[i].players;
            let player = players.find(player => player.player.id === playerId);
            if (player) {
                const index = rooms[i].players.indexOf(player);
                if (index > -1) {
                    rooms[i].players.splice(index, 1);
                }
            }

            // no players left in the room
            if (rooms[i].players.length === 0) {
                socket.leave(rooms[i].roomId);
                rooms.splice(i, 1);            
                break;
            } else if (rooms[i].players.length === 1) {
                io.to(rooms[i].roomId).emit("player-left", { playerId });
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log('server is running on port 3000');
});