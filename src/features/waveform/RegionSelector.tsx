import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Scissors, RotateCcw, Check, X, GripVertical } from 'lucide-react';

// ─── Region Selection Types ───
export interface Region {
    id: string;
    start: number;
    end: number;
    color?: string;
}

interface RegionSelectorProps {
    duration: number;
    currentTime: number;
    regions: Region[];
    selectedRegionId?: string;
    onRegionCreate: (region: Region) => void;
    onRegionUpdate: (region: Region) => void;
    onRegionDelete: (regionId: string) => void;
    onRegionSelect: (regionId: string | null) => void;
    onSeek: (time: number) => void;
    className?: string;
}

export function RegionSelector({
    duration,
    currentTime,
    regions,
    selectedRegionId,
    onRegionCreate,
    onRegionUpdate,
    onRegionDelete,
    onRegionSelect,
    onSeek,
    className,
}: RegionSelectorProps) {
    const [isCreating, setIsCreating] = React.useState(false);
    const [dragStart, setDragStart] = React.useState<number | null>(null);
    const [dragEnd, setDragEnd] = React.useState<number | null>(null);
    const [draggingHandle, setDraggingHandle] = React.useState<{
        regionId: string;
        type: 'start' | 'end';
    } | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const timeToPercent = (time: number) => (time / duration) * 100;
    const percentToTime = (percent: number) => (percent / 100) * duration;

    const getMousePercent = (e: React.MouseEvent) => {
        if (!containerRef.current) return 0;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        return (x / rect.width) * 100;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isCreating) {
            const percent = getMousePercent(e);
            setDragStart(percent);
            setDragEnd(percent);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragStart !== null && isCreating) {
            setDragEnd(getMousePercent(e));
        }
        if (draggingHandle) {
            const percent = getMousePercent(e);
            const region = regions.find((r) => r.id === draggingHandle.regionId);
            if (region) {
                const time = percentToTime(percent);
                if (draggingHandle.type === 'start' && time < region.end) {
                    onRegionUpdate({ ...region, start: time });
                } else if (draggingHandle.type === 'end' && time > region.start) {
                    onRegionUpdate({ ...region, end: time });
                }
            }
        }
    };

    const handleMouseUp = () => {
        if (dragStart !== null && dragEnd !== null && isCreating) {
            const start = percentToTime(Math.min(dragStart, dragEnd));
            const end = percentToTime(Math.max(dragStart, dragEnd));
            if (end - start > 0.5) {
                // Minimum 0.5 second region
                onRegionCreate({
                    id: `region-${Date.now()}`,
                    start,
                    end,
                    color: getRandomColor(),
                });
            }
            setDragStart(null);
            setDragEnd(null);
            setIsCreating(false);
        }
        setDraggingHandle(null);
    };

    const getRandomColor = () => {
        const colors = [
            '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
            '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-2">
                <Button
                    variant={isCreating ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setIsCreating(!isCreating)}
                    leftIcon={<Scissors className="h-4 w-4" />}
                >
                    {isCreating ? 'Click & Drag to Create' : 'Create Region'}
                </Button>

                {selectedRegionId && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRegionDelete(selectedRegionId)}
                            leftIcon={<X className="h-4 w-4" />}
                        >
                            Delete
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRegionSelect(null)}
                            leftIcon={<RotateCcw className="h-4 w-4" />}
                        >
                            Clear Selection
                        </Button>
                    </>
                )}
            </div>

            {/* Timeline with Regions */}
            <div
                ref={containerRef}
                className={cn(
                    'relative h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden',
                    isCreating && 'cursor-crosshair'
                )}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Regions */}
                {regions.map((region) => (
                    <div
                        key={region.id}
                        className={cn(
                            'absolute top-0 bottom-0 transition-opacity',
                            selectedRegionId === region.id ? 'opacity-80' : 'opacity-50 hover:opacity-70'
                        )}
                        style={{
                            left: `${timeToPercent(region.start)}%`,
                            width: `${timeToPercent(region.end - region.start)}%`,
                            backgroundColor: region.color || '#6366f1',
                        }}
                        onClick={() => onRegionSelect(region.id)}
                    >
                        {/* Start Handle */}
                        <div
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingHandle({ regionId: region.id, type: 'start' });
                            }}
                        >
                            <GripVertical className="h-4 w-4 text-white" />
                        </div>

                        {/* End Handle */}
                        <div
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingHandle({ regionId: region.id, type: 'end' });
                            }}
                        >
                            <GripVertical className="h-4 w-4 text-white" />
                        </div>

                        {/* Label */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs text-white font-medium bg-black/40 px-2 py-0.5 rounded">
                                {formatTime(region.start)} - {formatTime(region.end)}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Drag Preview */}
                {dragStart !== null && dragEnd !== null && (
                    <div
                        className="absolute top-0 bottom-0 bg-indigo-500/40 border-2 border-indigo-500 border-dashed"
                        style={{
                            left: `${Math.min(dragStart, dragEnd)}%`,
                            width: `${Math.abs(dragEnd - dragStart)}%`,
                        }}
                    />
                )}

                {/* Playhead */}
                <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none"
                    style={{ left: `${timeToPercent(currentTime)}%` }}
                >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-500 rounded-full" />
                </div>

                {/* Time Markers */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-[10px] text-slate-500 font-mono pointer-events-none">
                    <span>0:00</span>
                    <span>{formatTime(duration / 2)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Selected Region Info */}
            {selectedRegionId && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium text-indigo-900 dark:text-indigo-100">
                            Region Selected
                        </span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                            {(() => {
                                const region = regions.find((r) => r.id === selectedRegionId);
                                if (!region) return '';
                                return `${formatTime(region.start)} - ${formatTime(region.end)} (${formatTime(region.end - region.start)})`;
                            })()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Format Time Helper ───
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ─── Export index ───
export { WaveformStyleEditor, waveformPresets } from './WaveformStyleEditor';
export type { WaveformStyle } from './WaveformStyleEditor';
