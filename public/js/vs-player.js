// connect socket client to socket server
const socket = io();

// room information
const url = window.location.href;
const roomId = url.split("/").pop();

// players in the room
let players = [];

// currentPlayer 
const X_TEXT = 'X';
const O_TEXT = 'O';
let currentPlayer = X_TEXT;

// game board
const gameBoard = Array(9).fill(null);
let availableBoxes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const winningRows = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

// Player class
class Player {
    constructor(id, marker, score, color) {
        this.id = id;
        this.marker = marker;
        this.score = score
        this.color = color;
    }
    changeMarker() {
        marker = marker == 'X' ? 'O' : 'X';
    }
    updateScore() {
        score++;
    }
}

// find the room from the server using roomId
socket.emit("find-room", { roomId });

// if found, see if there is a player inside
socket.on("room-found", ({ room }) => {
    if (!room.hasOwnProperty('players')) {
        let player = new Player(socket.id, 'X', 0, '#31C4BE');
        $('.me').addClass('blue');
        $('.opponent').addClass('yellow');

        // asks the server to enter the room
        socket.emit("enter-room", { player, roomId });
    } else {
        let player = new Player(socket.id, 'O', 0, '#F2B236');
        $('.me').addClass('yellow');
        $('.opponent').addClass('blue');

        // asks the server to enter the room
        socket.emit("enter-room", { player, roomId });
    }
});

// player fails to enter the room
socket.on("room-is-full", () => {
    window.location.href = '/';
});

// player succeeds to enter the room
socket.on("room-entered", ({ room }) => {
    players = room.players;
});

// Initialize game 
const initializeGame = () => {
    $('.grid-container div').click(boxClicked);
}

// when a player clicks a cell
const boxClicked = (e) => {
    const id = e.target.id;
    // find who clicked
    let player = players.find(player => player.player.id === socket.id);
    console.log("Player Clicked: " + player.player.id + " Player Marker: " + player.player.marker);

    // see if it's the right player's turn
    if (player.player.marker === currentPlayer) {
        console.log("right turn");
        if (!gameBoard[id]) {
            // let the server notify another player that a cell has been clicked
            socket.emit("click", { player, id });
        }
    }
}

socket.on("clicked", ({ player, id }) => {
    // record the click
    gameBoard[id] = player.player.marker;
    availableBoxes.splice(availableBoxes.indexOf(Number(id)), 1);

    // change turn
    currentPlayer = currentPlayer == O_TEXT ? X_TEXT : O_TEXT;
    console.log(currentPlayer);

    $(`#${id}`).text(player.player.marker);
    $(`#${id}`).addClass(player.player.marker);
})


initializeGame();






