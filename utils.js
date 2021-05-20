export const SIDES = {
  TOP: 'top',
  RIGHT: 'right',
  BOTTOM: 'bottom',
  LEFT: 'left',
};

export const INVERT_SIDE = {
  [SIDES.TOP]: SIDES.BOTTOM,
  [SIDES.RIGHT]: SIDES.LEFT,
  [SIDES.BOTTOM]: SIDES.TOP,
  [SIDES.LEFT]: SIDES.RIGHT,
};

export function resize(width, height, availableWidth, availableHeight) {
  console.warn(width, height, availableWidth, availableHeight);
  const max = Math.max(width, height);
  console.warn('max', max);
  let delta;
  let newWidth;
  let newHeight;

  if (max === width) {
    console.warn('max width');
    newWidth = availableWidth;
    delta = newWidth - width;
    newHeight = height + delta;
  } else {
    console.warn('max height');
    newHeight = availableHeight;
    delta = newHeight - height;
    newWidth = width + delta;
  }

  console.warn('new', newWidth, newHeight);
  console.warn(delta);
  return {
    width: Math.floor(newWidth),
    height: Math.floor(newHeight),
  };
}

export function random(n) {
  return Math.floor(Math.random() * Math.floor(n));
}

export function randomInterval(min, max) {
  return min + Math.floor((max - min) * Math.random());
}

export function mouseIn(points, x, y) {
  return x >= points[0].x && x <= points[1].x && y >= points[0].y && y <= points[1].y;
}

export function getSidesFromPoints(points) {
  return {
    [SIDES.TOP]: [
      {
        x: points[0].x,
        y: points[0].y,
      },
      {
        x: points[1].x,
        y: points[0].y,
      },
    ],
    [SIDES.RIGHT]: [
      {
        x: points[1].x,
        y: points[0].y,
      },
      {
        x: points[1].x,
        y: points[1].y,
      },
    ],
    [SIDES.BOTTOM]: [
      {
        x: points[0].x,
        y: points[1].y,
      },
      {
        x: points[1].x,
        y: points[1].y,
      },
    ],
    [SIDES.LEFT]: [
      {
        x: points[0].x,
        y: points[0].y,
      },
      {
        x: points[0].x,
        y: points[1].y,
      }
    ]
  };
}

export function calcEventPage(event, cnv) {
  const point = event.touches && event.touches[0] || event
  const x = point.pageX - cnv.offsetLeft;
  const y = point.pageY - cnv.offsetTop;

  return { x, y };
}

export function calcOffsetBetween(sideP1, sideP2) {
  return {
    x: sideP2[0].x - sideP1[0].x,
    y: sideP2[0].y - sideP1[0].y
  };
}

export function isInConnectionArea(side1, side2, delta) {
  const sideArea = [
    { x: side2[0].x - delta, y: side2[0].y - delta },
    { x: side2[1].x + delta, y: side2[1].y + delta },
  ];

  return side1.every(point => mouseIn(sideArea, point.x, point.y));
}

export function playSound() {
  const audio = new Audio();

  audio.src = 'sound.mp3';
  audio.autoplay = true;
}
