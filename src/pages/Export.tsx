import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge, Spinner, PaywallModal } from '@/components/ui';
import { useProject } from '@/hooks/useProjects';
import { useFFmpeg, generateWaveformFrames, loadAudioBuffer, CaptionSegment } from '@/hooks/useFFmpeg';
import { cn, formatDuration, formatFileSize } from '@/lib/utils';
import { Id } from '../../convex/_generated/dataModel';
import {
  ArrowLeft,
  Download,
  Share2,
  Copy,
  Check,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  FileVideo,
  Clock,
  HardDrive,
  Sparkles,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';

type ExportStatus = 'idle' | 'loading-ffmpeg' | 'generating-frames' | 'rendering' | 'complete' | 'error';

interface FormatPreset {
  id: string;
  label: string;
  ratio: string;
  width: number;
  height: number;
}

const formatPresets: FormatPreset[] = [
  { id: 'square', label: 'Square', ratio: '1:1', width: 1080, height: 1080 },
  { id: 'vertical', label: 'Vertical', ratio: '9:16', width: 1080, height: 1920 },
  { id: 'horizontal', label: 'Horizontal', ratio: '16:9', width: 1920, height: 1080 },
];

const socialPlatforms = [
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

export default function Export() {
  const { projectId } = useParams<{ projectId: string }>();

  // Load project data
  const { project, isLoading: isProjectLoading } = useProject(
    projectId ? (projectId as Id<'projects'>) : null
  );

  // FFmpeg hook
  const {
    isLoaded: isFFmpegLoaded,
    isLoading: isFFmpegLoading,
    loadError: ffmpegLoadError,
    progress: ffmpegProgress,
    isProcessing,
    load: loadFFmpeg,
    generateVideo,
  } = useFFmpeg();

  // Export state
  const [status, setStatus] = React.useState<ExportStatus>('idle');
  const [progress, setProgress] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState<FormatPreset>(formatPresets[0]);
  const [videoBlob, setVideoBlob] = React.useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  // Load captions for the project
  const captions = useQuery(
    api.transcription.getCaptions,
    projectId ? { projectId: projectId as Id<'projects'> } : 'skip'
  );

  // Billing and usage
  const exportLimit = useQuery(api.billing.canExport);
  const subscription = useQuery(api.billing.getSubscription);
  const incrementUsage = useMutation(api.billing.incrementExportUsage);

  const [isPaywallOpen, setIsPaywallOpen] = React.useState(false);

  // Cleanup download URL on unmount
  React.useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  // Update progress from FFmpeg
  React.useEffect(() => {
    if (status === 'rendering') {
      setProgress(50 + ffmpegProgress * 0.5); // 50-100% for rendering phase
    }
  }, [ffmpegProgress, status]);

  const handleExport = async () => {
    // Check export limit
    if (exportLimit && !exportLimit.allowed) {
      setIsPaywallOpen(true);
      return;
    }

    if (!project?.audioUrl) {
      setErrorMessage('No audio file found for this project');
      setStatus('error');
      return;
    }

    setStatus('loading-ffmpeg');
    setProgress(0);
    setErrorMessage(null);

    try {
      // Step 1: Load FFmpeg (0-10%)
      if (!isFFmpegLoaded) {
        await loadFFmpeg();
      }
      setProgress(10);

      // Step 2: Fetch and decode audio (10-20%)
      setStatus('generating-frames');
      const audioResponse = await fetch(project.audioUrl);
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio file');
      }
      const audioBlob = await audioResponse.blob();
      setProgress(15);

      // Decode audio to get AudioBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setProgress(20);

      // Step 3: Generate waveform frames with captions (20-50%)
      // Convert captions to CaptionSegment format
      const captionSegments: CaptionSegment[] = (captions || []).map((c) => ({
        text: c.text,
        startTime: c.startTime,
        endTime: c.endTime,
        style: c.style,
      }));

      const frames = await generateWaveformFrames(
        {
          audioBuffer,
          width: selectedFormat.width,
          height: selectedFormat.height,
          barWidth: 6,
          barGap: 3,
          barColor: 'rgba(255, 255, 255, 0.4)',
          progressColor: '#ffffff',
          backgroundColor: '#6366f1', // Indigo
          fps: 30,
          captions: captionSegments,
        },
        (frameProgress) => {
          setProgress(20 + frameProgress * 0.3); // 20-50%
        }
      );

      // Step 4: Generate video with FFmpeg (50-100%)
      setStatus('rendering');
      const video = await generateVideo({
        audioBlob,
        waveformFrames: frames,
        duration: audioBuffer.duration,
        fps: 30,
        width: selectedFormat.width,
        height: selectedFormat.height,
        outputFormat: 'mp4',
      });

      if (!video) {
        throw new Error('Video generation returned null');
      }

      // Step 5: Create download URL
      const url = URL.createObjectURL(video);
      setVideoBlob(video);
      setDownloadUrl(url);

      // Increment usage count
      try {
        await incrementUsage();
      } catch (err) {
        console.warn('Failed to increment usage:', err);
      }

      setProgress(100);
      setStatus('complete');
    } catch (error) {
      console.error('Export failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !project) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${project.title || 'waveclip-export'}-${selectedFormat.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setVideoBlob(null);
  };

  // Get status display info
  const getStatusInfo = () => {
    switch (status) {
      case 'loading-ffmpeg':
        return { title: 'Initializing...', subtitle: 'Loading video encoder...' };
      case 'generating-frames':
        return { title: 'Generating Frames...', subtitle: 'Creating waveform animation...' };
      case 'rendering':
        return { title: 'Rendering Video...', subtitle: "This may take a minute. Don't close this page." };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const statusInfo = getStatusInfo();

  // Loading state
  if (isProjectLoading) {
    return (
      <AppLayout userName="User">
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
  if (!project) {
    return (
      <AppLayout userName="User">
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
    <AppLayout userName="User">
      <PageContainer maxWidth="lg" className="py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/editor/${projectId}`}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Editor
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Column */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Preview
            </h2>

            {/* Video Preview */}
            <div
              className={cn(
                'rounded-2xl overflow-hidden relative',
                selectedFormat.id === 'square' && 'aspect-square',
                selectedFormat.id === 'vertical' && 'aspect-[9/16]',
                selectedFormat.id === 'horizontal' && 'aspect-video'
              )}
            >
              {status === 'complete' && downloadUrl ? (
                <video
                  src={downloadUrl}
                  controls
                  className="w-full h-full object-cover"
                  poster=""
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 flex items-center justify-center">
                  {/* Waveform Visualization */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="flex items-end justify-center gap-1 h-32 w-full">
                      {[...Array(40)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 bg-white rounded-full"
                          style={{
                            height: `${20 + Math.sin(i * 0.3) * 30 + Math.random() * 40}%`,
                            opacity: 0.6 + Math.random() * 0.4,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur rounded-lg max-w-[80%]">
                    <p className="text-white text-sm font-medium text-center">
                      "The future of content creation..."
                    </p>
                  </div>

                  {/* Play Overlay */}
                  {status === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <FileVideo className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Project Info */}
            <Card className="mt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                    <FileVideo className="h-4 w-4" />
                    <span className="text-sm">Format</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {selectedFormat.label} ({selectedFormat.ratio})
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {formatDuration(project.duration || 0)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm">Size</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {videoBlob ? formatFileSize(videoBlob.size) : '—'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Export Column */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Export Video
            </h2>

            {/* Format Selection */}
            {status === 'idle' && (
              <Card className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Select Format
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {formatPresets.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format)}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-center',
                        selectedFormat.id === format.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      )}
                    >
                      <p
                        className={cn(
                          'text-sm font-medium',
                          selectedFormat.id === format.id
                            ? 'text-indigo-600'
                            : 'text-slate-700 dark:text-slate-300'
                        )}
                      >
                        {format.label}
                      </p>
                      <p className="text-xs text-slate-500">{format.ratio}</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Export Status Card */}
            <Card className="mb-6">
              {status === 'idle' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Ready to Export
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Your audiogram will be rendered as a high-quality {selectedFormat.width}×
                    {selectedFormat.height} MP4 video.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleExport}
                    leftIcon={<Download className="h-5 w-5" />}
                    disabled={!project.audioUrl}
                  >
                    Export Video
                  </Button>
                  {!project.audioUrl && (
                    <p className="text-sm text-amber-600 mt-3">
                      No audio file found. Please upload audio first.
                    </p>
                  )}
                </div>
              )}

              {(status === 'loading-ffmpeg' ||
                status === 'generating-frames' ||
                status === 'rendering') && (
                  <div className="py-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-700">
                          <div
                            className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"
                            style={{ animationDuration: '1.5s' }}
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-indigo-600">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                        {statusInfo.title}
                      </h3>
                      <p className="text-sm text-slate-500">{statusInfo.subtitle}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Stage indicators */}
                    <div className="flex justify-between mt-3 text-xs text-slate-400">
                      <span className={progress >= 10 ? 'text-indigo-500' : ''}>Initialize</span>
                      <span className={progress >= 50 ? 'text-indigo-500' : ''}>Generate</span>
                      <span className={progress >= 100 ? 'text-indigo-500' : ''}>Complete</span>
                    </div>
                  </div>
                )}

              {status === 'complete' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Export Complete!
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Your {selectedFormat.label} video is ready to download.
                    {videoBlob && ` Size: ${formatFileSize(videoBlob.size)}`}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant="primary"
                      leftIcon={<Download className="h-4 w-4" />}
                      onClick={handleDownload}
                    >
                      Download MP4
                    </Button>
                    <Button
                      variant="outline"
                      leftIcon={<RotateCcw className="h-4 w-4" />}
                      onClick={handleReset}
                    >
                      Export Different Format
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Export Failed
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-2">
                    {errorMessage || 'An unexpected error occurred.'}
                  </p>
                  <p className="text-sm text-slate-400 mb-6">
                    Please try again or contact support if the issue persists.
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                    onClick={handleReset}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </Card>

            {/* Share Section */}
            {status === 'complete' && (
              <>
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">
                  Share Your Video
                </h3>

                {/* Copy Link */}
                <Card className="mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      readOnly
                      value={window.location.href}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyLink}
                      leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </Card>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-4 gap-3">
                  {socialPlatforms.map((platform) => (
                    <Button key={platform.id} variant="outline" className="flex-col h-auto py-4">
                      <platform.icon className="h-5 w-5 mb-1" />
                      <span className="text-xs">{platform.label}</span>
                    </Button>
                  ))}
                </div>
              </>
            )}

            {/* Usage Info */}
            <Card className="mt-6 bg-slate-50 dark:bg-slate-800/50" padding="sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Exports this month</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {subscription?.exportsThisMonth || 0} / {subscription?.exportsLimit || 5}
                  </span>
                  <Badge variant="primary" size="sm">
                    {subscription?.plan || 'Free'} Plan
                  </Badge>
                </div>
              </div>
              <div className="mt-2 relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all duration-500",
                    (subscription?.exportsThisMonth || 0) >= (subscription?.exportsLimit || 5)
                      ? "bg-rose-500"
                      : "bg-indigo-500"
                  )}
                  style={{
                    width: `${Math.min(((subscription?.exportsThisMonth || 0) / (subscription?.exportsLimit || 5)) * 100, 100)}%`
                  }}
                />
              </div>
            </Card>

            {/* Paywall Modal */}
            <PaywallModal
              isOpen={isPaywallOpen}
              onClose={() => setIsPaywallOpen(false)}
              currentUsage={subscription?.exportsThisMonth}
              maxUsage={subscription?.exportsLimit}
              planName={subscription?.plan}
            />

            {/* FFmpeg load error */}
            {ffmpegLoadError && status === 'idle' && (
              <Card className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Video encoder issue
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      {ffmpegLoadError}. Make sure your browser supports WebAssembly.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
