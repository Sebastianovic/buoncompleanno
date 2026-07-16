(() => {
    const intro = document.getElementById('intro-overlay');
    const subtitle = intro.querySelector('.titolo-centro .sottotitolo');
    const hihiImage = intro.querySelector('.hihi-image');
    const leftButton = intro.querySelector('.choice-left');
    const rightButton = intro.querySelector('.choice-right');
    const blackScreen = intro.querySelector('.black-screen');
    const questionText = intro.querySelector('.question-text');
    const choiceButtons = intro.querySelector('.choice-buttons');
    const transitionMessage = intro.querySelector('.transition-message');
    const photoStack = intro.querySelector('.photo-stack');
    const albumScrollHint = intro.querySelector('.album-scroll-hint');
    const blueMemoryScene = intro.querySelector('.blue-memory-scene');
    const blueMemoryText = intro.querySelector('.blue-memory-text');
    const loveCounter = intro.querySelector('.love-counter');
    const counterDays = intro.querySelector('[data-counter-days]');
    const counterHours = intro.querySelector('[data-counter-hours]');
    const counterMinutes = intro.querySelector('[data-counter-minutes]');
    const counterSeconds = intro.querySelector('[data-counter-seconds]');
    const finalScrollHint = intro.querySelector('.final-scroll-hint');
    const tapGameScene = intro.querySelector('.tap-game-scene');
    const tapGameHitLayer = intro.querySelector('.tap-game-hit-layer');
    const gameCountdown = intro.querySelector('[data-game-countdown]');
    const gameStatus = intro.querySelector('[data-game-status]');
    const tapCountDisplay = intro.querySelector('[data-tap-count]');
    const gameTimerDisplay = intro.querySelector('[data-game-timer]');
    const tapGameFinale = intro.querySelector('.tap-game-finale');
    const tapGameFinaleText = intro.querySelector('.tap-game-finale-text');
    const scratchGame = intro.querySelector('.scratch-game');
    const spaceReturnLetter = intro.querySelector('.space-return-letter');
    const spacePaperContent = intro.querySelector('.space-paper-content');
    const scratchClose = intro.querySelector('.scratch-close');
    const scratchCards = Array.from(intro.querySelectorAll('.scratch-card'));
    const scratchCompleteHint = intro.querySelector('.scratch-complete-hint');
    const scratchBonusCard = intro.querySelector('.scratch-bonus-card');
    const susAudio = document.getElementById('sus-audio');
    const catAudio = document.getElementById('cat-audio');
    const awwAudio = document.getElementById('aww-audio');
    const backgroundAudio = document.getElementById('background-audio');
    const backgroundAudio2 = document.getElementById('background-audio-2');

    let revealStep = 0;
    let introStarted = false;
    let suppressIntroInputUntil = 0;
    let activePointerId = null;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeCurrentX = 0;
    let swipeActive = false;
    let accumulatedSwipe = 0;
    let lastSwipeDirection = 0;
    let swipeEnabled = false;
    let photoRevealed = false;
    let activePhotoIndex = 0;
    let photoCards = [];
    let initialPhotoShown = false;
    let photoTransitionTimer = null;
    let wheelPhotoLocked = false;
    let photoSwipeStartedAfterReveal = false;
    let albumComplete = false;
    let blueSceneStarted = false;
    let blueTextStep = 0;
    let counterTimer = null;
    let blueTextChangeTimer = null;
    let counterHintTimer = null;
    let counterScrollReady = false;
    let tapGameStarted = false;
    let tapGameActive = false;
    let tapCount = 0;
    let finalTapCount = 0;
    let gameCountdownTimer = null;
    let gameTimer = null;
    let lastTapGameInputAt = 0;
    let lastTapGameInputX = -9999;
    let lastTapGameInputY = -9999;
    let scratchGameShown = false;
    let activeScratchCard = null;
    let activeScratchCanvas = null;
    let scratchPointerDown = false;
    let scratchActivationTimer = null;
    let scratchCompleteShown = false;
    let scratchBonusStarted = false;
    let scratchScrollStartY = 0;
    let spaceScrollReady = false;
    let spaceZoomStarted = false;
    let spaceLetterOpened = false;
    let catAudioPlayed = false;
    let secondSongStarted = false;
    let backgroundMusicGestureFallbackReady = false;
    const viewedPhotoIndexes = new Set();
    const blueMessages = [
        'Amorino sai, abbiamo avuto momenti bellissimi...',
        '...e giornate che non dimenticher\u00f2 mai...',
        '...ma se dovessi contare da quanto non smetto di sorridere...'
    ];
    const loveStartDateMs = Date.parse('2025-08-27T22:31:00+02:00');

    const padCounter = (value) => String(value).padStart(2, '0');

    const updateAppHeight = (force = false) => {
        const currentHeight = parseFloat(document.documentElement.style.getPropertyValue('--app-height')) || 0;
        const viewportHeight = window.innerHeight;
        const stableHeight = force ? viewportHeight : Math.max(currentHeight, viewportHeight);
        document.documentElement.style.setProperty('--app-height', `${stableHeight}px`);
    };

    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(() => updateAppHeight(true), 250);
    });

    const startBackgroundMusic = () => {
        if (!backgroundAudio || !backgroundAudio.paused || secondSongStarted) {
            return;
        }
        backgroundAudio.loop = true;
        backgroundAudio.volume = 1;
        backgroundAudio.currentTime = 0;
        backgroundAudio.play().catch(() => {
            if (backgroundMusicGestureFallbackReady) {
                return;
            }
            backgroundMusicGestureFallbackReady = true;
            document.addEventListener('pointerdown', startBackgroundMusic, { once: true });
            document.addEventListener('touchstart', startBackgroundMusic, { once: true, passive: true });
        });
    };

    const fadeAudioVolume = (audio, targetVolume, durationMs, onComplete) => {
        if (!audio) {
            return;
        }
        const startVolume = audio.volume;
        const startedAt = Date.now();
        const tickMs = 50;
        const fadeTimer = setInterval(() => {
            const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
            audio.volume = startVolume + (targetVolume - startVolume) * progress;
            if (progress >= 1) {
                clearInterval(fadeTimer);
                audio.volume = targetVolume;
                if (onComplete) {
                    onComplete();
                }
            }
        }, tickMs);
    };

    const switchToSecondSong = () => {
        if (secondSongStarted) {
            return;
        }
        secondSongStarted = true;

        if (backgroundAudio) {
            fadeAudioVolume(backgroundAudio, 0, 1800, () => {
                backgroundAudio.pause();
            });
        }

        if (backgroundAudio2) {
            backgroundAudio2.loop = true;
            backgroundAudio2.volume = 0;
            backgroundAudio2.currentTime = 34;
            backgroundAudio2.play().then(() => {
                fadeAudioVolume(backgroundAudio2, 1, 1800);
            }).catch(() => {
                /* Il browser puo' bloccare l'audio se non lo considera legato a un gesto. */
            });
        }
    };

    const showButtonPress = (button) => {
        if (!button) {
            return;
        }
        button.classList.remove('is-pressed-feedback');
        void button.offsetWidth;
        button.classList.add('is-pressed-feedback');
        button.addEventListener('animationend', () => {
            button.classList.remove('is-pressed-feedback');
        }, { once: true });
    };

    const preparePaperHandwriting = () => {
        if (!spacePaperContent || spacePaperContent.dataset.prepared === 'true') {
            return;
        }

        let wordIndex = 0;
        spacePaperContent.querySelectorAll('p').forEach((paragraph) => {
            const fragment = document.createDocumentFragment();
            paragraph.childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const parts = node.textContent.split(/(\s+)/);
                    parts.forEach((part) => {
                        if (!part) {
                            return;
                        }
                        if (/^\s+$/.test(part)) {
                            fragment.appendChild(document.createTextNode(part));
                            return;
                        }
                        const word = document.createElement('span');
                        word.className = 'paper-word';
                        word.style.setProperty('--word-index', wordIndex);
                        word.textContent = part;
                        wordIndex += 1;
                        fragment.appendChild(word);
                    });
                } else {
                    fragment.appendChild(node.cloneNode(true));
                }
            });
            paragraph.replaceChildren(fragment);
        });

        spacePaperContent.dataset.prepared = 'true';
    };

    preparePaperHandwriting();

    const updateLoveCounter = () => {
        const elapsedMs = Math.max(0, Date.now() - loveStartDateMs);
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (counterDays) counterDays.textContent = days;
        if (counterHours) counterHours.textContent = hours;
        if (counterMinutes) counterMinutes.textContent = padCounter(minutes);
        if (counterSeconds) counterSeconds.textContent = padCounter(seconds);
    };

    const startLoveCounter = () => {
        intro.classList.remove('show-love-counter');
        void intro.offsetWidth;
        intro.classList.add('show-love-counter', 'stable-after-counter');
        counterScrollReady = false;
        intro.classList.remove('counter-scroll-ready');
        if (loveCounter) {
            loveCounter.setAttribute('aria-hidden', 'false');
        }
        updateLoveCounter();
        if (counterTimer) {
            clearInterval(counterTimer);
        }
        counterTimer = setInterval(updateLoveCounter, 1000);
        if (counterHintTimer) {
            clearTimeout(counterHintTimer);
        }
        counterHintTimer = setTimeout(() => {
            counterScrollReady = true;
            intro.classList.add('counter-scroll-ready');
            if (finalScrollHint) {
                finalScrollHint.setAttribute('aria-hidden', 'false');
            }
        }, 3000);
    };

    const createTapHeart = (x, y) => {
        if (!tapGameScene) {
            return;
        }

        const heart = document.createElement('span');
        heart.className = 'tap-heart';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        tapGameScene.appendChild(heart);
        heart.addEventListener('animationend', () => {
            heart.remove();
        }, { once: true });
    };

    const updateTapCount = () => {
        if (tapCountDisplay) {
            tapCountDisplay.textContent = tapCount;
        }
    };

    const startTapGameFinale = () => {
        intro.classList.add('tap-game-finished');
        if (tapGameFinale) {
            tapGameFinale.setAttribute('aria-hidden', 'false');
        }

        setTimeout(() => {
            intro.classList.add('show-finale-gif');
            if (catAudio && !catAudioPlayed) {
                catAudioPlayed = true;
                catAudio.volume = 0.25;
                catAudio.currentTime = 0;
                catAudio.play().catch(() => {
                    /* Autoplay bloccato: il suono parte solo se il browser lo permette dopo il gesto. */
                });
            }
        }, 2000);

        setTimeout(() => {
            intro.classList.remove('show-finale-gif');
            if (tapGameFinaleText) {
                tapGameFinaleText.textContent = `Diaaablo amo, ${finalTapCount} sono un po tanti... do le metto qua ahah`;
                tapGameFinaleText.classList.remove('text-pop-in');
                void tapGameFinaleText.offsetWidth;
                tapGameFinaleText.classList.add('text-pop-in');
            }
            intro.classList.add('show-finale-text');
        }, 5500);

        setTimeout(() => {
            if (tapGameFinaleText) {
                tapGameFinaleText.textContent = 'Te ne ho preparate 5 per\u00f2 hihi';
                tapGameFinaleText.classList.remove('text-pop-in');
                void tapGameFinaleText.offsetWidth;
                tapGameFinaleText.classList.add('text-pop-in');
            }
            switchToSecondSong();
        }, 9500);

        setTimeout(() => {
            scratchGameShown = true;
            intro.classList.remove('show-finale-text');
            intro.classList.add('show-scratch-game');
            if (tapGameFinale) {
                tapGameFinale.setAttribute('aria-hidden', 'true');
            }
            if (scratchGame) {
                scratchGame.setAttribute('aria-hidden', 'false');
            }
            requestAnimationFrame(() => {
                scratchCards.forEach((card) => {
                    setupScratchCard(card);
                });
            });
        }, 12000);
    };

    const paintScratchCover = (canvas) => {
        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        canvas.height = Math.max(1, Math.floor(rect.height * ratio));
        const ctx = canvas.getContext('2d');
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        gradient.addColorStop(0, '#f9f5ff');
        gradient.addColorStop(0.48, '#dceeff');
        gradient.addColorStop(1, '#ffc8df');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, rect.width, rect.height);

        ctx.globalAlpha = 0.38;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let x = -rect.height; x < rect.width + rect.height; x += 12) {
            ctx.beginPath();
            ctx.moveTo(x, rect.height);
            ctx.lineTo(x + rect.height, 0);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    };

    const setupScratchCard = (card) => {
        const canvas = card.querySelector('.scratch-cover');
        if (!canvas || card.dataset.scratchReady === 'true') {
            return;
        }
        card.dataset.scratchReady = 'true';
        paintScratchCover(canvas);
    };

    const findScratchCardAtPoint = (x, y) => {
        const visibleCards = scratchCards.filter((card) => !card.classList.contains('is-scratched'));
        const orderedCards = activeScratchCard
            ? [activeScratchCard, ...visibleCards.filter((card) => card !== activeScratchCard)]
            : visibleCards;

        return orderedCards.find((card) => {
            const rect = card.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }) || null;
    };

    const selectScratchCard = (card) => {
        if (!scratchGameShown || scratchCompleteShown) {
            return false;
        }

        const wasSelected = card === activeScratchCard;
        scratchPointerDown = false;
        scratchCards.forEach((item) => {
            item.classList.toggle('is-selected', item === card);
        });
        activeScratchCard = card;
        activeScratchCanvas = card.querySelector('.scratch-cover');
        intro.classList.add('scratch-card-selected');
        if (scratchGame) {
            scratchGame.classList.add('has-selected-card');
        }
        if (!wasSelected && activeScratchCanvas && card.dataset.scratchTouched !== 'true' && !card.classList.contains('is-scratched')) {
            requestAnimationFrame(() => {
                if (activeScratchCard === card && activeScratchCanvas && card.dataset.scratchTouched !== 'true' && !card.classList.contains('is-scratched')) {
                    paintScratchCover(activeScratchCanvas);
                }
            });
        }
        if (!wasSelected && scratchActivationTimer) {
            clearTimeout(scratchActivationTimer);
            scratchActivationTimer = null;
        }
        return wasSelected;
    };

    const closeScratchCard = () => {
        scratchPointerDown = false;
        activeScratchCard = null;
        activeScratchCanvas = null;
        intro.classList.remove('scratch-card-selected');
        if (scratchGame) {
            scratchGame.classList.remove('has-selected-card');
        }
        scratchCards.forEach((card) => {
            card.classList.remove('is-selected');
        });
    };

    const showScratchCompleteSequence = () => {
        if (scratchCompleteShown || !scratchCards.every((item) => item.classList.contains('is-scratched'))) {
            return;
        }

        scratchCompleteShown = true;
        closeScratchCard();

        if (scratchGame) {
            scratchGame.classList.add('scratch-complete');
        }
        if (scratchCompleteHint) {
            scratchCompleteHint.setAttribute('aria-hidden', 'false');
        }
    };

    const startScratchBonusSequence = () => {
        if (!scratchCompleteShown || scratchBonusStarted) {
            return;
        }

        scratchBonusStarted = true;
        if (scratchCompleteHint) {
            scratchCompleteHint.setAttribute('aria-hidden', 'true');
        }
        if (scratchBonusCard) {
            scratchBonusCard.setAttribute('aria-hidden', 'false');
        }
        if (scratchGame) {
            scratchGame.classList.add('show-scratch-bonus');
        }

        setTimeout(() => {
            if (scratchGame) {
                scratchGame.classList.add('show-earth-space');
            }
        }, 5000);

        setTimeout(() => {
            if (scratchGame) {
                scratchGame.classList.add('show-space-question');
            }
        }, 7300);

        setTimeout(() => {
            if (scratchGame) {
                scratchGame.classList.add('space-letter-fly');
            }
        }, 9800);

        setTimeout(() => {
            if (scratchGame) {
                scratchGame.classList.add('show-space-catch');
            }
        }, 11350);

        setTimeout(() => {
            spaceScrollReady = true;
            if (scratchGame) {
                scratchGame.classList.add('show-space-scroll-hint');
            }
        }, 15650);

        setTimeout(() => {
            if (scratchGame) {
                scratchGame.classList.add('reveal-scratch-bonus');
            }
        }, 1200);
    };

    const startSpaceZoomSequence = () => {
        if (!spaceScrollReady || spaceZoomStarted) {
            return;
        }
        spaceZoomStarted = true;
        if (scratchGame) {
            scratchGame.classList.add('space-zoom-out');
        }
        setTimeout(() => {
            if (scratchGame) {
                scratchGame.classList.add('space-return-letter-in');
            }
        }, 7800);
        setTimeout(() => {
            if (scratchGame) {
                scratchGame.classList.add('show-space-letter-prompt');
            }
        }, 13000);
    };

    const openSpaceLetter = () => {
        if (!spaceZoomStarted || spaceLetterOpened || !scratchGame || !scratchGame.classList.contains('show-space-letter-prompt')) {
            return;
        }
        spaceLetterOpened = true;
        scratchGame.classList.add('space-letter-opened');
    };

    const scratchAt = (event) => {
        if (!activeScratchCard || !activeScratchCanvas || activeScratchCard.classList.contains('is-scratched')) {
            return;
        }
        const rect = activeScratchCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            return;
        }
        activeScratchCard.dataset.scratchTouched = 'true';
        const ctx = activeScratchCanvas.getContext('2d');
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(28, rect.width * 0.1), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        checkScratchProgress(activeScratchCard, activeScratchCanvas);
    };

    const releaseScratchCover = (canvas) => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 1;
        canvas.height = 1;
    };

    const checkScratchProgress = (card, canvas) => {
        if (!card || !canvas || card.classList.contains('is-scratched')) {
            return;
        }
        const ctx = canvas.getContext('2d');
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let cleared = 0;
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 32) {
                cleared += 1;
            }
        }

        if (cleared / (pixels.length / 4) >= 0.6) {
            card.classList.add('is-scratched');
            releaseScratchCover(canvas);
            activeScratchCard = null;
            activeScratchCanvas = null;
            scratchPointerDown = false;
        }
    };

    const startTapGamePlay = () => {
        tapGameActive = true;
        intro.classList.add('tap-game-input-active');
        tapCount = 0;
        finalTapCount = 0;
        updateTapCount();
        if (gameStatus) {
            gameStatus.textContent = 'Tocca più che puoi!';
        }
        if (gameCountdown) {
            gameCountdown.textContent = 'VIA';
        }

        const gameStartedAt = Date.now();
        const gameDuration = 5000;
        if (gameTimer) {
            clearInterval(gameTimer);
        }
        gameTimer = setInterval(() => {
            const remaining = Math.max(0, gameDuration - (Date.now() - gameStartedAt));
            if (gameTimerDisplay) {
                gameTimerDisplay.textContent = `${(remaining / 1000).toFixed(1)}s`;
            }
            if (remaining <= 0) {
                clearInterval(gameTimer);
                tapGameActive = false;
                intro.classList.remove('tap-game-input-active');
                finalTapCount = tapCount;
                if (gameStatus) {
                    gameStatus.textContent = 'Tempo!';
                }
                if (gameCountdown) {
                    gameCountdown.textContent = tapCount;
                }
                startTapGameFinale();
            }
        }, 80);
    };

    const startTapGameCountdown = () => {
        let countdown = 5;
        if (gameCountdown) {
            gameCountdown.textContent = countdown;
        }
        if (gameStatus) {
            gameStatus.textContent = 'Preparati...';
        }
        if (gameTimerDisplay) {
            gameTimerDisplay.textContent = '5.0s';
        }
        updateTapCount();

        if (gameCountdownTimer) {
            clearInterval(gameCountdownTimer);
        }
        gameCountdownTimer = setInterval(() => {
            countdown -= 1;
            if (gameCountdown) {
                gameCountdown.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(gameCountdownTimer);
                startTapGamePlay();
            }
        }, 1000);
    };

    const startTapGameScene = () => {
        if (!counterScrollReady || tapGameStarted) {
            return;
        }

        tapGameStarted = true;
        intro.classList.remove('counter-scroll-ready');
        requestAnimationFrame(() => {
            intro.classList.add('tap-game-transition', 'tap-game-ready');
        });
        if (blueMemoryScene) {
            blueMemoryScene.setAttribute('aria-hidden', 'true');
        }
        if (loveCounter) {
            loveCounter.setAttribute('aria-hidden', 'true');
        }
        if (tapGameScene) {
            tapGameScene.setAttribute('aria-hidden', 'false');
        }
        setTimeout(() => {
            startTapGameCountdown();
        }, 650);
    };

    const registerTapGameInput = (x, y) => {
        if (!tapGameStarted || !tapGameActive || intro.classList.contains('show-scratch-game')) {
            return false;
        }

        const now = Date.now();
        const isDuplicate = now - lastTapGameInputAt < 90
            && Math.abs(x - lastTapGameInputX) < 14
            && Math.abs(y - lastTapGameInputY) < 14;

        if (isDuplicate) {
            return false;
        }

        lastTapGameInputAt = now;
        lastTapGameInputX = x;
        lastTapGameInputY = y;
        tapCount += 1;
        updateTapCount();
        createTapHeart(x, y);
        return true;
    };

    const handleTapGameTap = (event) => {
        if (registerTapGameInput(event.clientX, event.clientY)) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const handleTapGameTouch = (event) => {
        const touch = event.changedTouches && event.changedTouches[0];
        if (!touch) {
            return;
        }

        if (registerTapGameInput(touch.clientX, touch.clientY)) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const advanceBlueScene = () => {
        if (!blueSceneStarted) {
            return;
        }
        if (blueTextChangeTimer) {
            return;
        }

        if (blueTextStep < blueMessages.length - 1) {
            blueTextStep += 1;
            if (blueMemoryText) {
                blueMemoryText.classList.add('is-changing');
                blueTextChangeTimer = setTimeout(() => {
                    blueMemoryText.textContent = blueMessages[blueTextStep];
                    requestAnimationFrame(() => {
                        blueMemoryText.classList.remove('is-changing');
                        blueTextChangeTimer = null;
                    });
                }, 180);
            }
            return;
        }

        if (!intro.classList.contains('show-love-counter')) {
            startLoveCounter();
        }
    };

    const startBlueScene = () => {
        if (blueSceneStarted || !albumComplete) {
            return;
        }

        blueSceneStarted = true;
        blueTextStep = 0;
        intro.classList.remove('blue-text-ready');
        intro.classList.add('blue-scene-active');
        if (photoStack) {
            photoStack.setAttribute('aria-hidden', 'true');
        }
        if (albumScrollHint) {
            albumScrollHint.setAttribute('aria-hidden', 'true');
        }
        if (blueMemoryScene) {
            blueMemoryScene.setAttribute('aria-hidden', 'false');
        }
        if (blueMemoryText) {
            blueMemoryText.textContent = blueMessages[0];
        }
        setTimeout(() => {
            intro.classList.add('blue-text-ready');
        }, 1100);
    };

    const markPhotoSeen = () => {
        if (!photoRevealed || photoCards.length === 0 || albumComplete) {
            return;
        }

        viewedPhotoIndexes.add(activePhotoIndex);
        if (viewedPhotoIndexes.size >= photoCards.length) {
            albumComplete = true;
            intro.classList.add('album-complete');
            if (albumScrollHint) {
                albumScrollHint.setAttribute('aria-hidden', 'false');
            }
        }
    };

    const createPhotoCards = () => {
        if (!photoStack) {
            return;
        }

        photoStack.innerHTML = '';

        const photoItems = [
            { src: 'foto1.jpg', title: 'Primo viaggio Insieme', subtitle: 'Firenze' },
            { src: 'foto2.jpg', title: 'Feste Natalizie', subtitle: 'Roma' },
            { src: 'foto3.jpg', title: 'Primo Natale insieme' },
            { src: 'foto4.jpg', title: 'Viaggio per Capodanno', subtitle: 'Polonia, Zakopane' },
            { src: 'foto5.jpg', title: 'Napoletani bastardi', subtitle: 'Napoli' },
            { src: 'foto6.jpg', title: 'Post Starbucks' },
            { src: 'foto7.jpg', title: 'Uscita inventata sul momento', subtitle: 'perch\u00e8 si' },
            { src: 'foto8.jpg', title: 'Sushi dateee' },
            { src: 'foto9.jpg', title: 'Post scontro palle di neve' },
            { src: 'foto10.jpg', title: 'Post balletto TikTok' },
            { src: 'foto11.jpg', title: 'Primo viaggio all\u0027estero', subtitle: 'Praga' }
        ];

        for (let i = 0; i < photoItems.length; i += 1) {
            const photo = photoItems[i];
            const card = document.createElement('div');
            card.className = 'photo-polaroid';
            if (i === 0) {
                card.classList.add('is-active');
            }

            const caption = document.createElement('div');
            caption.className = 'photo-caption';

            const title = document.createElement('div');
            title.className = 'photo-caption-title';
            title.textContent = photo.title;
            caption.appendChild(title);

            if (photo.subtitle) {
                const subtitleLine = document.createElement('div');
                subtitleLine.className = 'photo-caption-subtitle';
                subtitleLine.textContent = photo.subtitle;
                caption.appendChild(subtitleLine);
            }

            const image = document.createElement('img');
            image.src = photo.src;
            image.alt = photo.subtitle ? `${photo.title} - ${photo.subtitle}` : photo.title;
            image.className = 'photo-image';
            image.width = 720;
            image.height = 1008;
            card.appendChild(caption);
            card.appendChild(image);
            photoStack.appendChild(card);
        }

        photoCards = Array.from(photoStack.querySelectorAll('.photo-polaroid'));
        if (!initialPhotoShown && photoCards.length > 0) {
            initialPhotoShown = true;
            photoCards[0].classList.add('is-initial');
            photoCards[0].addEventListener('animationend', () => {
                photoCards[0].classList.remove('is-initial');
            }, { once: true });
        }
        updatePhotoCarousel();
        markPhotoSeen();
    };

    const updatePhotoCarousel = () => {
        if (!photoStack || photoCards.length === 0) {
            return;
        }

        const totalPhotos = photoCards.length;
        const sideSpacing = window.innerWidth < 600 ? 54 : 72;
        const hiddenSpacing = window.innerWidth < 600 ? 128 : 168;

        photoCards.forEach((card, index) => {
            let offset = index - activePhotoIndex;
            if (offset > totalPhotos / 2) {
                offset -= totalPhotos;
            } else if (offset < -totalPhotos / 2) {
                offset += totalPhotos;
            }

            const absOffset = Math.abs(offset);
            const isActive = offset === 0;
            const isNear = absOffset <= 3;
            const direction = Math.sign(offset);
            const distance = Math.min(absOffset, 3);
            const x = isActive ? 0 : direction * (sideSpacing + (distance - 1) * hiddenSpacing);
            const y = 0;
            const rotation = isActive ? -1 : direction * (5 + distance * 4);
            const scale = isActive ? 1 : Math.max(0.7, 0.9 - distance * 0.08);
            const opacity = isNear ? 1 : 0;
            const zIndex = isActive ? 30 : 30 - absOffset;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
            card.style.setProperty('--rotation', `${rotation}deg`);
            card.style.setProperty('--scale', `${scale}`);
            card.style.setProperty('--opacity', `${opacity}`);
            card.style.setProperty('--z-index', `${zIndex}`);
            card.style.setProperty('--from-x', `${direction === 0 ? 0 : direction * 28}vw`);
            card.style.setProperty('--from-y', '0px');
            card.style.setProperty('--from-rotation', `${direction === 0 ? -1 : direction * 12}deg`);
            card.style.setProperty('--from-scale', `${isActive ? 0.8 : 0.74}`);
            card.style.setProperty('--delay', `${Math.min(0.16, absOffset * 0.025)}s`);
            card.classList.toggle('is-active', isActive);
            card.classList.toggle('is-near', isNear);
        });
    };

    const triggerPhotoTransition = () => {
        if (!photoCards.length) {
            return;
        }

        photoCards.forEach((card) => {
            card.classList.add('is-transitioning');
        });

        if (photoTransitionTimer) {
            clearTimeout(photoTransitionTimer);
        }

        photoTransitionTimer = setTimeout(() => {
            photoCards.forEach((card) => {
                card.classList.remove('is-transitioning');
            });
        }, 900);
    };

    const goToPhoto = (direction) => {
        intro.classList.toggle('photo-moving-left', direction > 0);
        intro.classList.toggle('photo-moving-right', direction < 0);
        activePhotoIndex = (activePhotoIndex + direction + photoCards.length) % photoCards.length;
        triggerPhotoTransition();
        updatePhotoCarousel();
        markPhotoSeen();
    };

    const setPinkTint = (value) => {
        const amount = Math.max(0, Math.min(1, value));
        intro.style.setProperty('--pink-overlay-opacity', amount.toFixed(3));
        intro.style.setProperty('--pink-reveal-shift', `${((1 - amount) * 16).toFixed(2)}vw`);
        intro.style.setProperty('--pink-reveal-scale', (0.9 + amount * 0.1).toFixed(3));
        intro.style.setProperty('--pink-magic-shift', `${((1 - amount) * 8).toFixed(2)}vw`);

        if (!photoRevealed && amount >= 1) {
            photoRevealed = true;
            intro.classList.add('photo-ready');
            createPhotoCards();
        }
    };

    const advanceReveal = () => {
        if (hihiImage && hihiImage.classList.contains('visible') && !intro.classList.contains('hihi-transition-active')) {
            intro.classList.add('hihi-transition-active');
            if (transitionMessage) {
                transitionMessage.addEventListener('transitionend', (event) => {
                    if (event.propertyName === 'opacity' && intro.classList.contains('hihi-transition-active')) {
                        swipeEnabled = true;
                    }
                }, { once: true });
            }
            return;
        }

        if (revealStep === 0) {
            intro.classList.add('show-alt', 'show-alt-text');
            revealStep = 1;
        } else if (revealStep === 1) {
            intro.classList.add('letter-visible');
            revealStep = 2;
        } else if (revealStep === 2) {
            intro.classList.add('show-question');
            revealStep = 3;
        } else if (revealStep === 3) {
            intro.classList.add('show-susdog');
            if (susAudio) {
                susAudio.volume = 0.25;
                susAudio.currentTime = 0;
                susAudio.play().catch(() => {
                    /* Autoplay bloccato: si attiva al prossimo gesto dell'utente */
                });
            }
            revealStep = 4;
        } else if (revealStep === 4) {
            intro.classList.add('show-hmm');
            revealStep = 5;
        } else if (revealStep === 5) {
            intro.classList.add('show-question2');
            revealStep = 6;
        } else if (revealStep === 6) {
            intro.classList.add('show-question3');
            revealStep = 7;
        }
    };

    const startIntroExperience = () => {
        if (introStarted) {
            return;
        }
        introStarted = true;
        suppressIntroInputUntil = Date.now() + 700;
        intro.classList.add('intro-started', 'attivo');
        startBackgroundMusic();

        const showHint = () => {
            intro.classList.add('intro-subtitle-settled');
            intro.classList.add('hint-ready');
            subtitle.removeEventListener('animationend', onSubtitleRevealEnd);
        };

        const onSubtitleRevealEnd = (event) => {
            if (event.animationName === 'handwriting-reveal') {
                showHint();
            }
        };

        subtitle.addEventListener('animationend', onSubtitleRevealEnd);
        setTimeout(showHint, 2800);
    };

    document.addEventListener('pointerdown', startIntroExperience, { once: true });
    document.addEventListener('touchstart', startIntroExperience, { once: true, passive: true });

    intro.addEventListener('pointerdown', (event) => {
        if (!introStarted || Date.now() < suppressIntroInputUntil) {
            return;
        }
        if (event.target.closest('button')) {
            return;
        }
        if (tapGameStarted && event.target.closest('.tap-game-scene')) {
            return;
        }
        if (tapGameStarted) {
            if (tapGameActive) {
                tapCount += 1;
                updateTapCount();
                createTapHeart(event.clientX, event.clientY);
            }
            return;
        }

        activePointerId = event.pointerId;
        swipeStartX = event.clientX;
        swipeStartY = event.clientY;
        swipeCurrentX = event.clientX;
        swipeActive = false;
        photoSwipeStartedAfterReveal = photoRevealed;
        intro.classList.add('is-swiping');
        try {
            intro.setPointerCapture(event.pointerId);
        } catch {
            /* Alcuni browser mobile possono rifiutare la capture durante gesture veloci. */
        }
    });

    if (tapGameScene) {
        tapGameScene.addEventListener('pointerdown', handleTapGameTap, true);
        tapGameScene.addEventListener('touchstart', handleTapGameTouch, { capture: true, passive: false });
    }

    if (tapGameHitLayer) {
        tapGameHitLayer.addEventListener('pointerdown', handleTapGameTap, true);
        tapGameHitLayer.addEventListener('touchstart', handleTapGameTouch, { capture: true, passive: false });
    }

    document.addEventListener('pointerdown', handleTapGameTap, true);
    document.addEventListener('touchstart', handleTapGameTouch, { capture: true, passive: false });

    intro.addEventListener('pointermove', (event) => {
        if (!swipeEnabled || activePointerId !== event.pointerId) {
            return;
        }
        if (blueSceneStarted) {
            return;
        }

        const deltaX = event.clientX - swipeStartX;
        const deltaY = event.clientY - swipeStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 12) {
            swipeActive = true;
            if (photoRevealed) {
                if (!photoSwipeStartedAfterReveal) {
                    return;
                }

                const dragX = Math.max(-110, Math.min(110, deltaX));
                intro.style.setProperty('--photo-drag-x', `${dragX}px`);
                intro.style.setProperty('--photo-drag-rotate', `${dragX * 0.035}deg`);
                lastSwipeDirection = deltaX < 0 ? 1 : -1;
                return;
            }

            if (deltaX < 0) {
                lastSwipeDirection = -1;
                const stepAmount = Math.min(1, Math.abs(event.clientX - swipeCurrentX) / window.innerWidth);
                if (stepAmount > 0) {
                    const nextAmount = Math.min(1, accumulatedSwipe + stepAmount);
                    accumulatedSwipe = nextAmount;
                    setPinkTint(nextAmount);
                    swipeCurrentX = event.clientX;
                }
            } else if (deltaX > 0) {
                lastSwipeDirection = 1;
            }
        }
    });

    intro.addEventListener('pointerup', (event) => {
        if (!introStarted || Date.now() < suppressIntroInputUntil) {
            return;
        }
        if (activePointerId === event.pointerId) {
            const deltaX = event.clientX - swipeStartX;
            const deltaY = event.clientY - swipeStartY;

            if (intro.classList.contains('show-love-counter') && counterScrollReady && !tapGameStarted && deltaY < -74 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
                startTapGameScene();
            } else if (blueSceneStarted && !swipeActive) {
                advanceBlueScene();
            } else if (photoRevealed && photoSwipeStartedAfterReveal && Math.abs(deltaY) > 74 && Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
                startBlueScene();
            } else if (photoRevealed && swipeActive && photoSwipeStartedAfterReveal) {
                if (Math.abs(deltaX) > 54) {
                    goToPhoto(deltaX < 0 ? 1 : -1);
                }
                intro.style.setProperty('--photo-drag-x', '0px');
                intro.style.setProperty('--photo-drag-rotate', '0deg');
            } else if (swipeEnabled && swipeActive && lastSwipeDirection < 0) {
                const nextAmount = Math.min(1, accumulatedSwipe + 0.02);
                accumulatedSwipe = nextAmount;
                setPinkTint(nextAmount);
            } else if (!swipeActive) {
                advanceReveal();
            }
            activePointerId = null;
            swipeActive = false;
            photoSwipeStartedAfterReveal = false;
            lastSwipeDirection = 0;
            intro.classList.remove('is-swiping');
        }
    });

    intro.addEventListener('pointercancel', (event) => {
        if (activePointerId === event.pointerId) {
            activePointerId = null;
            swipeActive = false;
            photoSwipeStartedAfterReveal = false;
            intro.style.setProperty('--photo-drag-x', '0px');
            intro.style.setProperty('--photo-drag-rotate', '0deg');
            intro.classList.remove('is-swiping');
        }
    });

    window.addEventListener('resize', () => {
        if (photoRevealed) {
            updatePhotoCarousel();
        }
    });

    window.addEventListener('wheel', (event) => {
        if (spaceScrollReady && !spaceZoomStarted && event.deltaY > 18 && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            startSpaceZoomSequence();
            return;
        }
        if (scratchCompleteShown && !scratchBonusStarted && event.deltaY > 18 && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            startScratchBonusSequence();
            return;
        }
        if (!swipeEnabled) {
            return;
        }
        if (blueSceneStarted) {
            if (intro.classList.contains('show-love-counter') && counterScrollReady && !tapGameStarted && event.deltaY > 18) {
                startTapGameScene();
            }
            return;
        }
        if (photoRevealed) {
            if (event.deltaY > 18 && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
                startBlueScene();
                return;
            }

            if (!wheelPhotoLocked && Math.abs(event.deltaX) > 8) {
                wheelPhotoLocked = true;
                goToPhoto(event.deltaX < 0 ? 1 : -1);
                setTimeout(() => {
                    wheelPhotoLocked = false;
                }, 520);
            }
            return;
        }
        if (event.deltaX < 0) {
            const current = parseFloat(intro.style.getPropertyValue('--pink-overlay-opacity') || '0');
            const nextAmount = Math.min(1, current + 0.18);
            accumulatedSwipe = nextAmount;
            setPinkTint(nextAmount);
        }
    }, { passive: true });

    if (leftButton && questionText) {
        leftButton.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            showButtonPress(leftButton);
            const currentQuestion = questionText.textContent.trim();
            if (currentQuestion === 'hihi.gif') {
                return;
            }
            questionText.classList.add('fade-out');
            questionText.addEventListener('animationend', function handleFadeOut() {
                questionText.removeEventListener('animationend', handleFadeOut);
                if (currentQuestion === 'AWWWWW DAVVERO?') {
                    if (choiceButtons) {
                        choiceButtons.classList.add('hidden');
                    }
                    questionText.textContent = '';
                    questionText.classList.remove('smaller');
                    if (hihiImage) {
                        hihiImage.classList.add('visible');
                    }
                    if (awwAudio) {
                        awwAudio.currentTime = 0;
                        awwAudio.play().catch(() => {
                            /* Autoplay bloccato: si attiva solo se il browser permette il suono dopo il gesto. */
                        });
                    }
                } else {
                    questionText.textContent = 'AWWWWW DAVVERO?';
                    questionText.classList.add('smaller');
                }
                questionText.classList.remove('fade-out');
                questionText.classList.add('fade-in');
                questionText.addEventListener('animationend', function handleFadeIn() {
                    questionText.removeEventListener('animationend', handleFadeIn);
                    questionText.classList.remove('fade-in');
                }, { once: true });
            }, { once: true });
        });
    }

    if (rightButton) {
        rightButton.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            showButtonPress(rightButton);
            const current = rightButton.textContent.trim();
            if (current === 'Bruciala') {
                rightButton.textContent = 'Senti eh';
            } else if (current === 'Senti eh') {
                rightButton.textContent = 'Daiii';
            } else if (current === 'Daiii') {
                rightButton.textContent = 'Rifallo dai';
            } else if (current === 'Rifallo dai') {
                if (blackScreen) {
                    blackScreen.classList.add('active');
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                } else {
                    window.location.reload();
                }
                return;
            }
            rightButton.classList.add('rejecting');
            rightButton.addEventListener('animationend', () => {
                rightButton.classList.remove('rejecting');
            }, { once: true });
        });
    }

    if (scratchClose) {
        scratchClose.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            scratchPointerDown = false;
            closeScratchCard();
            showScratchCompleteSequence();
        });
    }

    if (scratchGame) {
        scratchGame.addEventListener('pointerdown', (event) => {
            const cardFromPoint = findScratchCardAtPoint(event.clientX, event.clientY);
            if (cardFromPoint && !scratchCompleteShown) {
                event.preventDefault();
                event.stopPropagation();
                const wasSelected = selectScratchCard(cardFromPoint);
                if (!wasSelected || cardFromPoint !== activeScratchCard || cardFromPoint.classList.contains('is-scratched')) {
                    scratchPointerDown = false;
                    return;
                }
                if (activeScratchCanvas && cardFromPoint.dataset.scratchTouched !== 'true') {
                    paintScratchCover(activeScratchCanvas);
                }
                try {
                    cardFromPoint.setPointerCapture(event.pointerId);
                } catch {
                    /* Alcuni browser mobile rilasciano il pointer durante i cambi di layout. */
                }
                scratchPointerDown = true;
                scratchAt(event);
                return;
            }
            if (spaceScrollReady && !spaceZoomStarted) {
                scratchScrollStartY = event.clientY;
                return;
            }
            if (!scratchCompleteShown || scratchBonusStarted) {
                return;
            }
            scratchScrollStartY = event.clientY;
        }, true);

        scratchGame.addEventListener('pointermove', (event) => {
            if (!scratchPointerDown || !activeScratchCard) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            scratchAt(event);
        }, true);

        scratchGame.addEventListener('pointerup', (event) => {
            if (scratchPointerDown && activeScratchCard && activeScratchCanvas) {
                event.preventDefault();
                event.stopPropagation();
                checkScratchProgress(activeScratchCard, activeScratchCanvas);
                scratchPointerDown = false;
                return;
            }
            if (findScratchCardAtPoint(event.clientX, event.clientY)) {
                return;
            }
            if (spaceScrollReady && !spaceZoomStarted) {
                const deltaY = event.clientY - scratchScrollStartY;
                if (deltaY < -54) {
                    startSpaceZoomSequence();
                }
                return;
            }
            if (!scratchCompleteShown || scratchBonusStarted) {
                return;
            }
            const deltaY = event.clientY - scratchScrollStartY;
            if (deltaY < -54) {
                startScratchBonusSequence();
            }
        }, true);
    }

    if (spaceReturnLetter) {
        spaceReturnLetter.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openSpaceLetter();
        });
    }

    scratchCards.forEach((card) => {
        card.addEventListener('pointerdown', (event) => {
            if (!scratchGameShown) {
                return;
            }
            if (event.eventPhase !== Event.AT_TARGET) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const wasSelected = selectScratchCard(card);
            try {
                card.setPointerCapture(event.pointerId);
            } catch {
                /* Alcuni browser mobile rilasciano il pointer durante i cambi di layout. */
            }
            if (!wasSelected || card !== activeScratchCard || card.classList.contains('is-scratched')) {
                scratchPointerDown = false;
                return;
            }
            if (activeScratchCanvas && card.dataset.scratchTouched !== 'true') {
                paintScratchCover(activeScratchCanvas);
            }
            scratchPointerDown = true;
            scratchAt(event);
        });

        card.addEventListener('pointermove', (event) => {
            if (!scratchPointerDown || card !== activeScratchCard) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            scratchAt(event);
        });

        card.addEventListener('pointerup', (event) => {
            if (card === activeScratchCard) {
                event.stopPropagation();
            }
            if (card.hasPointerCapture && card.hasPointerCapture(event.pointerId)) {
                card.releasePointerCapture(event.pointerId);
            }
            if (card === activeScratchCard && activeScratchCanvas) {
                checkScratchProgress(card, activeScratchCanvas);
            }
            scratchPointerDown = false;
        });

        card.addEventListener('pointercancel', (event) => {
            if (card.hasPointerCapture && card.hasPointerCapture(event.pointerId)) {
                card.releasePointerCapture(event.pointerId);
            }
            scratchPointerDown = false;
        });
    });
})();
