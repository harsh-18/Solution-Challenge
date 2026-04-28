import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in the environment variables!");
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ==========================================
// API Routes
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReliefSetu Backend is running' });
});

// Endpoint: Extract Need from Report
app.post('/api/gemini/extract', async (req, res) => {
  if (!genAI) return res.status(500).json({ error: "Gemini API key is not configured on the server." });

  try {
    const { rawText, location } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            category: { type: SchemaType.STRING },
            summary: { type: SchemaType.STRING },
            summaryHindi: { type: SchemaType.STRING },
            affectedCount: { type: SchemaType.INTEGER },
            vulnerableGroups: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            requiredSupplies: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            requiredSkills: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            urgencyScore: { type: SchemaType.INTEGER },
            languageNeed: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            missingInfo: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            constraints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            reasoning: { type: SchemaType.STRING },
          },
          required: ["category", "summary", "summaryHindi", "affectedCount", "vulnerableGroups", "requiredSupplies", "requiredSkills", "urgencyScore", "languageNeed", "missingInfo", "constraints", "reasoning"],
        }
      }
    });

    const prompt = `Analyze the following disaster field report and extract structured information.
Location: ${location?.area || 'Unknown'}, ${location?.city || 'Unknown'}

Field Report:
"${rawText}"`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    res.json(parsed);
  } catch (error) {
    console.error("Extraction error:", error);
    res.status(500).json({ error: error.message || "Failed to extract report" });
  }
});

// Endpoint: Generate Volunteer Brief
app.post('/api/gemini/brief', async (req, res) => {
  if (!genAI) return res.status(500).json({ error: "Gemini API key is not configured on the server." });

  try {
    const { task, volunteer } = req.body;

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
Volunteer Skills: ${volunteer.skills?.join(', ')}

Task Category: ${task.extractedNeed?.category}
Summary: ${task.extractedNeed?.summary}
Location: ${task.extractedNeed?.location?.area}, ${task.extractedNeed?.location?.city}
Required Supplies: ${task.extractedNeed?.requiredSupplies?.join(', ')}
Constraints: ${task.extractedNeed?.constraints?.join(', ')}`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    res.json(parsed);
  } catch (error) {
    console.error("Brief generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate brief" });
  }
});

// Endpoint: Generate Impact Summary
app.post('/api/gemini/impact', async (req, res) => {
  if (!genAI) return res.status(500).json({ error: "Gemini API key is not configured on the server." });

  try {
    const { tasksContext } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Based on the following disaster relief tasks, write a brief, professional 3-sentence impact summary for the coordinator dashboard. Highlight key successes, active bottlenecks, and critical areas.
    
Tasks:
${tasksContext}`;

    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (error) {
    console.error("Impact summary error:", error);
    res.status(500).json({ error: error.message || "Failed to generate impact summary" });
  }
});

// ==========================================
// Production Static Serving
// ==========================================
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ReliefSetu Backend running on port ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📁 Serving static files from dist folder`);
  }
});
