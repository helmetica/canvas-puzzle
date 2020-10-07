import * as utl from './utils.js';
import { SIDES } from './utils.js';

export default class Piece {
  constructor({x , y, keys, image, size, gutterSize, context, gutters}) {
    this.size = size || 100;
    this.gutterSize = gutterSize;
    this.points = [
      { x, y },
      { x: x + this.size, y: y + this.size },
    ];
    this.z = 1;
    this.keys = keys || {};
    this.gutters = gutters || {};
    this.group = null;
    this.image = image;
    this.ctx = context;

    this.id = Piece.counter;
    Piece.counter += 1;
  }

  drawGutter(sidePoints, isHorizont, isOut, isInvert) {
    const p1 = sidePoints[isInvert ? 1 : 0];
    const p2 = sidePoints[isInvert ? 0 : 1];
    const gutterSize = isOut ? -this.gutterSize : this.gutterSize;
    const size = isInvert ? -this.size : this.size;
    const offset = size / 2;
    const K = 0.9;

    if (isHorizont) {
      this.ctx.bezierCurveTo(
        p1.x + size * K, p2.y,
        p1.x, p1.y + gutterSize,
        p1.x + offset, p1.y + gutterSize,
      );
      this.ctx.bezierCurveTo(
        p2.x, p2.y + gutterSize,
        p2.x - size * K, p2.y,
        p2.x, p2.y,
      );
    } else {
      this.ctx.bezierCurveTo(
        p1.x, p1.y + size * K,
        p1.x + gutterSize, p1.y,
        p1.x + gutterSize, p1.y + offset,
      );
      this.ctx.bezierCurveTo(
        p2.x + gutterSize, p2.y,
        p2.x, p2.y - size * K,
        p2.x, p2.y,
      );
    }
  }

  draw() {
    const sidePoints = this.getSidesPoins();

    this.ctx.strokeStyle = 'gray';

    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);

    // check top
    if (this.gutters.top === null) {
      this.ctx.lineTo(this.points[0].x + this.size, this.points[0].y);
    } else {
      this.drawGutter(sidePoints[SIDES.TOP], true, !!this.gutters.top);
    }

    if (this.gutters.right === null) {
      this.ctx.lineTo(this.points[0].x + this.size, this.points[0].y + this.size);
    } else {
      this.drawGutter(sidePoints[SIDES.RIGHT], false, !!this.gutters.right);
    }

    if (this.gutters.bottom === null) {
      this.ctx.lineTo(this.points[0].x, this.points[0].y + this.size);
    } else {
      this.drawGutter(sidePoints[SIDES.BOTTOM], true, !!this.gutters.bottom, true);
    }

    if (this.gutters.left !== null) {
      this.drawGutter(sidePoints[SIDES.LEFT], false, !!this.gutters.left, true);
    }

    this.ctx.closePath();

    this.ctx.clip();

    if (this.image instanceof HTMLCanvasElement) {
      this.ctx.drawImage(
        this.image,
        this.points[0].x - this.gutterSize, this.points[0].y - this.gutterSize,
        this.size + this.gutterSize * 2, this.size + this.gutterSize * 2,
      );
    }

    this.ctx.restore();

    // обводка формы
    // this.ctx.beginPath();
    // this.ctx.moveTo(this.points[0].x, this.points[0].y);
    // this.ctx.lineTo(this.points[0].x + this.size, this.points[0].y);
    // this.ctx.lineTo(this.points[0].x + this.size, this.points[0].y + this.size);
    // this.ctx.lineTo(this.points[0].x, this.points[0].y + this.size);
    // this.ctx.closePath();
    // this.ctx.stroke();
  }

  mouseIn(x, y) {
    return utl.mouseIn(this.points, x, y);
  }

  moveAt(offsetX, offsetY) {
    this.points.forEach(point => {
      point.x += offsetX;
      point.y += offsetY;
    });
  }

  getSidesPoins() {
    return utl.getSidesFromPoints(this.points);
  }
}

Piece.counter = 0;
