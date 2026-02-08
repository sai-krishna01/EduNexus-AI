
import { GoogleGenAI } from "@google/genai";
import { Message, User, SystemSettings } from '../types';

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

const TEACHER_MODEL = 'gemini-3-pro-preview';
const FILE_MODEL = 'gemini-2.5-flash-image';

export type AiIntent = 'TEACH' | 'NOTES' | 'QUIZ' | 'SUMMARY' | 'YOUTUBE_ANALYSIS';

export const generateTeacherResponse = async (
    userPrompt: string,
    history: Message[],
    user: User,
    settings: SystemSettings,
    fileContext?: string,
    intent: AiIntent = 'TEACH'
): Promise<string> => {
    
    if (!API_KEY) return "CRITICAL ERROR: AI Neural Link disconnected (Missing API Key).";
    if (!settings.enableAiTeacher) return "The AI Teacher module is currently disabled by system administration.";

    // YouTube Detection
    const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/;
    const hasYoutube = youtubeRegex.test(userPrompt);

    if (hasYoutube && !settings.enableYouTubeAnalysis) {
        return "YouTube analysis is currently disabled. Please upgrade your plan or contact admin.";
    }

    let systemPrompt = `
    You are **Prof. Nexus**, an expert AI Educator.
    Student: ${user.fullName} (${user.role}).

    **YOUR GOAL**: Provide the highest quality educational assistance.
    `;

    if (intent === 'NOTES') {
        systemPrompt += `
        **TASK**: Generate comprehensive **Study Notes** for the provided topic or context.
        **FORMAT**:
        1. **Title** (H1)
        2. **Executive Summary** (Italicized)
        3. **Key Concepts** (Bulleted list with definitions)
        4. **Deep Dive** (Structured paragraphs with H3 headers)
        5. **Visual Description**: Describe a diagram that would explain the concept.
        6. **Actionable Takeaways**.
        `;
    } else if (intent === 'QUIZ') {
        systemPrompt += `
        **TASK**: Create a **Practice Quiz** (5 Questions).
        **FORMAT**:
        - Question (Multiple Choice or Short Answer)
        - [Hidden Answer Key at the very bottom]
        `;
    } else if (intent === 'SUMMARY') {
        systemPrompt += `
        **TASK**: Summarize the content concisely.
        - Use bullet points.
        - Highlight the 3 most important facts.
        `;
    } else {
        systemPrompt += `
        **TEACHING STYLE**:
        - Explain *why* and *how*.
        - Use **bold** for key terms.
        - Connect to real-world examples.
        - If the user asks a question, answer it directly then expand.
        `;
    }

    if (fileContext) {
        systemPrompt += `\n\n**ATTACHED DOCUMENT CONTENT**: """${fileContext}"""\nBase your answer strictly on this content if relevant.`;
    }

    if (hasYoutube) {
        systemPrompt += `\n\n**INSTRUCTION**: The user provided a YouTube link. Use your search tools to find the video context/transcript if possible, or infer from the title/metadata provided in the chat. Explain the video content.`;
    }

    // Context Window
    const chatHistory = history.slice(-8).map(m => ({
        role: m.isAi ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: TEACHER_MODEL,
            contents: [
                ...chatHistory,
                { role: 'user', parts: [{ text: userPrompt }] }
            ],
            config: {
                systemInstruction: systemPrompt,
                tools: (hasYoutube || settings.enableYouTubeAnalysis) ? [{ googleSearch: {} }] : undefined,
                temperature: 0.3
            }
        });

        let text = response.text || "I'm processing complex data. Please clarify your request.";

        // Grounding citations
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            const links = response.candidates[0].groundingMetadata.groundingChunks
                .map((c: any) => c.web?.uri)
                .filter(Boolean);
            if (links.length > 0) {
                text += `\n\n**Sources:**\n${[...new Set(links)].slice(0, 3).map((l: any) => `- [${new URL(l).hostname}](${l})`).join('\n')}`;
            }
        }

        return text;
    } catch (e) {
        console.error("AI Error", e);
        return "I encountered a neural network error. Please try again.";
    }
};

export const analyzeDocument = async (base64Data: string, mimeType: string): Promise<string> => {
    if (!API_KEY) throw new Error("Missing API Key");

    try {
        const response = await ai.models.generateContent({
            model: FILE_MODEL,
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: "Extract all text and describe any visual elements in this document/image. Return purely the extracted information." }
                ]
            }
        });
        return response.text || "";
    } catch (e) {
        console.error("File Analysis Error", e);
        throw new Error("Unable to read file. Please ensure it is a valid document or image.");
    }
};
