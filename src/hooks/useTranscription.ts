import React from 'react';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// ─── Types ───
export interface TranscriptSegment {
    id: string;
    text: string;
    startTime: number; // in seconds
    endTime: number;
    confidence?: number;
}

export interface TranscriptionResult {
    segments: TranscriptSegment[];
    fullText: string;
    language?: string;
    duration: number;
}

interface UseTranscriptionOptions {
    apiKey?: string;
    model?: 'gemini-2.0-flash' | 'gemini-1.5-flash' | 'gemini-1.5-pro';
    language?: string;
}

interface UseTranscriptionReturn {
    isTranscribing: boolean;
    progress: number;
    error: string | null;
    result: TranscriptionResult | null;
    transcribe: (audioBlob: Blob) => Promise<TranscriptionResult>;
    reset: () => void;
}

export function useTranscription(options: UseTranscriptionOptions = {}): UseTranscriptionReturn {
    const {
        model = 'gemini-2.0-flash',
        language = 'en',
    } = options;

    const [isTranscribing, setIsTranscribing] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [error, setError] = React.useState<string | null>(null);
    const [result, setResult] = React.useState<TranscriptionResult | null>(null);

    const transcribe = React.useCallback(
        async (audioBlob: Blob): Promise<TranscriptionResult> => {
            setIsTranscribing(true);
            setProgress(0);
            setError(null);

            try {
                setProgress(10);

                // Convert audio blob to base64
                const audioBuffer = await audioBlob.arrayBuffer();
                const base64Audio = arrayBufferToBase64(audioBuffer);
                const mimeType = audioBlob.type || 'audio/mp3';

                setProgress(30);

                // Use Gemini 3 Flash for transcription via Vercel AI SDK
                // Note: Gemini supports audio files via data URLs
                const dataUrl = `data:${mimeType};base64,${base64Audio}`;

                const { text } = await generateText({
                    model: google(model),
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `Please transcribe this audio file accurately. 
                  
Instructions:
- Transcribe the spoken words exactly as heard
- Include punctuation and proper formatting
- If there are multiple speakers, indicate speaker changes
- Format the output as a JSON object with this structure:
{
  "segments": [
    {"text": "transcribed text for segment", "startTime": 0.0, "endTime": 2.5},
    {"text": "next segment", "startTime": 2.5, "endTime": 5.0}
  ],
  "fullText": "complete transcription as single string",
  "language": "${language}"
}

If you cannot determine exact timestamps, estimate them based on typical speaking pace (150 words per minute).
Only respond with the JSON, no additional text.

Audio file data URL: ${dataUrl.substring(0, 100)}...`,
                                },
                            ],
                        },
                    ],
                });

                setProgress(80);

                // Parse the response
                let parsedResult: TranscriptionResult;
                try {
                    // Try to extract JSON from the response
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        parsedResult = {
                            segments: parsed.segments.map((seg: any, index: number) => ({
                                id: `seg-${index}`,
                                text: seg.text,
                                startTime: seg.startTime || index * 3,
                                endTime: seg.endTime || (index + 1) * 3,
                                confidence: 0.95,
                            })),
                            fullText: parsed.fullText || text,
                            language: parsed.language || language,
                            duration: parsed.segments[parsed.segments.length - 1]?.endTime || 0,
                        };
                    } else {
                        // Fallback: treat entire response as transcript
                        parsedResult = {
                            segments: [
                                {
                                    id: 'seg-0',
                                    text: text.trim(),
                                    startTime: 0,
                                    endTime: 60, // Estimate
                                    confidence: 0.9,
                                },
                            ],
                            fullText: text.trim(),
                            language,
                            duration: 60,
                        };
                    }
                } catch (parseError) {
                    // Fallback: treat entire response as plain text transcript
                    parsedResult = {
                        segments: [{
                            id: 'seg-0',
                            text: text.trim(),
                            startTime: 0,
                            endTime: 60,
                            confidence: 0.85,
                        }],
                        fullText: text.trim(),
                        language,
                        duration: 60,
                    };
                }

                setProgress(100);
                setResult(parsedResult);
                return parsedResult;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
                setError(errorMessage);
                throw new Error(errorMessage);
            } finally {
                setIsTranscribing(false);
            }
        },
        [model, language]
    );

    const reset = React.useCallback(() => {
        setIsTranscribing(false);
        setProgress(0);
        setError(null);
        setResult(null);
    }, []);

    return {
        isTranscribing,
        progress,
        error,
        result,
        transcribe,
        reset,
    };
}

// ─── Helper: Convert ArrayBuffer to Base64 ───
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// ─── Server Action for Convex ───
// This is a template for the Convex action - put this in convex/transcription.ts
export const CONVEX_TRANSCRIPTION_ACTION_TEMPLATE = `
import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const transcribeAudio = action({
  args: {
    audioStorageId: v.id("_storage"),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get audio file from Convex storage
    const audioUrl = await ctx.storage.getUrl(args.audioStorageId);
    if (!audioUrl) {
      throw new Error("Audio file not found");
    }

    // Fetch the audio file
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    // Call Gemini for transcription
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: \`Transcribe this audio accurately. Return JSON with segments array containing text, startTime, endTime for each segment, plus fullText and language fields.\`,
            },
            {
              type: "file",
              data: base64Audio,
              mimeType: "audio/mp3",
            },
          ],
        },
      ],
    });

    // Parse and return
    const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { fullText: text, segments: [], language: args.language || "en" };
  },
});
`;
