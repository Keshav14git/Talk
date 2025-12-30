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
        const particleCount = 80;
        const connectionDistance = 160;
        const mouseInteractionRadius = 500; // Giant interaction zone

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
                // From 40% width to 100% width
                this.x = (Math.random() * 0.6 + 0.4) * canvas.width;
                this.y = Math.random() * canvas.height;

                this.vx = (Math.random() - 0.5) * 1.0;
                this.vy = (Math.random() - 0.5) * 1.0;
                this.size = Math.random() * 2 + 1.5;
            }

            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // --- PHYSICS TUNING ---

                // 1. Mouse Interaction
                if (distance < mouseInteractionRadius) {
                    // "Safe Zone" Radius: Keep particles this far away from mouse center
                    // Increased to 280px to prevent "congestion"
                    const safeRadius = 280;

                    if (distance > safeRadius) {
                        // GENTLE Pull (Attraction)
                        // Reduced force factor significantly so they don't rush in
                        const pullForce = (distance - safeRadius) * 0.00015;
                        this.vx += (dx / distance) * pullForce;
                        this.vy += (dy / distance) * pullForce;
                    } else {
                        // STRONG Push (Repulsion)
                        // If they get inside the circle, push them out hard
                        const pushForce = (distance - safeRadius) * 0.003;
                        this.vx += (dx / distance) * pushForce;
                        this.vy += (dy / distance) * pushForce;
                    }
                }

                // 2. Right-Side Drift (Subtle bias)
                // If particle drifts too far left (e.g., < 20% width), gently nudge it right
                if (this.x < canvas.width * 0.2) {
                    this.vx += 0.02;
                }

                // 3. Friction
                this.vx *= 0.96;
                this.vy *= 0.96;

                // 4. Base Movement (Life)
                if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
                    this.vx += (Math.random() - 0.5) * 0.1;
                }

                this.x += this.vx;
                this.y += this.vy;

                // 5. Wrapping
                const buffer = 50;
                if (this.x < -buffer) this.x = canvas.width + buffer;
                if (this.x > canvas.width + buffer) this.x = -buffer;
                if (this.y < -buffer) this.y = canvas.height + buffer;
                if (this.y > canvas.height + buffer) this.y = -buffer;
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
