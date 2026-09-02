// Canvas Confetti and Fireworks engine
class FXEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.fireworks = [];
        this.stars = [];
        this.shockwaves = [];
        this.emojis = ['👑', '🔥', '🚀', '💎', '💖', '🍾', '🎂', '🎉', '🌟', '⚡', '🥳'];
        this.running = false;
        this.colors = [
            '#ff2a7a', '#ff7b00', '#ffd000', '#00f0ff', 
            '#a124db', '#39ff14', '#ffffff', '#ff69b4', '#ff0055'
        ];
    }

    init(canvasId = 'fx-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = canvasId;
            document.body.prepend(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createStars();
        this.startLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        this.stars = [];
        const count = Math.floor(window.innerWidth * 0.05);
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.005,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    startLoop() {
        if (this.running) return;
        this.running = true;

        const loop = () => {
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // Spawn massive confetti blast
    blastConfetti(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 120) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 12 + 4;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - Math.random() * 5,
                size: Math.random() * 8 + 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 15,
                tilt: Math.random() * 10,
                vTilt: Math.random() * 0.1 + 0.05,
                life: 1,
                decay: Math.random() * 0.008 + 0.005,
                gravity: 0.18,
                shape: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'heart')
            });
        }
    }

    // Launch a firework rocket that explodes
    launchFirework(startX, targetX, targetY) {
        const sx = startX || Math.random() * window.innerWidth;
        const tx = targetX || Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1;
        const ty = targetY || Math.random() * window.innerHeight * 0.5 + 50;

        this.fireworks.push({
            x: sx,
            y: window.innerHeight,
            tx: tx,
            ty: ty,
            vx: (tx - sx) / 35,
            vy: (ty - window.innerHeight) / 35,
            trail: [],
            color: this.colors[Math.floor(Math.random() * this.colors.length)]
        });
    }

    explodeFirework(x, y, color) {
        const count = 70;
        const baseColor = color || this.colors[Math.floor(Math.random() * this.colors.length)];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.2;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 2,
                color: Math.random() > 0.3 ? baseColor : '#ffffff',
                rotation: 0,
                vRot: 0,
                tilt: 0,
                vTilt: 0,
                life: 1,
                decay: Math.random() * 0.02 + 0.012,
                gravity: 0.07,
                shape: 'spark'
            });
        }
    }

    // Continuous celebratory rain
    celebrationRain(durationMs = 5000) {
        const interval = setInterval(() => {
            const x = Math.random() * window.innerWidth;
            this.particles.push({
                x: x,
                y: -10,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 2,
                size: Math.random() * 8 + 5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 10,
                tilt: Math.random() * 10,
                vTilt: 0.08,
                life: 1,
                decay: 0.003,
                gravity: 0.05,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }, 60);

        setTimeout(() => clearInterval(interval), durationMs);
    }

    // MEGA EXPLOSION STORM (GRAND FINALE)
    megaExplosionStorm(cx = window.innerWidth / 2, cy = window.innerHeight / 2) {
        // 1. Shockwave rings
        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.75,
            lineWidth: 18,
            color: '#ffd000',
            alpha: 1,
            speed: 25
        });

        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 5,
            maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.6,
            lineWidth: 12,
            color: '#ff2a7a',
            alpha: 1,
            speed: 18
        });

        // 2. Huge burst of 450+ particles
        for (let i = 0; i < 450; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 22 + 6;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - Math.random() * 8,
                size: Math.random() * 12 + 6,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 25,
                tilt: Math.random() * 10,
                vTilt: Math.random() * 0.15 + 0.05,
                life: 1,
                decay: Math.random() * 0.006 + 0.003,
                gravity: 0.15,
                shape: Math.random() > 0.3 ? 'rect' : (Math.random() > 0.5 ? 'spark' : 'circle')
            });
        }

        // 3. Flying Emoji Blast
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 18 + 4;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - Math.random() * 6,
                size: Math.random() * 24 + 20,
                emoji: this.emojis[Math.floor(Math.random() * this.emojis.length)],
                rotation: Math.random() * 360,
                vRot: (Math.random() - 0.5) * 12,
                tilt: 0,
                vTilt: 0,
                life: 1,
                decay: 0.005,
                gravity: 0.12,
                shape: 'emoji'
            });
        }

        // 4. Multiple fireworks rockets barrage across screen
        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                const sx = Math.random() * window.innerWidth;
                const tx = Math.random() * window.innerWidth * 0.85 + window.innerWidth * 0.07;
                const ty = Math.random() * window.innerHeight * 0.5 + 40;
                this.launchFirework(sx, tx, ty);
            }, i * 220);
        }

        // 5. Celebration rain for 8 seconds
        this.celebrationRain(8000);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed;
            sw.alpha = 1 - (sw.radius / sw.maxRadius);

            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                this.shockwaves.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.lineWidth = sw.lineWidth;
            this.ctx.strokeStyle = sw.color;
            this.ctx.globalAlpha = Math.max(0, sw.alpha);
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = sw.color;
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Draw twinkling stars
        for (let s of this.stars) {
            s.phase += s.speed;
            const alpha = (Math.sin(s.phase) + 1) / 2 * 0.8 + 0.2;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw fireworks rockets
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const f = this.fireworks[i];
            f.x += f.vx;
            f.y += f.vy;

            // Spark trail
            f.trail.push({ x: f.x, y: f.y, alpha: 1 });
            if (f.trail.length > 8) f.trail.shift();

            this.ctx.beginPath();
            for (let t of f.trail) {
                t.alpha -= 0.1;
                this.ctx.fillStyle = f.color;
                this.ctx.globalAlpha = Math.max(0, t.alpha);
                this.ctx.fillRect(t.x, t.y, 3, 3);
            }
            this.ctx.globalAlpha = 1;

            if (f.y <= f.ty) {
                this.explodeFirework(f.x, f.y, f.color);
                this.fireworks.splice(i, 1);
            }
        }

        // Draw particles (confetti, sparks, hearts)
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rotation += p.vRot;
            p.tilt += p.vTilt;
            p.life -= p.decay;

            if (p.life <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);

            this.ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                const w = p.size * Math.cos(p.tilt);
                const h = p.size;
                this.ctx.fillRect(-w / 2, -h / 2, w, h);
            } else if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.shape === 'spark') {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = p.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.shape === 'heart') {
                const s = p.size * 0.7;
                this.ctx.beginPath();
                this.ctx.moveTo(0, s / 4);
                this.ctx.bezierCurveTo(-s / 2, -s / 2, -s, s / 3, 0, s);
                this.ctx.bezierCurveTo(s, s / 3, s / 2, -s / 2, 0, s / 4);
                this.ctx.fill();
            } else if (p.shape === 'emoji') {
                this.ctx.font = `${p.size}px sans-serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(p.emoji, 0, 0);
            }

            this.ctx.restore();
        }
    }
}

window.fxEngine = new FXEngine();
