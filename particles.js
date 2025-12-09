const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationFrameId;
let mouse = { x: -1000, y: -1000 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5; // Faster speed
        this.vy = (Math.random() - 0.5) * 1.5; // Faster speed
        this.size = Math.random() * 2.5 + 1;   // Slightly larger
        // Cyber-Poetic Palette Colors
        const colors = ['rgba(124, 58, 237, 0.8)', 'rgba(6, 182, 212, 0.8)', 'rgba(244, 114, 182, 0.6)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
    }

    draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 8), 150);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    particles.forEach((a, i) => {
        // Connect particles
        for (let j = i + 1; j < particles.length; j++) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(124, 58, 237, ${0.2 - distance / 500})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // Mouse Attraction (Swarm)
        const dx = mouse.x - a.x;
        const dy = mouse.y - a.y;
        const distMouse = Math.sqrt(dx * dx + dy * dy);

        if (distMouse < 300) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 - distMouse / 300})`;
            ctx.lineWidth = 1;
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(a.x, a.y);
            ctx.stroke();

            // Gentle attraction force
            const angle = Math.atan2(dy, dx);
            const force = (300 - distMouse) / 300;
            const attraction = force * 1.5;

            a.x += Math.cos(angle) * attraction;
            a.y += Math.sin(angle) * attraction;
        }
    });

    animationFrameId = requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Start
resize();
animate();
