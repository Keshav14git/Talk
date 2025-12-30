import { useEffect, useRef } from "react";

const ParticleNetworkPattern = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];
        let mouse = { x: window.innerWidth * 0.75, y: window.innerHeight / 2 };

        // Configuration
        const particleCount = 70;
        const connectionDistance = 140;
        const mouseInteractionRadius = 300; // Range where mouse affects particles

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
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                // Give them inherent life/velocity
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.size = Math.random() * 2 + 1;
                this.baseX = this.x; // Remember original "orbit" center if needed, or just float
            }

            update() {
                // 1. Natural Drift (Brownian motion)
                // Keep them moving even if mouse is still

                // 2. Mouse Interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseInteractionRadius) {
                    // Interaction Zone

                    // Complex Force: Attract at edge, Rapel at center (Orbital)
                    // If dist > 100: Attract (Positive force)
                    // If dist < 100: Repel (Negative force)
                    const orbitRadius = 100;
                    const forceDirection = (distance - orbitRadius) * 0.001; // Positive = Pull, Negative = Push

                    this.vx += (dx / distance) * forceDirection;
                    this.vy += (dy / distance) * forceDirection;
                }

                // 3. Friction (Damping) - Essential for stability
                this.vx *= 0.97;
                this.vy *= 0.97;

                // 4. Minimum movement guarantee (prevent freezing)
                // If velocity is too low, nudge it
                if (Math.abs(this.vx) < 0.1) this.vx += (Math.random() - 0.5) * 0.1;
                if (Math.abs(this.vy) < 0.1) this.vy += (Math.random() - 0.5) * 0.1;

                this.x += this.vx;
                this.y += this.vy;

                // 5. Screen Wrapping (Toroidal space)
                // Using a buffer to prevent popping
                const buffer = 50;
                if (this.x < -buffer) this.x = canvas.width + buffer;
                if (this.x > canvas.width + buffer) this.x = -buffer;
                if (this.y < -buffer) this.y = canvas.height + buffer;
                if (this.y > canvas.height + buffer) this.y = -buffer;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(150, 150, 150, 0.6)"; // Slightly brighter nodes
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
                        ctx.strokeStyle = `rgba(120, 120, 120, ${opacity * 0.4})`;
                        ctx.lineWidth = 0.5;
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
