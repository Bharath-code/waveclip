import React from 'react';
import WaveSurfer from 'wavesurfer.js';

interface UseWaveformOptions {
    container: React.RefObject<HTMLElement>;
    audioUrl?: string;
    audioBlob?: Blob;
    waveColor?: string;
    progressColor?: string;
    cursorColor?: string;
    barWidth?: number;
    barGap?: number;
    barRadius?: number;
    height?: number;
    responsive?: boolean;
}

interface UseWaveformReturn {
    wavesurfer: WaveSurfer | null;
    isReady: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    play: () => void;
    pause: () => void;
    toggle: () => void;
    seek: (time: number) => void;
    seekTo: (progress: number) => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
    zoom: (pxPerSec: number) => void;
    load: (url: string) => void;
    loadBlob: (blob: Blob) => void;
}

export function useWaveform(options: UseWaveformOptions): UseWaveformReturn {
    const {
        container,
        audioUrl,
        audioBlob,
        waveColor = '#a5b4fc', // Indigo 300
        progressColor = '#6366f1', // Indigo 500
        cursorColor = '#f43f5e', // Rose 500
        barWidth = 3,
        barGap = 2,
        barRadius = 3,
        height = 128,
        responsive = true,
    } = options;

    const wavesurferRef = React.useRef<WaveSurfer | null>(null);
    const [isReady, setIsReady] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolumeState] = React.useState(1);

    // Initialize WaveSurfer
    React.useEffect(() => {
        if (!container.current) return;

        const ws = WaveSurfer.create({
            container: container.current,
            waveColor,
            progressColor,
            cursorColor,
            barWidth,
            barGap,
            barRadius,
            height,
            normalize: true,
            backend: 'WebAudio',
        });

        wavesurferRef.current = ws;

        // Event listeners
        ws.on('ready', () => {
            setIsReady(true);
            setDuration(ws.getDuration());
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));
        ws.on('finish', () => setIsPlaying(false));

        ws.on('audioprocess', () => {
            setCurrentTime(ws.getCurrentTime());
        });

        ws.on('seeking', () => {
            setCurrentTime(ws.getCurrentTime());
        });

        // Load initial audio
        if (audioUrl) {
            ws.load(audioUrl);
        } else if (audioBlob) {
            ws.loadBlob(audioBlob);
        }

        // Handle resize
        if (responsive) {
            const handleResize = () => {
                ws.setOptions({ height });
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                ws.destroy();
            };
        }

        return () => {
            ws.destroy();
        };
    }, [container]); // Only re-initialize on container change

    // Update waveform colors if they change
    React.useEffect(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setOptions({
                waveColor,
                progressColor,
                cursorColor,
            });
        }
    }, [waveColor, progressColor, cursorColor]);

    const play = React.useCallback(() => {
        wavesurferRef.current?.play();
    }, []);

    const pause = React.useCallback(() => {
        wavesurferRef.current?.pause();
    }, []);

    const toggle = React.useCallback(() => {
        wavesurferRef.current?.playPause();
    }, []);

    const seek = React.useCallback((time: number) => {
        if (wavesurferRef.current && duration > 0) {
            wavesurferRef.current.seekTo(time / duration);
        }
    }, [duration]);

    const seekTo = React.useCallback((progress: number) => {
        wavesurferRef.current?.seekTo(progress);
    }, []);

    const setVolume = React.useCallback((vol: number) => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setVolume(vol);
            setVolumeState(vol);
        }
    }, []);

    const setMuted = React.useCallback((muted: boolean) => {
        if (wavesurferRef.current) {
            wavesurferRef.current.setMuted(muted);
        }
    }, []);

    const zoom = React.useCallback((pxPerSec: number) => {
        wavesurferRef.current?.zoom(pxPerSec);
    }, []);

    const load = React.useCallback((url: string) => {
        setIsReady(false);
        wavesurferRef.current?.load(url);
    }, []);

    const loadBlob = React.useCallback((blob: Blob) => {
        setIsReady(false);
        wavesurferRef.current?.loadBlob(blob);
    }, []);

    return {
        wavesurfer: wavesurferRef.current,
        isReady,
        isPlaying,
        currentTime,
        duration,
        volume,
        play,
        pause,
        toggle,
        seek,
        seekTo,
        setVolume,
        setMuted,
        zoom,
        load,
        loadBlob,
    };
}

// ─── Waveform Player Component ───
interface WaveformPlayerProps {
    audioUrl?: string;
    audioBlob?: Blob;
    height?: number;
    waveColor?: string;
    progressColor?: string;
    className?: string;
    showControls?: boolean;
}

export function WaveformPlayer({
    audioUrl,
    audioBlob,
    height = 128,
    waveColor = '#a5b4fc',
    progressColor = '#6366f1',
    className,
    showControls = true,
}: WaveformPlayerProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);

    const {
        isReady,
        isPlaying,
        currentTime,
        duration,
        toggle,
        seekTo,
    } = useWaveform({
        container: containerRef,
        audioUrl,
        audioBlob,
        waveColor,
        progressColor,
        height,
    });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className= { className } >
        {/* Waveform Container */ }
        < div
    ref = { containerRef }
    className = "w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800"
        />

        {/* Controls */ }
    {
        showControls && (
            <div className="flex items-center justify-between mt-4" >
                <button
            onClick={ toggle }
        disabled = {!isReady
    }
    className = "w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
        {
            isPlaying?(
              <svg className = "w-5 h-5" fill = "currentColor" viewBox = "0 0 24 24" >
                    <rect x="6" y = "4" width = "4" height = "16" rx = "1" />
                        <rect x="14" y = "4" width = "4" height = "16" rx = "1" />
                            </svg>
            ): (
                    <svg className = "w-5 h-5 ml-1" fill = "currentColor" viewBox = "0 0 24 24">
                <path d = "M8 5v14l11-7z" />
        </svg>
            )
}
</button>

    < div className = "text-sm text-slate-600 dark:text-slate-400 font-mono" >
        { formatTime(currentTime) } / { formatTime(duration) }
        </div>
        </div>
      )}
</div>
  );
}
