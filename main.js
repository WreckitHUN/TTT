/* 
SDDAdasfsafdsfdfd
 */

function game() {
  const _rows = 3;
  const _columns = 3;
  /* Creating the game area array         [[ [0],[0],[0] ],
                                             [ [0],[0],[0] ],
                                             [ [0],[0],[0] ]]
    */
  let _board = [];
  createBoard();
  function createBoard() {
    for (let i = 0; i < _rows; i++) {
      _board[i] = [];
      for (let j = 0; j < _columns; j++) {
        _board[i].push(Cell());
      }
    }
  }

  // The cell function for populating the board
  function Cell(playerValue = 0) {
    let _value = playerValue;

    return {
      get value() {
        return _value;
      },
      set value(value) {
        _value = value;
      },
    };
  }

  // For debug
  function printBoard() {
    const printedBoard = _board.map((row) => row.map((cell) => cell.value));
    console.log(printedBoard);
  }

  // When a player chooses a cell
  function playRound(row, col, activePlayer) {
    // First make sure this is an empty cell if not return false
    if (_board[row][col].value !== 0) return false;
    _board[row][col].value = activePlayer;
    printBoard();
    return true;
  }

  // Clear the board
  function clearBoard() {
    // Delete the board
    _board = [];
    createBoard();
    printBoard();
  }

  return {
    playRound,
    clearBoard,
    get board() {
      return _board;
    },
    get rows() {
      return _rows;
    },
    get columns() {
      return _columns;
    },
  };
}

function gameController(playerOne = "Player One", playerTwo = "Player Two") {
  let _winCounter1 = 0;
  let _winCounter2 = 0;
  const _gameBoard = game();
  const _rows = _gameBoard.rows;
  const _columns = _gameBoard.columns;
  let _emptyCells = [];
  let _someOneWon = false;
  let _isDraw = false;

  const winConditions = [
    // Horizontal
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Vertical
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonal
    [0, 4, 8],
    [2, 4, 6],
  ];

  // Creating the players
  const players = [
    {
      name: playerOne,
      value: 1,
    },
    {
      name: playerTwo,
      value: 2,
    },
  ];

  // Setting the active player
  // TO DO randomize maybe
  let _activePlayer = players[0];

  // Switching the active player status
  function switchActivePlayer() {
    _activePlayer = _activePlayer === players[0] ? players[1] : players[0];
  }

  // Playing a round
  function playRound(row, col) {
    console.log(_activePlayer.name);
    // If someone Won already or its draw return
    if (_someOneWon || _isDraw) return 5;
    // Check if it is a valid play (not occupied)
    let validPlay = _gameBoard.playRound(row, col, _activePlayer.value);
    if (!validPlay) {
      console.log("occupied");
      return false;
    }
    // Check if someone won the round
    let someoneWon = checkWin();
    if (someoneWon) {
      _activePlayer === players[0] ? _winCounter1++ : _winCounter2++;
      console.log(_winCounter1);
      console.log(`${_activePlayer.name} WON`);
      // Return 1 if player1 Won 3 times
      if (_winCounter1 >= 3) return 1;
      // Return 2 if player2 Won 3 times
      if (_winCounter2 >= 3) return 2;
      // TO DO
      _someOneWon = true;
    }
    // Check if it is DRAW
    if (checkDraw() && !_someOneWon) {
      console.log("ITS DRAW");
      _isDraw = true;
    }

    switchActivePlayer();
    return true;
  }

  function checkWin() {
    // Clear empty cells before repopulating it
    _emptyCells = [];
    // Get the current board
    let currentBoard = _gameBoard.board;
    // Get the activePlayer's selections [0, 1, ...] and All the empty cells
    let activeSelection = [];
    for (let i = 0; i < _rows; i++) {
      for (let j = 0; j < _columns; j++) {
        // Current Selection
        if (currentBoard[i][j].value === _activePlayer.value)
          activeSelection.push(i * _columns + j);
        // Empty Cells
        if (currentBoard[i][j].value === 0) _emptyCells.push([i, j]);
      }
    }
    for (let i = 0; i < winConditions.length; i++) {
      if (
        activeSelection.includes(winConditions[i][0]) &&
        activeSelection.includes(winConditions[i][1]) &&
        activeSelection.includes(winConditions[i][2])
      )
        return true;
    }
    return false;
  }

  function checkDraw() {
    // Return true if its DRAW
    if (_emptyCells === undefined || _emptyCells.length === 0) return true;
    return false;
  }

  function clearBoard() {
    // Clear the board and restarts the round
    _gameBoard.clearBoard();
    _activePlayer = players[0];
    _someOneWon = false;
    _isDraw = false;
  }

  function restartGame() {
    clearBoard();
    _winCounter1 = 0;
    _winCounter2 = 0;
  }

  return {
    playRound,
    clearBoard,
    restartGame,
    get winCounter1() {
      return _winCounter1;
    },
    get winCounter2() {
      return _winCounter2;
    },
    get board() {
      return _gameBoard.board;
    },
    get activePlayer() {
      return _activePlayer;
    },
    get emptyCells() {
      return _emptyCells;
    },
  };
}

function screenController(playerOne, playerTwo, ai = false) {
  let p1Won3inaRow = false;
  let p2Won3inaRow = false;
  let aiEnabled = ai;
  // Create controller
  const _GAME = gameController(playerOne, playerTwo);

  // UI elements
  const restartButton = document.querySelector("#restartRound");
  const restartGameButton = document.querySelector("#restartGame");
  restartButton.addEventListener("click", restartRound);
  restartGameButton.addEventListener("click", restartGame);

  // Get the turn and board elements
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const p1Counter = document.querySelector(".p1Counter");
  const p2Counter = document.querySelector(".p2Counter");

  function initialRender() {
    // Clear the board
    boardDiv.textContent = "";
    // Get the active player
    const activePlayer = _GAME.activePlayer;
    // Display player's turn
    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;
    // Display player counter
    p1Counter.textContent = `${playerOne}: ${_GAME.winCounter1}`;
    p2Counter.textContent = `${playerTwo}: ${_GAME.winCounter2}`;
    // Render board squares
    _GAME.board.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        // Create a data attribute to identify the row and column
        cellButton.dataset.row = i;
        cellButton.dataset.column = j;
        boardDiv.appendChild(cellButton);
      });
    });
    hoverChange(activePlayer);
  }

  // cell is a button element
  function updateScreen(cell) {
    if (cell === undefined) return;
    // If someone won the game just return
    if (p1Won3inaRow || p2Won3inaRow) return;
    // Get the active Player
    let activePlayer = _GAME.activePlayer;
    // Get the coordinates of the cell
    const selectedCellRow = cell.dataset.row;
    const selectedCellColumn = cell.dataset.column;
    // Check if play is valid PLAY the round
    let isValid = _GAME.playRound(selectedCellRow, selectedCellColumn);
    if (!isValid) return;
    // Check if someone WON a round or its Draw
    if (isValid === 5) return;
    // Check if someone WIN the GAME
    if (isValid === 1) {
      console.log("Player 1 3 in a row");
      p1Won3inaRow = true;
    }
    if (isValid === 2) {
      console.log("Player2 3 in a row");
      p2Won3inaRow = true;
    }
    // Update the winCounter
    p1Counter.textContent = `${playerOne}: ${_GAME.winCounter1}`;
    p2Counter.textContent = `${playerTwo}: ${_GAME.winCounter2}`;
    // Change the cell's color
    cell.classList.add(`p${activePlayer.value}`);
    // Get the next active player
    let nextActivePlayer = _GAME.activePlayer;
    // Display player's turn
    playerTurnDiv.textContent = `${nextActivePlayer.name}'s turn...`;
    // Change the hover color
    hoverChange(nextActivePlayer);
  }

  // Add event listener for the board
  function clickHandlerBoard(e) {
    const cell = e.target;
    // Get the coordinates of the cell
    const selectedCellRow = cell.dataset.row;
    // Make sure I've clicked a cell and not the gaps in between
    if (!selectedCellRow) return;
    updateScreen(cell);

    if (!aiEnabled) return;
    setTimeout(() => {
      updateScreen(aiController());
    }, 2000);
  }

  // ai controller
  function aiController() {
    // Get the empty cells
    let emptyCells = _GAME.emptyCells;

    if (emptyCells === undefined || emptyCells.length === 0) return undefined;

    // Get a random cell from the empty cells
    let randomCell = randomNumber(emptyCells);

    // Find the same button on the board
    let row = randomCell[0];
    let column = randomCell[1];
    const cell = document.querySelector(
      `[data-row="${row}"][data-column="${column}"]`
    );
    return cell;
  }

  // Change the hover color
  function hoverChange(activeP) {
    const cells = document.querySelectorAll(".cell:not(.p1):not(.p2)");

    cells.forEach((cell) => {
      // First remove all the hover classes
      cell.classList.remove("hoverP1", "hoverP2");
      // Set the desired hover class
      cell.classList.add(`hoverP${activeP.value}`);
    });
  }

  // Return a random array element from an array eg. [2,0] -> 2 or 0
  function randomNumber(arr) {
    let index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }

  boardDiv.addEventListener("click", clickHandlerBoard);

  function restartRound() {
    _GAME.clearBoard();
    initialRender();
  }

  function restartGame() {
    _GAME.restartGame();
    p1Won3inaRow = false;
    p2Won3inaRow = false;
    initialRender();
  }

  initialRender();
}

screenController("P1", "P2", false);
