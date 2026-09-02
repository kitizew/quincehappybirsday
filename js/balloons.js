// Interactive Balloon Game & Particle Pop
class BalloonGame {
    constructor() {
        this.container = null;
        this.balloons = [];
        this.score = 0;
        this.wishesUnlocked = 0;
        this.spawnInterval = null;
        this.isActive = false;

        this.wishes = [
            "❤️ Безмежного кохання!",
            "💰 Фінансової свободи та достатку!",
            "🚀 Стрімкого успіху в усіх справах!",
            "✈️ Незабутніх подорожей світом!",
            "🏖️ Кайфового відпочинку та релаксу!",
            "💎 Міцного здоров'я та енергії!",
            "🎉 Щоденного свята на душі!",
            "🌟 Здійснення всіх мрій!",
            "🍾 Яскравих емоцій та драйву!",
            "🔥 Невичерпного натхнення!",
            "👑 Бути завжди на висоті!",
            "🦄 Справжнього чарівництва в житті!"
        ];

        this.colors = [
            { bg: '#ff4d6d', shadow: '#c9184a' },
            { bg: '#7209b7', shadow: '#3a0ca3' },
            { bg: '#4cc9f0', shadow: '#4361ee' },
            { bg: '#ffd166', shadow: '#f39c12' },
            { bg: '#06d6a0', shadow: '#059669' },
            { bg: '#ff85a1', shadow: '#ff0a54' }
        ];
    }

    init(containerId = 'balloon-arena') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.setupArena();
    }

    setupArena() {
        this.container.innerHTML = `
            <div class="balloon-hud">
                <div class="hud-item"><span class="hud-label">Лопнуто кульок:</span> <strong id="balloon-score">0</strong> 🎈</div>
                <div class="hud-item"><span class="hud-label">Зібрано побажань:</span> <strong id="wishes-score">0</strong> / ${this.wishes.length} 🎁</div>
            </div>
            <div class="balloon-stage" id="balloon-stage"></div>
            <div class="balloon-wishes-tray" id="balloon-wishes-tray">
                <div class="tray-title">🌟 Твоя колекція розблокованих побажань:</div>
                <div class="tray-items" id="tray-items"></div>
            </div>
            <div class="balloon-controls">
                <button class="action-btn" id="spawn-wave-btn">🎈 Запустити ще кульок!</button>
                <button class="action-btn secondary-btn" id="toggle-balloon-btn">⏸️ Пауза</button>
            </div>
        `;

        this.stage = document.getElementById('balloon-stage');
        this.scoreEl = document.getElementById('balloon-score');
        this.wishesScoreEl = document.getElementById('wishes-score');
        this.trayEl = document.getElementById('tray-items');

        document.getElementById('spawn-wave-btn').addEventListener('click', () => {
            this.spawnWave(8);
        });

        const toggleBtn = document.getElementById('toggle-balloon-btn');
        toggleBtn.addEventListener('click', () => {
            if (this.isActive) {
                this.stop();
                toggleBtn.textContent = '▶️ Продовжити';
            } else {
                this.start();
                toggleBtn.textContent = '⏸️ Пауза';
            }
        });

        this.start();
        this.spawnWave(6);
    }

    start() {
        this.isActive = true;
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        this.spawnInterval = setInterval(() => {
            if (this.isActive && document.hidden === false) {
                this.spawnBalloon();
            }
        }, 1800);
    }

    stop() {
        this.isActive = false;
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
    }

    spawnBalloon() {
        if (!this.stage) return;
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const left = Math.random() * 85 + 5; // percentage
        const size = Math.random() * 25 + 65; // size in px
        const duration = Math.random() * 6 + 7; // speed in seconds
        const wobble = (Math.random() - 0.5) * 60; // wobble distance

        const balloon = document.createElement('div');
        balloon.className = 'floating-balloon';
        balloon.style.left = `${left}%`;
        balloon.style.width = `${size}px`;
        balloon.style.height = `${size * 1.25}px`;
        balloon.style.backgroundColor = color.bg;
        balloon.style.boxShadow = `inset -7px -7px 12px ${color.shadow}, inset 7px 7px 15px rgba(255,255,255,0.6), 0 10px 25px rgba(0,0,0,0.3)`;
        balloon.style.animationDuration = `${duration}s`;
        balloon.style.setProperty('--wobble-x', `${wobble}px`);

        balloon.innerHTML = `
            <div class="balloon-knot" style="border-bottom-color: ${color.bg};"></div>
            <div class="balloon-string"></div>
            <div class="balloon-shine"></div>
        `;

        const handlePop = (e) => {
            if (e) {
                e.stopPropagation();
                if (e.cancelable) e.preventDefault();
            }
            this.popBalloon(balloon, color.bg);
        };

        balloon.addEventListener('pointerdown', handlePop);
        balloon.addEventListener('click', handlePop);
        balloon.addEventListener('touchstart', handlePop, { passive: false });

        this.stage.appendChild(balloon);

        // Remove balloon if it floats past top
        balloon.addEventListener('animationend', () => {
            if (balloon.parentNode) {
                balloon.remove();
            }
        });
    }

    spawnWave(count = 6) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.spawnBalloon(), i * 220);
        }
    }

    popBalloon(balloon, color) {
        if (balloon.classList.contains('popping')) return;
        balloon.classList.add('popping');

        const rect = balloon.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        window.soundManager.playPop();
        window.fxEngine.blastConfetti(centerX, centerY, 35);

        // Score update
        this.score++;
        if (this.scoreEl) this.scoreEl.textContent = this.score;

        // Wish pickup
        const wishIndex = (this.score - 1) % this.wishes.length;
        const wishText = this.wishes[wishIndex];

        // Floating floating text popup
        this.showFloatingBadge(centerX, centerY, wishText);

        // Add to wishes tray if not already added
        if (this.trayEl && this.wishesUnlocked < this.wishes.length) {
            this.wishesUnlocked++;
            if (this.wishesScoreEl) this.wishesScoreEl.textContent = this.wishesUnlocked;

            const badge = document.createElement('div');
            badge.className = 'unlocked-wish-badge';
            badge.textContent = wishText;
            this.trayEl.prepend(badge);
        }

        balloon.remove();
    }

    showFloatingBadge(x, y, text) {
        const badge = document.createElement('div');
        badge.className = 'floating-pop-wish';
        badge.textContent = text;
        badge.style.left = `${x}px`;
        badge.style.top = `${y}px`;
        document.body.appendChild(badge);

        setTimeout(() => badge.remove(), 1600);
    }
}

window.balloonGame = new BalloonGame();
