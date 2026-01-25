import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge, Spinner, Modal } from '@/components/ui';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { WaveformPlayer } from '@/hooks/useWaveform';
import { cn, formatDuration } from '@/lib/utils';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Settings,
  Type,
  Palette,
  Sparkles,
  Square,
  RectangleVertical,
  RectangleHorizontal,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';

// Format presets for different social platforms
const formatPresets = [
  { id: 'square', label: 'Square', ratio: '1:1', icon: Square, width: 1080, height: 1080 },
  { id: 'vertical', label: 'Vertical', ratio: '9:16', icon: RectangleVertical, width: 1080, height: 1920 },
  { id: 'horizontal', label: 'Horizontal', ratio: '16:9', icon: RectangleHorizontal, width: 1920, height: 1080 },
];

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const waveformRef = React.useRef<HTMLDivElement>(null);

  // Load project data
  const { project, isLoading } = useProject(projectId as Id<"projects"> | null);
  const { updateProject } = useUpdateProject();

  // Editor state
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [selectedFormat, setSelectedFormat] = React.useState('square');
  const [zoom, setZoom] = React.useState(1);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [transcriptionStatus, setTranscriptionStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  // Audio element ref
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Waveform visualization (mock data fallback)
  const waveformBars = React.useMemo(() =>
    [...Array(100)].map(() => 20 + Math.random() * 60),
    []
  );

  // Load audio metadata
  React.useEffect(() => {
    if (project?.duration) {
      setDuration(project.duration);
    }
  }, [project]);

  // Handle audio playback
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const seekTime = (x / rect.width) * duration;
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleTranscribe = async () => {
    if (!projectId) return;

    setIsTranscribing(true);
    setTranscriptionStatus('idle');

    try {
      // TODO: Call Convex transcription action
      // await transcribe({ projectId: projectId as Id<"projects"> });

      // Mock transcription for now
      await new Promise(resolve => setTimeout(resolve, 3000));
      setTranscriptionStatus('success');
    } catch (error) {
      console.error('Transcription failed:', error);
      setTranscriptionStatus('error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Loading state
  if (isLoading) {
    return (
      <AppLayout userName="John Doe">
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mb-4" />
            <p className="text-slate-500">Loading project...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Project not found
  if (!project && !isLoading) {
    return (
      <AppLayout userName="John Doe">
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Project not found
            </h2>
            <p className="text-slate-500 mb-4">
              This project may have been deleted or doesn't exist.
            </p>
            <Link to="/dashboard">
              <Button variant="primary">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userName="John Doe">
      {/* Hidden audio element for playback */}
      {project?.audioUrl && (
        <audio
          ref={audioRef}
          src={project.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          muted={isMuted}
        />
      )}

      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Top Toolbar */}
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="font-semibold text-slate-900 dark:text-white">
                  {project?.title || 'Untitled Project'}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge size="sm" variant={project?.status === 'ready' ? 'success' : 'primary'}>
                    {project?.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {formatDuration(project?.duration || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={
                  isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : transcriptionStatus === 'success' ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )
                }
                onClick={handleTranscribe}
                disabled={isTranscribing || !project?.audioUrl}
              >
                {isTranscribing ? 'Transcribing...' : transcriptionStatus === 'success' ? 'Transcribed' : 'AI Captions'}
              </Button>
              <Link to={`/export/${projectId}`}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Export
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Tools */}
          <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 flex flex-col gap-2">
            <ToolButton icon={Type} label="Captions" active />
            <ToolButton icon={Palette} label="Style" />
            <ToolButton icon={Settings} label="Settings" />
          </div>

          {/* Center - Preview Canvas */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-8 overflow-auto">
            <div
              className={cn(
                'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300',
                selectedFormat === 'square' && 'w-[400px] h-[400px]',
                selectedFormat === 'vertical' && 'w-[300px] h-[533px]',
                selectedFormat === 'horizontal' && 'w-[533px] h-[300px]',
              )}
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Preview Content */}
              <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
                {/* Waveform Visualization */}
                <div className="flex items-center justify-center gap-0.5 h-24 w-full">
                  {waveformBars.slice(0, selectedFormat === 'horizontal' ? 60 : 40).map((height, i) => {
                    const isActive = i < (progressPercent / 100) * waveformBars.length;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'w-1 rounded-full transition-all duration-100',
                          isActive
                            ? 'bg-white'
                            : 'bg-white/40'
                        )}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>

                {/* Caption Preview */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur rounded-lg max-w-[80%]">
                  <p className="text-white text-sm font-medium text-center">
                    {transcriptionStatus === 'success'
                      ? '"Click AI Captions to generate subtitles..."'
                      : '"The future of content creation is here..."'
                    }
                  </p>
                </div>

                {/* Timestamp */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 rounded text-white text-xs font-mono">
                  {formatDuration(currentTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Format Selector */}
          <div className="w-64 shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Export Format
            </h3>
            <div className="space-y-2">
              {formatPresets.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                    selectedFormat === format.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  )}
                >
                  <format.icon className={cn(
                    'h-5 w-5',
                    selectedFormat === format.id
                      ? 'text-indigo-600'
                      : 'text-slate-400'
                  )} />
                  <div className="text-left">
                    <p className={cn(
                      'text-sm font-medium',
                      selectedFormat === format.id
                        ? 'text-indigo-600'
                        : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {format.label}
                    </p>
                    <p className="text-xs text-slate-500">{format.ratio}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Preview Zoom
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${((zoom - 0.5) / 1) * 100}%` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
                  disabled={zoom >= 1.5}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                {Math.round(zoom * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Timeline */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, currentTime - 5);
                }
              }}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-10 h-10 rounded-full"
                onClick={handlePlayPause}
                disabled={!project?.audioUrl}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(duration, currentTime + 5);
                }
              }}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm font-mono text-slate-600 dark:text-slate-400">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Timeline Scrubber */}
          <div
            className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer group"
            onClick={handleSeek}
          >
            {/* Waveform Background */}
            <div className="absolute inset-0 flex items-center justify-center gap-px px-2">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 rounded-full transition-colors',
                    i < (progressPercent / 100) * waveformBars.length
                      ? 'bg-indigo-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  )}
                  style={{ height: `${height * 0.8}%` }}
                />
              ))}
            </div>

            {/* Progress Indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 z-10"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow" />
            </div>

            {/* Hover indicator */}
            <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Tool Button Component ───
function ToolButton({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <button
      className={cn(
        'w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors',
        active
          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
