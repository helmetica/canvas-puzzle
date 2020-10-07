import * as utl from './utils.js';
import { SIDES, INVERT_SIDE } from './utils.js';
import Piece from './piece.js';

const PIECE_SIZE = 100;
const GUTTER_SIZE = 20;
const DELTA = 15;

let maxZ;
let group = 1;
let pieces = [];
let selectedPiece;
let movablePieces = [];
let startPoint;

const cnv = document.getElementById('canvas');
const ctx = cnv.getContext('2d');
const imgEl = document.getElementById('image');
const cnvImg = document.getElementById('canvasImage');
const ctxImg = cnvImg.getContext('2d');

const [imgW, imgH] = [imgEl.width, imgEl.height];

imgEl.classList.toggle('hidden', false);
cnvImg.width = imgEl.clientWidth;
cnvImg.height = imgEl.clientHeight;
const resizeSize = utl.resize(imgW, imgH, cnvImg.width, cnvImg.height);
cnvImg.width = resizeSize.width;
cnvImg.height = resizeSize.height;
console.warn(resizeSize);
ctxImg.drawImage(
  imgEl,
  0, 0, imgW, imgH,
  0, 0, resizeSize.width, resizeSize.height,
);
imgEl.classList.toggle('hidden', true);

const [WIDTH, HEIGHT] = [cnv.clientWidth, cnv.clientHeight];

cnv.width = WIDTH;
cnv.height = HEIGHT;
ctx.lineWidth = 1;

function render() {
  maxZ = Math.max(...pieces.map(p => p.z));
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  pieces.sort((prev, curr) => prev.z - curr.z);
  pieces.forEach(piece => piece.draw());
}

function checkSide(piece1, sidePoints1, sideName1, piece2, sidePoints2, sideName2) {
  let isNotSameGroup = true;
  let isFit = piece1.keys[sideName1] && piece2.keys[sideName2]
    && piece1.keys[sideName1] === piece2.keys[sideName2];

  if (piece1.group || piece2.group) isNotSameGroup = piece2.group !== piece1.group;

  return isNotSameGroup && isFit && utl.isEqualSides(sidePoints1[sideName1], sidePoints2[sideName2], DELTA);
}

function findNearPiece(piece) {
  const pieceSides = piece.getSidesPoins();
  let pieceSide;
  let pSide;

  const result = pieces.find(p => {
    const pSides = p.getSidesPoins();

    for (const keySide of Object.keys(SIDES)) {
      const side = SIDES[keySide];
      if (checkSide(piece, pieceSides, side, p, pSides, INVERT_SIDE[side])) {
        pieceSide = pieceSides[side];
        pSide = pSides[INVERT_SIDE[side]];

        utl.playSound();

        return true;
      }
    }
  });

  if (result) {
    merge(piece, result, pieceSide, pSide);
  }
}

function merge(piece1, piece2, pieceSide, resultSide) {
  const offsets = utl.calcOffsetBetween(pieceSide, resultSide);

  movablePieces.forEach(p => p.moveAt(offsets.x, offsets.y));

  if (piece1.group && !piece2.group) piece2.group = piece1.group;
  else if (!piece1.group && piece2.group) piece1.group = piece2.group;
  else if (!piece1.group && !piece2.group) {
    group++;
    piece1.group = group;
    piece2.group = group;
  } else {
    replaceGroup(piece1.group, piece2.group);
  }

  render();
}

function replaceGroup(replacementGroup, newGroup) {
  for (const piece of pieces) {
    if (piece.group === replacementGroup) piece.group = newGroup;
  }
}

pieces = generatePuzzle(cnvImg, Math.floor(cnvImg.height / PIECE_SIZE),Math.floor(cnvImg.width / PIECE_SIZE));
console.warn(pieces);
render();

function generatePuzzle(image, rows, cols) {
  const grid = Array.from(new Array(rows), () => Array.from(new Array(cols)));
  const halfPiecesCount = Math.floor((rows * cols) / 2);
  let sideLeftCount = 0;
  let sideRightCount = 0;

  let keyN = 1;
  let count = 0;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      [canvas.height, canvas.width] = [PIECE_SIZE + GUTTER_SIZE * 2, PIECE_SIZE + GUTTER_SIZE * 2];

      const leftCell = j > 0 && grid[i][j - 1] || null;
      const topCell = i > 0 && grid[i - 1][j] || null;

      const keys = {
        [SIDES.LEFT]: leftCell && leftCell.keys[SIDES.RIGHT] || 0,
        [SIDES.TOP]: topCell && topCell.keys[SIDES.BOTTOM] || 0,
        [SIDES.RIGHT]: j < cols - 1 ? keyN++ : 0,
        [SIDES.BOTTOM]: i < rows - 1 ? keyN++ : 0,
      };

      const gutters = {
        [SIDES.LEFT]: leftCell && leftCell.gutters[SIDES.RIGHT] !== null ? leftCell.gutters[SIDES.RIGHT] : null,
        [SIDES.TOP]: topCell && topCell.gutters[SIDES.BOTTOM] !== null ? topCell.gutters[SIDES.BOTTOM] : null,
        [SIDES.RIGHT]: j < cols - 1 ? utl.random(2) : null,
        [SIDES.BOTTOM]: i < rows - 1 ? utl.random(2) : null,
      };

      context.drawImage(
        image,
        j * PIECE_SIZE, i * PIECE_SIZE, PIECE_SIZE + GUTTER_SIZE * 2, PIECE_SIZE + GUTTER_SIZE * 2,
        0, 0, PIECE_SIZE + GUTTER_SIZE * 2, PIECE_SIZE + GUTTER_SIZE * 2,
      );

      // разброс пазлов
      const isRight = !!utl.random(2);
      let min;
      let max;

      if (isRight && sideRightCount < halfPiecesCount) {
        min = Math.floor(WIDTH - WIDTH * 0.25);
        max = WIDTH - PIECE_SIZE;
        sideRightCount++;
      } else {
        min = 0;
        max = WIDTH * 0.25 - PIECE_SIZE;
        sideLeftCount++;
      }

      grid[i][j] = new Piece({
        x: utl.randomInterval(min, max),
        y: utl.random(HEIGHT - PIECE_SIZE),
        keys,
        gutters,
        image: canvas,
        size: PIECE_SIZE,
        gutterSize: GUTTER_SIZE,
        context: ctx,
      });
      count++;
    }
  }

  return grid.reduce((acc, row) => acc.concat(...row), []);
}

document.getElementById('visibleButton').onclick = function (event) {
  if (['', 'none'].includes(imgEl.style.display)) {
    imgEl.style.display = 'block';
    this.textContent = 'hide';
  } else {
    imgEl.style.display = 'none';
    this.textContent = 'show';
  }
};

document.getElementById('settings').onclick = function (event) {

};

cnv.onmousemove = function(event) {
  if (selectedPiece) {
    const ePage = utl.calcEventPage(event, cnv);
    const offsetX = ePage.x - startPoint.x;
    const offsetY = ePage.y - startPoint.y;

    startPoint = { x: ePage.x, y: ePage.y };

    movablePieces.forEach(piece => piece.moveAt(offsetX, offsetY));

    render();
  }
};

cnv.onmousedown = function(event) {
  const ePage = utl.calcEventPage(event, cnv);

  if (!selectedPiece) {
    pieces.forEach(piece => {
      if (piece.mouseIn(ePage.x, ePage.y)) {
        selectedPiece = piece;
        startPoint = { x: ePage.x, y: ePage.y };
      }
    });

    if (selectedPiece) {
      movablePieces = selectedPiece.group
        ? pieces.filter(piece => piece.group === selectedPiece.group)
        : [selectedPiece];

      // обновим z-index
      movablePieces.forEach(piece => {
        piece.z = maxZ + 1;
      });
    }
  }
};

cnv.onmouseup = function() {
  if (selectedPiece) {
    findNearPiece(selectedPiece);

    render();
  }

  selectedPiece = null;
  movablePieces = [];
};