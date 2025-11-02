'use client';
import dynamic from 'next/dynamic';
const LiquidEther = dynamic(() => import('@/components/ui/LiquidEther'), { ssr: false });

export default function AppBackground() {
return (
<div className="pointer-events-none fixed inset-0 -z-10">
<LiquidEther
colors={['#0072FF', '#004A7C', '#00A878']}
mouseForce={15}
cursorSize={100}
isViscous={false}
viscous={30}
iterationsViscous={32}
iterationsPoisson={32}
resolution={0.6}
isBounce={false}
autoDemo
autoSpeed={0.25}
autoIntensity={1.6}
takeoverDuration={0.25}
autoResumeDelay={3000}
autoRampDuration={0.6}
/>
</div>
);
}