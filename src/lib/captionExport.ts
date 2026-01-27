// ─── Caption Export Utilities ───
// Provides SRT, VTT, and JSON export formats for captions

export interface CaptionSegment {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    style?: {
        fontSize?: number;
        fontFamily?: string;
        color?: string;
        backgroundColor?: string;
        position?: string;
    };
}

/**
 * Format time in SRT format: HH:MM:SS,mmm
 */
function formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

/**
 * Format time in VTT format: HH:MM:SS.mmm
 */
function formatVTTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Export captions to SRT format
 */
export function exportToSRT(captions: CaptionSegment[]): string {
    const sortedCaptions = [...captions].sort((a, b) => a.startTime - b.startTime);

    return sortedCaptions
        .map((caption, index) => {
            const lines = [
                (index + 1).toString(),
                `${formatSRTTime(caption.startTime)} --> ${formatSRTTime(caption.endTime)}`,
                caption.text,
                '',
            ];
            return lines.join('\n');
        })
        .join('\n');
}

/**
 * Export captions to VTT format
 */
export function exportToVTT(captions: CaptionSegment[]): string {
    const sortedCaptions = [...captions].sort((a, b) => a.startTime - b.startTime);

    const header = 'WEBVTT\n\n';

    const cues = sortedCaptions
        .map((caption, index) => {
            const cueId = caption.id || `cue-${index + 1}`;
            const lines = [
                cueId,
                `${formatVTTTime(caption.startTime)} --> ${formatVTTTime(caption.endTime)}`,
                caption.text,
                '',
            ];
            return lines.join('\n');
        })
        .join('\n');

    return header + cues;
}

/**
 * Export captions to JSON format
 */
export function exportToJSON(captions: CaptionSegment[]): string {
    const sortedCaptions = [...captions].sort((a, b) => a.startTime - b.startTime);

    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        captionCount: sortedCaptions.length,
        captions: sortedCaptions.map((caption) => ({
            id: caption.id,
            text: caption.text,
            startTime: caption.startTime,
            endTime: caption.endTime,
            duration: caption.endTime - caption.startTime,
            style: caption.style,
        })),
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Download a file to the user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export and download captions in the specified format
 */
export function downloadCaptions(
    captions: CaptionSegment[],
    projectName: string,
    format: 'srt' | 'vtt' | 'json'
): void {
    const sanitizedName = projectName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

    switch (format) {
        case 'srt':
            downloadFile(exportToSRT(captions), `${sanitizedName}.srt`, 'text/plain');
            break;
        case 'vtt':
            downloadFile(exportToVTT(captions), `${sanitizedName}.vtt`, 'text/vtt');
            break;
        case 'json':
            downloadFile(exportToJSON(captions), `${sanitizedName}_captions.json`, 'application/json');
            break;
    }
}

/**
 * Split a caption segment at a specific time point
 */
export function splitCaption(
    caption: CaptionSegment,
    splitTime: number
): [CaptionSegment, CaptionSegment] | null {
    // Validate split time is within caption bounds
    if (splitTime <= caption.startTime || splitTime >= caption.endTime) {
        return null;
    }

    // Calculate approximate word positions based on duration
    const words = caption.text.split(' ');
    const totalDuration = caption.endTime - caption.startTime;
    const splitRatio = (splitTime - caption.startTime) / totalDuration;
    const splitWordIndex = Math.floor(words.length * splitRatio);

    // Ensure we have at least one word on each side
    const effectiveSplitIndex = Math.max(1, Math.min(words.length - 1, splitWordIndex));

    const firstPart = words.slice(0, effectiveSplitIndex).join(' ');
    const secondPart = words.slice(effectiveSplitIndex).join(' ');

    const firstCaption: CaptionSegment = {
        id: `${caption.id}-a`,
        text: firstPart,
        startTime: caption.startTime,
        endTime: splitTime,
        style: caption.style,
    };

    const secondCaption: CaptionSegment = {
        id: `${caption.id}-b`,
        text: secondPart,
        startTime: splitTime,
        endTime: caption.endTime,
        style: caption.style,
    };

    return [firstCaption, secondCaption];
}

/**
 * Merge two adjacent caption segments
 */
export function mergeCaptions(
    first: CaptionSegment,
    second: CaptionSegment
): CaptionSegment {
    return {
        id: first.id,
        text: `${first.text} ${second.text}`,
        startTime: Math.min(first.startTime, second.startTime),
        endTime: Math.max(first.endTime, second.endTime),
        style: first.style || second.style,
    };
}
