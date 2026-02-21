import { create } from 'zustand';
import { Doc } from '../../convex/_generated/dataModel';

interface EditorState {
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;
    duration: number;
    selectedFormat: string;
    zoom: number;
    isTranscribing: boolean;
    transcriptionStatus: 'idle' | 'success' | 'error';
    activePanel: 'captions' | 'style' | 'settings';
    selectedCaption: Doc<'captions'> | null;

    // Actions
    setIsPlaying: (isPlaying: boolean) => void;
    setIsMuted: (isMuted: boolean) => void;
    setCurrentTime: (currentTime: number) => void;
    setDuration: (duration: number) => void;
    setSelectedFormat: (format: string) => void;
    setZoom: (zoom: number) => void;
    setIsTranscribing: (isTranscribing: boolean) => void;
    setTranscriptionStatus: (status: 'idle' | 'success' | 'error') => void;
    setActivePanel: (panel: 'captions' | 'style' | 'settings') => void;
    setSelectedCaption: (caption: Doc<'captions'> | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    isPlaying: false,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    selectedFormat: 'square',
    zoom: 1,
    isTranscribing: false,
    transcriptionStatus: 'idle',
    activePanel: 'captions',
    selectedCaption: null,

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setIsMuted: (isMuted) => set({ isMuted }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    setSelectedFormat: (selectedFormat) => set({ selectedFormat }),
    setZoom: (zoom) => set({ zoom }),
    setIsTranscribing: (isTranscribing) => set({ isTranscribing }),
    setTranscriptionStatus: (transcriptionStatus) => set({ transcriptionStatus }),
    setActivePanel: (activePanel) => set({ activePanel }),
    setSelectedCaption: (selectedCaption) => set({ selectedCaption }),
}));
