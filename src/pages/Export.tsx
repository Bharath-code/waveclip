import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

type ExportStatus = 'idle' | 'preparing' | 'rendering' | 'complete' | 'error';

const socialPlatforms = [
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
];

export default function Export() {
  const { projectId } = useParams();

  const [status, setStatus] = React.useState<ExportStatus>('idle');
  const [progress, setProgress] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  // Mock export data
  const exportData = {
    title: 'Podcast Episode 42',
    format: 'Square (1:1)',
    resolution: '1080×1080',
    duration: '3:00',
    fileSize: '24.5 MB',
    downloadUrl: '#',
  };

  const handleExport = async () => {
    setStatus('preparing');
    setProgress(0);

    // Simulate export process
    await simulateProgress(0, 20, 1000, setProgress);
    setStatus('rendering');
    await simulateProgress(20, 100, 3000, setProgress);

    setStatus('complete');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://waveclip.app/share/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout userName="John Doe">
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
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative">
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                </div>
              </div>
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
                    {exportData.format}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {exportData.duration}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm">Size</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {exportData.fileSize}
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
                    Your audiogram will be rendered in high quality MP4 format.
                  </p>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleExport}
                    leftIcon={<Download className="h-5 w-5" />}
                  >
                    Export Video
                  </Button>
                </div>
              )}

              {(status === 'preparing' || status === 'rendering') && (
                <div className="py-8">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <Spinner size="xl" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                      {status === 'preparing' ? 'Preparing...' : 'Rendering Video...'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {status === 'preparing'
                        ? 'Setting up your export...'
                        : 'This may take a minute. Please don\'t close this page.'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
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
                    Your video is ready to download.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant="primary"
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      Download MP4
                    </Button>
                    <Button variant="outline">
                      Export Again
                    </Button>
                  </div>
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
                      value="https://waveclip.app/share/abc123"
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
                    <Button
                      key={platform.id}
                      variant="outline"
                      className="flex-col h-auto py-4"
                    >
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
                  <span className="font-medium text-slate-900 dark:text-white">3 / 5</span>
                  <Badge variant="primary" size="sm">Free Plan</Badge>
                </div>
              </div>
              <div className="mt-2 relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[60%] bg-indigo-500 rounded-full" />
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}

// Helper function to simulate progress
async function simulateProgress(
  start: number,
  end: number,
  duration: number,
  setProgress: (p: number) => void
): Promise<void> {
  const steps = 20;
  const stepDuration = duration / steps;
  const stepIncrement = (end - start) / steps;

  for (let i = 0; i <= steps; i++) {
    setProgress(Math.round(start + stepIncrement * i));
    await new Promise((resolve) => setTimeout(resolve, stepDuration));
  }
}
