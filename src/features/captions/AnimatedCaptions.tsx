import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import { Sparkles, Check, Type, Zap } from 'lucide-react';

// ─── Caption Animation Types ───
export type CaptionAnimationType =
    | 'none'
    | 'fade'
    | 'slide-up'
    | 'slide-down'
    | 'scale'
    | 'typewriter'
    | 'word-by-word'
    | 'bounce'
    | 'glow';

export interface CaptionAnimation {
    id: CaptionAnimationType;
    name: string;
    description: string;
    css: string;
    keyframes?: string;
}

export const captionAnimations: CaptionAnimation[] = [
    {
        id: 'none',
        name: 'None',
        description: 'No animation',
        css: '',
    },
    {
        id: 'fade',
        name: 'Fade In',
        description: 'Smooth fade entrance',
        css: 'animate-fade-in',
        keyframes: `
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
      }
    `,
    },
    {
        id: 'slide-up',
        name: 'Slide Up',
        description: 'Slides in from below',
        css: 'animate-slide-up',
        keyframes: `
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-up {
        animation: slide-up 0.4s ease-out forwards;
      }
    `,
    },
    {
        id: 'slide-down',
        name: 'Slide Down',
        description: 'Slides in from above',
        css: 'animate-slide-down',
        keyframes: `
      @keyframes slide-down {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-down {
        animation: slide-down 0.4s ease-out forwards;
      }
    `,
    },
    {
        id: 'scale',
        name: 'Pop In',
        description: 'Pops in with scale',
        css: 'animate-scale-in',
        keyframes: `
      @keyframes scale-in {
        from { opacity: 0; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-scale-in {
        animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
    `,
    },
    {
        id: 'typewriter',
        name: 'Typewriter',
        description: 'Types out letter by letter',
        css: 'animate-typewriter',
        keyframes: `
      .animate-typewriter {
        overflow: hidden;
        white-space: nowrap;
        animation: typing 2s steps(40, end);
      }
      @keyframes typing {
        from { width: 0; }
        to { width: 100%; }
      }
    `,
    },
    {
        id: 'word-by-word',
        name: 'Word Highlight',
        description: 'Highlights each word',
        css: 'word-highlight',
    },
    {
        id: 'bounce',
        name: 'Bounce',
        description: 'Bouncy entrance',
        css: 'animate-bounce-in',
        keyframes: `
      @keyframes bounce-in {
        0% { opacity: 0; transform: scale(0.3) translateY(20px); }
        50% { opacity: 1; transform: scale(1.05); }
        70% { transform: scale(0.95); }
        100% { transform: scale(1) translateY(0); }
      }
      .animate-bounce-in {
        animation: bounce-in 0.5s ease-out forwards;
      }
    `,
    },
    {
        id: 'glow',
        name: 'Glow Pulse',
        description: 'Glowing text effect',
        css: 'animate-glow',
        keyframes: `
      @keyframes glow {
        0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3); }
        50% { text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.5); }
      }
      .animate-glow {
        animation: glow 2s ease-in-out infinite;
      }
    `,
    },
];

// ─── Animated Caption Preview ───
interface AnimatedCaptionPreviewProps {
    text: string;
    animation: CaptionAnimationType;
    style?: {
        fontSize?: number;
        fontFamily?: string;
        color?: string;
    };
    isPlaying?: boolean;
}

export function AnimatedCaptionPreview({
    text,
    animation,
    style,
    isPlaying = true,
}: AnimatedCaptionPreviewProps) {
    const [key, setKey] = React.useState(0);

    // Restart animation when needed
    const restartAnimation = () => setKey((k) => k + 1);

    React.useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(restartAnimation, 3000);
            return () => clearInterval(interval);
        }
    }, [isPlaying]);

    const animConfig = captionAnimations.find((a) => a.id === animation) || captionAnimations[0];

    // Word-by-word animation
    if (animation === 'word-by-word') {
        const words = text.split(' ');
        return (
            <div
                key={key}
                className="flex flex-wrap justify-center gap-1"
                style={{
                    fontSize: style?.fontSize || 24,
                    fontFamily: style?.fontFamily || 'Inter',
                    color: style?.color || '#ffffff',
                }}
            >
                {words.map((word, i) => (
                    <span
                        key={i}
                        className="inline-block animate-word-highlight"
                        style={{
                            animationDelay: `${i * 0.15}s`,
                        }}
                    >
                        {word}
                    </span>
                ))}
                <style>{`
          @keyframes word-highlight {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); background: rgba(255,255,255,0.1); }
          }
          .animate-word-highlight {
            animation: word-highlight 0.5s ease-out forwards;
            animation-fill-mode: both;
          }
        `}</style>
            </div>
        );
    }

    return (
        <>
            {animConfig.keyframes && <style>{animConfig.keyframes}</style>}
            <div
                key={key}
                className={cn('text-center', animConfig.css)}
                style={{
                    fontSize: style?.fontSize || 24,
                    fontFamily: style?.fontFamily || 'Inter',
                    color: style?.color || '#ffffff',
                }}
            >
                {text}
            </div>
        </>
    );
}

// ─── Animation Selector ───
interface CaptionAnimationSelectorProps {
    selected: CaptionAnimationType;
    onSelect: (animation: CaptionAnimationType) => void;
    className?: string;
}

export function CaptionAnimationSelector({
    selected,
    onSelect,
    className,
}: CaptionAnimationSelectorProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Caption Animation
            </h3>

            <div className="grid grid-cols-3 gap-2">
                {captionAnimations.map((anim) => (
                    <button
                        key={anim.id}
                        onClick={() => onSelect(anim.id)}
                        className={cn(
                            'p-3 rounded-xl border text-left transition-all',
                            selected === anim.id
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Type className="h-3 w-3 text-slate-400" />
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    selected === anim.id
                                        ? 'text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400'
                                )}
                            >
                                {anim.name}
                            </span>
                        </div>
                        {selected === anim.id && (
                            <Check className="h-3 w-3 text-indigo-500 absolute top-2 right-2" />
                        )}
                    </button>
                ))}
            </div>

            {/* Preview */}
            <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Preview</p>
                <div className="h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center">
                    <AnimatedCaptionPreview
                        text="Hello, World!"
                        animation={selected}
                        style={{ fontSize: 20, color: '#ffffff' }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Generate Animation CSS ───
export function generateAnimationCSS(): string {
    return captionAnimations
        .filter((a) => a.keyframes)
        .map((a) => a.keyframes)
        .join('\n');
}
