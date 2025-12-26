import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
}

@Component({
    selector: 'app-antigravity-background',
    standalone: true,
    imports: [CommonModule],
    template: `
    <canvas 
      #canvas
      class="absolute inset-0 w-full h-full pointer-events-none"
    ></canvas>
  `,
    styles: [`
    :host {
      display: block;
      position: absolute;
      inset: 0;
      overflow: hidden;
    }
  `]
})
export class AntigravityBackgroundComponent implements OnInit, OnDestroy {
    @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

    private ctx!: CanvasRenderingContext2D;
    private particles: Particle[] = [];
    private animationId: number | null = null;
    private mouseX = 0;
    private mouseY = 0;
    private isHovering = false;

    private readonly particleCount = 100;
    private readonly maxDistance = 150;
    private readonly repelDistance = 120;
    private readonly repelForce = 0.8;

    ngOnInit(): void {
        this.initCanvas();
        this.createParticles();
        this.animate();
        this.setupEventListeners();
    }

    ngOnDestroy(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('resize', this.handleResize);
    }

    private initCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        this.resizeCanvas();
    }

    private resizeCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    private createParticles(): void {
        const canvas = this.canvasRef.nativeElement;
        const colors = [
            'rgba(0, 191, 255, 0.6)',   // Cermont primary
            'rgba(34, 211, 238, 0.6)',   // Cyan
            'rgba(147, 197, 253, 0.6)',  // Blue light
            'rgba(96, 165, 250, 0.6)',   // Blue
            'rgba(59, 130, 246, 0.6)'    // Blue dark
        ];

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    private setupEventListeners(): void {
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleResize = this.handleResize.bind(this);

        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('resize', this.handleResize);
    }

    private handleMouseMove = (event: MouseEvent): void => {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        this.isHovering = true;
    };

    private handleResize = (): void => {
        this.resizeCanvas();
    };

    private animate = (): void => {
        const canvas = this.canvasRef.nativeElement;

        // Clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        this.particles.forEach((particle, index) => {
            // Apply antigravity effect from mouse
            if (this.isHovering) {
                const dx = particle.x - this.mouseX;
                const dy = particle.y - this.mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.repelDistance) {
                    const force = (this.repelDistance - distance) / this.repelDistance * this.repelForce;
                    const angle = Math.atan2(dy, dx);
                    particle.vx += Math.cos(angle) * force;
                    particle.vy += Math.sin(angle) * force;
                }
            }

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Apply friction
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(canvas.height, particle.y));
            }

            // Draw hexagon particle
            this.drawHexagon(this.ctx, particle.x, particle.y, particle.size + 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
        this.animationId = requestAnimationFrame(this.animate);
    };

    private drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
        const a = 2 * Math.PI / 6;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            ctx.lineTo(x + radius * Math.cos(a * i), y + radius * Math.sin(a * i));
        }
        ctx.closePath();
    }
}
