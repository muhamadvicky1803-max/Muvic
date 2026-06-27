document.addEventListener('DOMContentLoaded', () => {

    // --- AUDIO SETUP ---
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = musicBtn.querySelector('.music-icon');
    let isMusicPlaying = false;

    function toggleMusic() {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicIcon.innerText = '🔇';
            isMusicPlaying = false;
        } else {
            bgMusic.play().then(() => {
                musicIcon.innerText = '🎵';
                isMusicPlaying = true;
            }).catch(e => console.log("Audio play blocked", e));
        }
    }

    musicBtn.addEventListener('click', toggleMusic);

    // Auto-play workaround: Play music on ANY first interaction
    document.body.addEventListener('click', () => {
        if (!isMusicPlaying) {
            toggleMusic();
        }
    }, { once: true });

    // --- NAVIGATION LOGIC ---
    const scenes = document.querySelectorAll('.scene');
    
    function switchScene(targetId) {
        scenes.forEach(scene => scene.classList.remove('active'));
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');

        if (targetId === 'scene-finale') {
            startHeartRain();
        }
    }

    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            
            // Jika mau pindah ke halaman finale, matikan spotify
            if (targetId === 'scene-finale') {
                if (window.spotifyController) {
                    window.spotifyController.pause();
                }
                // Opsional: nyalakan lagi bg-music jika sebelumnya dimatikan oleh spotify
                if (window.bgMusicPausedBySpotify && !isMusicPlaying) {
                    toggleMusic();
                    window.bgMusicPausedBySpotify = false;
                }
            }
            
            switchScene(targetId);
        });
    });

    // --- SCENE 1: CUSTOM KEYPAD PASSWORD ---
    const CORRECT_PIN = "123456";
    let currentPin = "";
    
    const pinDots = document.querySelectorAll('.pin-dot');
    const pinDisplay = document.querySelector('.pin-display');
    const errorMsg = document.getElementById('error-msg');

    function updatePinDisplay() {
        pinDots.forEach((dot, index) => {
            if (index < currentPin.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    function checkPin() {
        if (currentPin === CORRECT_PIN) {
            errorMsg.classList.add('hidden');
            if (!isMusicPlaying) toggleMusic();
            
            setTimeout(() => {
                switchScene('scene-hi');
            }, 300);
            
        } else {
            errorMsg.classList.remove('hidden');
            pinDisplay.classList.add('error');
            
            setTimeout(() => {
                pinDisplay.classList.remove('error');
                currentPin = "";
                updatePinDisplay();
            }, 500);
        }
    }

    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (currentPin.length < 6) {
                currentPin += e.target.getAttribute('data-val');
                updatePinDisplay();
                errorMsg.classList.add('hidden'); 
                
                if (currentPin.length === 6) {
                    checkPin();
                }
            }
        });
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        if (currentPin.length > 0) {
            currentPin = currentPin.slice(0, -1);
            updatePinDisplay();
        }
    });

    // --- SCENE 8: DYNAMIC BOOK GALLERY ---
    const galleryData = [
        {
            text: "Nah ini salah satu foto paling favorit aku. Liat senyum kamu aja udah bikin capek aku ilang semua.. always be my home yaa sayang &lt;3 🏡👩‍❤️‍👨",
            img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=400&auto=format&fit=crop"
        }
    ];

    let currentGalleryIndex = 0;
    const bookPage = document.getElementById('book-page');
    const bookWrapper = document.getElementById('book-wrapper');
    const galleryText = document.getElementById('gallery-text');
    const galleryImg = document.getElementById('gallery-img');
    const pageNumber = document.getElementById('page-number');
    
    const btnPrevGallery = document.getElementById('btn-prev-gallery');
    const btnNextGallery = document.getElementById('btn-next-gallery');
    const btnCloseBook = document.getElementById('btn-close-book');
    const btnStartGallery = document.getElementById('btn-start-gallery');

    let isAnimating = false;

    function renderPage() {
        const data = galleryData[currentGalleryIndex];
        galleryText.innerHTML = data.text;
        galleryImg.src = data.img;
        pageNumber.innerText = `${currentGalleryIndex + 1} / ${galleryData.length}`;

        // Atur tombol navigasi
        if (currentGalleryIndex === 0) {
            btnPrevGallery.classList.add('hidden');
        } else {
            btnPrevGallery.classList.remove('hidden');
        }

        if (currentGalleryIndex === galleryData.length - 1) {
            btnNextGallery.classList.add('hidden');
            btnCloseBook.classList.remove('hidden');
        } else {
            btnNextGallery.classList.remove('hidden');
            btnCloseBook.classList.add('hidden');
        }
    }

    function changePage(direction) {
        if (isAnimating) return;
        isAnimating = true;

        // Slide Out Animation
        bookPage.className = 'book-page'; // reset
        if (direction === 'next') {
            bookPage.classList.add('anim-slide-out-left');
        } else {
            bookPage.classList.add('anim-slide-out-right');
        }

        setTimeout(() => {
            // Update Data saat kertas di luar layar
            if (direction === 'next') {
                currentGalleryIndex++;
            } else {
                currentGalleryIndex--;
            }
            renderPage();

            // Slide In Animation
            bookPage.className = 'book-page'; // reset
            if (direction === 'next') {
                bookPage.classList.add('anim-slide-in-right');
            } else {
                bookPage.classList.add('anim-slide-in-left');
            }

            setTimeout(() => {
                bookPage.className = 'book-page'; // bersih
                isAnimating = false;
            }, 400);

        }, 400);
    }

    btnStartGallery.addEventListener('click', () => {
        currentGalleryIndex = 0;
        bookWrapper.className = 'book-wrapper'; // reset close anim jika diulang
        renderPage();
        switchScene('scene-gallery');
    });

    btnPrevGallery.addEventListener('click', () => changePage('prev'));
    btnNextGallery.addEventListener('click', () => changePage('next'));

    // Animasi Menutup Buku
    btnCloseBook.addEventListener('click', () => {
        if (isAnimating) return;
        
        // Tambahkan animasi tutup
        bookWrapper.classList.add('book-close-anim');
        
        // Pindah layar setelah animasi selesai
        setTimeout(() => {
            switchScene('scene-spotify');
        }, 1000);
    });

    // Fitur SWIPE (Sentuh Geser)
    let touchStartX = 0;
    let touchEndX = 0;

    bookPage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    bookPage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (isAnimating) return;
        const swipeThreshold = 50; // Minimal geser 50px
        
        if (touchStartX - touchEndX > swipeThreshold) {
            // Geser Kiri (Next)
            if (currentGalleryIndex < galleryData.length - 1) {
                changePage('next');
            }
        }
        
        if (touchEndX - touchStartX > swipeThreshold) {
            // Geser Kanan (Prev)
            if (currentGalleryIndex > 0) {
                changePage('prev');
            }
        }
    }


    // --- SCENE 10: FINALE RAIN HEARTS ---
    const heartsContainer = document.getElementById('hearts-container');
    let heartInterval;

    function startHeartRain() {
        if (heartInterval) clearInterval(heartInterval);
        
        heartInterval = setInterval(() => {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerText = '❤';
            
            heart.style.left = Math.random() * 100 + 'vw';
            const fallDuration = Math.random() * 3 + 3;
            heart.style.animationDuration = fallDuration + 's';
            heart.style.fontSize = (Math.random() * 0.7 + 0.8) + 'rem';
            
            heartsContainer.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, fallDuration * 1000);

        }, 300); 
    }

    document.getElementById('btn-restart').addEventListener('click', () => {
        currentPin = "";
        updatePinDisplay();
        errorMsg.classList.add('hidden');
        
        clearInterval(heartInterval);
        heartsContainer.innerHTML = '';
        
        switchScene('scene-password');
    });

    // --- SPOTIFY IFRAME API CONTROLLER ---
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        const element = document.getElementById('embed-iframe');
        const options = {
            width: '100%',
            height: '152',
            uri: 'spotify:playlist:1azC4nGfhxwLHDtZW9HzZH'
        };
        const callback = (EmbedController) => {
            window.spotifyController = EmbedController;
            
            EmbedController.addListener('playback_update', e => {
                // Jika user Play lagu Spotify, matikan musik web utama
                if (e.data.isPaused === false) {
                    if (isMusicPlaying) {
                        bgMusic.pause();
                        musicIcon.innerText = '🔇';
                        isMusicPlaying = false;
                        window.bgMusicPausedBySpotify = true;
                    }
                }
            });
        };
        IFrameAPI.createController(element, options, callback);
    };

});
