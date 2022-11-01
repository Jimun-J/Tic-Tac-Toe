const express = require('express');
const app = express();

const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

let marker = '';

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/game-mode', (req, res) => {
    marker = req.body.marker;
    if (req.body.gameMode === 'vs-cpu') {
        res.redirect('/vs-cpu');
    } else {
        res.redirect('/vs-player');
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
    res.render('game-board', { marker, marker_opposite });
});

app.listen(3000, () => {
    console.log('server is running on port 3000');
});