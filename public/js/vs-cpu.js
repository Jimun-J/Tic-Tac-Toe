const O_TEXT = 'O';
const X_TEXT = 'X';
const CPU = 'cpu';
const PLAYER = 'player';

const gameBoard = Array(9).fill(null); // 9 boxes in the grid-container

let availableBoxes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let currentPlayer = X_TEXT; // X goes first
let currentTurn = '';

let playerScore = 0;
let cpuScore = 0;
let ties = 0;

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

const initializeGame = () => {
    // let use be able to click boxes
    $('.grid-container div').click(boxClicked);

    // find initial player (who starts first)
    currentTurn = findInitialPlayer();

    // if cpu is the initial player, cpu randomly clicks one box
    if (currentTurn === 'cpu') {
        cpuTakesTurn();
        $('.turn span').text('O');
    }
}

const boxClicked = (e) => {
    const id = e.target.id;
    // see if player clicks an available box
    if (!gameBoard[id]) {

        // record the click
        gameBoard[id] = currentPlayer;
        e.target.innerText = currentPlayer;
        e.target.classList.add(currentPlayer); // styling for X and O are different

        // let the clicked box be removed from the available boxes
        availableBoxes.splice(availableBoxes.indexOf(Number(id)), 1);

        // see if player has won the game
        if (playerHasWon() !== false) {
            showResult('player');
        } else if (playersTied() === true) {
            showTiedResult();
        } else {
            changeTurn();
            cpuTakesTurn();
        }
    }
}

const changeTurn = () => {
    currentPlayer = currentPlayer == X_TEXT ? O_TEXT : X_TEXT;
    currentTurn = currentTurn == CPU ? PLAYER : CPU;
    $('.turn span').text(currentPlayer);
}

const autoBoxClicked = () => {
    // choose a random box from the available boxes
    let randomNumber = Math.floor(Math.random() * availableBoxes.length);

    // record the click
    gameBoard[availableBoxes[randomNumber]] = currentPlayer;
    $('#' + availableBoxes[randomNumber]).text(currentPlayer);
    $('#' + availableBoxes[randomNumber]).addClass(currentPlayer);

    // let the clicked box be removed from the available boxes
    availableBoxes.splice(availableBoxes.indexOf(availableBoxes[randomNumber]), 1);
}


// vs CPU mode 
const cpuTakesTurn = () => {
    // game hasn't started yet and if it's cpu's turn
    if (gameBoard.every(element => element === null)) {
        autoBoxClicked();
        changeTurn();
    } else {
        // game is in progress and if it's cpu's turn
        autoBoxClicked();

        // See if CPU has won the game
        if (playerHasWon() !== false) {
            showResult('cpu');
        } else if (playersTied() === true) {
            showTiedResult();
        } else {
            changeTurn();
        }
    }
}

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
            $('#' + box).addClass('win');
        })
    });

    $('.modal').addClass(currentPlayer);
    $('.modal h1 span').text(currentPlayer);
    $('.modal p').text(winner + ' WON!');
    
    if (winner === 'cpu') {
        cpuScore++;
        $('.opponent span').text(cpuScore);
    } else if (winner === 'player') {
        playerScore++;
        $('.me span').text(playerScore);
    }

    showModal();
}

const showTiedResult = () => {
    ties++;
    $('.ties span').text(ties);
    showModal();
}

const findInitialPlayer = () => {
    if ($('.me').hasClass('X')) {
        return 'player';
    } else {
        return 'cpu';
    }
}

const resetCurrentBoard = () => {
    gameBoard.fill(null);
    availableBoxes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    $('.grid-container div').text('');
    $('.grid-container div').removeClass('X');
    $('.grid-container div').removeClass('O');
    $('.grid-container div').removeClass('win');
    $('.modal').removeClass('X');
    $('.modal').removeClass('O');
    currentPlayer = X_TEXT;
}

const resetTheScore = () => {
    $('.me span').text(0);
    $('.ties span').text(0);
    $('.opponent span').text(0);
    playerScore = 0;
    cpuScore = 0;
    ties = 0;
}

const showModal = () => {
    setTimeout(() => $('.background-modal').css("display", "block"), 1000);
}

const nextRound = () => {
    resetCurrentBoard();
    $('.background-modal').css("display", "none");
    initializeGame();
}

const quickGame = () => {
    $.ajax('/', {
        type: 'GET',
        success: () => {
            $('.background-modal, .container').fadeOut(2000, () => {
                window.location.href = '/';
            })
        }
    });
}

$('.refresh').click((e) => {
    resetCurrentBoard();
    resetTheScore();
    initializeGame();
})

$('.quit').click(quickGame);
$('.next').click(nextRound);

initializeGame();