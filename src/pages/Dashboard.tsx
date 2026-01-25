import React from 'react';
import { Link } from 'react-router-dom';
// TODO: Uncomment when Convex is deployed
// import { useQuery } from 'convex/react';
// import { api } from '../../convex/_generated/api';
import { AppLayout, PageContainer } from '@/components/layout';
import { Button, Card, CardHeader, Badge, EmptyState, Skeleton } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
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
} from 'lucide-react';

export default function Dashboard() {
  // TODO: Replace with actual Convex query when auth is fully wired
  const projects: any[] | undefined = undefined; // useQuery(api.projects.getUserProjects);
  const isLoading = false;

  // Mock data for demo
  const mockProjects = [
    {
      _id: '1',
      title: 'Podcast Episode 42',
      status: 'ready',
      duration: 180,
      createdAt: Date.now() - 86400000,
    },
    {
      _id: '2',
      title: 'Interview with John',
      status: 'processing',
      duration: 320,
      createdAt: Date.now() - 172800000,
    },
    {
      _id: '3',
      title: 'Quick Audio Clip',
      status: 'ready',
      duration: 45,
      createdAt: Date.now() - 259200000,
    },
  ];

  const displayProjects = projects ?? mockProjects;

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
            onClick={() => {/* TODO: Open create modal */ }}
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
                {displayProjects.length}
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
                3 / 5
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
                12:45
              </div>
              <div className="text-sm text-slate-500">Total Audio Time</div>
            </div>
          </Card>
        </div>

        {/* Upload Drop Zone */}
        <Card className="mb-8 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer group">
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
          ) : displayProjects.length === 0 ? (
            <EmptyState
              icon={<FileAudio className="h-8 w-8" />}
              title="No projects yet"
              description="Upload your first audio file to create an audiogram"
              action={
                <Button variant="primary" leftIcon={<Upload className="h-4 w-4" />}>
                  Upload Audio
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {displayProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}

// Project Card Component
function ProjectCard({ project }: { project: any }) {
  const statusColors = {
    uploading: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          <span>{formatDuration(project.duration)}</span>
          <span>•</span>
          <span>{formatRelativeTime(project.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link to={`/editor/${project._id}`}>
          <Button variant="ghost" size="sm" leftIcon={<Edit3 className="h-4 w-4" />}>
            Edit
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
