import React from 'react';
import { cn, formatFileSize } from '@/lib/utils';
import { Button, Spinner } from '@/components/ui';
import { Upload, FileAudio, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface AudioUploaderProps {
    onUpload: (file: File) => Promise<void>;
    maxSizeMB?: number;
    acceptedFormats?: string[];
    className?: string;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

export function AudioUploader({
    onUpload,
    maxSizeMB = 100,
    acceptedFormats = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'],
    className,
}: AudioUploaderProps) {
    const [state, setState] = React.useState<UploadState>('idle');
    const [progress, setProgress] = React.useState(0);
    const [file, setFile] = React.useState<File | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validateFile = (file: File): string | null => {
        if (!acceptedFormats.includes(file.type)) {
            return `Invalid file type. Please upload MP3, WAV, M4A, or OGG files.`;
        }
        if (file.size > maxSizeBytes) {
            return `File too large. Maximum size is ${maxSizeMB}MB.`;
        }
        return null;
    };

    const handleFile = async (selectedFile: File) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            setState('error');
            return;
        }

        setFile(selectedFile);
        setError(null);
        setState('uploading');

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 95) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            await onUpload(selectedFile);
            clearInterval(progressInterval);
            setProgress(100);
            setState('success');
        } catch (err) {
            clearInterval(progressInterval);
            setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
            setState('error');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setState('idle');

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFile(droppedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setState('dragging');
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setState('idle');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const reset = () => {
        setState('idle');
        setProgress(0);
        setFile(null);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div
            className={cn(
                'relative rounded-xl border-2 border-dashed transition-all duration-200',
                state === 'idle' && 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500',
                state === 'dragging' && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
                state === 'uploading' && 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20',
                state === 'success' && 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
                state === 'error' && 'border-rose-400 bg-rose-50 dark:bg-rose-950/30',
                className
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <input
                ref={inputRef}
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleInputChange}
                className="hidden"
                id="audio-upload"
            />

            {/* Idle State */}
            {(state === 'idle' || state === 'dragging') && (
                <label
                    htmlFor="audio-upload"
                    className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer"
                >
                    <div className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
                        state === 'dragging'
                            ? 'bg-indigo-100 dark:bg-indigo-900'
                            : 'bg-slate-100 dark:bg-slate-800'
                    )}>
                        <Upload className={cn(
                            'h-8 w-8 transition-colors',
                            state === 'dragging'
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-400'
                        )} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                        {state === 'dragging' ? 'Drop your file here' : 'Drop your audio file here'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 text-center">
                        MP3, WAV, M4A, OGG up to {maxSizeMB}MB
                    </p>
                    <Button variant="outline" size="sm" type="button">
                        Browse Files
                    </Button>
                </label>
            )}

            {/* Uploading State */}
            {state === 'uploading' && file && (
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center shrink-0">
                            <FileAudio className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                {file.name}
                            </p>
                            <p className="text-sm text-slate-500">
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        <Spinner size="md" />
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-sm text-slate-500 text-center">
                        Uploading... {Math.round(progress)}%
                    </p>
                </div>
            )}

            {/* Success State */}
            {state === 'success' && file && (
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                                {file.name}
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                Upload complete!
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={reset}>
                            Upload Another
                        </Button>
                    </div>
                </div>
            )}

            {/* Error State */}
            {state === 'error' && (
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-rose-600 dark:text-rose-400">
                                Upload Failed
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {error}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={reset}>
                            Try Again
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple inline audio preview after upload
interface AudioPreviewProps {
    file: File | null;
    onRemove?: () => void;
}

export function AudioPreview({ file, onRemove }: AudioPreviewProps) {
    const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
    const [duration, setDuration] = React.useState<number>(0);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    React.useEffect(() => {
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!file || !audioUrl) return null;

    return (
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <audio
                ref={audioRef}
                src={audioUrl}
                onLoadedMetadata={handleLoadedMetadata}
                className="hidden"
            />
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                <FileAudio className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                    {file.name}
                </p>
                <p className="text-sm text-slate-500">
                    {formatFileSize(file.size)} • {duration > 0 ? formatDuration(duration) : 'Loading...'}
                </p>
            </div>
            {onRemove && (
                <Button variant="ghost" size="sm" onClick={onRemove}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
