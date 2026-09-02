// Interactive Scratch Card with Canvas revealing Video Presentation
class ScratchCard {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        this.video = null;
        this.isDrawing = false;
        this.isRevealed = false;
        this.lastSoundTime = 0;
        this.scratchRadius = 38; // Larger radius for big screen
    }

    init(containerId = 'scratch-card-wrapper') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.renderCard();
    }

    renderCard() {
        this.isRevealed = false;

        this.container.innerHTML = `
            <div class="scratch-card-box" id="scratch-box">
                <div class="scratch-secret-content video-content">
                    <video id="scratch-secret-video" class="scratch-secret-video" playsinline controls preload="auto">
                        <source src="Презентація4.mp4" type="video/mp4">
                        <source src="assets/presentation4.mp4" type="video/mp4">
                        Ваш браузер не підтримує відео.
                    </video>
                    <div class="video-overlay-badge" id="video-overlay-badge">
                        🎬 Секретна Відео-Презентація для <span class="target-name">Quince</span>! ✨
                    </div>
                </div>
                <canvas class="scratch-canvas" id="scratch-canvas"></canvas>
            </div>
            
            <div class="scratch-instructions">
                🪄 Потри курсором мишки або пальцем по золотому шару, щоб відкрити секретне святкове відео!
            </div>

            <div class="scratch-controls">
                <button class="action-btn secondary-btn" id="reveal-all-btn">
                    ✨ Відкрити відео повністю
                </button>
                <button class="action-btn secondary-btn" id="reset-scratch-btn">
                    🔄 Стерти знову
                </button>
            </div>
        `;

        this.canvas = document.getElementById('scratch-canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.video = document.getElementById('scratch-secret-video');

        this.setupCanvas();
        this.setupEvents();

        document.getElementById('reset-scratch-btn').addEventListener('click', () => {
            this.renderCard();
        });

        document.getElementById('reveal-all-btn').addEventListener('click', () => {
            this.revealFully();
        });
    }

    setupCanvas() {
        const parent = this.canvas.parentElement;
        const width = parent ? (parent.clientWidth || parent.offsetWidth || 800) : 800;
        const height = parent ? (parent.clientHeight || parent.offsetHeight || 460) : 460;

        this.canvas.width = Math.max(width, 320);
        this.canvas.height = Math.max(height, 220);

        // Draw rich gold metallic scratch surface
        const grad = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        grad.addColorStop(0, '#d4af37');
        grad.addColorStop(0.25, '#f9e8a2');
        grad.addColorStop(0.5, '#aa771c');
        grad.addColorStop(0.75, '#f3d060');
        grad.addColorStop(1, '#946e19');

        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add subtle sparkles pattern
        for (let i = 0; i < 45; i++) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.beginPath();
            const sx = Math.random() * this.canvas.width;
            const sy = Math.random() * this.canvas.height;
            const sr = Math.random() * 3 + 1;
            this.ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Add stylish instruction overlay
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Outfit, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0,0,0,0.6)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('✨ СТРИ ТУТ ЩОБ ВІДКРИТИ ВІДЕО! ✨', this.canvas.width / 2, this.canvas.height / 2 - 14);

        this.ctx.font = '16px Outfit, sans-serif';
        this.ctx.fillStyle = '#fffdf0';
        this.ctx.fillText('🪙 Потри курсором або пальцем по екрану', this.canvas.width / 2, this.canvas.height / 2 + 24);
        this.ctx.shadowBlur = 0;
    }

    setupEvents() {
        const startScratch = (e) => {
            if (this.isRevealed) return;
            this.isDrawing = true;
            this.startVideoPlayback();
            this.scratch(e);
        };

        const stopScratch = () => {
            if (!this.isDrawing) return;
            this.isDrawing = false;
            this.checkProgress();
        };

        const moveScratch = (e) => {
            if (!this.isDrawing || this.isRevealed) return;
            this.scratch(e);
        };

        this.canvas.addEventListener('mousedown', startScratch);
        window.addEventListener('mouseup', stopScratch);
        this.canvas.addEventListener('mousemove', moveScratch);

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startScratch(e.touches[0]);
        }, { passive: false });

        window.addEventListener('touchend', stopScratch);
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            moveScratch(e.touches[0]);
        }, { passive: false });

        // Window resize adjustment
        window.addEventListener('resize', () => {
            if (!this.isRevealed && this.canvas) {
                const parent = this.canvas.parentElement;
                if (parent && Math.abs(this.canvas.width - parent.clientWidth) > 40) {
                    this.setupCanvas();
                }
            }
        });
    }

    startVideoPlayback() {
        if (this.video && this.video.paused) {
            this.video.play().catch(err => {
                console.log("Video autoplay blocked until user click interaction", err);
            });
        }
    }

    scratch(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX || e.pageX) - rect.left;
        const y = (e.clientY || e.pageY) - rect.top;

        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.scratchRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Sound throttling
        const now = Date.now();
        if (now - this.lastSoundTime > 80) {
            window.soundManager.playScratch();
            this.lastSoundTime = now;
        }
    }

    checkProgress() {
        if (this.isRevealed) return;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentCount = 0;
        const total = pixels.length / 4;

        // Sample every 4th pixel for high speed
        for (let i = 3; i < pixels.length; i += 16) {
            if (pixels[i] === 0) {
                transparentCount++;
            }
        }

        const scratchedRatio = transparentCount / (total / 4);

        if (scratchedRatio > 0.35) {
            this.revealFully();
        }
    }

    revealFully() {
        if (this.isRevealed) return;
        this.isRevealed = true;

        if (this.canvas) {
            this.canvas.style.transition = 'opacity 0.6s ease';
            this.canvas.style.opacity = '0';
            setTimeout(() => {
                if (this.canvas) this.canvas.style.display = 'none';
            }, 600);
        }

        this.startVideoPlayback();
        window.soundManager.playSparkle();

        const rect = this.canvas.getBoundingClientRect();
        window.fxEngine.blastConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
    }
}

window.scratchCard = new ScratchCard();
