 
 function blackhole(element) {
            const container = document.querySelector(element);
            const h = container.offsetHeight;
            const w = container.offsetWidth;
            const cw = w;
            const ch = h;
            const maxorbit = 255;
            const centery = ch / 2;
            const centerx = cw / 2;
            const startTime = new Date().getTime();
            let currentTime = 0;
            const stars = [];
            let collapse = false;
            let expanse = false;
            let returning = false;
            const canvas = document.createElement('canvas');
            canvas.width = cw;
            canvas.height = ch;
            container.appendChild(canvas);
            const context = canvas.getContext("2d");
            context.globalCompositeOperation = "multiply";

            function setDPI(canvas, dpi) {
                if (!canvas.style.width)
                    canvas.style.width = canvas.width + 'px';
                if (!canvas.style.height)
                    canvas.style.height = canvas.height + 'px';
                const scaleFactor = dpi / 96;
                canvas.width = Math.ceil(canvas.width * scaleFactor);
                canvas.height = Math.ceil(canvas.height * scaleFactor);
                const ctx = canvas.getContext('2d');
                ctx.scale(scaleFactor, scaleFactor);
            }

            function rotate(cx, cy, x, y, angle) {
                const radians = angle;
                const cos = Math.cos(radians);
                const sin = Math.sin(radians);
                const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
                const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
                return [nx, ny];
            }

            setDPI(canvas, 192);

            class Star {
                constructor() {
                    const rands = [];
                    rands.push(Math.random() * (maxorbit / 2) + 1);
                    rands.push(Math.random() * (maxorbit / 2) + maxorbit);
                    this.orbital = (rands.reduce((p, c) => p + c, 0) / rands.length);
                    this.x = centerx;
                    this.y = centery + this.orbital;
                    this.yOrigin = centery + this.orbital;
                    this.speed = (Math.floor(Math.random() * 2.5) + 1.5) * Math.PI / 180;
                    this.rotation = 0;
                    this.startRotation = (Math.floor(Math.random() * 360) + 1) * Math.PI / 180;
                    this.id = stars.length;
                    this.collapseBonus = this.orbital - (maxorbit * 0.7);
                    if (this.collapseBonus < 0) {
                        this.collapseBonus = 0;
                    }
                    this.color = 'rgba(255,255,255,' + (1 - ((this.orbital) / 255)) + ')';
                    this.hoverPos = centery + (maxorbit / 2) + this.collapseBonus;
                    this.expansePos = centery + (this.id % 100) * -10 + (Math.floor(Math.random() * 20) + 1);
                    this.prevR = this.startRotation;
                    this.prevX = this.x;
                    this.prevY = this.y;
                    this.originalY = this.yOrigin;
                    stars.push(this);
                }

                draw() {
                    if (!expanse && !returning) {
                        this.rotation = this.startRotation + (currentTime * this.speed);
                        if (!collapse) {
                            if (this.y > this.yOrigin) {
                                this.y -= 2.5;
                            }
                            if (this.y < this.yOrigin - 4) {
                                this.y += (this.yOrigin - this.y) / 10;
                            }
                        } else {
                            this.trail = 1;
                            if (this.y > this.hoverPos) {
                                this.y -= (this.hoverPos - this.y) / -5;
                            }
                            if (this.y < this.hoverPos - 4) {
                                this.y += 2.5;
                            }
                        }
                    } else if (expanse && !returning) {
                        this.rotation = this.startRotation + (currentTime * (this.speed / 2));
                        if (this.y > this.expansePos) {
                            this.y -= Math.floor(this.expansePos - this.y) / -80;
                        }
                    } else if (returning) {
                        this.rotation = this.startRotation + (currentTime * this.speed);
                        if (Math.abs(this.y - this.originalY) > 2) {
                            this.y += (this.originalY - this.y) / 50;
                        } else {
                            this.y = this.originalY;
                            this.yOrigin = this.originalY;
                        }
                    }
                    context.save();
                    context.fillStyle = this.color;
                    context.strokeStyle = this.color;
                    context.beginPath();
                    const oldPos = rotate(centerx, centery, this.prevX, this.prevY, -this.prevR);
                    context.moveTo(oldPos[0], oldPos[1]);
                    context.translate(centerx, centery);
                    context.rotate(this.rotation);
                    context.translate(-centerx, -centery);
                    context.lineTo(this.x, this.y);
                    context.stroke();
                    context.restore();
                    this.prevR = this.rotation;
                    this.prevX = this.x;
                    this.prevY = this.y;
                }
            }

            function loop() {
                const now = new Date().getTime();
                currentTime = (now - startTime) / 50;
                context.fillStyle = 'rgba(25,25,25,0.2)';
                context.fillRect(0, 0, cw, ch);
                for (let i = 0; i < stars.length; i++) {
                    if (stars[i] !== undefined) {
                        stars[i].draw();
                    }
                }
                requestAnimationFrame(loop);
            }

            function init() {
                context.fillStyle = 'rgba(25,25,25,1)';
                context.fillRect(0, 0, cw, ch);
                for (let i = 0; i < 2500; i++) {
                    new Star();
                }
                loop();
            }

            init();

            return {
                triggerExpanse: function() {
                    collapse = false;
                    expanse = true;
                    returning = false;
                    setTimeout(() => {
                        expanse = false;
                        returning = true;
                        setTimeout(() => {
                            returning = false;
                        }, 8000);
                    }, 25000);
                }
            };
        }

        document.addEventListener('DOMContentLoaded', () => {
            const blackholeInstance = blackhole('#blackhole');
            const triggerButton = document.getElementById('triggerBlackhole');
            const heroSection = document.querySelector('.hero');
            const navLinks = document.querySelectorAll('.nav-link');

            // Trigger blackhole and scroll to contact
            triggerButton.addEventListener('click', function() {
                heroSection.classList.add('hidden');
                blackholeInstance.triggerExpanse();
                
                // Scroll to contact section after animation starts
                setTimeout(() => {
                    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
                }, 500);
                
                // Show hero again after animation completes
                setTimeout(() => {
                    heroSection.classList.remove('hidden');
                }, 33000);
            });

            // Smooth navigation
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetSection = document.getElementById(targetId);
                    
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }

                    // Update active nav link
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });

            // Update active nav on scroll
            window.addEventListener('scroll', () => {
                let current = '';
                const sections = document.querySelectorAll('.hero, .content-section');
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (window.pageYOffset >= sectionTop - 100) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });
            });

            // Form submission
            document.querySelector('.contact-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Thank you for your message! I will get back to you soon.');
                this.reset();
            });
        });

        // animation hamza text 
        document.addEventListener('DOMContentLoaded', function() {
    const animatedName = document.querySelector('.animated-name');
    if (animatedName) {
        const text = animatedName.textContent;
        animatedName.textContent = '';
        
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.animationDelay = `${index * 0.05}s`;
            animatedName.appendChild(span);
        });
    }
});
   