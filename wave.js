/**
 * Modern Wave Particle System v2
 * "Sleek, Modern, Mouse-Driven Wave"
 * 
 * Features:
 * - Particles form a subtle flowing field
 * - Mouse movement creates a "magnetic wave" trail
 * - Particles "appear behind" the mouse (trail effect)
 * - Smoother, more organic motion
 */

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: -1000, y: -1000 };

// Configuration
const CONFIG = {
    particleCount: 180,      // Denser for better wave visualization
    connectionDist: 100,     // Distance to draw lines
    mouseRange: 300,         // Radius of mouse influence
    mouseStrength: 0.08,     // How strongly mouse pulls particles
    drag: 0.95,              // Friction (lower = slippery)
    baseSpeed: 0.3,          // Natural drift speed
    color: 'rgba(139, 92, 246, 0.6)' // Violet-500 optimized
};

class Particle {
    constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.vy = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.originX = this.x; // Remember original position for "return to form"
        this.originY = this.y;
        this.size = Math.random() * 2 + 0.5;
    }

    update() {
        // 1. Mouse Interaction (The "Wave" pulling effect)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If mouse is close, pull particle towards it (Magnetic Wave)
        if (dist < CONFIG.mouseRange) {
            const force = (CONFIG.mouseRange - dist) / CONFIG.mouseRange;
            const angle = Math.atan2(dy, dx);

            // "Behind it" effect: Pull towards mouse but with a slight swirl or lag
            this.vx += Math.cos(angle) * force * CONFIG.mouseStrength;
            this.vy += Math.sin(angle) * force * CONFIG.mouseStrength;
        }

        // 2. Natural "Wave" Drift (Sine wave influenced by position)
        // Adds that organic, fluid feeling even when mouse isn't moving
        this.vx += Math.sin(this.y * 0.01 + Date.now() * 0.001) * 0.002;
        this.vy += Math.cos(this.x * 0.01 + Date.now() * 0.001) * 0.002;

        // 3. Physics Update
        this.x += this.vx;
        this.y += this.vy;

        // Friction
        this.vx *= CONFIG.drag;
        this.vy *= CONFIG.drag;

        // Boundary Wrap (Seamless)
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
    }

    draw() {
        ctx.fillStyle = CONFIG.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    onResize();
    particles = [];
    // Mobile optimization
    const count = width < 768 ? 80 : CONFIG.particleCount;
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
    loop();
}

function onResize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function loop() {
    ctx.clearRect(0, 0, width, height);

    // Update & Draw Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw Connections (The "Wave Structure")
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.connectionDist) {
                // Opacity fades with distance
                // Dynamic color: brighter near mouse
                const alpha = 1 - (dist / CONFIG.connectionDist);
                ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.4})`;

                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(loop);
}

// Event Listeners
window.addEventListener('resize', onResize);
window.addEventListener('mousemove', e => {
    // Smooth mouse interpolation could be added here for even sleeker feel
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('touchmove', e => {
    if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
});
window.addEventListener('touchend', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

// Start
init();
