// ═══════════════════════════════════════════════════════
// STK VISION — Landing JS
// Particules + Scroll reveal + Interactions
// ═══════════════════════════════════════════════════════

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════
    // PARTICULES BACKGROUND (canvas)
    // ═══════════════════════════════════════════════════

    function initParticles() {
        const canvas = document.getElementById('particles-bg');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 60;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2,
            };
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }

        function animate() {
            if (document.hidden) { requestAnimationFrame(animate); return; }  // pause hors-écran
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.015;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                const alpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 217, 255, ${alpha})`;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 217, 255, ${alpha * 0.1})`;
                ctx.fill();
            });

            // Connexions
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
    }

    // ═══════════════════════════════════════════════════
    // SCROLL REVEAL (Intersection Observer)
    // ═══════════════════════════════════════════════════

    function initScrollReveal() {
        const elements = document.querySelectorAll(
            '.section-tag, .section-title, .section-subtitle, ' +
            '.paradigme-card, .cap-card, .target-card, .contact-card, ' +
            '.quote-block, .contact-direct'
        );

        elements.forEach(el => {
            el.classList.add('fade-up-on-scroll');
        });

        if (!('IntersectionObserver' in window)) {
            // Fallback : tout afficher
            elements.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Délai progressif pour les groupes
                    const parent = entry.target.parentElement;
                    if (parent) {
                        const siblings = Array.from(parent.children).filter(
                            c => c.classList.contains('fade-up-on-scroll')
                        );
                        const index = siblings.indexOf(entry.target);
                        entry.target.style.transitionDelay = `${index * 0.08}s`;
                    }
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        });

        elements.forEach(el => observer.observe(el));
    }

    // ═══════════════════════════════════════════════════
    // SMOOTH SCROLL pour les ancres
    // ═══════════════════════════════════════════════════

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    // ═══════════════════════════════════════════════════
    // RIPPLE EFFECT sur les boutons
    // ═══════════════════════════════════════════════════

    function initButtonRipple() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);

                ripple.style.position = 'absolute';
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(0, 217, 255, 0.3)';
                ripple.style.pointerEvents = 'none';
                ripple.style.animation = 'ripple 0.6s ease-out';

                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);

                ripple.addEventListener('animationend', () => ripple.remove());
            });
        });
    }

    // ═══════════════════════════════════════════════════
    // HEADER SCROLL EFFECT
    // ═══════════════════════════════════════════════════

    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;

            if (currentScroll > 50) {
                header.style.background = 'rgba(0, 0, 0, 0.85)';
                header.style.boxShadow = '0 4px 30px rgba(0, 217, 255, 0.1)';
            } else {
                header.style.background = 'rgba(0, 0, 0, 0.6)';
                header.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ═══════════════════════════════════════════════════
    // CONSOLE EASTER EGG
    // ═══════════════════════════════════════════════════

    function initConsoleEgg() {
        const styles = [
            'color: #00d9ff',
            'font-size: 14px',
            'font-weight: bold',
            'text-shadow: 0 0 10px rgba(0, 217, 255, 0.6)',
        ].join(';');

        console.log('%c⬡ STK VISION', styles);
        console.log(
            '%cVous regardez la console. Vous êtes du genre à comprendre.',
            'color: #6ba5b5; font-style: italic;'
        );
        console.log(
            '%cIngénieur système intéressé par le paradigme ? → stk.multidynamics@gmail.com',
            'color: #00d9ff;'
        );
    }

    // ═══════════════════════════════════════════════════
    // TERRE INTERACTIVE — glisser = rotation, molette = zoom
    // ═══════════════════════════════════════════════════

    function demoOuverte() {
        const d = document.getElementById('demo-page');
        return d && d.classList.contains('open');
    }

    // ═══════════════════════════════════════════════════
    // AUDIO partagé — contexte unique (débloqué par le 1er geste : ENTRER)
    // ═══════════════════════════════════════════════════
    let _actx = null;
    function audioCtx() {
        if (!_actx) { try { _actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
        if (_actx.state === 'suspended') _actx.resume();
        return _actx;
    }
    // ne chauffe pas en arrière-plan : on suspend le son hors-écran
    document.addEventListener('visibilitychange', () => {
        if (!_actx) return;
        if (document.hidden) _actx.suspend(); else _actx.resume();
    });

    // ── ambiance « Terre » : drone spatial continu + couche couplée à la rotation ──
    let _ambiance = null;
    function lancerAmbianceTerre() { _ambiance && _ambiance.demarrer(); }
    // Lit sonore TECHNO du site : pulsé, fort, dynamique (suit l'énergie de la vidéo).
    // Pour brancher un vrai morceau plus tard : le déposer en assets/musique.mp3,
    // le jouer via un MediaElementSource connecté à `techFilter` (même bus → même filtre rotation).
    function creerAmbianceTerre() {
        let demarree = false, master = null, techFilter = null, techTimer = null;
        function demarrer() {
            if (demarree) return;
            const ac = audioCtx(); if (!ac) return;
            demarree = true;
            const t0 = ac.currentTime;
            master = ac.createGain();
            master.gain.setValueAtTime(0.0001, t0);
            master.gain.exponentialRampToValueAtTime(0.85, t0 + 1.2);     // montée d'énergie (arrive vite)
            // limiteur : reste FORT sans saturer
            const comp = ac.createDynamicsCompressor();
            comp.threshold.value = -10; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.25;
            master.connect(comp).connect(ac.destination);

            // filtre global piloté par la rotation (brillance)
            techFilter = ac.createBiquadFilter(); techFilter.type = 'lowpass';
            techFilter.frequency.value = 1300; techFilter.Q.value = 0.7;
            techFilter.connect(master);

            // PAD de corps (accords graves soutenus)
            const padG = ac.createGain(); padG.gain.value = 0.14; padG.connect(techFilter);
            [55, 82.41, 110].forEach((f, i) => {            // A1 / E2 / A2
                const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1) * 7;
                const g = ac.createGain(); g.gain.value = i ? 0.45 : 0.7;
                o.connect(g).connect(padG); o.start();
            });

            // ── SÉQUENCEUR (horloge audio, planification anticipée) ──
            const BPM = 112, step = (60 / BPM) / 4;          // doubles-croches
            let nextTime = t0 + 0.25, idx = 0;
            const arp = [440, 523.25, 659.25, 523.25, 587.33, 659.25, 880, 659.25];   // motif La mineur
            const bassPat = [55, 0, 55, 0, 41.20, 0, 55, 0, 55, 0, 73.42, 0, 41.20, 0, 55, 0];
            const kick = (t) => {
                const o = ac.createOscillator(), g = ac.createGain();
                o.frequency.setValueAtTime(145, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
                g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.95, t + 0.005);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.20);
                o.connect(g).connect(master);                // kick direct → punch
                o.start(t); o.stop(t + 0.22);
            };
            const note = (t, f, type, dest, vol, dec, hp) => {
                if (!f) return;
                const o = ac.createOscillator(); o.type = type; o.frequency.value = f;
                const g = ac.createGain();
                g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
                g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
                let last = g;
                if (hp) { const f2 = ac.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = hp; o.connect(f2); f2.connect(g); }
                else o.connect(g);
                last.connect(dest); o.start(t); o.stop(t + dec + 0.05);
            };
            const planifier = () => {
                const ac2 = _actx; if (!ac2 || ac2.state !== 'running') return;   // suspendu hors-écran
                if (nextTime < ac2.currentTime - 0.1) nextTime = ac2.currentTime + 0.05;   // resync après reprise
                while (nextTime < ac2.currentTime + 0.13) {
                    const s = idx % 16;
                    if (s % 4 === 0) kick(nextTime);                         // 4 à la noire
                    note(nextTime, bassPat[s], 'square', techFilter, 0.42, step * 0.9, 0);      // basse
                    if (s % 2 === 0) note(nextTime, arp[(idx >> 1) % arp.length], 'triangle', techFilter, 0.26, step * 1.6, 300); // arpège brillant
                    nextTime += step; idx++;
                }
            };
            techTimer = setInterval(planifier, 25);
        }
        function setVitesse(v) {                 // v = |vitesse angulaire| (px/frame)
            if (!demarree || !techFilter) return;
            const ac = _actx; if (!ac || ac.state !== 'running') return;
            const t = ac.currentTime;
            const m = Math.min(1, v / 24);                       // plus tu tournes, plus c'est brillant
            techFilter.frequency.setTargetAtTime(950 + m * 5500, t, 0.12);
        }
        return { demarrer, setVitesse };
    }

    // ── son « vitesse lumière » : hum d'hyperespace coordonné avec le warp ──
    function creerWarp() {
        let on = false, master = null, rumble = null, sweep = null;
        function demarrer() {
            if (on) return; const ac = audioCtx(); if (!ac) return; on = true;
            const t = ac.currentTime;
            master = ac.createGain();
            master.gain.setValueAtTime(0.0001, t);
            master.gain.exponentialRampToValueAtTime(0.45, t + 0.9);   // le voyage s'installe
            master.connect(ac.destination);
            // grondement grave (poussée)
            rumble = ac.createOscillator(); rumble.type = 'sawtooth'; rumble.frequency.setValueAtTime(40, t);
            const rl = ac.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 130;
            const rg = ac.createGain(); rg.gain.value = 0.5;
            rumble.connect(rl).connect(rg).connect(master); rumble.start();
            // souffle qui file (étoiles qui défilent) : bruit en boucle + filtre balayé
            const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
            const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            const ns = ac.createBufferSource(); ns.buffer = b; ns.loop = true;
            sweep = ac.createBiquadFilter(); sweep.type = 'bandpass'; sweep.frequency.setValueAtTime(500, t); sweep.Q.value = 1.1;
            const ng = ac.createGain(); ng.gain.value = 0.5;
            ns.connect(sweep).connect(ng).connect(master); ns.start();
            const lfo = ac.createOscillator(); lfo.type = 'triangle'; lfo.frequency.value = 0.9;
            const lg = ac.createGain(); lg.gain.value = 500;          // ±500 autour de 1100 (jamais négatif)
            sweep.frequency.setValueAtTime(1100, t);
            lfo.connect(lg).connect(sweep.frequency); lfo.start();
        }
        function saut(dur) {                       // le punch du saut, coordonné au boost visuel
            const ac = _actx; if (!ac || !on) return; const t = ac.currentTime;
            master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
            master.gain.exponentialRampToValueAtTime(0.9, t + dur);
            rumble.frequency.exponentialRampToValueAtTime(150, t + dur);
            sweep.frequency.cancelScheduledValues(t); sweep.frequency.setValueAtTime(900, t);
            sweep.frequency.exponentialRampToValueAtTime(6500, t + dur);
        }
        function couper() {                        // on coupe net quand la vidéo prend le relais
            const ac = _actx; if (!ac || !on) return; const t = ac.currentTime; on = false;
            try {
                master.gain.cancelScheduledValues(t);
                master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
                master.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
            } catch (e) {}
        }
        return { demarrer, saut, couper };
    }

    function initEarth() {
        const earth = document.querySelector('.earth');
        const hero = document.querySelector('.hero');
        if (!earth) return;
        earth.style.animation = 'none';            // la rotation est pilotée en JS
        let rot = 0, scale = 1, dragging = false, lastX = 0, rotPrev = 0;
        const auto = 0.18;
        _ambiance = creerAmbianceTerre();          // le son de la Terre suit cette rotation
        function apply() {
            earth.style.backgroundPosition = rot.toFixed(1) + 'px 0';
            earth.style.transform = 'translateX(-50%) scale(' + scale.toFixed(3) + ')';
        }
        (function loop() {
            if (document.hidden) { requestAnimationFrame(loop); return; }  // pause hors-écran
            if (!dragging) rot -= auto;
            apply();
            _ambiance.setVitesse(Math.abs(rot - rotPrev)); rotPrev = rot;   // rotation → bruit
            requestAnimationFrame(loop);
        })();
        function inHero() { return window.scrollY < window.innerHeight * 0.85; }

        document.addEventListener('pointerdown', (e) => {
            if (demoOuverte() || !inHero()) return;
            if (e.target.closest('a,button,input,textarea,nav,header,.btn')) return;
            dragging = true; lastX = e.clientX;
            if (hero) hero.classList.add('earth-drag');
            document.body.style.userSelect = 'none';
        });
        window.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            rot += (e.clientX - lastX) * 2.4; lastX = e.clientX; apply();
        });
        window.addEventListener('pointerup', () => {
            dragging = false;
            if (hero) hero.classList.remove('earth-drag');
            document.body.style.userSelect = '';
        });
        window.addEventListener('wheel', (e) => {
            if (demoOuverte() || !inHero()) return;
            if (e.clientY < window.innerHeight * 0.40) return;   // zone du titre → scroll normal
            scale = Math.min(2.4, Math.max(0.7, scale - e.deltaY * 0.0034));   // zoom rapide
            apply(); e.preventDefault();
        }, { passive: false });
    }

    // ═══════════════════════════════════════════════════
    // PAGE DÉMO — glisse depuis la droite + fond shader (WebGL)
    // ═══════════════════════════════════════════════════

    let _demoRAF = null, _demoGL = null;
    function initDemoShader() {
        const cv = document.getElementById('demo-shader');
        if (!cv) return;
        const gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
        if (!gl) { cv.style.display = 'none'; return; }
        const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
        const vs = mk(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}');
        const fs = mk(gl.FRAGMENT_SHADER,
            'precision mediump float;uniform float t;uniform vec2 r;' +
            'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(uv-0.5)*vec2(r.x/r.y,1.0)*3.0;' +
            'float v=sin(p.x+t*0.3)+sin((p.y+t*0.2)*1.5)+sin((p.x+p.y+t*0.25)*0.8)+sin(length(p)*2.0-t*0.6);' +
            'v*=0.25;vec3 col=vec3(0.0,0.5+0.45*sin(v*3.1416),0.72+0.28*cos(v*3.1416));' +
            'col=mix(vec3(0.02,0.05,0.12),col,0.45+0.55*v);gl_FragColor=vec4(col*0.92,1.0);}');
        const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
        const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        const uT = gl.getUniformLocation(pr, 't'), uR = gl.getUniformLocation(pr, 'r');
        const rs = () => { cv.width = cv.clientWidth; cv.height = cv.clientHeight; gl.viewport(0, 0, cv.width, cv.height); };
        rs(); window.addEventListener('resize', rs);
        _demoGL = { gl, uT, uR, rs, t0: performance.now() };
    }
    function startShader() {
        if (!_demoGL) initDemoShader();
        if (!_demoGL) return;
        _demoGL.rs();
        (function frame() {
            if (document.hidden) { _demoRAF = requestAnimationFrame(frame); return; }  // pause hors-écran
            const g = _demoGL.gl, t = (performance.now() - _demoGL.t0) / 1000;
            g.uniform1f(_demoGL.uT, t); g.uniform2f(_demoGL.uR, g.canvas.width, g.canvas.height);
            g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
            _demoRAF = requestAnimationFrame(frame);
        })();
    }
    function stopShader() { if (_demoRAF) { cancelAnimationFrame(_demoRAF); _demoRAF = null; } }

    function openDemo() {
        const d = document.getElementById('demo-page'); if (!d) return;
        d.classList.add('open'); d.setAttribute('aria-hidden', 'false');
        startShader();                       // fond animé derrière les cartes
    }
    function closeDemo() {
        const d = document.getElementById('demo-page'); if (!d) return;
        d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
        setTimeout(stopShader, 650);
    }
    function initDemo() {
        document.querySelectorAll('.js-demo').forEach(el =>
            el.addEventListener('click', (e) => { e.preventDefault(); openDemo(); }));
        const close = document.getElementById('demo-close');
        if (close) close.addEventListener('click', closeDemo);
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDemo(); });
    }

    // ═══════════════════════════════════════════════════
    // CHAMP D'ÉTOILES (fond spatial)
    // ═══════════════════════════════════════════════════

    function initStars() {
        const cv = document.getElementById('stars');
        if (!cv) return;
        const ctx = cv.getContext('2d');
        let W, H, stars = [];
        const TEINTES = ['255,255,255', '200,224,255', '255,238,210', '180,210,255'];
        function resize() {
            W = cv.width = window.innerWidth;
            H = cv.height = window.innerHeight;
            const n = Math.min(420, Math.round((W * H) / 4200));
            stars = Array.from({ length: n }, () => ({
                x: Math.random() * W, y: Math.random() * H,
                r: Math.pow(Math.random(), 3) * 1.6 + 0.25,
                a: 0.2 + Math.random() * 0.6,
                c: TEINTES[(Math.random() * TEINTES.length) | 0],
                tw: Math.random() * Math.PI * 2, sp: 0.6 + Math.random() * 1.6,
            }));
        }
        resize();
        window.addEventListener('resize', resize);
        const t0 = performance.now();
        (function paint() {
            if (document.hidden) { requestAnimationFrame(paint); return; }  // pause hors-écran
            const t = (performance.now() - t0) / 1000;
            ctx.clearRect(0, 0, W, H);
            for (const s of stars) {
                const a = s.a * (0.55 + 0.45 * Math.sin(t * s.sp + s.tw));
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, 6.2832);
                ctx.fillStyle = 'rgba(' + s.c + ',' + a + ')';
                ctx.fill();
            }
            requestAnimationFrame(paint);
        })();
    }

    // ═══════════════════════════════════════════════════
    // EFFET CINÉMA — warp lumière + séquence d'ouverture
    // ═══════════════════════════════════════════════════

    function initCinema() {
        const cine = document.getElementById('cine');
        if (!cine) return;

        const reduce = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // une seule fois par session, et jamais en mouvement réduit
        if (reduce || sessionStorage.getItem('stk_cine')) {
            cine.parentNode && cine.parentNode.removeChild(cine);
            return;
        }
        sessionStorage.setItem('stk_cine', '1');

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => cine.classList.add('bars'));

        // ── warp : étoiles qui filent depuis le centre, en accélération ──
        const cv = document.getElementById('cine-warp');
        const ctx = cv.getContext('2d');
        let W, H, raf, boost = 1;       // boost = saut « vitesse lumière » au clic ENTRER
        const t0 = performance.now();
        const stars = [];
        function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
        resize();
        window.addEventListener('resize', resize);
        for (let i = 0; i < 320; i++) {
            stars.push({ a: Math.random() * Math.PI * 2, r: Math.random() * 40, sp: 1 + Math.random() * 2.2 });
        }
        const TEINTES = ['160,240,255', '255,255,255', '120,210,255'];
        stars.forEach(s => s.c = TEINTES[(Math.random() * TEINTES.length) | 0]);

        function draw() {
            const t = (performance.now() - t0) / 1000;
            // accélère jusqu'à ~2,6 s puis décélère (sortie d'hyperespace)
            const accBase = t < 2.6 ? 1 + t * t * 2.4 : Math.max(0.2, 1 + 2.6 * 2.6 * 2.4 - (t - 2.6) * 9);
            const acc = accBase * boost;
            const cx = W / 2, cy = H / 2, diag = Math.hypot(W, H) / 2;
            ctx.fillStyle = 'rgba(0,0,0,0.28)';          // traînées (motion blur)
            ctx.fillRect(0, 0, W, H);
            for (const s of stars) {
                const pr = s.r;
                s.r += s.sp * acc;
                const m = Math.min(1, s.r / diag);
                ctx.strokeStyle = 'rgba(' + s.c + ',' + (0.18 + 0.82 * m) + ')';
                ctx.lineWidth = 1 + m * 1.6;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(s.a) * pr, cy + Math.sin(s.a) * pr);
                ctx.lineTo(cx + Math.cos(s.a) * s.r, cy + Math.sin(s.a) * s.r);
                ctx.stroke();
                if (s.r > diag) { s.r = Math.random() * 30; s.a = Math.random() * Math.PI * 2; }
            }
            raf = requestAnimationFrame(draw);
        }
        draw();

        // intro vidéo (assets/intro2.mp4) : jouée AVEC LE SON sur le clic ENTRER.
        const introVid = document.getElementById('cine-video');
        let videoPrete = false, introLancee = false;
        const warp = creerWarp();                 // son d'hyperespace (début)

        // ── son « vitesse lumière » synthétisé (Web Audio, aucun fichier) ──
        function whoosh(montee) {                 // montee=true : saut ; false : sortie douce
            const ac = audioCtx(); if (!ac) return;
            const t = ac.currentTime, dur = montee ? 1.1 : 0.9;
            const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;   // bruit large bande
            const src = ac.createBufferSource(); src.buffer = buf;
            const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
            const g = ac.createGain();
            if (montee) { bp.frequency.setValueAtTime(180, t); bp.frequency.exponentialRampToValueAtTime(7000, t + dur); }
            else { bp.frequency.setValueAtTime(6000, t); bp.frequency.exponentialRampToValueAtTime(160, t + dur); }
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.5, t + dur * 0.45);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            const osc = ac.createOscillator(); osc.type = 'sine';      // corps grave (whoomp)
            const og = ac.createGain();
            osc.frequency.setValueAtTime(montee ? 70 : 90, t);
            osc.frequency.exponentialRampToValueAtTime(montee ? 220 : 40, t + dur);
            og.gain.setValueAtTime(0.0001, t);
            og.gain.exponentialRampToValueAtTime(0.35, t + dur * 0.4);
            og.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            src.connect(bp).connect(g).connect(ac.destination);
            osc.connect(og).connect(ac.destination);
            src.start(t); src.stop(t + dur);
            osc.start(t); osc.stop(t + dur);
        }

        // ── transition de sortie : shader fluide WebGL (stries de lumière) ──
        function transitionShader(getProg) {
            const c = document.getElementById('cine-transition'); if (!c) return null;
            const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
            if (!gl) return null;
            c.width = window.innerWidth; c.height = window.innerHeight; c.style.opacity = 1;
            const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
            const fs =
                'precision highp float;uniform vec2 r;uniform float t;uniform float prog;' +
                'float h(vec2 x){return fract(sin(dot(x,vec2(41.3,289.1)))*43758.5);}' +
                'float n(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);' +
                'return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
                'void main(){vec2 uv=gl_FragCoord.xy/r;' +
                'float edge=smoothstep(0.72,1.0,uv.x);' +                       // halo au bord droit (la fuite)
                'float streak=pow(n(vec2(uv.x*4.0-t*3.5,uv.y*9.0)),2.0);' +     // stries horizontales filantes
                'float glow=edge*(0.45+0.9*streak);' +
                'vec3 col=mix(vec3(0.0,0.85,1.0),vec3(0.92,0.98,1.0),streak);' +
                'float vis=smoothstep(0.0,0.12,prog)*(1.0-smoothstep(0.82,1.0,prog));' +
                'gl_FragColor=vec4(col,clamp(glow,0.0,1.0)*vis);}';
            const mk = (ty, s) => { const o = gl.createShader(ty); gl.shaderSource(o, s); gl.compileShader(o); return o; };
            const pr = gl.createProgram();
            gl.attachShader(pr, mk(gl.VERTEX_SHADER, vs));
            gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, fs));
            gl.linkProgram(pr); gl.useProgram(pr);
            const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(pr, 'p');
            gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            const uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uP = gl.getUniformLocation(pr, 'prog');
            gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            const a0 = performance.now(); let stop = false;
            (function loop() {
                if (stop) return;
                gl.uniform2f(uR, c.width, c.height);
                gl.uniform1f(uT, (performance.now() - a0) / 1000);
                gl.uniform1f(uP, getProg());
                gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(loop);
            })();
            return () => { stop = true; };
        }

        let fini = false;
        function terminer() {
            if (fini) return; fini = true;
            cancelAnimationFrame(raf);                       // stoppe le warp
            lancerAmbianceTerre();                           // le lit techno arrive DÈS la fin de l'intro
            const finir = () => {
                cine.parentNode && cine.parentNode.removeChild(cine);
                document.body.style.overflow = prevOverflow;
            };
            const G = window.gsap;
            if (G) {                                         // transition directionnelle : glisse vers la gauche
                const etat = { p: 0 };
                const arret = transitionShader(() => etat.p);
                whoosh(false);                               // souffle de sortie
                const tl = G.timeline({ onComplete: () => { arret && arret(); finir(); } });
                tl.to(etat, { duration: 0.75, p: 1, ease: 'none' }, 0);
                tl.to(cine, { duration: 0.75, xPercent: -100, ease: 'power3.inOut' }, 0);   // la scène file à gauche
                tl.to(cine, { duration: 0.75, '--wipe': '130%', ease: 'power1.in' }, 0);    // …en s'effaçant (transparence)
            } else {                                         // repli : glisse CSS
                cine.classList.add('slide-out');
                setTimeout(finir, 720);
            }
        }
        let planifie = setTimeout(terminer, 3100);
        function passer() { clearTimeout(planifie); terminer(); }

        if (introVid) {
            introVid.addEventListener('canplay', () => {
                videoPrete = true;
                clearTimeout(planifie);          // on attend ENTRER, pas d'auto-sortie
            }, { once: true });
            introVid.load();
        }

        function lancerIntro() {
            if (introLancee) return;
            if (!videoPrete) { passer(); return; }   // vidéo absente/lente → on entre direct
            introLancee = true;
            clearTimeout(planifie);
            warp.demarrer();                         // SON d'hyperespace s'installe (le « début »)
            const centre = cine.querySelector('.cine-center');
            const flash = cine.querySelector('.cine-flash');
            const wc = document.getElementById('cine-warp');
            const versVideo = () => {
                if (wc) wc.style.display = 'none';
                cancelAnimationFrame(raf);           // le warp n'est plus visible
                introVid.style.display = 'block';
                introVid.muted = false; introVid.volume = 1; introVid.currentTime = 0;
                introVid.play().catch(() => { introVid.muted = true; introVid.play().catch(() => {}); });
                introVid.addEventListener('ended', terminer, { once: true });
                planifie = setTimeout(terminer, 30000);  // garde-fou
            };
            const JUMP = 1.0;                        // durée de la montée en vitesse lumière
            const sauter = () => { whoosh(true); warp.saut(0.45); };   // punch sonore du saut
            const G = window.gsap;
            if (G) {                                 // accélération progressive → saut → vidéo
                const bo = { b: 1 };
                const tl = G.timeline();
                tl.to(bo, { duration: JUMP, b: 9, ease: 'power2.in', onUpdate: () => { boost = bo.b; } }, 0);
                if (centre) tl.to(centre, { duration: 0.6, opacity: 0, scale: 1.4, ease: 'power2.in' }, 0);
                tl.add(sauter, JUMP - 0.05);                                    // son du saut, coordonné
                if (flash) {
                    tl.to(flash, { duration: 0.3, opacity: 0.95, ease: 'power2.in' }, JUMP - 0.05)
                      .add(() => { versVideo(); warp.couper(); })
                      .to(flash, { duration: 0.6, opacity: 0, ease: 'power2.out' });
                } else { tl.add(() => { versVideo(); warp.couper(); }, JUMP + 0.1); }
            } else {
                if (centre) centre.style.display = 'none';
                sauter(); versVideo(); warp.couper();
            }
        }

        document.getElementById('cine-skip').addEventListener('click', passer);
        const enter = document.getElementById('cine-enter');
        if (enter) enter.addEventListener('click', lancerIntro);   // ENTRER = lance l'intro sonore
        cine.addEventListener('click', (e) => {
            if (e.target.closest('#cine-skip, #cine-enter')) return;
            if (introLancee) passer();          // intro en cours → un clic la saute
            else lancerIntro();                 // sinon, le clic démarre l'intro (geste audio)
        });
        window.addEventListener('keydown', () => {
            if (introLancee || !videoPrete) passer();   // Échap/touche : saute
            else lancerIntro();                          // sinon démarre l'intro
        }, { once: true });
    }

    // ═══════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════

    // détail : un son discret quand on survole/touche une carte de la page Démo
    function initCartesVision() {
        const freqs = { 'Innovation': 660, 'Vision': 783.99, 'Souveraineté': 880 };
        const blip = (f) => {
            const ac = _actx; if (!ac || ac.state !== 'running') return;   // ne force pas l'audio
            const t = ac.currentTime;
            const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f;
            const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
            const g = ac.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.10, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
            o.connect(hp).connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.24);
        };
        // cartes DÉCORATIVES (non cliquables) — juste un son discret au survol
        document.querySelectorAll('.vcard').forEach((c) => {
            const lbl = (c.querySelector('.vcard-label') || {}).textContent || '';
            const f = freqs[lbl.trim()] || 720;
            c.addEventListener('pointerenter', () => blip(f));
        });
    }

    // ── lightbox vidéo : cliquer pour zoomer, ‹ › pour sélectionner ──
    function initVideoLightbox() {
        const figs = Array.from(document.querySelectorAll('.demo-vid'));
        if (!figs.length) return;
        const items = figs.map(f => ({
            src: (f.querySelector('video') || {}).getAttribute ? f.querySelector('video').getAttribute('src') : '',
            cap: (f.querySelector('figcaption') || {}).textContent || ''
        }));
        const ov = document.createElement('div');
        ov.className = 'video-zoom';
        ov.innerHTML = '<button class="vz-close" type="button" aria-label="fermer">✕</button>' +
            '<button class="vz-nav vz-prev" type="button" aria-label="précédent">‹</button>' +
            '<button class="vz-nav vz-next" type="button" aria-label="suivant">›</button>' +
            '<figure class="vz-frame"><video controls autoplay loop muted playsinline></video><figcaption></figcaption></figure>';
        document.body.appendChild(ov);
        const vid = ov.querySelector('video'), cap = ov.querySelector('figcaption');
        let i = 0;
        function show(n) {
            i = (n + items.length) % items.length;
            vid.src = items[i].src; vid.play().catch(() => {});
            cap.textContent = items[i].cap; cap.style.display = items[i].cap ? '' : 'none';
        }
        function open(n) { show(n); ov.classList.add('open'); }
        function close() { ov.classList.remove('open'); vid.pause(); vid.removeAttribute('src'); vid.load(); }
        figs.forEach((f, n) => { f.style.cursor = 'zoom-in'; f.addEventListener('click', () => open(n)); });
        ov.querySelector('.vz-close').addEventListener('click', close);
        ov.querySelector('.vz-prev').addEventListener('click', () => show(i - 1));
        ov.querySelector('.vz-next').addEventListener('click', () => show(i + 1));
        ov.addEventListener('click', e => { if (e.target === ov) close(); });
        document.addEventListener('keydown', e => {
            if (!ov.classList.contains('open')) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowRight') show(i + 1);
            else if (e.key === 'ArrowLeft') show(i - 1);
        });
    }

    function init() {
        initCinema();
        initStars();
        initEarth();
        initDemo();
        initParticles();
        initScrollReveal();
        initSmoothScroll();
        initButtonRipple();
        initHeaderScroll();
        initConsoleEgg();
        initCartesVision();
        initVideoLightbox();

        // si l'intro est sautée (déjà vue / mouvement réduit) : pas de clic ENTRER
        // pour débloquer l'audio → on démarre l'ambiance au tout premier geste.
        if (!document.getElementById('cine')) {
            const go = () => { audioCtx(); lancerAmbianceTerre(); };
            window.addEventListener('pointerdown', go, { once: true });
            window.addEventListener('keydown', go, { once: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
