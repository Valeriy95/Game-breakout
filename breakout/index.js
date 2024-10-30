const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const button = document.querySelector('#runButton');
const popup = document.querySelector('.popup');
const result = document.querySelector('.result');
const scoreResult = document.querySelector('.score');
const livesResult = document.querySelector('.lives');
const buttonResults = document.querySelector('#results');
const popupResults = document.querySelector('.popup-results');
const buttonRestart = document.querySelector('.restart');

let x = canvas.width / 2;
let y = canvas.height - 30;
const ballRadius = 10;

const paddleHeight = 10;
const paddleWidth = 275;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;
let interval = 0;

let dx = 2;
let dy = -2;

const brickRowCount = 3;
const brickColumnCount = 7;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let score = 0;
let lives = 3;

let gameOver = false;
const bestResult = document.querySelector('.best-result');
const bestScore = JSON.parse(localStorage.getItem('bestScore')) || [];

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function draw() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();
  drawScore();
  drawLives();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      lives--;
      if (!lives) {
        gameOver = true;
        popup.style.display = 'flex';
        result.textContent = 'GAME OVER';
        scoreResult.textContent = `SCORE: ${score}`;
        livesResult.textContent = `LIVES: ${lives}`;
        saveLocalStorage();
      } else {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 2;
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  x += dx;
  y += dy;

  if (rightPressed) {
    paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
  } else if (leftPressed) {
    paddleX = Math.max(paddleX - 7, 0);
  }
  requestAnimationFrame(draw);
}

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftPressed = false;
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            gameOver = true;
            popup.style.display = 'flex';
            result.textContent = 'YOU WIN, CONGRATULATIONS!';
            scoreResult.textContent = `SCORE: ${score}`;
            livesResult.textContent = `LIVES: ${lives}`;
            saveLocalStorage();
            clearInterval(interval);
          }
        }
      }
    }
  }
}

button.addEventListener('click', function () {
  draw();
  this.disabled = true;
});

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawScore() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText(`Score: ${score}`, 8, 20);
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

function drawLives() {
  ctx.font = '16px Arial';
  ctx.fillStyle = '#0095DD';
  ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function saveLocalStorage() {
  bestScore.push(score);
  bestScore.sort((a, b) => b - a);
  slicedArray = bestScore.slice(0, 10);
  localStorage.setItem('bestScore', JSON.stringify(slicedArray));
}

buttonResults.addEventListener('click', function () {
  const storedArray = JSON.parse(localStorage.getItem('bestScore'));
  popupResults.style.display = 'flex';
  popupResults.innerHTML = '';
  const title = document.createElement('p');
  title.classList.add('results-text');
  title.textContent = `Results:`;
  popupResults.append(title);
  storedArray.forEach((element, index) => {
    const text = document.createElement('p');
    text.classList.add('results-text');
    text.textContent = `${index + 1}: ${element}`;
    popupResults.append(text);
  });
});

popupResults.addEventListener('click', function () {
  popupResults.style.display = 'none';
});

buttonRestart.addEventListener('click', function () {
  popup.style.display = 'none';
  document.location.reload();
});
