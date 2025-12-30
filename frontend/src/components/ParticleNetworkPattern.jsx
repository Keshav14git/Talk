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
        const particleCount = 75; // Slightly more dense
        const connectionDistance = 140;
        const mouseInteractionRadius = 400; // Larger grab range

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
                // INITIALIZATION: RIGHT SIDE ONLY
                // Random position between 50% width and 100% width
                this.x = (Math.random() * 0.5 + 0.5) * canvas.width;
                this.y = Math.random() * canvas.height;

                // Velocity: Give them a good initial kick
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;

                this.size = Math.random() * 2 + 1.5; // Slightly larger average size
            }

            update() {
                // 1. Mouse Interaction (The Core Logic)
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseInteractionRadius) {
                    // "Orbital" Mechanics:
                    // If far: Gentle attraction (Pull)
                    // If near: Forceful repulsion (Push) - Keeps the cloud open

                    const safeRadius = 120; // Ensure cloud stays >= 240px wide

                    let force = 0;
                    if (distance > safeRadius) {
                        // Pull in
                        force = (distance - safeRadius) * 0.0003;
                    } else {
                        // Push out HARD to prevent shrinking
                        force = (distance - safeRadius) * 0.002;
                    }

                    this.vx += (dx / distance) * force;
                    this.vy += (dy / distance) * force;
                } else {
                    // Distant drift: Slowly drift back towards center of right side? 
                    // Or just random drift. Brownian implies "life".
                    // Let's add a very tiny "home" force to keep them from dispersing entirely off screen?
                    // No, wrapping handles that. Let's just create some random noise.
                    this.vx += (Math.random() - 0.5) * 0.05;
                    this.vy += (Math.random() - 0.5) * 0.05;
                }

                // 2. Friction (Stability)
                this.vx *= 0.96;
                this.vy *= 0.96;

                // 3. Keep them moving (Life)
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed < 0.2) {
                    this.vx += (Math.random() - 0.5) * 0.2;
                    this.vy += (Math.random() - 0.5) * 0.2;
                }

                this.x += this.vx;
                this.y += this.vy;

                // 4. Screen Wrapping
                const buffer = 50;
                if (this.x < -buffer) this.x = canvas.width + buffer;
                if (this.x > canvas.width + buffer) this.x = -buffer;
                if (this.y < -buffer) this.y = canvas.height + buffer;
                if (this.y > canvas.height + buffer) this.y = -buffer;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(180, 180, 180, 0.7)"; // Brighter, more visible nodes
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
                        // Brighter lines
                        ctx.strokeStyle = `rgba(150, 150, 150, ${opacity * 0.5})`;
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
