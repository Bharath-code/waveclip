import React from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface UseFFmpegReturn {
    isLoaded: boolean;
    isLoading: boolean;
    loadError: string | null;
    progress: number;
    isProcessing: boolean;
    load: () => Promise<void>;
    generateVideo: (options: VideoGenerationOptions) => Promise<Blob | null>;
    abort: () => void;
}

interface VideoGenerationOptions {
    audioBlob: Blob;
    waveformFrames: string[]; // Base64 encoded frame images
    duration: number; // in seconds
    fps?: number;
    width: number;
    height: number;
    outputFormat?: 'mp4' | 'webm';
}

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;

export function useFFmpeg(): UseFFmpegReturn {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const [progress, setProgress] = React.useState(0);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const abortControllerRef = React.useRef<AbortController | null>(null);

    const load = React.useCallback(async () => {
        if (isLoaded || isLoading) return;

        setIsLoading(true);
        setLoadError(null);

        try {
            // Create singleton instance
            if (!ffmpegInstance) {
                ffmpegInstance = new FFmpeg();

                // Set up progress handler
                ffmpegInstance.on('progress', ({ progress: p }) => {
                    setProgress(Math.round(p * 100));
                });

                ffmpegInstance.on('log', ({ message }) => {
                    console.log('[FFmpeg]', message);
                });
            }

            // Load FFmpeg WASM files from CDN
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

            await ffmpegInstance.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });

            setIsLoaded(true);
        } catch (error) {
            console.error('Failed to load FFmpeg:', error);
            setLoadError(error instanceof Error ? error.message : 'Failed to load FFmpeg');
        } finally {
            setIsLoading(false);
        }
    }, [isLoaded, isLoading]);

    const generateVideo = React.useCallback(
        async (options: VideoGenerationOptions): Promise<Blob | null> => {
            if (!ffmpegInstance || !isLoaded) {
                throw new Error('FFmpeg not loaded. Call load() first.');
            }

            const {
                audioBlob,
                waveformFrames,
                duration,
                fps = 30,
                width,
                height,
                outputFormat = 'mp4',
            } = options;

            setIsProcessing(true);
            setProgress(0);
            abortControllerRef.current = new AbortController();

            try {
                // Write audio file
                const audioData = await fetchFile(audioBlob);
                await ffmpegInstance.writeFile('audio.mp3', audioData);

                // Write frame images
                for (let i = 0; i < waveformFrames.length; i++) {
                    const frameData = waveformFrames[i];
                    const frameBlob = await (await fetch(frameData)).blob();
                    const frameArray = await fetchFile(frameBlob);
                    await ffmpegInstance.writeFile(`frame${String(i).padStart(5, '0')}.png`, frameArray);
                }

                // Generate video from frames + audio
                const outputFile = `output.${outputFormat}`;

                // FFmpeg command to combine image sequence with audio
                await ffmpegInstance.exec([
                    '-framerate', String(fps),
                    '-i', 'frame%05d.png',
                    '-i', 'audio.mp3',
                    '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac',
                    '-shortest',
                    '-movflags', '+faststart',
                    '-preset', 'fast',
                    '-crf', '23',
                    outputFile,
                ]);

                // Read output file
                const data = await ffmpegInstance.readFile(outputFile);
                const videoBlob = new Blob([data], {
                    type: outputFormat === 'mp4' ? 'video/mp4' : 'video/webm'
                });

                // Cleanup
                await ffmpegInstance.deleteFile('audio.mp3');
                await ffmpegInstance.deleteFile(outputFile);
                for (let i = 0; i < waveformFrames.length; i++) {
                    try {
                        await ffmpegInstance.deleteFile(`frame${String(i).padStart(5, '0')}.png`);
                    } catch {
                        // Ignore cleanup errors
                    }
                }

                setProgress(100);
                return videoBlob;
            } catch (error) {
                console.error('Video generation failed:', error);
                throw error;
            } finally {
                setIsProcessing(false);
            }
        },
        [isLoaded]
    );

    const abort = React.useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsProcessing(false);
        setProgress(0);
    }, []);

    return {
        isLoaded,
        isLoading,
        loadError,
        progress,
        isProcessing,
        load,
        generateVideo,
        abort,
    };
}

// ─── Canvas Waveform Renderer ───
export interface CaptionSegment {
    text: string;
    startTime: number;
    endTime: number;
    style?: {
        fontSize?: number;
        fontFamily?: string;
        color?: string;
        backgroundColor?: string;
        position?: string;
    };
}

interface WaveformRendererOptions {
    audioBuffer: AudioBuffer;
    width: number;
    height: number;
    barWidth?: number;
    barGap?: number;
    barColor?: string;
    progressColor?: string;
    backgroundColor?: string;
    fps?: number;
    captions?: CaptionSegment[];
}

export async function generateWaveformFrames(
    options: WaveformRendererOptions,
    onProgress?: (progress: number) => void
): Promise<string[]> {
    const {
        audioBuffer,
        width,
        height,
        barWidth = 4,
        barGap = 2,
        barColor = 'rgba(255, 255, 255, 0.4)',
        progressColor = '#ffffff',
        backgroundColor = '#6366f1', // Indigo
        fps = 30,
        captions = [],
    } = options;

    const duration = audioBuffer.duration;
    const totalFrames = Math.ceil(duration * fps);
    const frames: string[] = [];

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Extract waveform data
    const channelData = audioBuffer.getChannelData(0);
    const samplesPerBar = Math.floor(channelData.length / (width / (barWidth + barGap)));
    const bars: number[] = [];

    for (let i = 0; i < width / (barWidth + barGap); i++) {
        const start = i * samplesPerBar;
        const end = start + samplesPerBar;
        let max = 0;

        for (let j = start; j < end && j < channelData.length; j++) {
            const abs = Math.abs(channelData[j]);
            if (abs > max) max = abs;
        }

        bars.push(max);
    }

    // Generate frames
    for (let frame = 0; frame < totalFrames; frame++) {
        const progress = frame / totalFrames;
        const currentTime = (frame / fps);

        // Clear canvas
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw waveform bars
        const barCount = bars.length;
        const barsToDraw = Math.floor(barCount * progress);

        for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + barGap) + barGap;
            const barHeight = bars[i] * (height * 0.8);
            const y = (height - barHeight) / 2;

            ctx.fillStyle = i < barsToDraw ? progressColor : barColor;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
            ctx.fill();
        }

        // Draw caption for current time
        const activeCaption = captions.find(
            (c) => currentTime >= c.startTime && currentTime < c.endTime
        );

        if (activeCaption) {
            const fontSize = activeCaption.style?.fontSize || 32;
            const fontFamily = activeCaption.style?.fontFamily || 'Inter, sans-serif';
            const textColor = activeCaption.style?.color || '#ffffff';
            const bgColor = activeCaption.style?.backgroundColor || 'rgba(0, 0, 0, 0.6)';
            const position = activeCaption.style?.position || 'bottom';

            // Set font
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Measure text
            const metrics = ctx.measureText(activeCaption.text);
            const textWidth = metrics.width;
            const textHeight = fontSize * 1.2;
            const padding = fontSize * 0.5;

            // Calculate position
            let textY: number;
            switch (position) {
                case 'top':
                    textY = height * 0.15;
                    break;
                case 'middle':
                    textY = height * 0.5;
                    break;
                case 'bottom':
                default:
                    textY = height * 0.85;
                    break;
            }

            // Draw background
            ctx.fillStyle = bgColor;
            const bgX = (width - textWidth) / 2 - padding;
            const bgWidth = textWidth + padding * 2;
            const bgHeight = textHeight + padding;
            const bgY = textY - bgHeight / 2;

            ctx.beginPath();
            ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 8);
            ctx.fill();

            // Draw text
            ctx.fillStyle = textColor;
            ctx.fillText(activeCaption.text, width / 2, textY);
        }

        // Convert to base64
        frames.push(canvas.toDataURL('image/png'));

        if (onProgress) {
            onProgress((frame / totalFrames) * 100);
        }

        // Yield to prevent blocking
        if (frame % 10 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    return frames;
}

// ─── Audio Buffer Loader ───
export async function loadAudioBuffer(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    return audioContext.decodeAudioData(arrayBuffer);
}
