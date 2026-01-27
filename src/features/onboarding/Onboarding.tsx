import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import {
    Upload,
    Sparkles,
    Download,
    Share2,
    ArrowRight,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// ─── Onboarding Step Data ───
const onboardingSteps = [
    {
        id: 'upload',
        title: 'Upload Your Audio',
        description: 'Drag and drop your podcast, interview, or any audio file to get started.',
        icon: Upload,
        color: 'indigo',
        tips: [
            'Supports MP3, WAV, M4A, and more',
            'Files up to 500MB',
            'Free users: 5 exports/month',
        ],
    },
    {
        id: 'transcribe',
        title: 'AI-Powered Captions',
        description: 'Our AI transcribes your audio with 99% accuracy and creates beautiful captions.',
        icon: Sparkles,
        color: 'violet',
        tips: [
            'Automatic transcription in seconds',
            'Edit and style captions easily',
            'Multiple animation effects',
        ],
    },
    {
        id: 'customize',
        title: 'Customize Your Style',
        description: 'Choose from beautiful waveform presets and customize colors to match your brand.',
        icon: Share2,
        color: 'pink',
        tips: [
            '8 built-in style presets',
            'Custom colors and shapes',
            'Multiple aspect ratios',
        ],
    },
    {
        id: 'export',
        title: 'Export & Share',
        description: 'Download your audiogram in MP4 format optimized for any social platform.',
        icon: Download,
        color: 'emerald',
        tips: [
            'Square (1:1) for Instagram',
            'Vertical (9:16) for TikTok/Reels',
            'Horizontal (16:9) for YouTube',
        ],
    },
];

// ─── Onboarding Modal ───
interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
    const [currentStep, setCurrentStep] = React.useState(0);
    const navigate = useNavigate();

    if (!isOpen) return null;

    const step = onboardingSteps[currentStep];
    const isLastStep = currentStep === onboardingSteps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
            navigate('/dashboard');
        } else {
            setCurrentStep((s) => s + 1);
        }
    };

    const handleSkip = () => {
        onComplete();
        navigate('/dashboard');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <Card className="relative w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Progress */}
                <div className="flex gap-1 p-4 pb-0">
                    {onboardingSteps.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'h-1 flex-1 rounded-full transition-colors',
                                i <= currentStep ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'
                            )}
                        />
                    ))}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="p-8 pt-6 text-center">
                    {/* Icon */}
                    <div
                        className={cn(
                            'w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6',
                            step.color === 'indigo' && 'bg-indigo-100 dark:bg-indigo-900/30',
                            step.color === 'violet' && 'bg-violet-100 dark:bg-violet-900/30',
                            step.color === 'pink' && 'bg-pink-100 dark:bg-pink-900/30',
                            step.color === 'emerald' && 'bg-emerald-100 dark:bg-emerald-900/30'
                        )}
                    >
                        <step.icon
                            className={cn(
                                'h-10 w-10',
                                step.color === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
                                step.color === 'violet' && 'text-violet-600 dark:text-violet-400',
                                step.color === 'pink' && 'text-pink-600 dark:text-pink-400',
                                step.color === 'emerald' && 'text-emerald-600 dark:text-emerald-400'
                            )}
                        />
                    </div>

                    {/* Text */}
                    <Badge variant="outline" className="mb-3">
                        Step {currentStep + 1} of {onboardingSteps.length}
                    </Badge>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        {step.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {step.description}
                    </p>

                    {/* Tips */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                        <ul className="space-y-2">
                            {step.tips.map((tip, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {currentStep > 0 && (
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentStep((s) => s - 1)}
                                leftIcon={<ChevronLeft className="h-4 w-4" />}
                            >
                                Back
                            </Button>
                        )}
                        <div className="flex-1" />
                        <Button variant="ghost" onClick={handleSkip}>
                            Skip Tour
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            rightIcon={isLastStep ? undefined : <ChevronRight className="h-4 w-4" />}
                        >
                            {isLastStep ? 'Get Started' : 'Next'}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ─── Onboarding Hook ───
const ONBOARDING_COMPLETE_KEY = 'waveclip_onboarding_complete';

export function useOnboarding() {
    const [showOnboarding, setShowOnboarding] = React.useState(false);

    React.useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (!completed) {
            // Small delay to let the page load
            setTimeout(() => setShowOnboarding(true), 500);
        }
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        setShowOnboarding(false);
    };

    const resetOnboarding = () => {
        localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
        setShowOnboarding(true);
    };

    return {
        showOnboarding,
        setShowOnboarding,
        completeOnboarding,
        resetOnboarding,
    };
}

// ─── Onboarding Checklist (for Dashboard) ───
interface OnboardingChecklistProps {
    completedSteps: string[];
    className?: string;
}

export function OnboardingChecklist({ completedSteps, className }: OnboardingChecklistProps) {
    const allSteps = [
        { id: 'upload', label: 'Upload your first audio' },
        { id: 'transcribe', label: 'Generate AI captions' },
        { id: 'export', label: 'Export your first audiogram' },
        { id: 'customize', label: 'Customize waveform style' },
    ];

    const progress = (completedSteps.length / allSteps.length) * 100;

    if (progress >= 100) return null;

    return (
        <Card className={cn('p-4', className)}>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                    Getting Started
                </h3>
                <Badge variant="primary" size="sm">
                    {completedSteps.length}/{allSteps.length}
                </Badge>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <ul className="space-y-2">
                {allSteps.map((step) => {
                    const isComplete = completedSteps.includes(step.id);
                    return (
                        <li
                            key={step.id}
                            className={cn(
                                'flex items-center gap-2 text-sm',
                                isComplete
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-600 dark:text-slate-400'
                            )}
                        >
                            {isComplete ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                            )}
                            <span className={cn(isComplete && 'line-through')}>{step.label}</span>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
