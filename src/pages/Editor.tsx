import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id, Doc } from '../../convex/_generated/dataModel';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge, Spinner, Modal } from '@/components/ui';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { WaveformPlayer } from '@/hooks/useWaveform';
import { CaptionTimeline, CaptionEditor } from '@/features/captions';
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
  const [activePanel, setActivePanel] = React.useState<'captions' | 'style' | 'settings'>('captions');
  const [selectedCaption, setSelectedCaption] = React.useState<Doc<'captions'> | null>(null);

  // Load captions
  const captions = useQuery(
    api.transcription.getCaptions,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  );

  // Get active caption based on current time
  const activeCaption = React.useMemo(() => {
    if (!captions) return null;
    return captions.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime
    );
  }, [captions, currentTime]);

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

  const transcribe = useAction(api.transcription.transcribe);

  const handleTranscribe = async () => {
    if (!projectId) return;

    setIsTranscribing(true);
    setTranscriptionStatus('idle');

    try {
      await transcribe({ projectId: projectId as Id<"projects"> });
      setTranscriptionStatus('success');
      setActivePanel('captions'); // Switch to captions panel to see results
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
          <div className="w-20 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-3 flex flex-col gap-4">
            <ToolButton icon={Type} label="Captions" active={activePanel === 'captions'} onClick={() => setActivePanel('captions')} />
            <ToolButton icon={Palette} label="Style" active={activePanel === 'style'} onClick={() => setActivePanel('style')} />
            <ToolButton icon={Settings} label="Settings" active={activePanel === 'settings'} onClick={() => setActivePanel('settings')} />
          </div>

          {/* Center - Preview Canvas */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-8 overflow-auto">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-500 border-8 border-white dark:border-slate-800 shadow-indigo-500/10',
                selectedFormat === 'square' && 'w-[450px] h-[450px]',
                selectedFormat === 'vertical' && 'w-[320px] h-[568px]',
                selectedFormat === 'horizontal' && 'w-[640px] h-[360px]',
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
                    {activeCaption?.text || (captions && captions.length > 0
                      ? 'Captions will appear during playback...'
                      : '"Click AI Captions to transcribe your audio..."'
                    )}
                  </p>
                </div>

                {/* Timestamp */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-black/40 rounded text-white text-xs font-mono">
                  {formatDuration(currentTime)}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar - Dynamic Panel */}
          <div className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {activePanel === 'captions' && (
                  <>
                    {selectedCaption ? (
                      <CaptionEditor
                        caption={selectedCaption}
                        onClose={() => setSelectedCaption(null)}
                        className="flex-1 overflow-y-auto"
                      />
                    ) : (
                      <CaptionTimeline
                        projectId={projectId as Id<'projects'>}
                        currentTime={currentTime}
                        duration={duration}
                        onSeek={(time) => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = time;
                            setCurrentTime(time);
                          }
                        }}
                        onCaptionSelect={(caption) => setSelectedCaption(caption)}
                        selectedCaptionId={selectedCaption?._id}
                        className="flex-1 overflow-hidden"
                      />
                    )}
                  </>
                )}

                {activePanel === 'style' && (
                  <div className="p-4 overflow-y-auto">
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
                )}

                {activePanel === 'settings' && (
                  <div className="p-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      Project Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Project Title
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {project?.title || 'Untitled'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Duration
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {formatDuration(project?.duration || 0)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Captions
                        </label>
                        <p className="text-sm text-slate-900 dark:text-white">
                          {captions?.length || 0} segments
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
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
function ToolButton({ icon: Icon, label, active = false, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group',
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
      title={label}
    >
      {active && (
        <motion.div
          layoutId="activeTool"
          className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", active && "text-white")} />
      <span className={cn("text-[10px] font-bold tracking-tight uppercase", active ? "text-white" : "text-slate-500")}>{label}</span>
    </motion.button>
  );
}
