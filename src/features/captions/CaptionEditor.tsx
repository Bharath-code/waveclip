import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id, Doc } from '../../../convex/_generated/dataModel';
import { cn, formatDuration } from '@/lib/utils';
import { Button, Card } from '@/components/ui';
import {
    Type,
    Palette,
    AlignCenter,
    Bold,
    Italic,
    Check,
    X,
    ChevronDown,
} from 'lucide-react';

interface CaptionEditorProps {
    caption: Doc<'captions'> | null;
    onClose?: () => void;
    className?: string;
}

const fontSizes = [
    { value: 24, label: 'Small' },
    { value: 32, label: 'Medium' },
    { value: 40, label: 'Large' },
    { value: 48, label: 'X-Large' },
];

const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Poppins', label: 'Poppins' },
];

const colors = [
    { value: '#ffffff', label: 'White' },
    { value: '#000000', label: 'Black' },
    { value: '#ffff00', label: 'Yellow' },
    { value: '#00ff00', label: 'Green' },
    { value: '#ff6b6b', label: 'Red' },
    { value: '#4ecdc4', label: 'Teal' },
];

const positions = [
    { value: 'top', label: 'Top' },
    { value: 'middle', label: 'Middle' },
    { value: 'bottom', label: 'Bottom' },
];

export function CaptionEditor({ caption, onClose, className }: CaptionEditorProps) {
    const updateCaption = useMutation(api.transcription.updateCaption);

    const [text, setText] = React.useState('');
    const [startTime, setStartTime] = React.useState(0);
    const [endTime, setEndTime] = React.useState(0);
    const [style, setStyle] = React.useState<{
        fontSize?: number;
        fontFamily?: string;
        color?: string;
        backgroundColor?: string;
        position?: string;
    }>({});

    const [isSaving, setIsSaving] = React.useState(false);

    // Initialize state when caption changes
    React.useEffect(() => {
        if (caption) {
            setText(caption.text);
            setStartTime(caption.startTime);
            setEndTime(caption.endTime);
            setStyle(caption.style || {});
        }
    }, [caption]);

    const handleSave = async () => {
        if (!caption) return;

        setIsSaving(true);
        try {
            await updateCaption({
                captionId: caption._id,
                text,
                startTime,
                endTime,
                style: Object.keys(style).length > 0 ? style : undefined,
            });
            onClose?.();
        } catch (error) {
            console.error('Failed to save caption:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!caption) {
        return (
            <Card className={cn('p-6 text-center', className)}>
                <div className="text-slate-400 dark:text-slate-500 mb-2">
                    <Type className="h-8 w-8 mx-auto mb-3" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Select a caption to edit its text and styling.
                </p>
            </Card>
        );
    }

    return (
        <Card className={cn('', className)}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                        Edit Caption
                    </h3>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            leftIcon={<X className="h-4 w-4" />}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            leftIcon={<Check className="h-4 w-4" />}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Text Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Caption Text
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Enter caption text..."
                    />
                </div>

                {/* Timing */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Start Time
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={startTime.toFixed(1)}
                                onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                                step="0.1"
                                min="0"
                                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-xs text-slate-500">sec</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            End Time
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={endTime.toFixed(1)}
                                onChange={(e) => setEndTime(parseFloat(e.target.value) || 0)}
                                step="0.1"
                                min="0"
                                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <span className="text-xs text-slate-500">sec</span>
                        </div>
                    </div>
                </div>

                {/* Style Options */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Style
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Font Size */}
                        <select
                            value={style.fontSize || 32}
                            onChange={(e) =>
                                setStyle((s) => ({ ...s, fontSize: parseInt(e.target.value) }))
                            }
                            className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {fontSizes.map((size) => (
                                <option key={size.value} value={size.value}>
                                    {size.label}
                                </option>
                            ))}
                        </select>

                        {/* Font Family */}
                        <select
                            value={style.fontFamily || 'Inter'}
                            onChange={(e) =>
                                setStyle((s) => ({ ...s, fontFamily: e.target.value }))
                            }
                            className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {fontFamilies.map((font) => (
                                <option key={font.value} value={font.value}>
                                    {font.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Color Options */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Text Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => setStyle((s) => ({ ...s, color: color.value }))}
                                className={cn(
                                    'w-8 h-8 rounded-full border-2 transition-all',
                                    style.color === color.value
                                        ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Position */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Position
                    </label>
                    <div className="flex gap-2">
                        {positions.map((pos) => (
                            <button
                                key={pos.value}
                                onClick={() => setStyle((s) => ({ ...s, position: pos.value }))}
                                className={cn(
                                    'flex-1 px-3 py-2 text-sm rounded-lg border transition-all',
                                    style.position === pos.value
                                        ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                                )}
                            >
                                {pos.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Preview
                    </label>
                    <div className="relative h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg overflow-hidden flex items-center justify-center">
                        <div
                            className={cn(
                                'absolute px-4 py-2 bg-black/60 backdrop-blur rounded-lg max-w-[80%]',
                                style.position === 'top' && 'top-3',
                                style.position === 'middle' && '',
                                (style.position === 'bottom' || !style.position) && 'bottom-3'
                            )}
                        >
                            <p
                                className="text-center font-medium"
                                style={{
                                    color: style.color || '#ffffff',
                                    fontSize: `${(style.fontSize || 32) / 3}px`,
                                    fontFamily: style.fontFamily || 'Inter',
                                }}
                            >
                                {text || 'Caption preview...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
