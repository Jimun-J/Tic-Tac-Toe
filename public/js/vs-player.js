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
let playerWon;
let tied = 0;

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
}

// find the room from the server using roomId
socket.emit("find-room", { roomId });

// if found, see if there is a player inside
socket.on("room-found", ({ room }) => {
    if (!room.hasOwnProperty('players')) {
        let player = new Player(socket.id, 'X', 0, '#31C4BE');
        $('.me').css('background-color', '#31C4BE');
        $('.opponent').css('background-color', '#F2B236');

        // asks the server to enter the room
        socket.emit("enter-room", { player, roomId: room.roomId });
    } else {
        let player = new Player(socket.id, 'O', 0, '#F2B236');
        $('.me').addClass('yellow');
        $('.opponent').addClass('blue');

        // asks the server to enter the room
        socket.emit("enter-room", { player, roomId: room.roomId });
    }
});

// player fails to enter the room
socket.on("room-is-full", () => {
    window.location.href = '/';
});

// player succeeds to enter the room
socket.on("room-entered", ({ room }) => {
    players = room.players;
    if (room.players.length == 1) {
        $('.first-player').css("display", "block");
    } else if (room.players.length == 2) {
        $('.first-player').css("display", "block");
        $('.second-player').css("display", "block");
        $('.start').css("display", "block");
    }
});

/* player left before the game start: 
    1. if all players are left from the room, room is destroyed on the server side
    2. if one of the players is left, update accordingly
*/
socket.on("player-left", ({ playerId }) => {

    // find who left and remove from the waiting list
    players.forEach(player => {
        if (player.player.id === playerId) {
            const index = players.indexOf(player);
            if (index > -1) {
                players.splice(index, 1);
            }
        }
    })

    players[0].player.marker = X_TEXT;
    players[0].player.color = '#31C4BE';


    let playerInfo = players[0];
    socket.emit("change-player-info", { playerInfo, roomId });

    // player cannot start the game
    $('.second-player').css("display", "none");
    $('.start').css("display", "none");
    $('.me').removeClass('yellow');
    $('.me').addClass('blue');
    $('.opponent').removeClass('blue');
    $('.opponent').addClass('yellow');
    $('.waiting-room').css("display", "block");
    $('.background-modal').css("display", "none");

    resetGame();

})

$('.start').click(() => {
    socket.emit("startGame", { roomId });
});

socket.on("gameStarted", () => {
    $('.waiting-room').css("display", "none");
    initializeGame();
})

// Initialize game 
const initializeGame = () => {
    $('.grid-container div').unbind("click", boxClicked);
    $('.grid-container div').click(boxClicked);
}

// when a player clicks a cell
const boxClicked = (e) => {
    const id = e.target.id;
    // find who clicked
    let player = players.find(player => player.player.id === socket.id);

    // see if it's the right player's turn
    if (player.player.marker === currentPlayer) {
        if (!gameBoard[id]) {
            // let the server notify another player that a cell has been clicked
            socket.emit("click", { player, id, roomId });
        }
    }
}

const resetBoard = () => {
    $('.grid-container div').text('');
    $('.player-mode-turn span').text('X');
    $('.grid-container div').css('background-color', '#1F3540');
    currentPlayer = X_TEXT;
    gameBoard.fill(null);
    availableBoxes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
}

const resetGame = () => {
    // reset board
    resetBoard();
    
    // reset score
    $('.me span').text(0);
    $('.opponent span').text(0);
    tied = 0;
    $('.ties span').text(tied);
}

// player clicked the cell
socket.on("clicked", ({ player, id }) => {
    // record the click
    gameBoard[id] = player.player.marker;
    availableBoxes.splice(availableBoxes.indexOf(Number(id)), 1);

    $(`#${id}`).text(player.player.marker);
    $(`#${id}`).css('color', player.player.color);
    $(`#${id}`).css('font-weight', 'bold');

    // see if player has won the game
    if (playerHasWon() !== false) {
        showResult(player.player);
    } else if (playersTied() === true) {
        showTiedResult();
    }

    // change turn
    currentPlayer = currentPlayer == X_TEXT ? O_TEXT : X_TEXT;

    // Notice whose turn it is on the screen
    if (currentPlayer === O_TEXT) {
        $('.player-mode-turn span').text('O');
        if (player.player.color === '#31C4BE') {
            $('.player-mode-turn').css("background-color", '#F2B236');
        } else {
            $('.player-mode-turn').css('background-color', '#31C4BE');
        }
    } else {
        $('.player-mode-turn span').text('X');
        if (player.player.color === '#31C4BE') {
            $('.player-mode-turn').css("background-color", '#F2B236');
        } else {
            $('.player-mode-turn').css('background-color', '#31C4BE');
        }
    }
})

const playerHasWon = () => {
    for (const condition of winningRows) {
        let [a, b, c] = condition;
        if (gameBoard[a] && (gameBoard[a] == gameBoard[b] && gameBoard[a] == gameBoard[c])) {
            return [a, b, c];
        }
    }
    return false;
}

const playersTied = () => {
    if (availableBoxes.length === 0) {
        return true;
    }
    return false;
}

const showResult = (winner) => {
    let winningBoxes = playerHasWon();
    winningBoxes.forEach((box) => {
        $('#' + box).fadeIn(5000, () => {
            $('#' + box).css({
                'color': '#192A32',
                'background-color': winner.color
            })
        })
    });

    $('.modal h1').css('color', winner.color);
    $('.modal h1 span').text(winner.marker);
    $('.modal p').text(winner.marker + ' WON!');

    playerWon = winner;

    showModal();
}

const showTiedResult = () => {
    tied++;
    playerWon = null;
    $('.ties span').text(tied);
    $('.modal p').text("TIED");
    $('.modal h1 span').text("NO ONE");
    $('.modal h1').css("color", "white");
    showModal();
}

$('.next').click(() => {
    socket.emit("go-next-round", { roomId, winner: playerWon });
})

$('.quit').click(() => {
    socket.emit("quit", { roomId });
    window.location.href = "/";
})

socket.on("disconnect-by-pressing-quit", () => {
    $('.player-mode-turn').css("background-color", "#31C4BE");
})

socket.on("moved-to-next-round", ({ winner }) => {
    if (winner) {
        let playerWon = players.find(player => player.player.id === winner.id);
        let playerLost = players.find(player => player.player.id !== winner.id);
    
    
        playerWon.player.score++;
        resetGame();
    
        if (socket.id === winner.id) {
            $('.me span').text(playerWon.player.score);
            $('.opponent span').text(playerLost.player.score);
        } else {
            $('.opponent span').text(playerWon.player.score);
            $('.me span').text(playerLost.player.score)
        }
    }

    resetBoard();

    players.forEach(player => {
        player.player.marker = player.player.marker == X_TEXT ? O_TEXT : X_TEXT;
    })

    let nextStartPlayer = players.find(player => player.player.marker === 'X');
    $('.player-mode-turn').css('background-color', nextStartPlayer.player.color);

    $('.grid-container div').css('background-color', '#1F3540');

    initializeGame();
    $('.background-modal').css('display', 'none');
})


const showModal = () => {
    setTimeout(() => $('.background-modal').css("display", "block"), 1000);
}





