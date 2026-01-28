import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, CardHeader, Badge, EmptyState, Skeleton, Modal } from '@/components/ui';
import { Magnetic } from '@/components/ui/Magnetic';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
} as const;

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
      <PageContainer className="noise-overlay min-h-screen pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Welcome back! You have <span className="text-indigo-500 font-bold">{projects.length}</span> projects.
            </p>
          </div>
          <Magnetic strength={0.2}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              className="rounded-2xl shadow-xl shadow-indigo-600/20"
              onClick={() => setShowUploadModal(true)}
            >
              New Project
            </Button>
          </Magnetic>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
        >
          <motion.div variants={itemVariants}>
            <Card variant="glass" className="flex items-center gap-5 border-white/10 dark:bg-slate-900/50">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner">
                <FolderOpen className="h-7 w-7 text-indigo-500" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.totalProjects ?? projects.length}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Projects</div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card variant="glass" className="flex items-center gap-5 border-white/10 dark:bg-slate-900/50">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                <Sparkles className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {stats?.exportsThisMonth ?? 0} / 5
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exports This Month</div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card variant="glass" className="flex items-center gap-5 border-white/10 dark:bg-slate-900/50">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center shadow-inner">
                <Clock className="h-7 w-7 text-violet-500" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatDuration(stats?.totalDuration ?? 0)}
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Audio Time</div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Upload Drop Zone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            variant="default"
            className="mb-10 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group rounded-[2rem]"
            onClick={() => setShowUploadModal(true)}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Upload className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Drop your audio file here
              </h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">
                MP3, WAV, M4A up to 100MB
              </p>
              <Button variant="outline" size="sm" className="rounded-xl px-6 border-slate-200">
                Browse Files
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Projects List */}
        <div className="pb-20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            Recent Projects
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={80} className="rounded-2xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<FileAudio className="h-10 w-10 text-slate-300" />}
              title="No projects yet"
              description="Upload your first audio file to create an audiogram"
              action={
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Upload className="h-5 w-5" />}
                  className="rounded-xl"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Audio
                </Button>
              }
            />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {projects.map((project) => (
                <motion.div key={project._id} variants={itemVariants}>
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
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
