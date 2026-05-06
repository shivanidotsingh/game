// --- YOUR LATEST 16x20 GRID ---
const gridText = [
  ". . . . . . . . V . A N U P A M",
  ". . C . . . . . A . M . . . . A",
  ". . H . B A A D S H A H . . . N",
  ". J U H I . . . C . N . Z E R O",
  ". . N . L O N D O N . . . . . J",
  ". . N . L . . . . . . . . . . .",
  ". . I . U . . . Y E S B O S S .",
  ". . . . B . . . . . . . N . . .",
  ". S . . A . . . . P R I E T Y .",
  "K A V E R I A M M A . . T . . .",
  ". A . . B . . . . H . . W . . .",
  ". T . . E . . . . E . . O . J .",
  ". H . . R . . . . L . . K . U .",
  ". I . . . . . . . I . G A N G A",
  ". Y . . G . . . . . . . F . . .",
  ". A K I R A . G . . . . O . . .",
  ". . . . E . . E . . D . U . K .",
  ". . . . E . . R . . A M R I T A",
  ". . . . C . . U . . R . . . V .",
  ". . . H E Y R A M . R . . . . ."
];

const grid = gridText.map(row => row.trim().split(/\s+/));
const ROWS = 20;
const COLS = 16;

const cluesList = [
  // Across
  ["ANUPAM", "Father who he greets with 'O Potchi, O Koka, O Bobi, O Lola'; the actor (6)"],
  ["BAADSHAH", "Film in which he throws walnut on mirror to prove he's not in love (8)"],
  ["JUHI", "When he doesn't end up with Anna, this actress makes a cameo at the end (4)"],
  ["ZERO", "In this film he plays Bauua from Meerut (4)"],
  ["LONDON", "Maya(aka Pooja)'s fiancé, lives here (6)"],
  ["YESBOSS", "In a popular song from this film, he's playing the piano on a truck (3,4)"],
  ["PRIETY", "When he's Amar they almost get married, as Dev they're getting divorced; the actress (6)"],
  ["KAVERIAMMA", "Mohan has come to India after many years for her (6,4)"],
  ["GANGA", "His 'Mehbooba', who shares her name with a river (5)"],
  ["AKIRA", "They meet in Ladakh, he calls her supergirl; Name is in the song 'Jiya Re' (5)"],
  ["AMRITA", "General Bakshi sends him to Darjeeling to protect her; the actress (6)"],
  ["HEYRAM", "His Tamil debut (3,3)"],
  // Down
  ["CHUNNI", "\"Apne hisse ki zindagi toh hum jee chuke ______ Babu\" (6)"],
  ["VASCO", "The Bicchhoos and Eagles are gangs in this city (5)"],
  ["AMAN", "As this character he says 'Yeh woh Geeta nahi hai jiske do gande gande bache hai?' (4)"],
  ["MANOJ", "Zaara's fiancé; the actor (5)"],
  ["PAHELI", "Sunil Shetty is his absent brother in this film (6)"],
  ["JUG", "As this character, he makes a parallel between choosing a kursi and choosing a life partner (3)"],
  ["BILLUBARBER", "Remake of a Malayalam film, loosely based on Krishna and Sudama (5,6)"],
  ["ONETWOKAFOUR", "Osaka Moraiya film (3,3,2,4)"],
  ["SAATHIYA", "He plays Tabu's husband in a cameo in this Tamil film's Hindi remake (8)"],
  ["GREECE", "He follows Priya to this country because he didn't want to say 'Kaash' (6)"],
  ["GERUA", " 🟠 (5)"],
  ["DARR", "His only film with Sunny Deol (4)"],
  ["KTV", "As Ajay Bakshi, he works for this channel (3)"]
];

// --- AUTO-DETECT WORDS IN GRID ---
function isWhite(r, c) { return grid[r] && grid[r][c] && grid[r][c] !== "."; }

function findWordsAndNumbering() {
  let num = 1;
  const numbering = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  const across = [], down = [];
  const used = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!isWhite(r, c)) continue;
      let isStartAcross = (c === 0 || !isWhite(r, c-1)) && (c+1 < COLS && isWhite(r, c+1));
      let isStartDown   = (r === 0 || !isWhite(r-1, c)) && (r+1 < ROWS && isWhite(r+1, c));
      if (isStartAcross || isStartDown) numbering[r][c] = num++;
      if (isStartAcross) {
        let len = 1;
        while (c+len < COLS && isWhite(r, c+len)) len++;
        let answer = grid[r].slice(c, c+len).join('');
        let idx = cluesList.findIndex(([ans]) => ans === answer);
        if (idx !== -1 && !used["A"+r+","+c]) {
          across.push({num: numbering[r][c], row: r, col: c, answer, clue: cluesList[idx][1], dir: 'across'});
          used["A"+r+","+c] = true;
        }
      }
      if (isStartDown) {
        let len = 1;
        let answer = '';
        while (r+len < ROWS && isWhite(r+len, c)) len++;
        for (let i = 0; i < len; i++) answer += grid[r+i][c];
        let idx = cluesList.findIndex(([ans]) => ans === answer);
        if (idx !== -1 && !used["D"+r+","+c]) {
          down.push({num: numbering[r][c], row: r, col: c, answer, clue: cluesList[idx][1], dir: 'down'});
          used["D"+r+","+c] = true;
        }
      }
    }
  }
  return {across, down, numbering};
}
const {across, down, numbering} = findWordsAndNumbering();

// --- RENDER GRID ---
const crossword = document.getElementById('crossword');
const cellRefs = [];
for (let r = 0; r < ROWS; r++) {
  cellRefs[r] = [];
  for (let c = 0; c < COLS; c++) {
    const ch = grid[r][c];
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell' + (ch === '.' ? ' block' : '');
    cellDiv.style.position = 'relative';

    let input = null;
    if (ch !== ".") {
      input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'cell-input';
      input.dataset.row = r;
      input.dataset.col = c;
      cellDiv.appendChild(input);

      input.addEventListener('keydown', onCellKeyDown);
      input.addEventListener('input', onCellInput);
      input.addEventListener('click', onCellClick);
      // NOTE: no 'focus' listener — we manage selection explicitly
    }

    const num = numbering[r][c];
    if (num) {
      const span = document.createElement('span');
      span.className = 'cell-number';
      span.textContent = num;
      cellDiv.appendChild(span);
    }

    crossword.appendChild(cellDiv);
    cellRefs[r][c] = input;
  }
}

// --- UX STATE ---
let selected = null;   // { word, idx, dir }
let lastClickedInput = null;

// --- SELECTION HELPERS ---
function clearHighlights() {
  document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('highlight', 'current'));
  document.querySelectorAll('.clue').forEach(clue => clue.classList.remove('active'));
}

function highlightWord(word, idx, dir) {
  clearHighlights();
  for (let i = 0; i < word.answer.length; i++) {
    let rr = word.row + (dir === 'down' ? i : 0);
    let cc = word.col + (dir === 'across' ? i : 0);
    const cellDiv = cellRefs[rr][cc]?.parentNode;
    if (cellDiv) cellDiv.classList.add('highlight');
  }
  let rr = word.row + (dir === 'down' ? idx : 0);
  let cc = word.col + (dir === 'across' ? idx : 0);
  const cellDiv = cellRefs[rr][cc]?.parentNode;
  if (cellDiv) cellDiv.classList.add('current');

  let clues = dir === 'across'
    ? document.querySelectorAll('#acrossClues .clue')
    : document.querySelectorAll('#downClues .clue');
  let clueIdx = (dir === 'across' ? across : down).findIndex(w => w === word);
  if (clues[clueIdx]) {
    clues[clueIdx].classList.add('active');
    clues[clueIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Select a word + position, focus the input, update highlights.
// Does NOT trigger any focus-based re-selection.
function selectWord(word, idx, dir) {
  selected = { word, idx, dir };
  highlightWord(word, idx, dir);
  let rr = word.row + (dir === 'down' ? idx : 0);
  let cc = word.col + (dir === 'across' ? idx : 0);
  const inp = cellRefs[rr][cc];
  if (inp && document.activeElement !== inp) {
    inp.focus({ preventScroll: false });
  }
}

// --- CLUE RENDERING ---
function renderClues() {
  const acrossDiv = document.getElementById('acrossClues');
  const downDiv = document.getElementById('downClues');
  acrossDiv.innerHTML = '';
  downDiv.innerHTML = '';
  across.forEach(w => {
    const div = document.createElement('div');
    div.className = 'clue';
    div.innerHTML = `<b>${w.num}.</b> ${w.clue}`;
    div.onclick = () => selectWord(w, 0, 'across');
    acrossDiv.appendChild(div);
  });
  down.forEach(w => {
    const div = document.createElement('div');
    div.className = 'clue';
    div.innerHTML = `<b>${w.num}.</b> ${w.clue}`;
    div.onclick = () => selectWord(w, 0, 'down');
    downDiv.appendChild(div);
  });
}
renderClues();

// --- CELL CLICK ---
// First click on a cell: pick the best word for current direction.
// Second click on the SAME cell: toggle direction if the cell is an intersection.
function onCellClick(e) {
  const input = e.target;
  const r = +input.dataset.row;
  const c = +input.dataset.col;

  const wordAcross = across.find(w => w.row === r && c >= w.col && c < w.col + w.answer.length);
  const wordDown   = down.find(w => w.col === c && r >= w.row && r < w.row + w.answer.length);

  let dir, word;

  if (lastClickedInput === input && wordAcross && wordDown) {
    // Toggle direction on repeated click
    dir = (selected && selected.dir === 'across') ? 'down' : 'across';
    word = dir === 'across' ? wordAcross : wordDown;
  } else {
    // Prefer current direction if available, else whichever exists
    if (selected && selected.dir === 'across' && wordAcross) {
      dir = 'across'; word = wordAcross;
    } else if (selected && selected.dir === 'down' && wordDown) {
      dir = 'down'; word = wordDown;
    } else {
      dir = wordAcross ? 'across' : 'down';
      word = wordAcross || wordDown;
    }
  }

  if (!word) return;

  const idx = dir === 'across' ? c - word.col : r - word.row;
  selected = { word, idx, dir };
  highlightWord(word, idx, dir);
  lastClickedInput = input;
}

// --- INPUT HANDLER ---
// Only sanitises the value; movement is handled entirely in keydown.
function onCellInput(e) {
  const input = e.target;
  // Keep only the last letter typed (handles IME / mobile keyboards)
  const val = input.value.toUpperCase().replace(/[^A-Z]/g, '');
  input.value = val.slice(-1);
}

// --- KEYDOWN HANDLER ---
function onCellKeyDown(e) {
  if (!selected) return;
  const { word, idx, dir } = selected;

  // ── Letter key: write the character and advance, skipping filled cells ──
  if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
    e.preventDefault();
    const rCur = word.row + (dir === 'down' ? idx : 0);
    const cCur = word.col + (dir === 'across' ? idx : 0);
    cellRefs[rCur][cCur].value = e.key.toUpperCase();

    // Advance to the very next cell, whether it is filled or empty
    if (idx + 1 < word.answer.length) {
      const next = idx + 1;
      const rr = word.row + (dir === 'down' ? next : 0);
      const cc = word.col + (dir === 'across' ? next : 0);
      selected = { word, idx: next, dir };
      highlightWord(word, next, dir);
      cellRefs[rr][cc].focus({ preventScroll: false });
    }
    return;
  }

  // ── Backspace: clear current cell and step back ──
  if (e.key === "Backspace") {
    e.preventDefault();
    const rCur = word.row + (dir === 'down' ? idx : 0);
    const cCur = word.col + (dir === 'across' ? idx : 0);
    if (cellRefs[rCur][cCur].value !== "") {
      // Clear in place, don't move
      cellRefs[rCur][cCur].value = "";
    } else if (idx > 0) {
      // Already empty — step back and clear that cell
      const prev = idx - 1;
      const rr = word.row + (dir === 'down' ? prev : 0);
      const cc = word.col + (dir === 'across' ? prev : 0);
      cellRefs[rr][cc].value = "";
      selected = { word, idx: prev, dir };
      highlightWord(word, prev, dir);
      cellRefs[rr][cc].focus({ preventScroll: false });
    }
    return;
  }

  // ── Arrow keys ──
  if (e.key === "ArrowRight") {
    e.preventDefault();
    if (dir === 'across' && idx < word.answer.length - 1) {
      const next = idx + 1;
      selected = { word, idx: next, dir };
      highlightWord(word, next, dir);
      cellRefs[word.row][word.col + next].focus({ preventScroll: false });
    }
    return;
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (dir === 'across' && idx > 0) {
      const next = idx - 1;
      selected = { word, idx: next, dir };
      highlightWord(word, next, dir);
      cellRefs[word.row][word.col + next].focus({ preventScroll: false });
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (dir === 'down' && idx < word.answer.length - 1) {
      const next = idx + 1;
      selected = { word, idx: next, dir };
      highlightWord(word, next, dir);
      cellRefs[word.row + next][word.col].focus({ preventScroll: false });
    }
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (dir === 'down' && idx > 0) {
      const next = idx - 1;
      selected = { word, idx: next, dir };
      highlightWord(word, next, dir);
      cellRefs[word.row + next][word.col].focus({ preventScroll: false });
    }
    return;
  }

  // ── Enter: jump to next word ──
  if (e.key === "Enter") {
    e.preventDefault();
    const currentList = dir === 'across' ? across : down;
    const nextList    = dir === 'across' ? down : across;
    const nextDir     = dir === 'across' ? 'down' : 'across';
    const currentIndex = currentList.findIndex(w => w.num === word.num);

    if (currentIndex < currentList.length - 1) {
      selectWord(currentList[currentIndex + 1], 0, dir);
    } else {
      selectWord(nextList[0], 0, nextDir);
    }
  }
}

// --- CONTROLS ---
function clearGrid() {
  document.querySelectorAll('.cell-input').forEach(input => { input.value = ''; });
  document.getElementById('status').textContent = '';
}

function checkAnswers() {
  let correct = 0, total = 0;
  [...across, ...down].forEach(w => {
    let user = '';
    for (let i = 0; i < w.answer.length; i++) {
      let rr = w.row + (w.dir === 'down' ? i : 0);
      let cc = w.col + (w.dir === 'across' ? i : 0);
      user += cellRefs[rr][cc].value || ' ';
    }
    total++;
    if (user.trim().toUpperCase() === w.answer.toUpperCase()) correct++;
  });
  const status = document.getElementById('status');
  if (correct === total) {
    status.innerHTML = '🎉 All correct! Crossword solved! 🎉';
  } else {
    status.textContent = `${correct} / ${total} words correct.`;
  }
}

function revealAnswers() {
  [...across, ...down].forEach(w => {
    for (let i = 0; i < w.answer.length; i++) {
      let rr = w.row + (w.dir === 'down' ? i : 0);
      let cc = w.col + (w.dir === 'across' ? i : 0);
      cellRefs[rr][cc].value = w.answer[i];
    }
  });
  document.getElementById('status').innerHTML = '📖 All answers revealed!';
}
