import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import React from "react";

interface UploadProgress {
    stage: 'idle' | 'uploading' | 'creating' | 'complete' | 'error';
    progress: number;
    message: string;
}

interface UseAudioUploadReturn {
    uploadState: UploadProgress;
    uploadAudio: (file: File) => Promise<{ projectId: Id<"projects">; audioUrl: string } | null>;
    reset: () => void;
}

export function useAudioUpload(): UseAudioUploadReturn {
    const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
    const createFromUpload = useMutation(api.projects.createFromUpload);

    const [uploadState, setUploadState] = React.useState<UploadProgress>({
        stage: 'idle',
        progress: 0,
        message: '',
    });

    const uploadAudio = React.useCallback(
        async (file: File) => {
            try {
                // Stage 1: Generate upload URL
                setUploadState({
                    stage: 'uploading',
                    progress: 10,
                    message: 'Preparing upload...',
                });

                const uploadUrl = await generateUploadUrl();

                // Stage 2: Upload file
                setUploadState({
                    stage: 'uploading',
                    progress: 30,
                    message: 'Uploading audio file...',
                });

                const uploadResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Upload failed');
                }

                const { storageId } = await uploadResponse.json();

                setUploadState({
                    stage: 'uploading',
                    progress: 70,
                    message: 'Processing audio...',
                });

                // Stage 3: Extract audio metadata
                const metadata = await extractAudioMetadata(file);

                setUploadState({
                    stage: 'creating',
                    progress: 85,
                    message: 'Creating project...',
                });

                // Stage 4: Create project
                const title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
                const result = await createFromUpload({
                    title,
                    storageId,
                    duration: metadata.duration,
                    sampleRate: metadata.sampleRate,
                });

                setUploadState({
                    stage: 'complete',
                    progress: 100,
                    message: 'Upload complete!',
                });

                return {
                    projectId: result.projectId,
                    audioUrl: result.audioUrl || '',
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                setUploadState({
                    stage: 'error',
                    progress: 0,
                    message: errorMessage,
                });
                return null;
            }
        },
        [generateUploadUrl, createFromUpload]
    );

    const reset = React.useCallback(() => {
        setUploadState({
            stage: 'idle',
            progress: 0,
            message: '',
        });
    }, []);

    return {
        uploadState,
        uploadAudio,
        reset,
    };
}

// ─── Audio Metadata Extraction ───
interface AudioMetadata {
    duration: number;
    sampleRate: number;
    channels: number;
}

async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
        const audioContext = new AudioContext();
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                resolve({
                    duration: audioBuffer.duration,
                    sampleRate: audioBuffer.sampleRate,
                    channels: audioBuffer.numberOfChannels,
                });

                audioContext.close();
            } catch (error) {
                // Fallback for files that can't be decoded
                resolve({
                    duration: 0,
                    sampleRate: 44100,
                    channels: 2,
                });
            }
        };

        reader.onerror = () => {
            resolve({
                duration: 0,
                sampleRate: 44100,
                channels: 2,
            });
        };

        reader.readAsArrayBuffer(file);
    });
}

// ─── Projects List Hook ───
export function useProjects(limit?: number) {
    const projects = useQuery(api.projects.list, { limit });
    const stats = useQuery(api.projects.getStats, {});

    return {
        projects: projects || [],
        stats,
        isLoading: projects === undefined,
    };
}

// ─── Single Project Hook ───
export function useProject(projectId: Id<"projects"> | null) {
    const project = useQuery(
        api.projects.get,
        projectId ? { projectId } : "skip"
    );

    return {
        project,
        isLoading: project === undefined,
    };
}

// ─── Delete Project ───
export function useDeleteProject() {
    const deleteProject = useMutation(api.projects.remove);

    return {
        deleteProject: async (projectId: Id<"projects">) => {
            await deleteProject({ projectId });
        },
    };
}

// ─── Update Project ───
export function useUpdateProject() {
    const updateProject = useMutation(api.projects.update);

    return {
        updateProject: async (
            projectId: Id<"projects">,
            updates: {
                title?: string;
                settings?: any;
                status?: "uploading" | "processing" | "transcribing" | "ready" | "failed";
            }
        ) => {
            await updateProject({ projectId, ...updates });
        },
    };
}
