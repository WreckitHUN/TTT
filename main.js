function game(){
    const _rows = 3;
    const _columns = 3;
    /* Creating the game area array         [[ [0],[0],[0] ],
                                             [ [0],[0],[0] ],
                                             [ [0],[0],[0] ]]
    */
    let _board = [];
    createBoard();
    function createBoard(){
        for (let i = 0; i < _rows; i++ ){
            _board[i] = [];
            for (let j = 0; j < _columns; j++){
                _board[i].push(Cell());
            }
        }
    }

    // The cell function for populating the board
    function Cell(playerValue = 0){
        let _value = playerValue;
    
        return {
            get value(){
                return _value;
            },
            set value(value){
                _value = value;
            }
        };
    }

    // For debug
    function printBoard(){
        const printedBoard = _board.map((row) => row.map(cell => cell.value));
        console.log(printedBoard);
    }

    // When a player chooses a cell
    function playRound(row, col, activePlayer){
        // First make sure this is an empty cell if not return false
        if (_board[row][col].value !== 0) return false;
        _board[row][col].value = activePlayer;
        printBoard();
        return true;
    }

    // Clear the board
    function clearBoard(){
        // Delete the board
        _board = [];
        createBoard();
        printBoard();
    }

    return {
        playRound,
        clearBoard,
        get board(){
            return _board;
        },
        get rows(){
            return _rows;
        },
        get columns(){
            return _columns;
        }
    }
}

function gameController(playerOne = "Player One", playerTwo = "Player Two"){
    let _winCounter1 = 0;
    let _winCounter2 = 0;
    const _gameBoard = game();
    const _rows = _gameBoard.rows;
    const _columns = _gameBoard.columns;
    let _emptyCells = [];
    let _someOneWon = false;

    const winConditions = [
        // Horizontal
        [0,1,2], [3,4,5], [6,7,8],
        // Vertical
        [0,3,6], [1,4,7], [2,5,8],
        // Diagonal
        [0,4,8], [2,4,6]
    ]

    // Creating the players
    const players = [
        {
            name: playerOne,
            value: 1,
        },
        {
            name: playerTwo,
            value: 2,
        }
    ];

    // Setting the active player
    // TO DO randomize maybe
    let _activePlayer = players[0];

    // Switching the active player status
    function switchActivePlayer(){
        _activePlayer = _activePlayer === players[0] ? players[1] : players[0];
    }

    // Playing a round
    function playRound(row, col){
        console.log(_activePlayer.name);
        // If someone Won already return
        if (_someOneWon) return 5;
        // Check if it is a valid play (not occupied)
        let validPlay = _gameBoard.playRound(row, col, _activePlayer.value);
        if(!validPlay){
            console.log("occupied");
            return false;
        } 
        // Check if someone won the round
        let someoneWon = checkWin();
        if(someoneWon) {
            _activePlayer === players[0] ? (_winCounter1++) : (_winCounter2++);
            console.log(_winCounter1);
            console.log(`${_activePlayer.name} WON`);
            // Return 1 if player1 Won 3 times
            if (_winCounter1 >= 3) return 1;
            // Return 2 if player2 Won 3 times
            if (_winCounter2 >= 3) return 2;
            // TO DO
            _someOneWon = true;
        }
        
        switchActivePlayer();
        return true;
    }

    function checkWin(){
        // Clear empty cells
        _emptyCells = [];
        // Get the current board
        let currentBoard = _gameBoard.board; 
        // Get the activePlayer's selections [0, 1, ...] and All the empty cells
        let activeSelection = [];
        for (let i = 0; i < _rows; i++){
            for (let j = 0; j < _columns; j++){
                // Current Selection
                if (currentBoard[i][j].value === _activePlayer.value) activeSelection.push(i * _columns + j);
                // Empty Cells
                if (currentBoard[i][j].value === 0) _emptyCells.push([i,j]);
            }
        }
        for (let i = 0; i < winConditions.length; i++){
            if (activeSelection.includes(winConditions[i][0]) &&
                activeSelection.includes(winConditions[i][1]) &&
                activeSelection.includes(winConditions[i][2])) return true;
        }
        return false;
    }

    function clearBoard(){
        // Clear the board
        _gameBoard.clearBoard();
        _activePlayer = players[0];
        _someOneWon = false;
        // TO DO
    }

    function restartGame(){
        clearBoard();
        _winCounter1 = 0;
        _winCounter2 = 0;
    }

    return {
        playRound,
        clearBoard,
        restartGame,
        get board(){
            return _gameBoard.board;
        },
        get activePlayer(){
            return _activePlayer;
        },
        get emptyCells(){
            return _emptyCells;
        },
        get rows(){
            return _rows;
        },
        get columns(){
            return _columns;
        }
    }
}

function aiController(playerOne = "Player One"){
    const _gameController = gameController(playerOne, "AI");

    const clearBoard = () => _gameController.clearBoard();

    // Check if it's AI's turn
    if (_gameController.activePlayer.name === "AI"){
        // AI's turn
        _gameController.playRound(randomNumber([0,1,2]), randomNumber([0,1,2]));
    }

    // MAKE THIS from screencontroller TO DO
    function playRound(row, col){
        // Player's turn
        // If it's invalid or someone won return
        if (!_gameController.playRound(row, col) ) return;
        
        // Get the empty cells
        let emptyCells = _gameController.emptyCells;

        // AI's turn
        // Get a random cell from the empty cells
        let randomCell = randomNumber(emptyCells);
        _gameController.playRound(randomCell[0], randomCell[1]);
        
         
    }
    
    // Return a random element from an array eg. [2,0] -> 2 or 0 
    function randomNumber(arr){
        let index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }
    

    return {
        playRound,
        clearBoard,
        get board(){
           return _gameController.board
        },
        get activePlayer(){
            return _gameController.activePlayer;
        },
        get rows(){
            return _gameController.rows;
        },
        get columns(){
            return _gameController.columns;
        }
    }
}

function screenController(playerOne, playerTwo){
    let aiEnabled = false;
    // Create controller 
    const _GAME = gameController(playerOne, playerTwo);

    // UI elements
    const restartButton = document.querySelector("#restart");
    restartButton.addEventListener("click", restartGame);

    // Get the dimensions of the board
    const _rows = _GAME.rows;
    const _columns = _GAME.columns;

    // Get the turn and board elements
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector(".board");

    function initialRender(){
        // Clear the board
        boardDiv.textContent = "";
            
        // Display player's turn
        playerTurnDiv.textContent = `${_GAME.activePlayer.name}'s turn...`

         // Render board squares
        _GAME.board.forEach((row, i) => {
            row.forEach((cell, j) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("cell");
                // Create a data attribute to identify the row and column
                cellButton.dataset.row = i;
                cellButton.dataset.column = j;
                cellButton.textContent = cell.value;
                boardDiv.appendChild(cellButton);
        })
      })
    }
    
    // cell is a button element
    function updateScreen(cell){
        // Get the active Player
        let activePlayer = _GAME.activePlayer;
        // Get the coordinates of the cell
        const selectedCellRow = cell.dataset.row;
        const selectedCellColumn = cell.dataset.column;
        // Check if play is valid
        let isValid = _GAME.playRound(selectedCellRow, selectedCellColumn);
        if (!isValid) return;
        // Check if someone WIN the GAME
        if (isValid === 1) console.log("3 in a row");
        if (isValid === 2) console.log("3 in a row");
        // Check if someone WON a round
        if (isValid === 5) return;
        // Put the value of the player into the cell
        cell.textContent = activePlayer.value;
        // Get the next active player
        let nextActivePlayer = _GAME.activePlayer;
        // Display player's turn
        playerTurnDiv.textContent = `${nextActivePlayer.name}'s turn...`;
        
    }

    // Add event listener for the board
    function clickHandlerBoard(e) {
        const cell = e.target;
        // Get the coordinates of the cell
        const selectedCellRow = cell.dataset.row;
        // Make sure I've clicked a cell and not the gaps in between
        if (!selectedCellRow) return;
        updateScreen(cell);
        
    }
    boardDiv.addEventListener("click", clickHandlerBoard);

    function restartGame(){
        _GAME.clearBoard();
        initialRender();
    }

    initialRender();
   
}

screenController("Szabolcs", "Péter");





























