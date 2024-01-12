let gameLength = 15;
let gameRunning = false;
let gameTimer = null;
let particleAdder = null;
let timeRemaining = gameLength;
let mouse = { x: null, y: null };
let addedParticles = 0;
let score = 0;

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

document.addEventListener('touchstart', function(e) {
// is not near edge of view, exit.
if (e.pageX > 10 && e.pageX < window.innerWidth - 10) return;
// prevent swipe to navigate gesture.
e.preventDefault();
});

function startGame() {
    startButton.style.display = 'none';
    endScreen.style.display = 'none';
    restartButton.style.display = 'block';
    if (gameRunning) return;
    particles = Array.from({ length: 100 }, () => new Particle());
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

        this.speedX *= 0.95; // Add friction
        this.speedY *= 0.95; // Add friction

        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0 || this.x > window.innerWidth) this.speedX *= -1;
        if (this.y < 0 || this.y > window.innerHeight) this.speedY *= -1;
    }

    draw(ctx) {
        const rand = Math.floor(Math.random() * 100);
        // ctx.beginPath();
        // ctx.fillStyle = this.color;
        // ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // ctx.closePath();
        // ctx.fill();
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
            // ctx.beginPath();
            // ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            // ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
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

let particles = Array.from({ length: 100 }, () => new Particle());

function addParticle() {
    particles.push(new Particle());
    addedParticles++;
}

function animate() {
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
            particle.isStar ? starRemovedSound.play() : console.log('Particle removed');
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
            console.log('Particle removed');
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
})

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
        particle.speedX = (Math.random() - 0.5) * 20; // Change speedX
        particle.speedY = (Math.random() - 0.5) * 20; // Change speedY
        particle.update();
    });
});

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
