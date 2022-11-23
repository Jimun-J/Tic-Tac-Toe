# Tic-Tac-Toe
 Tic Tac Toe. This game provides PvP and CPU mode.
 - [Website](https://tictactoe-jimun.herokuapp.com/)

### The challenge
- Game logic
- Creating multiple rooms using socket 
- Mapping users to specific rooms
- Limiting users in each room
- Handling users leaving the room during the game

### Screenshot
#### Home
![](./home.png?raw=true "Landing Page")
#### vs CPU
![](./vs-cpu.png?raw=true "vs CPU Page")
#### vs Player
![](./vs-player.png?raw=true "vs CPU Page")

### My process
#### Built with
- Semantic HTML5 markup
- CSS custom properties
- CSS Grid
- Node & Express (server)
- socket.io (creating multiple rooms and broadcasting events.. ex) clicking game board, leaving the game)
- EJS (view engine)
- heroku (app hosting)

### Author
- Website - [Jimun Jang](https://tictactoe-jimun.herokuapp.com/)
- Design Reference - [Design](https://www.frontendmentor.io/challenges/tic-tac-toe-game-Re7ZF_E2v)


### Next Steps
- separate game logic into a separate file (modularize)
- level of difficulties in CPU mode (from randomly clicking to actually blocking the winning rows)
- time clock in (vs player) mode
- save player info in the database (such as player's winning rate)
