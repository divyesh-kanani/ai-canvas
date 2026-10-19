
const API_BASE_URL = "http://127.0.0.1:8000";

export interface OrganizedNote {
  title: string;
  summary: string;
  key_points: string[];
}

export async function askAI(question: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? `AI request failed: ${response.status}`
    );
  }

  const data: { answer: string } = await response.json();

  return data.answer;
}

export async function organizeAnswer(
  question: string,
  answer: string,
): Promise<OrganizedNote> {
  const response = await fetch(`${API_BASE_URL}/api/ai/organize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, answer }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ?? `Could not organize the answer: ${response.status}`,
    );
  }

  const data: { note: OrganizedNote } = await response.json();

  return data.note;
}
