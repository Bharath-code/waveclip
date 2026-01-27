import React from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id, Doc } from '../../../convex/_generated/dataModel';
import { cn, formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
    GripVertical,
    Trash2,
    Play,
    Pause,
    Edit3,
    Check,
    X,
} from 'lucide-react';

interface CaptionTimelineProps {
    projectId: Id<'projects'>;
    currentTime: number;
    duration: number;
    onSeek?: (time: number) => void;
    onCaptionSelect?: (caption: Doc<'captions'>) => void;
    selectedCaptionId?: Id<'captions'> | null;
    className?: string;
}

export function CaptionTimeline({
    projectId,
    currentTime,
    duration,
    onSeek,
    onCaptionSelect,
    selectedCaptionId,
    className,
}: CaptionTimelineProps) {
    const captions = useQuery(api.transcription.getCaptions, { projectId });
    const updateCaption = useMutation(api.transcription.updateCaption);
    const deleteCaption = useMutation(api.transcription.deleteCaption);

    const [editingId, setEditingId] = React.useState<Id<'captions'> | null>(null);
    const [editText, setEditText] = React.useState('');

    const handleStartEdit = (caption: Doc<'captions'>) => {
        setEditingId(caption._id);
        setEditText(caption.text);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        await updateCaption({
            captionId: editingId,
            text: editText,
        });
        setEditingId(null);
        setEditText('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleDelete = async (captionId: Id<'captions'>) => {
        await deleteCaption({ captionId });
    };

    // Calculate which caption is active based on current time
    const activeCaption = React.useMemo(() => {
        if (!captions) return null;
        return captions.find(
            (c) => currentTime >= c.startTime && currentTime < c.endTime
        );
    }, [captions, currentTime]);

    if (!captions) {
        return (
            <div className={cn('p-4 text-center text-slate-500', className)}>
                Loading captions...
            </div>
        );
    }

    if (captions.length === 0) {
        return (
            <div className={cn('p-8 text-center', className)}>
                <div className="text-slate-400 dark:text-slate-500 mb-2">
                    No captions yet
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Click "AI Captions" to generate captions from your audio.
                </p>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Timeline Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Captions ({captions.length})
                </h3>
                <span className="text-xs text-slate-500">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
            </div>

            {/* Timeline Visual */}
            <div
                className="relative h-8 bg-slate-100 dark:bg-slate-800 cursor-pointer mx-4 mt-3 rounded-lg overflow-hidden"
                onClick={(e) => {
                    if (onSeek && duration > 0) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const time = (x / rect.width) * duration;
                        onSeek(time);
                    }
                }}
            >
                {/* Caption blocks on timeline */}
                {captions.map((caption) => {
                    const left = (caption.startTime / duration) * 100;
                    const width = ((caption.endTime - caption.startTime) / duration) * 100;
                    const isActive = caption._id === activeCaption?._id;
                    const isSelected = caption._id === selectedCaptionId;

                    return (
                        <div
                            key={caption._id}
                            className={cn(
                                'absolute top-1 bottom-1 rounded transition-all cursor-pointer',
                                isActive
                                    ? 'bg-indigo-500'
                                    : isSelected
                                        ? 'bg-indigo-400'
                                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                            )}
                            style={{
                                left: `${left}%`,
                                width: `${Math.max(width, 1)}%`,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCaptionSelect?.(caption);
                                onSeek?.(caption.startTime);
                            }}
                            title={caption.text}
                        />
                    );
                })}

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500" />
                </div>
            </div>

            {/* Caption List */}
            <div className="flex-1 overflow-y-auto mt-4 px-2 space-y-1">
                {captions.map((caption) => {
                    const isActive = caption._id === activeCaption?._id;
                    const isSelected = caption._id === selectedCaptionId;
                    const isEditing = editingId === caption._id;

                    return (
                        <div
                            key={caption._id}
                            className={cn(
                                'group flex items-start gap-2 p-2 rounded-lg transition-all cursor-pointer',
                                isActive
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700'
                                    : isSelected
                                        ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                            )}
                            onClick={() => {
                                onCaptionSelect?.(caption);
                                onSeek?.(caption.startTime);
                            }}
                        >
                            {/* Drag Handle */}
                            <GripVertical className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Time */}
                            <div className="shrink-0 text-xs font-mono text-slate-500 dark:text-slate-400 w-16 pt-0.5">
                                {formatDuration(caption.startTime)}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit();
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveEdit();
                                            }}
                                            className="p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelEdit();
                                            }}
                                            className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <p
                                        className={cn(
                                            'text-sm',
                                            isActive
                                                ? 'text-indigo-900 dark:text-indigo-100 font-medium'
                                                : 'text-slate-700 dark:text-slate-300'
                                        )}
                                    >
                                        {caption.text}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            {!isEditing && (
                                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartEdit(caption);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded"
                                        title="Edit"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(caption._id);
                                        }}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
