// Main Application Controller, Slide Switcher & State Management
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Graphic FX Engine
    window.fxEngine.init('fx-canvas');

    // State Variables - Default Name is Quince
    let appState = {
        name: 'Quince',
        sender: 'Твої найкращі друзі',
        age: '',
        theme: 'neon',
        musicPlaying: false,
        giftOpened: false,
        currentSlide: 0,
        totalSlides: 6
    };

    // Load from URL Parameters or LocalStorage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('name')) appState.name = urlParams.get('name');
    if (urlParams.has('from')) appState.sender = urlParams.get('from');
    if (urlParams.has('age')) appState.age = urlParams.get('age');
    if (urlParams.has('theme')) appState.theme = urlParams.get('theme');

    const savedState = localStorage.getItem('hb_party_state');
    if (savedState && !urlParams.has('name')) {
        try {
            const parsed = JSON.parse(savedState);
            appState = { ...appState, ...parsed };
            // Ensure default name stays Quince if it was a default placeholder
            if (!appState.name || appState.name === 'Іменинник') {
                appState.name = 'Quince';
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Apply State to DOM
    updatePersonalizedContent();
    applyTheme(appState.theme);

    // Initial Gift Unboxing Stage
    const giftBox = document.getElementById('mystery-gift-box');
    const introStage = document.getElementById('intro-stage');
    const mainStage = document.getElementById('main-party-stage');

    if (giftBox) {
        giftBox.addEventListener('click', () => {
            if (appState.giftOpened) return;
            appState.giftOpened = true;

            giftBox.classList.add('opening');
            window.soundManager.playFanfare();
            window.soundManager.toggleMusic((isPlaying) => updateMusicButton(isPlaying));

            const rect = giftBox.getBoundingClientRect();
            window.fxEngine.blastConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 160);
            window.fxEngine.celebrationRain(3000);

            // Trigger Fireworks sequence
            for (let i = 0; i < 4; i++) {
                setTimeout(() => window.fxEngine.launchFirework(), i * 350);
            }

            setTimeout(() => {
                introStage.classList.add('fade-out');
                setTimeout(() => {
                    introStage.style.display = 'none';
                    mainStage.classList.remove('hidden');
                    mainStage.classList.add('fade-in');

                    // Initialize all modules
                    window.cakeManager.init('cake-wrapper');
                    window.balloonGame.init('balloon-arena');
                    window.scratchCard.init('scratch-card-wrapper');

                    // Go to initial slide (Slide 0)
                    goToSlide(0);
                }, 700);
            }, 1200);
        });
    }

    // ========================================================
    // SLIDE & CHAPTER SWITCHER CONTROLLER
    // ========================================================
    const slides = document.querySelectorAll('.party-slide');
    const tabs = document.querySelectorAll('.chapter-tab');
    const dots = document.querySelectorAll('.slide-indicator-dots .dot');
    const prevBtn = document.getElementById('prev-slide-btn');
    const nextBtn = document.getElementById('next-slide-btn');

    function goToSlide(targetIndex) {
        if (targetIndex < 0 || targetIndex >= appState.totalSlides) return;
        appState.currentSlide = targetIndex;

        // Sound effect on slide switch
        window.soundManager.playSparkle();

        // Update slides visibility
        slides.forEach((slide, idx) => {
            if (idx === targetIndex) {
                slide.classList.add('active-slide');
            } else {
                slide.classList.remove('active-slide');
            }
        });

        // Update top tabs
        tabs.forEach((tab, idx) => {
            if (idx === targetIndex) {
                tab.classList.add('active');
                tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else {
                tab.classList.remove('active');
            }
        });

        // Update bottom dots
        dots.forEach((dot, idx) => {
            if (idx === targetIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update prev / next buttons state
        if (prevBtn) prevBtn.disabled = targetIndex === 0;
        if (nextBtn) nextBtn.disabled = targetIndex === appState.totalSlides - 1;

        // Pause video if navigating away from Slide 4
        const secretVideo = document.getElementById('scratch-secret-video');
        if (secretVideo && targetIndex !== 4) {
            secretVideo.pause();
        }

        // Slide specific triggers
        if (targetIndex === 1) { // Cake
            // Ensure cake ready
        } else if (targetIndex === 3) { // Balloons
            if (window.balloonGame) {
                window.balloonGame.start();
                window.balloonGame.spawnWave(5);
            }
        } else {
            // Stop spawning balloons when on other slides
            if (window.balloonGame && window.balloonGame.isActive) {
                window.balloonGame.stop();
            }
        }
        
        if (targetIndex === 4) { // Scratch Video
            if (window.scratchCard && window.scratchCard.canvas) {
                // Re-setup canvas dimensions in case of resizing
                setTimeout(() => {
                    if (!window.scratchCard.isRevealed) {
                        window.scratchCard.setupCanvas();
                    }
                }, 50);
            }
        }
    }

    // Chapter tabs click event
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const step = parseInt(tab.getAttribute('data-step'), 10);
            goToSlide(step);
        });
    });

    // Indicator dots click event
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const step = parseInt(dot.getAttribute('data-step'), 10);
            goToSlide(step);
        });
    });

    // Prev / Next button clicks
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(appState.currentSlide - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(appState.currentSlide + 1);
        });
    }

    // Hero next step button
    document.querySelectorAll('.next-step-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = parseInt(btn.getAttribute('data-target'), 10);
            goToSlide(target);
        });
    });

    // Keyboard Arrow Keys Navigation (Left / Right)
    window.addEventListener('keydown', (e) => {
        if (!appState.giftOpened) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            goToSlide(appState.currentSlide + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            goToSlide(appState.currentSlide - 1);
        }
    });

    // Touch Swipe Navigation for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const slidesContainer = document.querySelector('.party-slides-container');

    if (slidesContainer) {
        slidesContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slidesContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 60) {
            if (diff < 0) {
                // Swipe Left -> Next
                goToSlide(appState.currentSlide + 1);
            } else {
                // Swipe Right -> Prev
                goToSlide(appState.currentSlide - 1);
            }
        }
    }

    // Music Toggle Button
    const musicBtn = document.getElementById('music-toggle-btn');
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            window.soundManager.toggleMusic((isPlaying) => updateMusicButton(isPlaying));
        });
    }

    function updateMusicButton(isPlaying) {
        if (!musicBtn) return;
        if (isPlaying) {
            musicBtn.innerHTML = '🎵 <span class="music-bars"><span></span><span></span><span></span></span> Музика: Увімк.';
            musicBtn.classList.add('playing');
        } else {
            musicBtn.innerHTML = '🔇 Музика: Вимк.';
            musicBtn.classList.remove('playing');
        }
    }

    // Customization Modal
    const editModal = document.getElementById('edit-modal');
    const openEditBtn = document.getElementById('open-edit-btn');
    const closeEditBtn = document.getElementById('close-edit-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const shareLinkBtn = document.getElementById('share-link-btn');

    const inputName = document.getElementById('input-name');
    const inputSender = document.getElementById('input-sender');
    const inputAge = document.getElementById('input-age');
    const selectTheme = document.getElementById('select-theme');

    if (openEditBtn && editModal) {
        openEditBtn.addEventListener('click', () => {
            inputName.value = appState.name;
            inputSender.value = appState.sender;
            inputAge.value = appState.age || '';
            selectTheme.value = appState.theme;
            editModal.classList.remove('hidden');
        });
    }

    if (closeEditBtn && editModal) {
        closeEditBtn.addEventListener('click', () => {
            editModal.classList.add('hidden');
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            appState.name = inputName.value.trim() || 'Quince';
            appState.sender = inputSender.value.trim() || 'Твої друзі';
            appState.age = inputAge.value.trim();
            appState.theme = selectTheme.value;

            localStorage.setItem('hb_party_state', JSON.stringify(appState));
            updatePersonalizedContent();
            applyTheme(appState.theme);

            editModal.classList.add('hidden');
            window.soundManager.playSparkle();
            window.fxEngine.blastConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);
        });
    }

    if (shareLinkBtn) {
        shareLinkBtn.addEventListener('click', () => {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('name', appState.name);
            currentUrl.searchParams.set('from', appState.sender);
            if (appState.age) currentUrl.searchParams.set('age', appState.age);
            currentUrl.searchParams.set('theme', appState.theme);

            navigator.clipboard.writeText(currentUrl.toString()).then(() => {
                const originalText = shareLinkBtn.innerHTML;
                shareLinkBtn.innerHTML = '✅ Посилання скопійовано!';
                setTimeout(() => {
                    shareLinkBtn.innerHTML = originalText;
                }, 2500);
            }).catch(() => {
                prompt("Скопіюйте це посилання:", currentUrl.toString());
            });
        });
    }

    // Polaroid card interactive 3D flip & tilt
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    polaroidCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
            window.soundManager.playSparkle();
        });
    });

    // Custom Photo Upload Handler for Polaroids
    const photoUploadInput = document.getElementById('photo-upload-input');
    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const firstPolaroidImg = document.querySelector('.polaroid-card .polaroid-img');
                    if (firstPolaroidImg) {
                        firstPolaroidImg.style.backgroundImage = `url(${event.target.result})`;
                        firstPolaroidImg.style.backgroundSize = 'cover';
                        firstPolaroidImg.style.backgroundPosition = 'center';
                        firstPolaroidImg.innerHTML = '';
                    }
                    window.soundManager.playSparkle();
                };
                reader.readAsDataURL(files[0]);
            }
        });
    }

    // Sparkle trail on mouse/touch move
    let lastSparkleTime = 0;
    window.addEventListener('pointermove', (e) => {
        const now = Date.now();
        if (now - lastSparkleTime > 75) {
            createSparkleTrail(e.clientX, e.clientY);
            lastSparkleTime = now;
        }
    });

    function createSparkleTrail(x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-sparkle';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        sparkle.style.color = ['#ff2a7a', '#ffd000', '#00f0ff', '#ffffff', '#39ff14'][Math.floor(Math.random() * 5)];
        sparkle.textContent = ['✨', '⭐', '💖', '🎉', '🌟'][Math.floor(Math.random() * 5)];
        document.body.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 700);
    }

    function updatePersonalizedContent() {
        document.querySelectorAll('.target-name').forEach(el => {
            el.textContent = appState.name;
        });

        document.querySelectorAll('.target-sender').forEach(el => {
            el.textContent = appState.sender;
        });

        const ageBadge = document.getElementById('hero-age-badge');
        if (ageBadge) {
            if (appState.age) {
                ageBadge.textContent = `${appState.age} років яскравого життя! 🌟`;
                ageBadge.classList.remove('hidden');
            } else {
                ageBadge.classList.add('hidden');
            }
        }

        document.title = `🎉 З Днем Народження, ${appState.name}!`;
    }

    function applyTheme(themeName) {
        document.body.classList.remove('theme-neon', 'theme-gold', 'theme-sunset', 'theme-galaxy');
        document.body.classList.add(`theme-${themeName}`);
    }

    // ========================================================
    // MEGA EXPLOSION DETONATOR & GRAND FINALE CONTROLS
    // ========================================================
    const detonatorBtn = document.getElementById('detonator-btn');
    const detonatorBox = document.getElementById('detonator-box');
    const countdownDisplay = document.getElementById('countdown-display');
    const grandTrophyReveal = document.getElementById('grand-trophy-reveal');
    const repeatExplosionBtn = document.getElementById('repeat-explosion-btn');
    const danceDiscoBtn = document.getElementById('dance-disco-btn');
    const screenFlash = document.getElementById('screen-flash');

    const userExplosionGifBox = document.getElementById('user-explosion-gif-box');
    const userHeartGif = document.getElementById('user-heart-gif');
    const cinemaExplosionLayer = document.getElementById('cinema-explosion-layer');
    const explosionGifHeart = document.getElementById('explosion-gif-heart');
    const explosionGif1 = document.getElementById('explosion-gif-1');

    function triggerMegaExplosionSequence() {
        if (!detonatorBox || !countdownDisplay) return;

        detonatorBox.classList.add('hidden');
        if (grandTrophyReveal) grandTrophyReveal.classList.add('hidden');
        if (userExplosionGifBox) userExplosionGifBox.classList.add('hidden');
        countdownDisplay.classList.remove('hidden');

        let count = 3;
        countdownDisplay.textContent = count;
        window.soundManager.playCountdownBeep(450, 0.15);

        const countInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownDisplay.textContent = count;
                window.soundManager.playCountdownBeep(450 + (3 - count) * 120, 0.15);
            } else {
                clearInterval(countInterval);
                // Hide countdown text completely - NO TEXT BOOM, SHOW REAL GIF!
                countdownDisplay.classList.add('hidden');
                executeMegaBlast();
            }
        }, 750);
    }

    // DOM-based Flying Particles Burst for guaranteed 100% visibility
    function createDomExplosionBurst(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 50) {
        const emojis = ['👑', '🔥', '💥', '🚀', '💎', '💖', '🍾', '🎂', '🎉', '🌟', '✨', '⚡'];
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'dom-blast-particle';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * (window.innerWidth * 0.45) + 80;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance - Math.random() * 100;
            const rot = (Math.random() - 0.5) * 720;

            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.style.setProperty('--dx', `${dx}px`);
            el.style.setProperty('--dy', `${dy}px`);
            el.style.setProperty('--rot', `${rot}deg`);

            document.body.appendChild(el);
            setTimeout(() => el.remove(), 1900);
        }
    }

    function executeMegaBlast() {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight * 0.45;
        const cacheTime = Date.now();

        // 1. Audio Blast (Deep sub-bass + noise explosion + fanfare)
        window.soundManager.playMegaExplosion();

        // 2. Show User Heart Explosion GIF in Detonator Area
        if (userExplosionGifBox && userHeartGif) {
            userHeartGif.src = `heartexplo_Fx0zF5Li.gif?t=${cacheTime}`;
            userExplosionGifBox.classList.remove('hidden');
        }

        // 3. Trigger Fullscreen Cinematic Explosion Layer with User GIF
        if (cinemaExplosionLayer) {
            if (explosionGifHeart) explosionGifHeart.src = `heartexplo_Fx0zF5Li.gif?t=${cacheTime}`;
            if (explosionGif1) explosionGif1.src = `assets/explosion.gif?t=${cacheTime}`;
            cinemaExplosionLayer.classList.remove('hidden');

            setTimeout(() => {
                cinemaExplosionLayer.classList.add('hidden');
            }, 3600);
        }

        // 4. Page Shatter / Destruction of UI
        const partyStage = document.getElementById('main-party-stage');
        if (partyStage) {
            partyStage.classList.remove('page-shattering');
            void partyStage.offsetWidth;
            partyStage.classList.add('page-shattering');
            setTimeout(() => partyStage.classList.remove('page-shattering'), 2900);
        }

        // 5. Canvas Particle & Shockwave Storm (500+ particles, shockwaves, rockets)
        window.fxEngine.megaExplosionStorm(cx, cy);

        // 6. DOM Flying Emoji & Particle Burst + Expanding Shockwave Ring
        createDomExplosionBurst(cx, cy, 80);

        // Physical DOM Shockwave ring
        const ring = document.createElement('div');
        ring.className = 'dom-shockwave-ring';
        ring.style.left = `${cx}px`;
        ring.style.top = `${cy}px`;
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 1300);

        // 7. Screen Flash (Bright white flash overlay)
        if (screenFlash) {
            screenFlash.classList.add('active');
            setTimeout(() => {
                screenFlash.classList.remove('active');
                screenFlash.classList.add('fade-out');
                setTimeout(() => screenFlash.classList.remove('fade-out'), 900);
            }, 80);
        }

        // 8. Screen Quake / Earthquake shake
        document.body.classList.remove('screen-quake');
        void document.body.offsetWidth; // Trigger reflow
        document.body.classList.add('screen-quake');
        setTimeout(() => document.body.classList.remove('screen-quake'), 1200);

        // 9. Reveal Grand Trophy Badge
        setTimeout(() => {
            if (grandTrophyReveal) grandTrophyReveal.classList.remove('hidden');
        }, 1200);
    }

    const triggerSoundBlastBtn = document.getElementById('trigger-sound-blast-btn');
    if (triggerSoundBlastBtn) {
        triggerSoundBlastBtn.addEventListener('click', () => {
            executeMegaBlast();
        });
    }

    const mainHeartGif = document.getElementById('main-heart-gif');
    if (mainHeartGif) {
        mainHeartGif.addEventListener('click', () => {
            executeMegaBlast();
        });
    }

    if (detonatorBtn) {
        detonatorBtn.addEventListener('click', () => {
            triggerMegaExplosionSequence();
        });
    }

    if (repeatExplosionBtn) {
        repeatExplosionBtn.addEventListener('click', () => {
            executeMegaBlast();
        });
    }

    if (danceDiscoBtn) {
        danceDiscoBtn.addEventListener('click', () => {
            document.body.classList.toggle('disco-active');
            window.soundManager.playSparkle();
            if (document.body.classList.contains('disco-active')) {
                danceDiscoBtn.textContent = '⏸️ Зупинити Диско';
                window.fxEngine.celebrationRain(6000);
            } else {
                danceDiscoBtn.textContent = '🪩 Диско Режим! ✨';
            }
        });
    }

    // Intro Direct Blast Button
    const introDirectBlastBtn = document.getElementById('intro-direct-blast-btn');
    if (introDirectBlastBtn) {
        introDirectBlastBtn.addEventListener('click', () => {
            // Open party and jump directly to explosion
            if (!appState.giftOpened && giftBox) {
                appState.giftOpened = true;
                introStage.style.display = 'none';
                mainStage.classList.remove('hidden');
                window.cakeManager.init('cake-wrapper');
                window.balloonGame.init('balloon-arena');
                window.scratchCard.init('scratch-card-wrapper');
                goToSlide(5);
            }
            executeMegaBlast();
        });
    }

    // Navbar Mega Explosion button: launches the full blast immediately from anywhere!
    const instantConfettiBtn = document.getElementById('instant-confetti-btn');
    if (instantConfettiBtn) {
        instantConfettiBtn.addEventListener('click', () => {
            if (!appState.giftOpened && introStage && mainStage) {
                appState.giftOpened = true;
                introStage.style.display = 'none';
                mainStage.classList.remove('hidden');
                window.cakeManager.init('cake-wrapper');
                window.balloonGame.init('balloon-arena');
                window.scratchCard.init('scratch-card-wrapper');
                goToSlide(5);
            }
            executeMegaBlast();
        });
    }
});
