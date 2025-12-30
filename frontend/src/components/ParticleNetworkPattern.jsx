import { useEffect, useRef } from "react";

const ParticleNetworkPattern = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];
        // Default mouse far away to allow initial spread state
        let mouse = { x: -1000, y: -1000 };

        // Configuration
        const particleCount = 80;
        const connectionDistance = 160;
        const mouseInteractionRadius = 450;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        class Particle {
            constructor() {
                // Initialize broadly on the right side
                this.x = (Math.random() * 0.6 + 0.4) * canvas.width;
                this.y = Math.random() * canvas.height;

                // Store ORIGINAL position for rubber-band return
                this.baseX = this.x;
                this.baseY = this.y;

                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.size = Math.random() * 2 + 1.5;
            }

            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // --- 1. MOUSE INTERACTION (The Disturbance) ---
                if (distance < mouseInteractionRadius) {
                    const safeRadius = 260; // Keep cloud expanded

                    if (distance > safeRadius) {
                        // Gentle Attraction
                        const pullForce = (distance - safeRadius) * 0.0002;
                        this.vx += (dx / distance) * pullForce;
                        this.vy += (dy / distance) * pullForce;
                    } else {
                        // Strong Repulsion (Anti-Shrink)
                        const pushForce = (distance - safeRadius) * 0.003;
                        this.vx += (dx / distance) * pushForce;
                        this.vy += (dy / distance) * pushForce;
                    }
                }
                // --- 2. RETURN TO ORIGIN (The Restoration) ---
                else {
                    // If mouse is far, slowly float back to base position
                    const homeDx = this.baseX - this.x;
                    const homeDy = this.baseY - this.y;

                    // Very gentle spring force back home
                    this.vx += homeDx * 0.0005;
                    this.vy += homeDy * 0.0005;
                }

                // 3. Friction
                this.vx *= 0.95; // Slightly higher friction for stability
                this.vy *= 0.95;

                // 4. Natural Life (Brownian)
                // Always add a tiny bit of noise so they don't freeze at home
                this.vx += (Math.random() - 0.5) * 0.05;
                this.vy += (Math.random() - 0.5) * 0.05;

                this.x += this.vx;
                this.y += this.vy;

                // 5. Hard Boundaries / Soft Wrap
                // If particles get shoved way off screen, wrap them? 
                // Or just clamp them? "Return to Origin" handles most drifting.
                // Let's just constrain them loosely.
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(180, 180, 180, 0.7)";
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        const opacity = 1 - dist / connectionDistance;
                        ctx.strokeStyle = `rgba(160, 160, 160, ${opacity * 0.4})`;
                        ctx.lineWidth = 0.8;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", handleMouseMove);

        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

export default ParticleNetworkPattern;
