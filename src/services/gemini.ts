// ============================================================
// ReliefSetu — Gemini API Service
// Calls our secure Node.js backend to prevent API key leaks
// ============================================================

import { ExtractedNeed, Urgency, GeoLocation, Volunteer, Task, TaskBrief } from '@/types/models'

export async function extractNeedFromReport(
  rawText: string,
  location: GeoLocation,
  _imageUrl?: string
): Promise<ExtractedNeed> {
  const response = await fetch('/api/gemini/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawText, location })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  const parsed = await response.json();

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
  const response = await fetch('/api/gemini/brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, volunteer })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

export async function generateImpactSummary(tasks: Task[]): Promise<string> {
  const tasksContext = tasks.map(t => 
    `Task: ${t.extractedNeed.category} | Status: ${t.status} | Urgency: ${t.extractedNeed.urgencyScore}/10 | Location: ${t.extractedNeed.location.city}`
  ).join('\n');

  const response = await fetch('/api/gemini/impact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasksContext })
  });

  if (!response.ok) {
    return "Impact summary generation failed. Could not contact secure backend.";
  }

  const data = await response.json();
  return data.text;
}
