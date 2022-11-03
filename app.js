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
    } else {
        const randomStr = randomstring.generate(10);
        rooms.push({ roomId: randomStr });
        res.json({ gameMode: 'vs-player', roomId: randomStr });
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
    if (!rooms.find(room => room.roomId === req.params.roomId)) {
        res.redirect('/');
    } else {
        res.render("vs-player");
    }
});

io.on('connection', (socket) => {
    socket.on("find-room", ({ roomId }) => {
        let room = rooms.find(room => room.roomId === roomId);
        socket.emit("room-found", { room });
    })

    socket.on("enter-room", ({ player, roomId }) => {
        let room = rooms.find(room => room.roomId === roomId);
        if (!room.hasOwnProperty('players')) {
            room.players =[{ player }];
            io.sockets.emit("room-entered", ({ room }));
        } else if (room.players.length === 2) {
            socket.emit("room-is-full");
        } else {
            room.players.push({ player });
            io.sockets.emit("room-entered", ({ room }));
        }
    })

    socket.on("click", ({ player, id }) => {
        console.log(player);
        console.log(id);
        io.sockets.emit("clicked", { player, id });
    })
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('server is running on port 3000');
});