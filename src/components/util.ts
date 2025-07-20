import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCzGFFERE2nP8zApZLfTvRUpTQ0v6VlHqg';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite-preview-06-17',
});

export const generateContentWithModel = async (
  prompt: string
): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating content:', error);
    return '';
  }
};

export const generateText = async (
  data: string,
  fileName: string
): Promise<string> => {
  try {
    const fileResponse = await fetch(`/${fileName}.txt`);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileName}.txt`);
    }
    const fileContent = await fileResponse.text();
    const prompt = `${fileContent}\n\n${data}`;
    return await generateContentWithModel(prompt);
  } catch (error) {
    console.error('Error generating content:', error);
    return '';
  }
};

export const generateBluePrintForReport = async (
  data: Record<string, string>[]
) => {
  return await generateText(JSON.stringify(data), 'generateReportBlueprint');
};

export const generateChunkSummary = async (
  data: Record<string, string>[],
  blueprintPrompt: string
) => {
  const fullPrompt =
    blueprintPrompt + '\n\n**CHUNK DATA:**\n' + data.join('\n');
  return await generateText(fullPrompt, 'chunkSummaryGenerator');
};

export const generateReport = async (
  data: string[],
  blueprintPrompt: string
) => {
  const fullPrompt =
    blueprintPrompt + '\n\n**CHUNK DATA:**\n' + data.join('\n');
  const result = await generateText(fullPrompt, 'reportGenerator');

  // Extract HTML content from code block if present
  const htmlMatch = result.match(/```html\s*([\s\S]*?)```/i);
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }
  return result.trim();
};
