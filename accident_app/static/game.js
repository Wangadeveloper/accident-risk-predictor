document.addEventListener('DOMContentLoaded', () => {
  // ==== Canvas Setup ====
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const groundHeight = 50;
  const gravity = 0.8;
  let isJumping = false;

  // ==== Game State ====
  let ball = { x: 100, y: canvas.height - groundHeight - 20, radius: 15, velocityY: 0 };
  let bars = [];
  let score = 0;
  let lives = 3;
  let gameRunning = false;
  let popupActive = false;

  // ==== UI Elements ====
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const newGameBtn = document.getElementById('new-game-btn');

  // ==== Popup Modal Elements ====
  const popupModal = document.getElementById('popup-modal');
  const roadsContainer = document.getElementById('roads-container');
  const gameResult = document.getElementById('game-result');
  const continueBtn = document.getElementById('continue-btn');

  // ==== Reset Game ====
  function resetGame() {
    score = 0;
    lives = 3;
    bars = [];
    isJumping = false;
    popupActive = false;
    hidePopup();

    ball.y = canvas.height - groundHeight - 20;
    ball.velocityY = 0;

    scoreEl.textContent = `Score: ${score}`;
    livesEl.textContent = `Lives: ${lives}`;

    gameRunning = true;
    animate();
  }

  // ==== Drawing ====
  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#007bff";
    ctx.fill();
    ctx.closePath();
  }

  function drawGround() {
    ctx.fillStyle = "#444";
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
  }

  function drawBars() {
    ctx.fillStyle = "#2ecc71";
    bars.forEach(bar => {
      ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
    });
  }

  // ==== Obstacle Spacing ====
  function updateBars() {
    if (bars.length < 4) {
      let lastBarX = bars.length ? bars[bars.length - 1].x : canvas.width;
      let newX = lastBarX + 400 + Math.random() * 200; // 400–600px spacing
      bars.push({
        x: newX,
        y: canvas.height - groundHeight - 20,
        width: 40,
        height: 20
      });
    }

    bars.forEach(bar => {
      bar.x -= 5;
    });

    bars = bars.filter(bar => bar.x + bar.width > 0);
  }

  // ==== Collision ====
  function detectCollision() {
    bars.forEach(bar => {
      if (
        ball.x + ball.radius > bar.x &&
        ball.x - ball.radius < bar.x + bar.width &&
        ball.y + ball.radius > bar.y &&
        ball.y - ball.radius < bar.y + bar.height
      ) {
        bars = bars.filter(b => b !== bar);
        lives--;
        livesEl.textContent = `Lives: ${lives}`;
        flashCanvas();

        if (lives <= 0) {
          endGame("You ran out of lives!");
        }
      }
    });
  }

  // ==== Canvas Flash ====
  function flashCanvas() {
    canvas.style.backgroundColor = '#ff6b6b';
    setTimeout(() => {
      canvas.style.backgroundColor = '#fff';
    }, 200);
  }

  // ==== End Game ====
  function endGame(message) {
    gameRunning = false;
    alert(message + " Game Over!");
  }

  // ==== Show Popup ====
  function showPopup() {
    popupActive = true;
    gameRunning = false;

    popupModal.classList.remove('hidden');
    popupModal.classList.add('visible');
    roadsContainer.innerHTML = "<p>Loading roads...</p>";
    gameResult.textContent = "";
    continueBtn.classList.add('hidden');

    fetch("/game")
      .then(res => res.json())
      .then(data => {

        const roads = [data.road1_desc, data.road2_desc];
        const saferRoad = data.safer_road;

        const btnContainer = document.createElement('div');
        btnContainer.style.display = "flex";
        btnContainer.style.flexDirection = "column";
        btnContainer.style.gap = "10px";

        roads.forEach((desc, index) => {
          const roadBtn = document.createElement('button');
          roadBtn.className = "road-option";
          roadBtn.textContent = desc;

          roadBtn.onclick = () => {
            if (index === saferRoad) {
              gameResult.textContent = "✅ Correct choice! +1 life";
              lives++;
            } else {
              gameResult.textContent = "❌ Wrong choice! -1 life";
              lives--;
            }

            score++;
            scoreEl.textContent = `Score: ${score}`;
            livesEl.textContent = `Lives: ${lives}`;

            if (lives <= 0) {
              gameResult.textContent = "💀 Game Over!";
              continueBtn.textContent = "Restart";
              continueBtn.onclick = () => {
                hidePopup();
                resetGame();
              };
            } else {
              continueBtn.textContent = "Continue";
              continueBtn.onclick = () => {
                hidePopup();
                gameRunning = true;
                animate();
              };
            }

            continueBtn.classList.remove('hidden');
          };

          btnContainer.appendChild(roadBtn);
        });

        roadsContainer.appendChild(btnContainer);
      });
  }

  // ==== Hide Popup ====
  function hidePopup() {
    popupModal.classList.remove('visible');
    popupModal.classList.add('hidden');
    popupActive = false;
  }

  // ==== Game Animation Loop ====
  function animate() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawBars();
    drawBall();

    if (isJumping) {
      ball.velocityY += gravity;
      ball.y += ball.velocityY;
      if (ball.y >= canvas.height - groundHeight - ball.radius - 5) {
        ball.y = canvas.height - groundHeight - ball.radius - 5;
        isJumping = false;
      }
    }

    updateBars();
    detectCollision();

    // Popup every ~10 seconds
    if (Math.random() < 0.002 && !popupActive) {
      showPopup();
    }

    requestAnimationFrame(animate);
  }

  // ==== Controls ====
  document.addEventListener('keydown', e => {
    if (e.code === 'ArrowUp' && !isJumping && gameRunning) {
      isJumping = true;
      ball.velocityY = -12;
    }
  });

  newGameBtn.addEventListener('click', resetGame);
});