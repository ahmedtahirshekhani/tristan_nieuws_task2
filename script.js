// (function () {
//   const wordPool = {
//     'Makkelijk - 10 punten': [
//       'WEER','SPORT','ZON','REGIO','NIEUWS','PAGINA','FOTO','TIP','WEDSTRIJD','VERSLAG',
//       'WEEK','DAG','RUBRIEK','FEIT','KORT','KRANT','MELDING','ONLINE','LOKAAL','BRIEF',
//       'BLOG','SITE','VIDEO','LINK','ZOEK','GERUCHT','NOTITIE','LEZER','PERS','NIEUWSFEED'
//     ],
//     'Gemiddeld - 20 punten': [
//       'JOURNAAL','OMROEP','NATIONAAL','RAPPORT','ANALYSE','DEBAT','THEMA','OPINIE','SCOOP',
//       'BUITENLAND','INFORMATIE','ACTUEEL','KANAAL','REACTIE','STUDIE','MEDIA','ANALIST','PLATFORM','EDITIE',
//       'PODCAST','DOCUMENT','FACTCHECK','CENSUUR','STATEMENT','PUBLICIST','MAGAZINE','ESSAY','TENDENS','EDITORIAL'
//     ],
//     'Moeilijk - 30 punten': [
//       'REDACTIE','EXCLUSIEF','RECHTSZAAK','PARLEMENT','ONDERZOEK','AMBASSADE','MINISTER','STATISTIEK','COMMENTAAR',
//       'PROPAGANDA','DIPLOMAAT','POLITIEK','PUBLICATIE','EVACUATIE','PRESIDENT','REFERENDUM','COALITIE','SENSATIE',
//       'JOURNALIST','SANCTIES','SCHANDAAL','VERKLARING','INFLATIE','OPPOSITIE','REVOLUTIE','STEMRECHT','MIGRATIE',
//       'DISCUSSIE','BESLUITEN','VERKIEZING'
//     ]
//   };

//   const pickRandomWords = (list, n) => list.sort(() => 0.5 - Math.random()).slice(0, n);

//   const GRID_SIZE = 11;
//   const directions = [
//     [0, 1],  [0, -1],
//     [1, 0],  [-1, 0],
//     [1, 1],  [1, -1],
//     [-1, 1], [-1, -1]
//   ];

//   let puzzle = [];
//   let cellElements = [];
//   let wordPositionsMap = {}; 
//   let foundWords = new Set();

//   let score = 0;
//   let hintsLeft = 3;
//   let selectedWords = {};

//   let timerInterval = null;
//   let startTime = 0;

//   let totalWordsCount = 0;
//   let totalMaxPoints = 0;

//   const introScreen = document.getElementById("woordzoeker-intro-screen");
//   const gameScreen = document.getElementById("woordzoeker-game-screen");
//   const endScreen = document.getElementById("woordzoeker-end-screen");

//   const grid = document.getElementById("woordzoeker-grid");
//   const wordList = document.getElementById("woordzoeker-word-list");
//   const scoreDisplay = document.getElementById("woordzoeker-score");
//   const hintBtn = document.getElementById("woordzoeker-hint-btn");
//   const startBtn = document.getElementById("woordzoeker-btn-start");
//   const restartBtn = document.getElementById("woordzoeker-restart-btn");
//   const newGameBtn = document.getElementById("woordzoeker-btn-newgame");

//   const timerDisplay = document.getElementById("woordzoeker-timer");
//   const endFoundWords = document.getElementById("end-found-words");
//   const endScore = document.getElementById("end-score");
//   const endTime = document.getElementById("end-time");
//   const endMaxPoints = document.getElementById("end-max-points");

//   function updateScore() {
//     scoreDisplay.textContent = `Score: ${score}`;
//   }

//   function updateHintButton() {
//     hintBtn.textContent = `Hint (${hintsLeft}/3)`;
//     hintBtn.disabled = (hintsLeft === 0);
//   }

//   function generateEmptyGrid() {
//     return Array(GRID_SIZE * GRID_SIZE).fill(" ");
//   }

//   function placeWord(grid, word) {
//     for (let attempt = 0; attempt < 500; attempt++) {
//       const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
//       const startRow = Math.floor(Math.random() * GRID_SIZE);
//       const startCol = Math.floor(Math.random() * GRID_SIZE);

//       let fits = true;
//       const positions = [];

//       for (let i = 0; i < word.length; i++) {
//         const rr = startRow + i * dr;
//         const cc = startCol + i * dc;
//         if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) {
//           fits = false;
//           break;
//         }
//         const idx = rr * GRID_SIZE + cc;
//         if (grid[idx] !== " " && grid[idx] !== word[i]) {
//           fits = false;
//           break;
//         }
//         positions.push(idx);
//       }
//       if (fits) {
//         positions.forEach((p, i) => grid[p] = word[i]);
//         return positions;
//       }
//     }
//     return null;
//   }

//   function placeAllWords(allWords, grid, map) {
//     allWords.sort((a, b) => b.length - a.length);
//     for (const w of allWords) {
//       const pos = placeWord(grid, w);
//       if (!pos) {
//         return false;
//       }
//       map[w] = pos;
//     }
//     return true;
//   }

//   function fillGridRandom(grid) {
//     const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     for (let i = 0; i < grid.length; i++) {
//       if (grid[i] === " ") {
//         grid[i] = letters[Math.floor(Math.random() * letters.length)];
//       }
//     }
//   }

//   function createGrid() {
//     grid.innerHTML = "";
//     cellElements = [];
//     for (let i = 0; i < puzzle.length; i++) {
//       const cell = document.createElement("div");
//       cell.className = "woordzoeker-letter-cell";
//       cell.textContent = puzzle[i];
//       cell.addEventListener("click", () => {
//         cell.classList.toggle("woordzoeker-highlight");
//         checkWords();
//       });
//       grid.appendChild(cell);
//       cellElements.push(cell);
//     }
//   }

//   function buildWordList() {
//     wordList.innerHTML = "";
//     totalMaxPoints = 0;

//     Object.entries(selectedWords).forEach(([label, words]) => {
//       const labelItem = document.createElement("li");
//       labelItem.innerHTML = `<b>${label}</b>`;
//       wordList.appendChild(labelItem);

//       const pts = parseInt(label.match(/\d+/)[0]) || 0;
//       words.forEach(w => {
//         const li = document.createElement("li");
//         li.textContent = w;
//         li.dataset.word = w;
//         li.dataset.points = pts;
//         wordList.appendChild(li);
//         totalMaxPoints += pts;
//       });
//     });
//   }

//   function countDiagonalWords(map) {
//     let count = 0;
//     for (const [word, positions] of Object.entries(map)) {
//       if (positions.length <= 1) continue;
//       const i1 = positions[0], i2 = positions[1];
//       const r1 = Math.floor(i1 / GRID_SIZE), c1 = i1 % GRID_SIZE;
//       const r2 = Math.floor(i2 / GRID_SIZE), c2 = i2 % GRID_SIZE;
//       const dr = r2 - r1, dc = c2 - c1;
//       if (dr !== 0 && dc !== 0) {
//         count++;
//       }
//     }
//     return count;
//   }

//   function checkWords() {
//     Object.entries(selectedWords).flatMap(e => e[1]).forEach(word => {
//       const pos = wordPositionsMap[word];
//       if (!pos) return;
//       const allHighlighted = pos.every(i => cellElements[i].classList.contains("woordzoeker-highlight"));
//       const li = wordList.querySelector(`li[data-word='${word}']`);
//       if (allHighlighted && !foundWords.has(word)) {
//         li.classList.add("woordzoeker-found");
//         foundWords.add(word);
//         score += parseInt(li.dataset.points);
//         updateScore();
//       } else if (!allHighlighted && foundWords.has(word)) {
//         li.classList.remove("woordzoeker-found");
//         foundWords.delete(word);
//         score -= parseInt(li.dataset.points);
//         updateScore();
//       }
//     });

//     if (foundWords.size === totalWordsCount) {
//       setTimeout(endGame, 600);
//     }
//   }

//   function startTimer() {
//     startTime = Date.now();
//     timerInterval = setInterval(() => {
//       const elapsedMs = Date.now() - startTime;
//       const seconds = Math.floor(elapsedMs / 1000);
//       timerDisplay.textContent = `Tijd: ${seconds}s`;
//     }, 1000);
//   }

//   function stopTimer() {
//     clearInterval(timerInterval);
//     timerInterval = null;
//   }

//   function startGame() {
//     document.getElementById("header").classList.add("top-left");
//     document.getElementById("logo").style.display = 'block';
//     console.log("Start game");

//     foundWords.clear();
//     score = 0;
//     hintsLeft = 3;
//     updateScore();
//     updateHintButton();

//     selectedWords = {};
//     Object.entries(wordPool).forEach(([label, list]) => {
//       selectedWords[label] = pickRandomWords(list, 4);
//     });
//     const allWords = Object.values(selectedWords).flat();
//     totalWordsCount = allWords.length;

//     let attemptCount = 0;
//     let puzzleReady = false;

//     while (!puzzleReady && attemptCount < 500) {
//       attemptCount++;
//       puzzle = generateEmptyGrid();
//       wordPositionsMap = {};

//       let placedAll = placeAllWords(allWords, puzzle, wordPositionsMap);
//       if (!placedAll) continue;

//       fillGridRandom(puzzle);

//       let diagCount = countDiagonalWords(wordPositionsMap);
//       if (diagCount < 2) {
//         continue;
//       }

//       puzzleReady = true;
//     }

//     createGrid();
//     buildWordList();

//     introScreen.style.display = "none";
//     endScreen.style.display = "none";
//     gameScreen.style.display = "block";

//     startTimer();
//   }

//   function resetGame() {
//     stopTimer();
//     gameScreen.style.display = "none";
//     endScreen.style.display = "none";
//     introScreen.style.display = "block";
//   }

//   function endGame() {
//     stopTimer();
//     gameScreen.style.display = "none";
//     endScreen.style.display = "block";

//     const elapsedMs = Date.now() - startTime;
//     const seconds = Math.floor(elapsedMs / 1000);

//     endFoundWords.textContent = `${foundWords.size} / ${totalWordsCount}`;
//     endScore.textContent = score;
//     endTime.textContent = `${seconds} seconden`;
//     endMaxPoints.textContent = totalMaxPoints;
//   }

//   startBtn.onclick = startGame;
//   hintBtn.onclick = () => {
//     if (hintsLeft <= 0) return;

//     const remaining = Object.values(selectedWords).flat().filter(w => !foundWords.has(w));
//     if (!remaining.length) return;
//     const randomWord = remaining[Math.floor(Math.random() * remaining.length)];
//     const positions = wordPositionsMap[randomWord];
//     if (!positions) return;

//     const unhighlighted = positions.filter(i => !cellElements[i].classList.contains("woordzoeker-highlight"));
//     if (unhighlighted.length) {
//       const rCell = unhighlighted[Math.floor(Math.random() * unhighlighted.length)];
//       cellElements[rCell].classList.add("woordzoeker-highlight", "woordzoeker-hint");
//     }

//     hintsLeft--;
//     score -= 5;
//     updateScore();
//     updateHintButton();
//     checkWords();
//   };

//   restartBtn.onclick = resetGame;
//   newGameBtn.onclick = resetGame;
// })();



(function () {
  const wordPool = {
    'Makkelijk - 10 punten': [
      'WEER','SPORT','ZON','REGIO','NIEUWS','PAGINA','FOTO','TIP','WEDSTRIJD','VERSLAG',
      'WEEK','DAG','RUBRIEK','FEIT','KORT','KRANT','MELDING','ONLINE','LOKAAL','BRIEF',
      'BLOG','SITE','VIDEO','LINK','ZOEK','GERUCHT','NOTITIE','LEZER','PERS','NIEUWSFEED'
    ],
    'Gemiddeld - 20 punten': [
      'JOURNAAL','OMROEP','NATIONAAL','RAPPORT','ANALYSE','DEBAT','THEMA','OPINIE','SCOOP',
      'BUITENLAND','INFORMATIE','ACTUEEL','KANAAL','REACTIE','STUDIE','MEDIA','ANALIST','PLATFORM','EDITIE',
      'PODCAST','DOCUMENT','FACTCHECK','CENSUUR','STATEMENT','PUBLICIST','MAGAZINE','ESSAY','TENDENS','EDITORIAL'
    ],
    'Moeilijk - 30 punten': [
      'REDACTIE','EXCLUSIEF','RECHTSZAAK','PARLEMENT','ONDERZOEK','AMBASSADE','MINISTER','STATISTIEK','COMMENTAAR',
      'PROPAGANDA','DIPLOMAAT','POLITIEK','PUBLICATIE','EVACUATIE','PRESIDENT','REFERENDUM','COALITIE','SENSATIE',
      'JOURNALIST','SANCTIES','SCHANDAAL','VERKLARING','INFLATIE','OPPOSITIE','REVOLUTIE','STEMRECHT','MIGRATIE',
      'DISCUSSIE','BESLUITEN','VERKIEZING'
    ]
  };

  const pickRandomWords = (list, n) => list.sort(() => 0.5 - Math.random()).slice(0, n);

  const GRID_SIZE = 11;
  const directions = [
    [0, 1],  [0, -1],
    [1, 0],  [-1, 0],
    [1, 1],  [1, -1],
    [-1, 1], [-1, -1]
  ];

  let puzzle = [];
  let cellElements = [];
  let wordPositionsMap = {}; 
  let foundWords = new Set();

  let score = 0;
  let hintsLeft = 3;
  let selectedWords = {};

  let timerInterval = null;
  let startTime = 0;

  let totalWordsCount = 0;
  let totalMaxPoints = 0;

  const introScreen = document.getElementById("woordzoeker-intro-screen");
  const gameScreen = document.getElementById("woordzoeker-game-screen");
  const endScreen = document.getElementById("woordzoeker-end-screen");

  const grid = document.getElementById("woordzoeker-grid");
  const wordList = document.getElementById("woordzoeker-word-list");
  const scoreDisplay = document.getElementById("woordzoeker-score");
  const hintBtn = document.getElementById("woordzoeker-hint-btn");
  const startBtn = document.getElementById("woordzoeker-btn-start");
  const restartBtn = document.getElementById("woordzoeker-restart-btn");
  const newGameBtn = document.getElementById("woordzoeker-btn-newgame");

  const timerDisplay = document.getElementById("woordzoeker-timer");
  const endFoundWords = document.getElementById("end-found-words");
  const endScore = document.getElementById("end-score");
  const endTime = document.getElementById("end-time");
  const endMaxPoints = document.getElementById("end-max-points");

  function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
  }

  function updateHintButton() {
    hintBtn.textContent = `Hint (${hintsLeft}/3)`;
    hintBtn.disabled = (hintsLeft === 0);
  }

  function generateEmptyGrid() {
    return Array(GRID_SIZE * GRID_SIZE).fill(" ");
  }

  function placeWord(grid, word) {
    for (let attempt = 0; attempt < 500; attempt++) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * GRID_SIZE);
      const startCol = Math.floor(Math.random() * GRID_SIZE);

      let fits = true;
      const positions = [];

      for (let i = 0; i < word.length; i++) {
        const rr = startRow + i * dr;
        const cc = startCol + i * dc;
        if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) {
          fits = false;
          break;
        }
        const idx = rr * GRID_SIZE + cc;
        if (grid[idx] !== " " && grid[idx] !== word[i]) {
          fits = false;
          break;
        }
        positions.push(idx);
      }
      if (fits) {
        positions.forEach((p, i) => grid[p] = word[i]);
        return positions;
      }
    }
    return null;
  }

  function placeAllWords(allWords, grid, map) {
    allWords.sort((a, b) => b.length - a.length);
    for (const w of allWords) {
      const pos = placeWord(grid, w);
      if (!pos) {
        return false;
      }
      map[w] = pos;
    }
    return true;
  }

  function fillGridRandom(grid) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === " ") {
        grid[i] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  function createGrid() {
    grid.innerHTML = "";
    cellElements = [];
    for (let i = 0; i < puzzle.length; i++) {
        const cell = document.createElement("div");
        cell.className = "woordzoeker-letter-cell";
        cell.textContent = puzzle[i];

        // Make the cells draggable
        cell.setAttribute("draggable", "true");

        // Start drag
        cell.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text", i); // Store the index of the selected cell
            cell.classList.add("woordzoeker-dragging");
        });

        // Drag over (needed to allow dropping)
        cell.addEventListener("dragover", (e) => {
            e.preventDefault(); // Necessary to allow dropping
            cell.classList.add("woordzoeker-hover");
        });

        // End drag
        cell.addEventListener("dragend", () => {
            cell.classList.remove("woordzoeker-dragging");
            cell.classList.remove("woordzoeker-hover");
            // remove from all sells
            cellElements.forEach(c => c.classList.remove("woordzoeker-hover"));

        });

        // Drop event (to handle the selection logic)
        cell.addEventListener("drop", (e) => {
            e.preventDefault();
            const draggedIndex = e.dataTransfer.getData("text"); // Get the dragged cell's index
            const draggedCell = cellElements[draggedIndex];
            
            // Calculate the direction and toggle selection
            const { isValidWord, selectedWord } = toggleSelection(draggedCell, cell);
            console.log('isValidWord', isValidWord)
            if (isValidWord) {
                // Lock valid word
                checkWords(selectedWord);
            }
        });

        grid.appendChild(cell);
        cellElements.push(cell);
    }
}

function toggleSelection(startCell, endCell) {
    const startIndex = cellElements.indexOf(startCell);
    const endIndex = cellElements.indexOf(endCell);

    // Clear previous selection
    cellElements.forEach(cell => {
        cell.classList.remove("woordzoeker-highlight");
    });

    // Calculate the row and column positions of the cells
    const startRow = Math.floor(startIndex / GRID_SIZE);
    const startCol = startIndex % GRID_SIZE;
    const endRow = Math.floor(endIndex / GRID_SIZE);
    const endCol = endIndex % GRID_SIZE;

    // Determine direction
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;

    // Determine if the selection is diagonal
    const isDiagonal = Math.abs(rowDiff) === Math.abs(colDiff);

    let selectedCells = [];

    // Handle horizontal (left to right or right to left)
    if (rowDiff === 0) {
        const direction = colDiff > 0 ? 1 : -1;
        for (let i = 0; i <= Math.abs(colDiff); i++) {
            const index = startIndex + i * direction;
            selectedCells.push(cellElements[index]);
        }
    }
    // Handle vertical (top to bottom or bottom to top)
    else if (colDiff === 0) {
        const direction = rowDiff > 0 ? GRID_SIZE : -GRID_SIZE;
        for (let i = 0; i <= Math.abs(rowDiff); i++) {
            const index = startIndex + i * direction;
            selectedCells.push(cellElements[index]);
        }
    }
    // Handle diagonal (forward or reverse)
    else if (isDiagonal) {
        const rowDirection = rowDiff > 0 ? GRID_SIZE : -GRID_SIZE;
        const colDirection = colDiff > 0 ? 1 : -1;
        const steps = Math.abs(rowDiff);
        for (let i = 0; i <= steps; i++) {
            const index = startIndex + i * rowDirection + i * colDirection;
            selectedCells.push(cellElements[index]);
        }
    }

    // Highlight selected cells
    selectedCells.forEach(cell => {
        cell.classList.add("woordzoeker-highlight");
    });

    const selectedWord = selectedCells.map(cell => cell.textContent).join("");
    const isValidWord = validateWord(selectedWord);
    console.log('selectedWord', selectedWord)

    // If the word is invalid, remove selection
    if (!isValidWord) {
        selectedCells.forEach(cell => {
            cell.classList.remove("woordzoeker-highlight");
        });
        return { isValidWord: false, selectedWord: selectedWord };
    }

    return { isValidWord: true, selectedWord: selectedWord };
}

function validateWord(word) {
    // Check if the word is valid (exists in the word list)
    for (const [label, words] of Object.entries(selectedWords)) {
        if (words.includes(word)) {
            return true; // Valid word
        }
    }
    return false; // Invalid word
}

function checkWords(selectedWord) {
  
  // Check if the word is valid (exists in the word list)
  selectedCells = cellElements.filter(cell => cell.classList.contains("woordzoeker-highlight"));
  console.log('selectedCells', selectedCells)

  // Mark the word as found in the word list
  const wordListItem = wordList.querySelector(`li[data-word='${selectedWord}']`);
  if (wordListItem) {
      wordListItem.classList.add("woordzoeker-found");
      foundWords.add(selectedWord);
      score += parseInt(wordListItem.dataset.points); // Add points for the found word
      updateScore(); // Update the score on the screen
  }
  
  const colorSelect = [
    "#e03131",   // Original Red
    "#c92a2a",   // Darker Red
    "#9e1b1b",   // Even darker Red
    "#ff5733",   // Red-Orange
    "#e04a00",   // Dark Orange-Red
    "#ff4d6d",   // Pinkish Red
    "#d63384",   // Dark Pink
    "#e1008c",   // Hot Pink
    "#a50032",   // Dark Red-Pink
    "#d93025",   // Dark Red-Orange
    "#bd2130"    // Strong Red-Pink
];
  const randomColor = colorSelect[Math.floor(Math.random() * colorSelect.length)];
  // Lock the word by making its cells dark blue
  selectedCells.forEach(cell => {
      cell.classList.add("woordzoeker-locked");
      cell.classList.remove("woordzoeker-highlight"); // Remove highlight from locked cells
      // add random color
      cell.style.backgroundColor = randomColor;

      cell.setAttribute("draggable", "false"); // Prevent further dragging
  });
  if (foundWords.size === totalWordsCount) {
    setTimeout(endGame, 600);
  }

}

  function buildWordList() {
    wordList.innerHTML = "";
    totalMaxPoints = 0;

    Object.entries(selectedWords).forEach(([label, words]) => {
      const labelItem = document.createElement("li");
      labelItem.innerHTML = `<b>${label}</b>`;
      wordList.appendChild(labelItem);

      const pts = parseInt(label.match(/\d+/)[0]) || 0;
      words.forEach(w => {
        const li = document.createElement("li");
        li.textContent = w;
        li.dataset.word = w;
        li.dataset.points = pts;
        wordList.appendChild(li);
        totalMaxPoints += pts;
      });
    });
  }

  function countDiagonalWords(map) {
    let count = 0;
    for (const [word, positions] of Object.entries(map)) {
      if (positions.length <= 1) continue;
      const i1 = positions[0], i2 = positions[1];
      const r1 = Math.floor(i1 / GRID_SIZE), c1 = i1 % GRID_SIZE;
      const r2 = Math.floor(i2 / GRID_SIZE), c2 = i2 % GRID_SIZE;
      const dr = r2 - r1, dc = c2 - c1;
      if (dr !== 0 && dc !== 0) {
        count++;
      }
    }
    return count;
  }

  

  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      const seconds = Math.floor(elapsedMs / 1000);
      timerDisplay.textContent = `Tijd: ${seconds}s`;
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function startGame() {
    document.getElementById("header").classList.add("top-left");
    document.getElementById("logo").style.display = 'block';
    if (window.innerWidth < 600) {
      document.getElementById("logo").style.height = '20px';        
    }


    console.log("Start game");

    foundWords.clear();
    score = 0;
    hintsLeft = 3;
    updateScore();
    updateHintButton();

    selectedWords = {};
    Object.entries(wordPool).forEach(([label, list]) => {
      selectedWords[label] = pickRandomWords(list, 4);
    });
    const allWords = Object.values(selectedWords).flat();
    totalWordsCount = allWords.length;

    let attemptCount = 0;
    let puzzleReady = false;

    while (!puzzleReady && attemptCount < 500) {
      attemptCount++;
      puzzle = generateEmptyGrid();
      wordPositionsMap = {};

      let placedAll = placeAllWords(allWords, puzzle, wordPositionsMap);
      if (!placedAll) continue;

      fillGridRandom(puzzle);

      let diagCount = countDiagonalWords(wordPositionsMap);
      if (diagCount < 2) {
        continue;
      }

      puzzleReady = true;
    }

    createGrid();
    buildWordList();

    introScreen.style.display = "none";
    endScreen.style.display = "none";
    gameScreen.style.display = "block";

    startTimer();
  }

  function resetGame() {
    stopTimer();
    gameScreen.style.display = "none";
    endScreen.style.display = "none";
    introScreen.style.display = "block";
  }

  function endGame() {
    stopTimer();
    gameScreen.style.display = "none";
    endScreen.style.display = "block";

    const elapsedMs = Date.now() - startTime;
    const seconds = Math.floor(elapsedMs / 1000);

    endFoundWords.textContent = `${foundWords.size} / ${totalWordsCount}`;
    endScore.textContent = score;
    endTime.textContent = `${seconds} seconden`;
    endMaxPoints.textContent = totalMaxPoints;
  }

  startBtn.onclick = startGame;
  hintBtn.onclick = () => {
    if (hintsLeft <= 0) return;

    const remaining = Object.values(selectedWords).flat().filter(w => !foundWords.has(w));
    if (!remaining.length) return;
    const randomWord = remaining[Math.floor(Math.random() * remaining.length)];
    const positions = wordPositionsMap[randomWord];
    if (!positions) return;

    const unhighlighted = positions.filter(i => !cellElements[i].classList.contains("woordzoeker-highlight"));
    if (unhighlighted.length) {
      const rCell = unhighlighted[Math.floor(Math.random() * unhighlighted.length)];
      cellElements[rCell].classList.add("woordzoeker-highlight", "woordzoeker-hint");
    }

    hintsLeft--;
    score -= 5;
    updateScore();
    updateHintButton();
    // checkWords();
  };

  restartBtn.onclick = resetGame;
  newGameBtn.onclick = resetGame;
})();


