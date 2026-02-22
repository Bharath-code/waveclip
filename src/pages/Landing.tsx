import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { LandingSEO } from '@/components/SEO';
import { MarketingLayout } from '@/components/layout';

gsap.registerPlugin(ScrollTrigger);

// ─── UTILS & SUB-COMPONENTS ───────────────────────────────────────────────

const Icon = ({ icon, className = "", style = {} }: { icon: string; className?: string, style?: any }) => {
  return (
    // @ts-ignore
    <iconify-icon icon={icon} class={className} style={style}></iconify-icon>
  );
};

// -- Vertical Slide Down Letter Animation
const StaggeredText = ({ text, className = "" }: { text: string; className?: string }) => {
  const letters = text.split("");
  return (
    <span className={cn("inline-block overflow-hidden pb-4 -mb-4", className)}>
      {letters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          whileInView={{ y: "0%", opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.6,
            ease: [0.33, 1, 0.68, 1],
            delay: index * 0.03,
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};

// -- Flashlight Card
const FlashlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden group transition-colors duration-500",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 dark:hidden"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99,102,241,0.08), transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 hidden dark:block"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

// -- Pill Button with 1px Border Beam
const BeamButton = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 group shadow-lg"
    >
      <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] group-hover:bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,#a5b4fc_50%,#fff_100%)] transition-colors duration-500" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-50 dark:bg-slate-950 px-8 py-1 text-sm font-bold tracking-tighter text-slate-900 dark:text-white backdrop-blur-3xl group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
        {children}
      </span>
    </button>
  );
};

// -- Sonar Animation
const SonarPing = () => (
  <div className="relative flex items-center justify-center h-12 w-12">
    <div className="absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
    <div className="absolute inline-flex h-8 w-8 rounded-full bg-indigo-600 opacity-40 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
    <div className="relative inline-flex rounded-full h-4 w-4 bg-indigo-600" />
  </div>
);

// ─── WEBGL SPLIT IMAGE COMPONENT ──────────────────────────────────────────

const WebGLSplitImage = ({ src }: { src: string }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollData = useRef({ velocity: 0, targetOffsets: [0, 0, 0, 0], currentOffsets: [0, 0, 0, 0] });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // ThreeJS Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    // Custom Shader
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: null },
        uOffsets: { value: [0, 0, 0, 0] },
        uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uOffsets[4];
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Simple motion blur using offset sampling
        vec4 sampleBlurred(sampler2D tex, vec2 uv, float offset) {
            vec2 dir = vec2(0.0, offset * 0.05); // Blur direction based on velocity
            vec4 color = vec4(0.0);
            float samples = 5.0;
            for(float i = -2.0; i <= 2.0; i++) {
                vec2 sampleUv = uv + dir * (i / samples);
                sampleUv.y = fract(sampleUv.y); // wrap texture vertically
                color += texture2D(tex, sampleUv);
            }
            return color / samples;
        }

        void main() {
          float colIndex = floor(vUv.x * 4.0);
          float offset = 0.0;
          
          if (colIndex < 1.0) offset = uOffsets[0];
          else if (colIndex < 2.0) offset = uOffsets[1];
          else if (colIndex < 3.0) offset = uOffsets[2];
          else offset = uOffsets[3];

          vec2 finalUv = vUv;
          finalUv.y = fract(finalUv.y + offset); // Use fract to loop the image
          
          // Add 1px vertical borders between columns
          float line = 0.0;
          float pxWidth = 1.0 / uResolution.x;
          if (abs(vUv.x - 0.25) < pxWidth || abs(vUv.x - 0.5) < pxWidth || abs(vUv.x - 0.75) < pxWidth) {
              line = 1.0;
          }

          vec4 texColor = sampleBlurred(uTexture, finalUv, offset);
          
          // Draw thin container lines over texture
          vec3 mixedColor = mix(texColor.rgb, vec3(0.5), line * 0.3);
          gl_FragColor = vec4(mixedColor, 1.0);
        }
      `
    });

    textureLoader.load(src, (texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.minFilter = THREE.LinearFilter;
      material.uniforms.uTexture.value = texture;
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Scroll tracking
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = (currentScrollY - lastScrollY) * 0.001; // Scaled velocity
      scrollData.current.velocity = velocity;
      lastScrollY = currentScrollY;

      // Outer columns lag (slower), inner columns race ahead (faster)
      scrollData.current.targetOffsets[0] += velocity * 0.5;
      scrollData.current.targetOffsets[1] += velocity * 1.5;
      scrollData.current.targetOffsets[2] += velocity * 1.5;
      scrollData.current.targetOffsets[3] += velocity * 0.5;
    };

    window.addEventListener('scroll', handleScroll);

    // Animation loop (Lerp for smooth snapping/blur)
    let animationFrameId: number;
    const render = () => {
      const data = scrollData.current;

      // Decelerate velocity for snap effect
      data.velocity *= 0.9;

      // Interpolate current offsets towards target offsets for smoothness
      for (let i = 0; i < 4; i++) {
        data.currentOffsets[i] += (data.targetOffsets[i] - data.currentOffsets[i]) * 0.1;
      }

      material.uniforms.uOffsets.value = [...data.currentOffsets];
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      if (container) {
        renderer.setSize(container.clientWidth, container.clientHeight);
        material.uniforms.uResolution.value.set(container.clientWidth, container.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container) container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [src]);

  return <div ref={mountRef} className="w-full h-full absolute inset-0" />;
};


// ─── MAIN LANDING COMPONENT ───────────────────────────────────────────────

export default function Landing() {
  const companyLogos = [
    "simple-icons:nasa", "simple-icons:spacex", "simple-icons:uber", "simple-icons:visa",
    "simple-icons:grab", "simple-icons:bose", "simple-icons:discover", "simple-icons:dji",
    "simple-icons:nikon", "simple-icons:sony"
  ];

  return (
    <MarketingLayout>
      <LandingSEO />

      <main className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 transition-colors duration-500">

        {/* Global Vertical Grid Lines */}
        <div className="pointer-events-none fixed inset-0 z-0 flex justify-center container-app">
          <div className="w-full h-full grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-4">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="h-full w-px bg-slate-900/[0.04] dark:bg-white/[0.03]" />
            ))}
          </div>
        </div>

        {/* 1. HERO SECTION */}
        <section className="relative z-10 pt-32 pb-20 min-h-screen flex flex-col items-center justify-center container-app">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none dark:bg-indigo-600/20" />

          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-10 md:col-start-2 text-center flex flex-col items-center relative">

              <SonarPing />

              <h1 className="mt-8 text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1] md:leading-[0.9] text-slate-900 dark:text-white pb-2">
                <StaggeredText text="Aesthetic Audio" />
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 dark:from-slate-400 dark:via-white dark:to-slate-400">
                  <StaggeredText text="Engineered for Viral." />
                </span>
              </h1>

              <p className="mt-8 text-lg md:text-2xl text-slate-600 dark:text-slate-400 font-medium tracking-tight max-w-2xl px-4">
                The avant-garde editor for zero-latency, typography-driven audiograms. Scale your spoken-word content effortlessly.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row gap-6">
                <Link to="/auth/register">
                  <BeamButton>Deploy Audio →</BeamButton>
                </Link>
                <button className="flex items-center gap-3 px-8 py-4 text-sm font-bold tracking-tighter text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors group">
                  <Icon icon="solar:play-circle-bold-duotone" className="text-2xl group-hover:scale-110 transition-transform text-indigo-500" />
                  View Architecture
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* 2. INFINITE MARQUEE */}
        <section className="relative z-10 py-12 border-y border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/50 backdrop-blur-md overflow-hidden flex flex-col items-center">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-20 pointer-events-none" />

          <p className="text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-500 mb-8">Trusted by avant-garde teams</p>

          <div className="flex w-[200%] animate-[marquee_30s_linear_infinite]">
            <div className="flex w-1/2 justify-around items-center">
              {companyLogos.map((logo, i) => (
                <Icon key={i} icon={logo} className="text-4xl text-slate-400 hover:text-slate-800 dark:text-slate-600 dark:hover:text-white transition-colors duration-300 mx-8" />
              ))}
            </div>
            <div className="flex w-1/2 justify-around items-center">
              {companyLogos.map((logo, i) => (
                <Icon key={`dup-${i}`} icon={logo} className="text-4xl text-slate-400 hover:text-slate-800 dark:text-slate-600 dark:hover:text-white transition-colors duration-300 mx-8" />
              ))}
            </div>
          </div>
        </section>

        {/* 3. WEBGL SHOWCASE SECTION */}
        <section className="relative z-10 py-32 container-app">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto min-h-[70vh]">
            <div className="md:col-span-4 flex flex-col justify-center">
              <div>
                <span className="text-xs font-black tracking-widest text-indigo-500 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> 01 WebGL Integration
                </span>
                <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                  Zero Latency.<br />Infinite Frames.
                </h2>
                <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium tracking-tight leading-relaxed max-w-sm">
                  Experience buttery-smooth native rendering. Our architecture pushes frames directly to a headless engine, bypassing browser limits entirely.
                </p>
              </div>
              <div className="pt-12 pb-8">
                <Link to="/auth/register" className="group inline-flex items-center gap-2 text-sm font-bold tracking-tighter text-slate-900 dark:text-white">
                  Initialize Protocol
                  <Icon icon="solar:arrow-right-linear" className="text-lg group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="md:col-span-8 relative rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/10 group min-h-[400px]">
              {/* WebGL Component renders in the background */}
              <WebGLSplitImage src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" />

              {/* Overlay Glass Panel */}
              <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
              <div className="absolute bottom-8 left-8 p-6 bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl max-w-xs shadow-2xl">
                <Icon icon="solar:camera-bold-duotone" className="text-3xl text-indigo-500 mb-4" />
                <h3 className="text-lg font-bold tracking-tighter text-slate-900 dark:text-white">Neural Aesthetics</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-2">Bespoke waveform topology reacting in real-time to vocal cadence.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES GRID */}
        <section className="relative z-10 py-32 bg-slate-100/50 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-white/5">
          <div className="container-app">
            <div className="mb-20 text-center max-w-2xl mx-auto">
              <span className="text-xs font-black tracking-widest text-indigo-500 uppercase">02 Core Logic</span>
              <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                Intentional Minimalism.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Kinetic Typography", icon: "solar:text-field-focus-bold-duotone", desc: "Captions that breathe. Words scale and shift based on volume and sentiment context seamlessly." },
                { title: "Contextual B-Roll", icon: "solar:video-library-bold-duotone", desc: "Machine intelligence automatically queries high-end stock footage matching your spoken topics." },
                { title: "Headless Pipeline", icon: "solar:server-square-bold-duotone", desc: "Drop tasks into the QStash architecture. Cloud containers rip through 4K encoding instantly." }
              ].map((f, i) => (
                <FlashlightCard key={i} className="p-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6 shadow-sm">
                    <Icon icon={f.icon} className="text-2xl text-indigo-500" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white mb-3">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                  <div className="mt-8 text-xs font-black text-slate-400 dark:text-slate-700 tracking-widest">FUNC_{i + 1}()</div>
                </FlashlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* 5. AVATAR / TESTIMONIALS */}
        <section className="relative z-10 py-32 container-app">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <span className="text-xs font-black tracking-widest text-indigo-500 uppercase">03 Signal Verification</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
              Endorsed by the Vanguard.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { img: "https://i.pravatar.cc/150?img=33", name: "Elena Rostova", role: "Design Director @ Automata", quote: "The architectural fidelity here is staggering. It removes 90% of the friction between audio recording and visual deployment." },
              { img: "https://i.pravatar.cc/150?img=11", name: "Marcus Chen", role: "Founder @ VoxAI", quote: "We migrated our entire podcast clipping pipeline to WaveClip. The typographic execution is unmatched." }
            ].map((t, i) => (
              <FlashlightCard key={i} className="p-10 flex flex-col justify-between h-full bg-white dark:bg-transparent border-slate-200 dark:border-slate-800/50 shadow-sm dark:shadow-none">
                <Icon icon="solar:quote-right-bold-duotone" className="text-4xl text-slate-200 dark:text-slate-800 mb-6" />
                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium tracking-tight mb-10 leading-snug">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-6 mt-auto">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 grayscale contrast-125 shadow-sm" />
                  <div>
                    <h4 className="text-sm font-bold tracking-tighter text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 tracking-tight">{t.role}</p>
                  </div>
                </div>
              </FlashlightCard>
            ))}
          </div>
        </section>

        {/* 6. CTA / FOOTER */}
        <footer className="relative z-10 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/80 dark:from-indigo-900/10 to-transparent pointer-events-none" />
          <div className="container-app relative flex flex-col items-center text-center">
            <Icon icon="solar:clapperboard-play-bold-duotone" className="text-6xl text-indigo-500 mb-8 drop-shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6">
              Execute Production.
            </h2>
            <Link to="/auth/register" className="mt-8">
              <BeamButton>Deploy Instance Now</BeamButton>
            </Link>

            <div className="w-full mt-32 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-600 font-bold tracking-widest uppercase">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Icon icon="solar:record-circle-linear" className="text-lg" />
                WaveClip Systems © 2026
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Discord</a>
              </div>
            </div>
          </div>
        </footer>

      </main>

      {/* Global Style Override for Keyframes */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </MarketingLayout>
  );
}
