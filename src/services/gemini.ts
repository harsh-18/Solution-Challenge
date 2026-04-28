// ============================================================
// ReliefSetu — Gemini AI Service
// Integrates Vertex AI / Google AI Studio for reasoning
// ============================================================

import { ExtractedNeed, Urgency, GeoLocation, VolunteerMatch, MatchReason, Volunteer, Task, TaskBrief } from '@/types/models'
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai'

// Initialize the Gemini API client
// Note: In a production app, this should be called from a secure backend to prevent key exposure.
// For the hackathon MVP, we use the client-side key with Vite environment variables.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function extractNeedFromReport(
  rawText: string,
  location: GeoLocation,
  _imageUrl?: string
): Promise<ExtractedNeed> {
  if (!genAI) {
    console.warn("VITE_GEMINI_API_KEY is not set. Falling back to mock extraction.");
    throw new Error("Gemini API key is missing");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          category: { type: SchemaType.STRING, description: "Main category of the need (e.g., Medical Emergency, Food Supply, Rescue)" },
          summary: { type: SchemaType.STRING, description: "A concise English summary of the situation." },
          summaryHindi: { type: SchemaType.STRING, description: "A concise Hindi summary of the situation." },
          affectedCount: { type: SchemaType.INTEGER, description: "Estimated number of people affected." },
          vulnerableGroups: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of vulnerable groups identified (e.g., elderly, children, pregnant women)." },
          requiredSupplies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of supplies needed." },
          requiredSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "List of skills required by volunteers." },
          urgencyScore: { type: SchemaType.INTEGER, description: "Urgency score from 1 to 10." },
          languageNeed: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Languages spoken by the victims." },
          missingInfo: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Important information missing from the report." },
          constraints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Environmental or situational constraints (e.g., flooded roads)." },
          reasoning: { type: SchemaType.STRING, description: "Explanation of why the urgency score and category were chosen." },
        },
        required: ["category", "summary", "summaryHindi", "affectedCount", "vulnerableGroups", "requiredSupplies", "requiredSkills", "urgencyScore", "languageNeed", "missingInfo", "constraints", "reasoning"],
      }
    }
  });

  const prompt = `Analyze the following disaster field report and extract structured information.
The report might be in English, Hindi, or Hinglish.
Location: ${location.area}, ${location.city}, ${location.state}

Field Report:
"${rawText}"`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const parsed = JSON.parse(responseText);

  let urgency = Urgency.MEDIUM;
  if (parsed.urgencyScore >= 8) urgency = Urgency.CRITICAL;
  else if (parsed.urgencyScore >= 6) urgency = Urgency.HIGH;
  else if (parsed.urgencyScore <= 3) urgency = Urgency.LOW;

  return {
    ...parsed,
    urgency,
    deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    location,
    confidence: 0.92,
  };
}

export async function generateVolunteerBrief(
  task: Task,
  volunteer: Volunteer
): Promise<TaskBrief> {
  if (!genAI) throw new Error("Gemini API key is missing");

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          english: {
            type: SchemaType.OBJECT,
            properties: {
              whatToDo: { type: SchemaType.STRING },
              whatToCarry: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              whereToGo: { type: SchemaType.STRING },
              whoToContact: { type: SchemaType.STRING },
              safetyNotes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              estimatedTime: { type: SchemaType.STRING },
            },
            required: ["whatToDo", "whatToCarry", "whereToGo", "whoToContact", "safetyNotes", "estimatedTime"]
          },
          hindi: {
            type: SchemaType.OBJECT,
            properties: {
              whatToDo: { type: SchemaType.STRING },
              whatToCarry: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              whereToGo: { type: SchemaType.STRING },
              whoToContact: { type: SchemaType.STRING },
              safetyNotes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              estimatedTime: { type: SchemaType.STRING },
            },
            required: ["whatToDo", "whatToCarry", "whereToGo", "whoToContact", "safetyNotes", "estimatedTime"]
          }
        },
        required: ["english", "hindi"]
      }
    }
  });

  const prompt = `Generate a volunteer task brief in both English and Hindi for the following assignment.
Volunteer Name: ${volunteer.name}
Volunteer Skills: ${volunteer.skills.join(', ')}

Task Category: ${task.extractedNeed.category}
Summary: ${task.extractedNeed.summary}
Location: ${task.extractedNeed.location.address}, ${task.extractedNeed.location.area}, ${task.extractedNeed.location.city}
Required Supplies: ${task.extractedNeed.requiredSupplies.join(', ')}
Constraints/Safety: ${task.extractedNeed.constraints.join(', ')}

Create clear, actionable instructions tailored for this volunteer.`;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());
  return parsed;
}

export async function generateImpactSummary(tasks: Task[]): Promise<string> {
  if (!genAI) return "Impact summary generation requires Gemini API key.";

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const tasksContext = tasks.map(t => 
    `Task: ${t.extractedNeed.category} | Status: ${t.status} | Urgency: ${t.extractedNeed.urgencyScore}/10 | Location: ${t.extractedNeed.location.city}`
  ).join('\n');

  const prompt = `Based on the following disaster relief tasks, write a brief, professional 3-sentence impact summary for the coordinator dashboard. Highlight key successes, active bottlenecks, and critical areas.
  
Tasks:
${tasksContext}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
