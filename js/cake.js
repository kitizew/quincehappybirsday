// Birthday Cake & Candle Blowing Interaction
class CakeManager {
    constructor() {
        this.cakeContainer = null;
        this.candles = [];
        this.candleCount = 5;
        this.isBlownOut = false;
        this.isListeningMic = false;
        this.audioContext = null;
        this.analyser = null;
        this.micStream = null;
        this.onAllBlownCallback = null;
    }

    init(containerId = 'cake-wrapper', onAllBlown = null) {
        this.cakeContainer = document.getElementById(containerId);
        this.onAllBlownCallback = onAllBlown;
        this.renderCake();
        this.setupEvents();
    }

    renderCake() {
        if (!this.cakeContainer) return;
        this.isBlownOut = false;

        let candlesHtml = '';
        for (let i = 0; i < this.candleCount; i++) {
            candlesHtml += `
                <div class="candle" data-index="${i}" title="Клікни щоб задмухати!">
                    <div class="flame">
                        <div class="flame-inner"></div>
                        <div class="flame-glow"></div>
                    </div>
                    <div class="wick"></div>
                    <div class="smoke"></div>
                    <div class="candle-stick"></div>
                </div>
            `;
        }

        this.cakeContainer.innerHTML = `
            <div class="cake-assembly">
                <!-- Candles Container -->
                <div class="candles-rack">
                    ${candlesHtml}
                </div>

                <!-- Top Tier -->
                <div class="cake-tier tier-top">
                    <div class="tier-frosting">
                        <div class="frosting-drip drip-1"></div>
                        <div class="frosting-drip drip-2"></div>
                        <div class="frosting-drip drip-3"></div>
                        <div class="frosting-drip drip-4"></div>
                        <div class="frosting-drip drip-5"></div>
                    </div>
                    <div class="tier-toppings">
                        <span class="cherry">🍓</span>
                        <span class="cherry">🫐</span>
                        <span class="cherry">🍓</span>
                    </div>
                </div>

                <!-- Middle Tier -->
                <div class="cake-tier tier-middle">
                    <div class="tier-frosting">
                        <div class="frosting-drip drip-1"></div>
                        <div class="frosting-drip drip-3"></div>
                        <div class="frosting-drip drip-5"></div>
                    </div>
                    <div class="sprinkles-pattern"></div>
                </div>

                <!-- Bottom Tier -->
                <div class="cake-tier tier-bottom">
                    <div class="cake-ribbon"></div>
                    <div class="sprinkles-pattern"></div>
                </div>

                <!-- Cake Plate -->
                <div class="cake-plate"></div>
            </div>

            <div class="cake-controls">
                <button class="action-btn blow-all-btn" id="blow-all-btn">
                    💨 Задмухати всі свічки
                </button>
                <button class="action-btn mic-btn" id="mic-blow-btn">
                    🎤 Задмухати в мікрофон
                </button>
                <button class="action-btn relight-btn hidden" id="relight-btn">
                    ✨ Запалити знову
                </button>
            </div>
            
            <div class="wish-prompt" id="wish-prompt">
                ✨ Загадай найзаповітніше бажання перед тим як задмухати! ✨
            </div>
        `;

        this.candles = Array.from(this.cakeContainer.querySelectorAll('.candle'));
    }

    setupEvents() {
        // Individual candle clicking
        this.cakeContainer.addEventListener('click', (e) => {
            const candle = e.target.closest('.candle');
            if (candle && !candle.classList.contains('extinguished')) {
                this.extinguishCandle(candle);
            }
        });

        // Blow all button
        const blowAllBtn = document.getElementById('blow-all-btn');
        if (blowAllBtn) {
            blowAllBtn.addEventListener('click', () => {
                this.blowAllCandles();
            });
        }

        // Relight button
        const relightBtn = document.getElementById('relight-btn');
        if (relightBtn) {
            relightBtn.addEventListener('click', () => {
                this.relightCandles();
            });
        }

        // Microphone blow detection
        const micBtn = document.getElementById('mic-blow-btn');
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                this.toggleMicDetection();
            });
        }
    }

    extinguishCandle(candleElement) {
        if (candleElement.classList.contains('extinguished')) return;
        
        candleElement.classList.add('extinguished');
        window.soundManager.playBlowSound();

        const smoke = candleElement.querySelector('.smoke');
        if (smoke) {
            smoke.classList.add('active');
            setTimeout(() => smoke.classList.remove('active'), 1800);
        }

        this.checkAllExtinguished();
    }

    blowAllCandles() {
        window.soundManager.playBlowSound();
        let delay = 0;
        this.candles.forEach((candle) => {
            if (!candle.classList.contains('extinguished')) {
                setTimeout(() => {
                    this.extinguishCandle(candle);
                }, delay);
                delay += 120;
            }
        });
    }

    relightCandles() {
        this.isBlownOut = false;
        window.soundManager.playSparkle();
        this.candles.forEach((candle) => {
            candle.classList.remove('extinguished');
        });

        const relightBtn = document.getElementById('relight-btn');
        const blowAllBtn = document.getElementById('blow-all-btn');
        const wishPrompt = document.getElementById('wish-prompt');

        if (relightBtn) relightBtn.classList.add('hidden');
        if (blowAllBtn) blowAllBtn.classList.remove('hidden');
        if (wishPrompt) {
            wishPrompt.textContent = "✨ Загадай найзаповітніше бажання перед тим як задмухати! ✨";
            wishPrompt.classList.remove('celebrating');
        }
    }

    checkAllExtinguished() {
        const remaining = this.candles.filter(c => !c.classList.contains('extinguished'));
        if (remaining.length === 0 && !this.isBlownOut) {
            this.isBlownOut = true;
            this.celebrateCakeSuccess();
        }
    }

    celebrateCakeSuccess() {
        window.soundManager.playFanfare();
        window.fxEngine.blastConfetti(window.innerWidth / 2, window.innerHeight * 0.45, 180);
        window.fxEngine.celebrationRain(4000);

        // Multiple fireworks bursts
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                window.fxEngine.launchFirework();
            }, i * 400);
        }

        const wishPrompt = document.getElementById('wish-prompt');
        if (wishPrompt) {
            wishPrompt.innerHTML = "🎉 Бажання обов'язково здійсниться! З Днем Народження! 🥳🌟";
            wishPrompt.classList.add('celebrating');
        }

        const relightBtn = document.getElementById('relight-btn');
        const blowAllBtn = document.getElementById('blow-all-btn');
        if (relightBtn) relightBtn.classList.remove('hidden');
        if (blowAllBtn) blowAllBtn.classList.add('hidden');

        if (this.isListeningMic) {
            this.stopMicDetection();
        }

        if (this.onAllBlownCallback) {
            this.onAllBlownCallback();
        }
    }

    async toggleMicDetection() {
        const micBtn = document.getElementById('mic-blow-btn');
        if (this.isListeningMic) {
            this.stopMicDetection();
            if (micBtn) micBtn.innerHTML = '🎤 Задмухати в мікрофон';
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.micStream = stream;
            this.isListeningMic = true;
            if (micBtn) {
                micBtn.innerHTML = '🔴 Дуй у мікрофон зараз!';
                micBtn.classList.add('active-mic');
            }

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            source.connect(this.analyser);

            const bufferLength = this.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const detectBlow = () => {
                if (!this.isListeningMic) return;
                this.analyser.getByteFrequencyData(dataArray);

                // Calculate average low-frequency energy (blowing creates strong rumble below 300Hz)
                let sum = 0;
                const lowBins = Math.min(25, bufferLength);
                for (let i = 0; i < lowBins; i++) {
                    sum += dataArray[i];
                }
                const avgLow = sum / lowBins;

                // Blowing noise threshold
                if (avgLow > 65) {
                    this.blowAllCandles();
                    this.stopMicDetection();
                    return;
                }

                requestAnimationFrame(detectBlow);
            };

            detectBlow();
        } catch (err) {
            alert("Не вдалося отримати доступ до мікрофона. Можна задмухати свічки кліком або кнопкою!");
            if (micBtn) micBtn.innerHTML = '🎤 Задмухати в мікрофон';
        }
    }

    stopMicDetection() {
        this.isListeningMic = false;
        const micBtn = document.getElementById('mic-blow-btn');
        if (micBtn) {
            micBtn.innerHTML = '🎤 Задмухати в мікрофон';
            micBtn.classList.remove('active-mic');
        }
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

window.cakeManager = new CakeManager();
