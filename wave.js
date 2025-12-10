/**
 * Modern Wave Particle System v4
 * "High Energy & Dynamic"
 * 
 * Update: Increased movement speed, particle count, and interaction sensitivity.
 */

const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: -1000, y: -1000 };

// Configuration - High Energy Mode
const CONFIG = {
    particleCount: 220,     // More dots for denser field
    connectionDist: 110,
    mouseRange: 300,        // Larger interaction radius
    mouseStrength: 0.08,    // Stronger magnetic pull
    drag: 0.98,            // Less friction = longer sliding
    baseSpeed: 0.8,        // Significantly faster natural movement
    oscillationSpeed: 0.002, // Quicker wave undulation
    baseColor: { r: 124, g: 58, b: 237 }, // Violet
    activeColor: { r: 45, g: 212, b: 191 }, // Cyan
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
        // Faster random velocity
        this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.vy = (Math.random() - 0.5) * CONFIG.baseSpeed;
        this.baseSize = Math.random() * 2 + 1; // Slightly larger average size
        this.size = this.baseSize;
        this.phase = Math.random() * Math.PI * 2;
        this.color = `rgba(${CONFIG.baseColor.r}, ${CONFIG.baseColor.g}, ${CONFIG.baseColor.b}, 0.6)`;
    }

    update() {
        // 1. Mouse Interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.mouseRange) {
            const force = (CONFIG.mouseRange - dist) / CONFIG.mouseRange;
            const angle = Math.atan2(dy, dx);

            // Magnetic Pull with Swirl
            this.vx += Math.cos(angle) * force * CONFIG.mouseStrength;
            this.vy += Math.sin(angle) * force * CONFIG.mouseStrength;

            // Size Bloom
            const targetSize = this.baseSize + (force * 5); // Bigger bloom
            this.size = this.size * 0.9 + targetSize * 0.1;

            // Color Shift
            const r = CONFIG.baseColor.r + (CONFIG.activeColor.r - CONFIG.baseColor.r) * force;
            const g = CONFIG.baseColor.g + (CONFIG.activeColor.g - CONFIG.baseColor.g) * force;
            const b = CONFIG.baseColor.b + (CONFIG.activeColor.b - CONFIG.baseColor.b) * force;
            const a = 0.6 + force * 0.4;
            this.color = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${a})`;

        } else {
            this.size = this.size * 0.9 + this.baseSize * 0.1;
            this.color = `rgba(${CONFIG.baseColor.r}, ${CONFIG.baseColor.g}, ${CONFIG.baseColor.b}, 0.5)`;
        }

        // 2. High Energy Wave Motion
        // More active sine wave influence
        this.vx += Math.sin(this.y * 0.005 + Date.now() * CONFIG.oscillationSpeed) * 0.005;
        this.vy += Math.cos(this.x * 0.005 + Date.now() * CONFIG.oscillationSpeed) * 0.005;

        this.x += this.vx;
        this.y += this.vy;

        this.vx *= CONFIG.drag;
        this.vy *= CONFIG.drag;

        // Wrap
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    onResize();
    particles = [];
    const count = width < 768 ? 100 : CONFIG.particleCount;
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

    // Update & Draw Particles first (background layer)
    // Actually, drawing lines first looks better for "behind" feel

    // Calculate positions first
    particles.forEach(p => p.update());

    // Draw Connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONFIG.connectionDist) {
                let alpha = 1 - (dist / CONFIG.connectionDist);

                // Color logic for lines
                const mouseDx = mouse.x - particles[i].x;
                const mouseDy = mouse.y - particles[i].y;
                const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

                if (mouseDist < CONFIG.mouseRange) {
                    ctx.strokeStyle = `rgba(45, 212, 191, ${alpha * 0.6})`; // Active Cyan
                } else {
                    ctx.strokeStyle = `rgba(124, 58, 237, ${alpha * 0.15})`; // Passive Violet
                }

                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }

    // Draw Dots
    particles.forEach(p => p.draw());

    requestAnimationFrame(loop);
}

// Event Listeners
window.addEventListener('resize', onResize);
window.addEventListener('mousemove', e => {
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

init();
