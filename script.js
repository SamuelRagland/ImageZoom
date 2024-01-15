let gameLength = 15;
let gameRunning = false;
let gameTimer = null;
let particleAdder = null;
let timeRemaining = gameLength;
let mouse = { x: null, y: null };
let addedParticles = 0;
let score = 0;
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const endScreen = document.getElementById('endScreen');
const endScore = document.getElementById('endScore');
const title = document.getElementById('intro');
const highScore = document.getElementById('highScore');
const restartButtonEnd = document.getElementById('restartButtonEnd');
const starRemovedSound = new Audio('starRemoved.wav');
            starRemovedSound.volume = 0.2;

resumeButton.addEventListener('click', resumeGame);
pauseButton.addEventListener('click', pauseGame);
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
restartButtonEnd.addEventListener('click', restartGame);

timerDisplay.textContent = timeRemaining;

function startGame() {
    title.style.display = 'none';
    startButton.style.display = 'none';
    endScreen.style.display = 'none';
    restartButton.style.display = 'block';
    if (gameRunning) return;
    particles = Array.from({ length: 100 }, () => new Particle());
    obstacles = Array.from({ length: 10 }, () => new Obstacle());
    gameRunning = true;
    timerDisplay.textContent = timeRemaining;
    particleAdder = setInterval(addParticle, 100);
    gameTimer = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        if (timeRemaining <= 0) endGame();
    }, 1000); // Update the timer every second
}

function endGame() {
    if (score > localStorage.getItem('HighScore')) {
        localStorage.setItem('HighScore', score);
    }
    gameRunning = false;
    highScore.textContent = localStorage.getItem('HighScore');
    endScore.textContent = score;
    endScreen.style.display = 'flex';
    clearInterval(gameTimer);
    clearInterval(particleAdder);
    startButton.disabled = false;
}

function restartGame() {
    clearInterval(gameTimer);
    clearInterval(particleAdder);
    score = 0;
    timeRemaining = gameLength;
    scoreBoard.textContent = score;
    particles = []; // Reset the particles
    obstacles = []; // Reset the obstacles
    gameRunning = false;
    startGame();
}

function pauseGame() {
    gameRunning = false;
    clearInterval(gameTimer);
    clearInterval(particleAdder);
    pauseButton.style.display = 'none';
    resumeButton.style.display = 'block';
}

function resumeGame() {
    gameRunning = true;
    particleAdder = setInterval(addParticle, 100);
    gameTimer = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        if (timeRemaining <= 0) endGame();
    }, 1000); // Update the timer every second
    pauseButton.style.display = 'block';
    resumeButton.style.display = 'none';
}

class Particle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.speedX = Math.random() * 3 - 1;
        this.speedY = Math.random() * 3 - 1;
        this.size = Math.random() * 5 + 3;
        // this.color = `hsla(${Math.floor(Math.random() * 240)}, 100%, 50%, 0.8)`;
        this.target = { x: this.x, y: this.y };
        this.isStar = Math.random() < 0.03; // 3% chance of being a star
    }

    update() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy) || 1;
    
        if (mouse.x && mouse.y) {
            const dxMouse = mouse.x - this.x;
            const dyMouse = mouse.y - this.y;
            const distToMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
    
            if (distToMouse < 100) { // 100 is the threshold distance
                this.target = { x: mouse.x, y: mouse.y };
            } else if (this.target.x === mouse.x && this.target.y === mouse.y) {
                this.target = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };
                
            }
        }

        const force = distToTarget * 0.01;
    
        this.speedX += dx / distToTarget * force;
        this.speedY += dy / distToTarget * force;

        this.x += this.speedX;
        this.y += this.speedY;

        // Calculate new position
        let newX = this.x + this.speedX;
        let newY = this.y + this.speedY;

        if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.speedY *= -1;

        if (obstacles.some(obstacle => obstacle.containsPoint(newX, newY))) {
            // Reverse direction if collision detected
            this.speedX *= -1;
            this.speedY *= -1;

            // Recalculate new position
            newX = this.x + this.speedX;
            newY = this.y + this.speedY;
        }

        this.speedX *= 0.95; // Add friction
        this.speedY *= 0.95; // Add friction

        // Update position
        this.x = newX;
        this.y = newY;
        
        if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.speedY *= -1;
    }

    draw(ctx) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);

        const hue = dist / maxDist * 540; // Change color based on distance

        ctx.save();

        if (this.isStar) {
            // Draw a star
            ctx.beginPath();
            ctx.fillStyle = `hsl(60, 100%, 50%)`;
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(this.x + this.size * Math.cos(2 * Math.PI * i / 5), this.y + this.size * Math.sin(2 * Math.PI * i / 5));
                ctx.lineTo(this.x + this.size / 2 * Math.cos(2 * Math.PI * (i + 0.5) / 5), this.y + this.size / 2 * Math.sin(2 * Math.PI * (i + 0.5) / 5));
            }
            ctx.closePath();
        } else {
            // Draw a circle
            ctx.beginPath();
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }
            if (window.innerWidth > 1000) { // Add shadow
                ctx.shadowColor = `hsl(${hue}, 100%, 50%)`; // Use the same color as the particle
                ctx.shadowBlur = 20; // Adjust the blur radius
                ctx.shadowOffsetX = 0; // Adjust the horizontal offset
                ctx.shadowOffsetY = 0; // Adjust the vertical offset
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.fill();
        ctx.restore();
    }
}

class Obstacle {
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.size && y >= this.y && y <= this.y + this.size;
    }
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 10 + 30;
    }

    update() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = 'red'; // Change this to the color you want
        ctx.fill();
        ctx.closePath();
    }
}



let obstacles = Array.from({ length: 10 }, () => new Obstacle());
let particles = Array.from({ length: 100 }, () => new Particle());



function addParticle() {
    particles.push(new Particle());
    addedParticles++;
}

function animate() {
    updateMousePosition();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (gameRunning && mouse.x && mouse.y) {
    const initialLength = particles.length;

    particles = particles.filter(particle => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) { // 20 is the threshold distance
            // If the particle is a star, add 10 to the score
            // Otherwise, add 1
            score += particle.isStar ? 10 : 1;
            particle.isStar ? starRemovedSound.play() : null;
            return false;
        }

        return true;
        // return distance > 20; // 20 is the threshold distance
    });
    
    const removedParticles = initialLength - particles.length;
        for (let i = 0; i < removedParticles; i++) {
            const particleRemovedSound = new Audio('particleRemoved.wav');
            particleRemovedSound.volume = 0.06;
            particleRemovedSound.play(); // Play sound
        }
    // score += removedParticles;
    scoreBoard.textContent = score;
}
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Use a semi-transparent black color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw(ctx);
    });
    obstacles.forEach(obstacle => {
        obstacle.draw(ctx);
    });

    if (mouse.x && mouse.y) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2); // 10 is the radius of the circle
        ctx.fillStyle = 'hsla(0, 0%, 100%, 0.7)';

        // Add shadow
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 20; // Adjust the blur radius
        ctx.shadowOffsetX = 0; // Adjust the horizontal offset
        ctx.shadowOffsetY = 0; // Adjust the vertical offset

        ctx.fill();
        ctx.restore(); // Restore the context to its original state
    }

    requestAnimationFrame(animate);
}

animate();

canvas.addEventListener('mousemove', function(e) {
    if (!gameRunning) return;

    mouse = { x: e.clientX, y: e.clientY };
});

document.addEventListener('touchmove', function(e) {
    if (!gameRunning) return;

    mouse = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
});

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('mouseout', function() {
    mouse = { x: null, y: null };
    particles.forEach(particle => {
        particle.target = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
    });
});

canvas.addEventListener('click', function(e) {
    addParticle();
    // mouse = { x: null, y: null };
    particles.forEach(particle => {
        particle.target = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        };
        particle.speedX = (Math.random() - 0.5) * 7; // Change speedX
        particle.speedY = (Math.random() - 0.5) * 7; // Change speedY
        particle.update();
    });
});

document.addEventListener('keydown', function(event) {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

function updateMousePosition() {
    const speed = 7; // Adjust this value to change the speed of the mouse

    let newX = mouse.x;
    let newY = mouse.y;

    if (keys.ArrowUp) newY -= speed;
    if (keys.ArrowDown) newY += speed;
    if (keys.ArrowLeft) newX -= speed;
    if (keys.ArrowRight) newX += speed;

    // Check if the new position is inside the screen boundaries
    if (newX < 0 || newX > window.innerWidth) newX = mouse.x;
    if (newY < 0 || newY > window.innerHeight) newY = mouse.y;

    // Check if the new position is inside an obstacle
    if (!obstacles.some(obstacle => newX >= obstacle.x && newX <= obstacle.x + obstacle.width && newY >= obstacle.y && newY <= obstacle.y + obstacle.height)) {
        mouse.x = newX;
        mouse.y = newY;
    }
}

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});