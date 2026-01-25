import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

// Format presets for different social platforms
const formatPresets = [
  { id: 'square', label: 'Square', ratio: '1:1', icon: Square, width: 1080, height: 1080 },
  { id: 'vertical', label: 'Vertical', ratio: '9:16', icon: RectangleVertical, width: 1080, height: 1920 },
  { id: 'horizontal', label: 'Horizontal', ratio: '16:9', icon: RectangleHorizontal, width: 1920, height: 1080 },
];

export default function Editor() {
  const { projectId } = useParams();

  // Editor state
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(180); // Mock: 3 minutes
  const [selectedFormat, setSelectedFormat] = React.useState('square');
  const [zoom, setZoom] = React.useState(1);
  const [isTranscribing, setIsTranscribing] = React.useState(false);

  // Mock waveform data
  const waveformBars = React.useMemo(() =>
    [...Array(100)].map(() => 20 + Math.random() * 60),
    []
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / duration) * 100;

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    // TODO: Implement actual transcription
    setTimeout(() => setIsTranscribing(false), 3000);
  };

  return (
    <AppLayout userName="John Doe">
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
                  Podcast Episode 42
                </h1>
                <p className="text-xs text-slate-500">Project ID: {projectId}</p>
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
                leftIcon={isTranscribing ? <Spinner size="sm" /> : <Sparkles className="h-4 w-4" />}
                onClick={handleTranscribe}
                disabled={isTranscribing}
              >
                {isTranscribing ? 'Transcribing...' : 'AI Captions'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
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
                    "The future of content creation is here and it's more accessible than ever..."
                  </p>
                </div>

                {/* Timestamp */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 rounded text-white text-xs font-mono">
                  {formatTime(currentTime)}
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
                    <div className={cn(
                      'font-medium text-sm',
                      selectedFormat === format.id
                        ? 'text-indigo-600'
                        : 'text-slate-700 dark:text-slate-300'
                    )}>
                      {format.label}
                    </div>
                    <div className="text-xs text-slate-500">
                      {format.ratio} • {format.width}×{format.height}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Zoom
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Platform Presets
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {['Instagram', 'TikTok', 'Twitter', 'YouTube'].map((platform) => (
                  <Badge
                    key={platform}
                    variant="outline"
                    className="justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Timeline */}
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          {/* Transport Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button variant="ghost" size="sm">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="primary"
              className="w-12 h-12 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <SkipForward className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Waveform Timeline */}
          <div className="relative h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer">
            {/* Waveform Bars */}
            <div className="absolute inset-0 flex items-center justify-center gap-px px-2">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 rounded-full',
                    i < (progressPercent / 100) * waveformBars.length
                      ? 'bg-indigo-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            {/* Progress Indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
              style={{ left: `${progressPercent}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-500 rounded-full" />
            </div>

            {/* Click Handler */}
            <div
              className="absolute inset-0"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                setCurrentTime(percent * duration);
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Tool Button Component
function ToolButton({
  icon: Icon,
  label,
  active = false
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        'w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-colors',
        active
          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
