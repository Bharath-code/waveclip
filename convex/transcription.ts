import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ─── Transcription with Gemini ───
// Note: This requires GOOGLE_GENERATIVE_AI_API_KEY in environment
export const transcribe = action({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        // Get project and audio URL
        const project = await ctx.runQuery(internal.transcription.getProjectForTranscription, {
            projectId: args.projectId,
        });

        if (!project) {
            throw new Error("Project not found");
        }

        if (!project.audioUrl) {
            throw new Error("Project has no audio file");
        }

        // Update project status
        await ctx.runMutation(internal.transcription.updateProjectStatus, {
            projectId: args.projectId,
            status: "transcribing",
        });

        try {
            // Fetch audio file
            const audioResponse = await fetch(project.audioUrl);
            const audioBuffer = await audioResponse.arrayBuffer();
            const base64Audio = Buffer.from(audioBuffer).toString("base64");

            // Use Gemini for transcription via direct API call
            // Note: In production, use @ai-sdk/google with generateText
            const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            if (!geminiApiKey) {
                throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not configured");
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `Transcribe this audio file accurately. Return ONLY a JSON object with this exact structure, no other text:
{
  "segments": [
    {"text": "transcribed text", "startTime": 0.0, "endTime": 2.5},
    {"text": "next segment", "startTime": 2.5, "endTime": 5.0}
  ],
  "fullText": "complete transcription as single string",
  "language": "en"
}

Create segments of approximately 5-10 words each with estimated timestamps based on 150 words per minute speech rate.`,
                                    },
                                    {
                                        inline_data: {
                                            mime_type: "audio/mp3",
                                            data: base64Audio,
                                        },
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

            // Parse the transcription result
            let transcription;
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    transcription = JSON.parse(jsonMatch[0]);
                } else {
                    transcription = {
                        segments: [{ text: text.trim(), startTime: 0, endTime: project.duration || 60 }],
                        fullText: text.trim(),
                        language: "en",
                    };
                }
            } catch {
                transcription = {
                    segments: [{ text: text.trim(), startTime: 0, endTime: project.duration || 60 }],
                    fullText: text.trim(),
                    language: "en",
                };
            }

            // Save captions to database
            await ctx.runMutation(internal.transcription.saveCaptions, {
                projectId: args.projectId,
                segments: transcription.segments,
            });

            // Update project status to ready
            await ctx.runMutation(internal.transcription.updateProjectStatus, {
                projectId: args.projectId,
                status: "ready",
            });

            return {
                success: true,
                segmentCount: transcription.segments.length,
                fullText: transcription.fullText,
            };
        } catch (error) {
            // Update project status to failed
            await ctx.runMutation(internal.transcription.updateProjectStatus, {
                projectId: args.projectId,
                status: "failed",
            });

            throw error;
        }
    },
});

// ─── Internal: Get Project for Transcription ───
export const getProjectForTranscription = internalQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.projectId);
        if (!project) return null;

        // Get audio URL from storage if needed
        let audioUrl = project.audioUrl;
        if (project.audioStorageId && !audioUrl) {
            audioUrl = await ctx.storage.getUrl(project.audioStorageId) || undefined;
        }

        return {
            ...project,
            audioUrl,
        };
    },
});

// ─── Internal: Update Project Status ───
export const updateProjectStatus = internalMutation({
    args: {
        projectId: v.id("projects"),
        status: v.union(
            v.literal("uploading"),
            v.literal("processing"),
            v.literal("transcribing"),
            v.literal("ready"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.projectId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});

// ─── Internal: Save Captions ───
export const saveCaptions = internalMutation({
    args: {
        projectId: v.id("projects"),
        segments: v.array(
            v.object({
                text: v.string(),
                startTime: v.number(),
                endTime: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        // Delete existing captions for this project
        const existingCaptions = await ctx.db
            .query("captions")
            .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
            .collect();

        for (const caption of existingCaptions) {
            await ctx.db.delete(caption._id);
        }

        // Insert new captions
        for (const segment of args.segments) {
            await ctx.db.insert("captions", {
                projectId: args.projectId,
                text: segment.text,
                startTime: segment.startTime,
                endTime: segment.endTime,
                createdAt: Date.now(),
            });
        }

        return { count: args.segments.length };
    },
});

// ─── Get Captions for Project ───
export const getCaptions = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const captions = await ctx.db
            .query("captions")
            .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
            .collect();

        // Sort by start time
        return captions.sort((a, b) => a.startTime - b.startTime);
    },
});

// ─── Update Caption ───
export const updateCaption = mutation({
    args: {
        captionId: v.id("captions"),
        text: v.optional(v.string()),
        startTime: v.optional(v.number()),
        endTime: v.optional(v.number()),
        style: v.optional(
            v.object({
                fontSize: v.optional(v.number()),
                fontFamily: v.optional(v.string()),
                color: v.optional(v.string()),
                backgroundColor: v.optional(v.string()),
                position: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const { captionId, ...updates } = args;

        await ctx.db.patch(captionId, {
            ...updates,
            updatedAt: Date.now(),
        });

        return { success: true };
    },
});

// ─── Delete Caption ───
export const deleteCaption = mutation({
    args: { captionId: v.id("captions") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.captionId);
        return { success: true };
    },
});
