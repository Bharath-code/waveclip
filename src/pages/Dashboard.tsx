import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConvexProvider, useConvex } from 'convex/react';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, CardHeader, Badge, EmptyState, Skeleton, Modal } from '@/components/ui';
import { AudioUploader } from '@/features/upload';
import { useAudioUpload, useProjects, useDeleteProject } from '@/hooks/useProjects';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import {
  Plus,
  Upload,
  FolderOpen,
  Clock,
  MoreVertical,
  Play,
  Trash2,
  Edit3,
  FileAudio,
  Sparkles,
  X,
  Check,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const { projects, stats, isLoading } = useProjects(10);
  const { uploadState, uploadAudio, reset: resetUpload } = useAudioUpload();

  // Handle file upload completion
  const handleUpload = async (file: File) => {
    const result = await uploadAudio(file);
    if (result?.projectId) {
      // Wait a moment to show success state, then navigate
      setTimeout(() => {
        setShowUploadModal(false);
        resetUpload();
        navigate(`/editor/${result.projectId}`);
      }, 1000);
    }
  };

  return (
    <AppLayout userName="John Doe">
      <PageContainer>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Projects
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Create and manage your audiogram projects
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowUploadModal(true)}
          >
            New Project
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.totalProjects ?? projects.length}
              </div>
              <div className="text-sm text-slate-500">Total Projects</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.exportsThisMonth ?? 0} / 5
              </div>
              <div className="text-sm text-slate-500">Exports This Month</div>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatDuration(stats?.totalDuration ?? 0)}
              </div>
              <div className="text-sm text-slate-500">Total Audio Time</div>
            </div>
          </Card>
        </div>

        {/* Quick Upload Drop Zone */}
        <Card
          className="mb-8 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer group"
          onClick={() => setShowUploadModal(true)}
        >
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
              <Upload className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
              Drop your audio file here
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              MP3, WAV, M4A up to 100MB
            </p>
            <Button variant="outline" size="sm">
              Browse Files
            </Button>
          </div>
        </Card>

        {/* Projects List */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Projects
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="flex items-center gap-4">
                  <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
                  <div className="flex-1">
                    <Skeleton width="60%" height={20} className="mb-2" />
                    <Skeleton width="40%" height={16} />
                  </div>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<FileAudio className="h-8 w-8" />}
              title="No projects yet"
              description="Upload your first audio file to create an audiogram"
              action={
                <Button
                  variant="primary"
                  leftIcon={<Upload className="h-4 w-4" />}
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Audio
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            resetUpload();
          }}
          title="Upload Audio"
          size="lg"
        >
          <div className="p-6">
            {uploadState.stage === 'idle' ? (
              <AudioUploader
                onUpload={handleUpload}
                maxSizeMB={100}
              />
            ) : (
              <UploadProgress state={uploadState} />
            )}
          </div>
        </Modal>
      </PageContainer>
    </AppLayout>
  );
}

// ─── Upload Progress Component ───
function UploadProgress({ state }: { state: { stage: string; progress: number; message: string } }) {
  const stageIcons = {
    uploading: <Upload className="h-6 w-6" />,
    creating: <FileAudio className="h-6 w-6" />,
    complete: <Check className="h-6 w-6" />,
    error: <X className="h-6 w-6" />,
  };

  const stageColors = {
    uploading: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900',
    creating: 'text-violet-600 bg-violet-100 dark:bg-violet-900',
    complete: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900',
    error: 'text-rose-600 bg-rose-100 dark:bg-rose-900',
  };

  return (
    <div className="flex flex-col items-center py-8">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${stageColors[state.stage as keyof typeof stageColors] || stageColors.uploading}`}>
        {stageIcons[state.stage as keyof typeof stageIcons] || stageIcons.uploading}
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        {state.message}
      </h3>

      {state.stage !== 'complete' && state.stage !== 'error' && (
        <div className="w-full max-w-xs mt-4">
          <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-500 text-center">
            {Math.round(state.progress)}%
          </p>
        </div>
      )}

      {state.stage === 'complete' && (
        <p className="text-emerald-600 dark:text-emerald-400 text-sm">
          Redirecting to editor...
        </p>
      )}

      {state.stage === 'error' && (
        <p className="text-rose-600 dark:text-rose-400 text-sm">
          {state.message}
        </p>
      )}
    </div>
  );
}

// ─── Project Card Component ───
function ProjectCard({ project }: { project: any }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);
  const { deleteProject } = useDeleteProject();

  const statusColors = {
    uploading: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    transcribing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const handleDelete = async () => {
    if (confirm('Delete this project? This cannot be undone.')) {
      await deleteProject(project._id);
    }
  };

  return (
    <Card className="flex items-center gap-4 group hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
        <FileAudio className="h-6 w-6 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-slate-900 dark:text-white truncate">
            {project.title}
          </h3>
          <Badge
            className={statusColors[project.status as keyof typeof statusColors]}
            size="sm"
          >
            {project.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>{formatDuration(project.duration || 0)}</span>
          <span>•</span>
          <span>{formatRelativeTime(project.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Edit3 className="h-4 w-4" />}
          onClick={() => navigate(`/editor/${project._id}`)}
        >
          Edit
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-600"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20 py-1">
                <button
                  onClick={() => {
                    navigate(`/export/${project._id}`);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Play className="h-4 w-4 inline mr-2" />
                  Export
                </button>
                <button
                  onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
