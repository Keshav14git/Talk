import { useEffect, useRef } from "react";

const ParticleNetworkPattern = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];
        let mouse = { x: window.innerWidth * 0.75, y: window.innerHeight / 2 }; // Default target

        // Configuration
        const particleCount = 70;
        const connectionDistance = 150;
        const speedLimit = 2; // Max speed

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
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 1.5 + 1;
            }

            update() {
                // Vector to mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;

                // Gentle Steering Force
                // The factor (0.0005) controls how strong the attraction is.
                const forceX = dx * 0.0005;
                const forceY = dy * 0.0005;

                this.vx += forceX;
                this.vy += forceY;

                // Friction / Damping to prevent infinite acceleration
                this.vx *= 0.96;
                this.vy *= 0.96;

                // Soft Speed Limit
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > speedLimit) {
                    this.vx = (this.vx / speed) * speedLimit;
                    this.vy = (this.vy / speed) * speedLimit;
                }

                // Apply velocity
                this.x += this.vx;
                this.y += this.vy;

                // Screen Wrapping (Endless flow)
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(120, 120, 120, 0.6)";
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
                        // Opacity based on distance
                        const opacity = 0.15 * (1 - dist / connectionDistance);
                        ctx.strokeStyle = `rgba(120, 120, 120, ${opacity})`;
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
