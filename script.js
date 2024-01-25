'use strict';
// Get elements;
// buttons:
const btnBeginner = document.getElementById('beginner');
const btnIntermediate = document.getElementById('intermediate');
const btnExpert = document.getElementById('expert');
const btnNewGame = document.getElementById('new-game');
const btn = document.getElementsByClassName('btn');

// board and elements in it:
const board = document.getElementById('board');
let rows = document.getElementsByClassName('gridRow');
let cellsArray = [];
let cells = document.getElementsByClassName('cell');
let CurrentClickedCells;

// images:
const imgFlag = 'flag-icon.png';
const imgMineBlack = 'mine-icon-black.png';
const imgMineRed = 'mine-icon-red.png';

// Other elements:
const remainingFlagsEl = document.getElementById('remaining-flags');
let remainingFlags = remainingFlagsEl.textContent;
const gameResult = document.getElementById('game-result');

// initial values
let rowWidth;
let level = 'beginner';
let mines = [];
let neighbours = [];
let neighboursOfCells = [[]];
createGrid();
addEventListenersToCells();

// add eventListeners:
btnBeginner.addEventListener('click', function () {
  changeLevel('beginner');
});
btnIntermediate.addEventListener('click', function () {
  changeLevel('intermediate');
});
btnExpert.addEventListener('click', function () {
  changeLevel('expert');
});
btnNewGame.addEventListener('click', function () {
  createGrid();
  addEventListenersToCells();
});

function addEventListenersToCells() {
  for (let i = 0; i < cells.length; i++) {
    cells[i].classList.add('noContextmenu');
    cells[i].addEventListener('click', openUpCells);
    cells[i].addEventListener('contextmenu', function (e) {
      setFlagEL(e, cells[i]);
    });
  }
}

// remove eventListeners:
function removeEventListeners() {
  for (let j = 0; j < cells.length; j++) {
    cells[j].classList.remove('hidden');
    cells[j].removeEventListener('click', openUpCells);
    cells[j].removeEventListener('contextmenu', setFlagEL);
  }
}

// functions used in eventListeners:
function setFlagEL(e, cell) {
  e.preventDefault();
  setFlagIcon(cell);
}

function openUpCells() {
  if (!this.querySelector('.flag-icon')) {
    this.classList.remove('hidden');
    this.classList.add('clicked');
    insertNeighboursWithMine(this);
    // identifyNeighbours(this.row, this.column);
    // insertNeighboursWithMine(this);
    if (!document.querySelector('.hidden.no-mine')) {
      gameResult.textContent = 'You won!';
    }
    if (this.classList.contains('mine')) {
      handleMineClicked(this);
    }
  }
}

function setFlagIcon(cell) {
  if (cell.classList.contains('hidden')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', '0 0 448 512');
    svg.classList.toggle('flag-icon');
    cell.classList.toggle('flag');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', '#b30707');
    path.setAttribute(
      'd',
      'M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z'
    );
    svg.appendChild(path);
    const existingSvg = cell.querySelector('svg.flag-icon');
    if (existingSvg) {
      remainingFlags++;
      remainingFlagsEl.textContent = remainingFlags;
      existingSvg.remove();
    } else if (remainingFlags > 0) {
      remainingFlags--;
      remainingFlagsEl.textContent = remainingFlags;
      cell.appendChild(svg);
    }
  }
}

function setMineIcons() {
  for (let i = 0; i < mines.length; i++) {
    const mine = document.querySelector(`div#cell-${mines[i]}`);
    const flag = document.querySelector(`div#cell-${mines[i]} svg.flag-icon`);
    if (!flag) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('viewBox', '0 0 512 512');
      svg.classList.add('mine-icon');
      mine.classList.add('mine');
      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      path.setAttribute(
        'd',
        'M459.1 52.4L442.6 6.5C440.7 2.6 436.5 0 432.1 0s-8.5 2.6-10.4 6.5L405.2 52.4l-46 16.8c-4.3 1.6-7.3 5.9-7.2 10.4c0 4.5 3 8.7 7.2 10.2l45.7 16.8 16.8 45.8c1.5 4.4 5.8 7.5 10.4 7.5s8.9-3.1 10.4-7.5l16.5-45.8 45.7-16.8c4.2-1.5 7.2-5.7 7.2-10.2c0-4.6-3-8.9-7.2-10.4L459.1 52.4zm-132.4 53c-12.5-12.5-32.8-12.5-45.3 0l-2.9 2.9C256.5 100.3 232.7 96 208 96C93.1 96 0 189.1 0 304S93.1 512 208 512s208-93.1 208-208c0-24.7-4.3-48.5-12.2-70.5l2.9-2.9c12.5-12.5 12.5-32.8 0-45.3l-80-80zM200 192c-57.4 0-104 46.6-104 104v8c0 8.8-7.2 16-16 16s-16-7.2-16-16v-8c0-75.1 60.9-136 136-136h8c8.8 0 16 7.2 16 16s-7.2 16-16 16h-8z'
      );
      svg.appendChild(path);
      mine.appendChild(svg);
    }
  }
  handleWrongFlag();
}

function setCrossIcon(cell) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 384 512');
  cell.classList.add('wrong-flag');
  svg.classList.add('wrong-flag-icon');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', '#ff2e2e');
  path.setAttribute(
    'd',
    'M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z'
  );
  svg.appendChild(path);
  cell.appendChild(svg);
}

function handleWrongFlag() {
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < cells.length / rows.length; j++) {
      const cell = document.querySelector(`#cell-${i}-${j}`);
      const flag = document.querySelector(`div#cell-${i}-${j} svg.flag-icon`);
      const mine = cell.classList.contains('mine');
      if (flag && !mine) {
        cell.removeChild(flag);
        setCrossIcon(cell);
      }
    }
  }
}

function handleMineClicked(cell) {
  insertAllNeigboursWithMine();
  setMineIcons();
  removeEventListeners();
  // this.querySelector('.mine-icon').style.color = 'red';
  const icon = cell.querySelector('.mine-icon');
  icon.removeChild(icon.children[0]);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', '#c81414');
  path.setAttribute(
    'd',
    'M459.1 52.4L442.6 6.5C440.7 2.6 436.5 0 432.1 0s-8.5 2.6-10.4 6.5L405.2 52.4l-46 16.8c-4.3 1.6-7.3 5.9-7.2 10.4c0 4.5 3 8.7 7.2 10.2l45.7 16.8 16.8 45.8c1.5 4.4 5.8 7.5 10.4 7.5s8.9-3.1 10.4-7.5l16.5-45.8 45.7-16.8c4.2-1.5 7.2-5.7 7.2-10.2c0-4.6-3-8.9-7.2-10.4L459.1 52.4zm-132.4 53c-12.5-12.5-32.8-12.5-45.3 0l-2.9 2.9C256.5 100.3 232.7 96 208 96C93.1 96 0 189.1 0 304S93.1 512 208 512s208-93.1 208-208c0-24.7-4.3-48.5-12.2-70.5l2.9-2.9c12.5-12.5 12.5-32.8 0-45.3l-80-80zM200 192c-57.4 0-104 46.6-104 104v8c0 8.8-7.2 16-16 16s-16-7.2-16-16v-8c0-75.1 60.9-136 136-136h8c8.8 0 16 7.2 16 16s-7.2 16-16 16h-8z'
  );
  icon.appendChild(path);
  gameResult.textContent = 'Game Over!';
}

function gameEnded(result) {}

// Changes difficulty level
const changeLevel = function (input) {
  level = input;

  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.classList.remove('active');
  });
  if (input === 'beginner') {
    btnBeginner.classList.add('active');
    remainingFlags = 10;
  } else if (input === 'intermediate') {
    btnIntermediate.classList.add('active');
    remainingFlags = 40;
  } else if (input === 'expert') {
    btnExpert.classList.add('active');
    remainingFlags = 99;
  }
  remainingFlagsEl.textContent = remainingFlags;
  createGrid();
  addEventListenersToCells();
};

// Functions to generate gameboard:
function createGrid() {
  gameResult.textContent = ' ';
  removeBoard();
  mines = [];
  if (level === 'beginner') {
    createRows(8);
    createColumns(8);
    generateMines(10);
    remainingFlags = 10;
    remainingFlagsEl.textContent = remainingFlags;
  } else if (level === 'intermediate') {
    createRows(16);
    createColumns(16);
    generateMines(40);
    remainingFlags = 40;
    remainingFlagsEl.textContent = remainingFlags;
  } else {
    createRows(16);
    createColumns(30);
    generateMines(99);
    remainingFlags = 99;
    remainingFlagsEl.textContent = remainingFlags;
  }
  identifyNeighboursAllCells();
}

function removeBoard() {
  while (rows.length > 0) {
    board.removeChild(rows[0]);
  }
}

function createRows(rowNumber) {
  for (let i = 0; i < rowNumber; i++) {
    let newRow = document.createElement('div');
    rowWidth = 70;
    newRow.style.width = `${rowWidth}vw`;
    board.appendChild(newRow).className = `gridRow gridRow-${i}`;
  }
}

function createColumns(cellNumber) {
  cellsArray = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < cellNumber; j++) {
      let newCell = document.createElement('div');
      const cellWidth = rowWidth / cellNumber - 0.2;
      const cellHeight = 60 / rows.length - 0.2;
      newCell.style.width = `${cellHeight}vh`;
      newCell.style.height = `${cellHeight}vh`;
      newCell.style.fontSize = `${cellHeight * 0.5}vh`;
      newCell.innerHTML = ` `;
      rows[i].appendChild(newCell).id = `cell-${i}-${j}`;
      document
        .getElementById(`cell-${i}-${j}`)
        .classList.add('cell', 'hidden', 'no-mine');
      let cellCreated = document.getElementById(`cell-${i}-${j}`);
      cellsArray.push(newCell);
      // let fontSize = 70 / cellNumber;
      // newCell.style.fontSize = fontSize;
    }
  }
}

function generateMines(numOfMines) {
  for (let i = 0; i < numOfMines; i++) {
    selectRandomCell();
  }
}

function selectRandomCell() {
  let row = Number(Math.trunc(Math.random() * rows.length));
  const column = Number(
    Math.trunc(Math.random() * (cells.length / rows.length))
  );
  const selectedCel = document.getElementById(`cell-${row}-${column}`);
  if (selectedCel.classList.contains('mine')) {
    selectRandomCell();
  } else {
    mines.push(`${row}-${column}`);
    selectedCel.classList.remove('no-mine');
    selectedCel.classList.add('mine');
  }
}

// calculate number of neighbours:
function isCellMine(cell) {
  if (cell.classList.contains('mine')) {
    return 1;
  } else {
    return 0;
  }
}

function identifyNeighbours(row, column) {
  neighbours = [];
  const cell = document.getElementById(`cell-${row}-${column}`);
  const rowNum = Number(row);
  const columnNum = Number(column);
  for (let i = rowNum - 1; i <= rowNum + 1; i++) {
    for (let j = columnNum - 1; j <= columnNum + 1; j++) {
      const potentialNeighbour = document.getElementById(`cell-${i}-${j}`);
      if (potentialNeighbour && (rowNum !== i || columnNum !== j)) {
        neighbours.push(potentialNeighbour);
      } else {
      }
    }
  }
  neighboursOfCells.push(neighbours);
}

function identifyNeighboursAllCells() {
  neighboursOfCells = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < cells.length / rows.length; j++) {
      identifyNeighbours(i, j);
    }
  }
}

function insertAllNeigboursWithMine() {
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains('mine, flag')) {
      insertNeighboursWithMine(cells[i]);
    }
  }
}

function revealNeighbours() {
  for (let i = 0; i < this.length; i++) {
    if (
      this[i].classList.contains('hidden') &&
      !this[i].classList.contains('flag') &&
      !this[i].classList.contains('mine')
    ) {
      openUpCells.call(this[i]);
      insertNeighboursWithMine(this[i]);
    }
  }
}

function insertNeighboursWithMine(cell) {
  const cellId = cell.id;
  const index = cellsArray.findIndex(element => element.id === cellId);
  let neighboursWithMine = 0;
  for (let i = 0; i < neighboursOfCells[index].length; i++) {
    neighboursWithMine =
      neighboursWithMine + Number(isCellMine(neighboursOfCells[index][i]));
  }
  // if clicked cell = 0 neighbouring mines automated opening up neighbours:
  if (neighboursWithMine === 0) {
    revealNeighbours.call(neighboursOfCells[index]);
  }
  // if clicked cell != 0 neighbouring mines insertion num of neighbouring mines:
  else if (
    !cell.classList.contains('mine') &&
    !cell.classList.contains('flag')
  ) {
    cell.textContent = neighboursWithMine;
  }
}
