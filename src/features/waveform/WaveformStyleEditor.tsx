import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import { Palette, Waves, BarChart3, Activity, Check } from 'lucide-react';

// ─── Waveform Style Presets ───
export interface WaveformStyle {
    id: string;
    name: string;
    waveColor: string;
    progressColor: string;
    backgroundColor: string;
    barWidth: number;
    barGap: number;
    barRadius: number;
}

export const waveformPresets: WaveformStyle[] = [
    {
        id: 'classic-indigo',
        name: 'Classic Indigo',
        waveColor: '#a5b4fc',
        progressColor: '#6366f1',
        backgroundColor: '#1e1b4b',
        barWidth: 3,
        barGap: 2,
        barRadius: 3,
    },
    {
        id: 'neon-green',
        name: 'Neon Green',
        waveColor: '#86efac',
        progressColor: '#22c55e',
        backgroundColor: '#052e16',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
    },
    {
        id: 'sunset-orange',
        name: 'Sunset Orange',
        waveColor: '#fdba74',
        progressColor: '#f97316',
        backgroundColor: '#431407',
        barWidth: 4,
        barGap: 2,
        barRadius: 4,
    },
    {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        waveColor: '#7dd3fc',
        progressColor: '#0ea5e9',
        backgroundColor: '#0c4a6e',
        barWidth: 3,
        barGap: 1,
        barRadius: 6,
    },
    {
        id: 'electric-pink',
        name: 'Electric Pink',
        waveColor: '#f9a8d4',
        progressColor: '#ec4899',
        backgroundColor: '#500724',
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
    },
    {
        id: 'minimal-white',
        name: 'Minimal White',
        waveColor: '#e2e8f0',
        progressColor: '#ffffff',
        backgroundColor: '#0f172a',
        barWidth: 1,
        barGap: 1,
        barRadius: 1,
    },
    {
        id: 'retro-amber',
        name: 'Retro Amber',
        waveColor: '#fcd34d',
        progressColor: '#f59e0b',
        backgroundColor: '#451a03',
        barWidth: 5,
        barGap: 3,
        barRadius: 0,
    },
    {
        id: 'gradient-purple',
        name: 'Gradient Purple',
        waveColor: '#c4b5fd',
        progressColor: '#8b5cf6',
        backgroundColor: '#2e1065',
        barWidth: 3,
        barGap: 2,
        barRadius: 6,
    },
];

// ─── Waveform Style Picker ───
interface WaveformStylePickerProps {
    selectedStyle: WaveformStyle;
    onStyleChange: (style: WaveformStyle) => void;
    className?: string;
}

export function WaveformStylePicker({
    selectedStyle,
    onStyleChange,
    className,
}: WaveformStylePickerProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Waveform Style
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {waveformPresets.map((preset) => (
                    <button
                        key={preset.id}
                        onClick={() => onStyleChange(preset)}
                        className={cn(
                            'relative p-3 rounded-xl border-2 transition-all text-left',
                            selectedStyle.id === preset.id
                                ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        )}
                    >
                        {/* Preview */}
                        <div
                            className="h-8 rounded-lg mb-2 flex items-center justify-center gap-0.5 overflow-hidden"
                            style={{ backgroundColor: preset.backgroundColor }}
                        >
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="transition-all"
                                    style={{
                                        width: preset.barWidth,
                                        height: `${20 + Math.random() * 60}%`,
                                        backgroundColor: i < 6 ? preset.progressColor : preset.waveColor,
                                        borderRadius: preset.barRadius,
                                    }}
                                />
                            ))}
                        </div>

                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {preset.name}
                        </p>

                        {selectedStyle.id === preset.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Custom Color Picker ───
interface CustomColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

export function CustomColorPicker({ label, value, onChange }: CustomColorPickerProps) {
    const presetColors = [
        '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b',
        '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
        '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    ];

    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                {label}
            </label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
                />
                <div className="flex flex-wrap gap-1">
                    {presetColors.slice(0, 7).map((color) => (
                        <button
                            key={color}
                            onClick={() => onChange(color)}
                            className={cn(
                                'w-5 h-5 rounded-full border transition-all',
                                value === color
                                    ? 'ring-2 ring-indigo-500 ring-offset-1'
                                    : 'border-slate-300 hover:scale-110'
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Bar Style Options ───
interface BarStyleOptionsProps {
    barWidth: number;
    barGap: number;
    barRadius: number;
    onBarWidthChange: (width: number) => void;
    onBarGapChange: (gap: number) => void;
    onBarRadiusChange: (radius: number) => void;
}

export function BarStyleOptions({
    barWidth,
    barGap,
    barRadius,
    onBarWidthChange,
    onBarGapChange,
    onBarRadiusChange,
}: BarStyleOptionsProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Bar Style
            </h4>

            <div className="space-y-3">
                {/* Bar Width */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Width</label>
                        <span className="text-xs font-mono text-slate-500">{barWidth}px</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="8"
                        value={barWidth}
                        onChange={(e) => onBarWidthChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                {/* Bar Gap */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Gap</label>
                        <span className="text-xs font-mono text-slate-500">{barGap}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="6"
                        value={barGap}
                        onChange={(e) => onBarGapChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                {/* Bar Radius */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-slate-600 dark:text-slate-400">Roundness</label>
                        <span className="text-xs font-mono text-slate-500">{barRadius}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={barRadius}
                        onChange={(e) => onBarRadiusChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Main Waveform Style Editor ───
interface WaveformStyleEditorProps {
    style: WaveformStyle;
    onStyleChange: (style: WaveformStyle) => void;
    className?: string;
}

export function WaveformStyleEditor({
    style,
    onStyleChange,
    className,
}: WaveformStyleEditorProps) {
    const updateStyle = (updates: Partial<WaveformStyle>) => {
        onStyleChange({ ...style, ...updates, id: 'custom' });
    };

    return (
        <Card className={cn('p-4 space-y-6', className)}>
            <WaveformStylePicker selectedStyle={style} onStyleChange={onStyleChange} />

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Custom Colors
                </h4>

                <CustomColorPicker
                    label="Wave Color"
                    value={style.waveColor}
                    onChange={(color) => updateStyle({ waveColor: color })}
                />

                <CustomColorPicker
                    label="Progress Color"
                    value={style.progressColor}
                    onChange={(color) => updateStyle({ progressColor: color })}
                />

                <CustomColorPicker
                    label="Background"
                    value={style.backgroundColor}
                    onChange={(color) => updateStyle({ backgroundColor: color })}
                />
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            <BarStyleOptions
                barWidth={style.barWidth}
                barGap={style.barGap}
                barRadius={style.barRadius}
                onBarWidthChange={(width) => updateStyle({ barWidth: width })}
                onBarGapChange={(gap) => updateStyle({ barGap: gap })}
                onBarRadiusChange={(radius) => updateStyle({ barRadius: radius })}
            />

            {/* Live Preview */}
            <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Preview
                </h4>
                <div
                    className="h-16 rounded-xl flex items-center justify-center gap-0.5 overflow-hidden transition-all"
                    style={{ backgroundColor: style.backgroundColor }}
                >
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="transition-all"
                            style={{
                                width: style.barWidth,
                                marginRight: style.barGap,
                                height: `${15 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`,
                                backgroundColor: i < 15 ? style.progressColor : style.waveColor,
                                borderRadius: style.barRadius,
                            }}
                        />
                    ))}
                </div>
            </div>
        </Card>
    );
}
