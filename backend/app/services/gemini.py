import os
from dotenv import load_dotenv
from google import genai
import json
from pydantic import ValidationError
from app.schemas.ai import OrganizedNote

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Check backend/.env"
    )

client = genai.Client(api_key=api_key)


async def ask_gemini(question: str) -> str:
    """Send a question to the online Gemini model."""

    response = await client.aio.models.generate_content(
        model=model_name,
        contents=question,
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text

async def organize_answer(question: str, answer: str) -> OrganizedNote:
    prompt = f"""
Organize the following AI answer into a useful study note.

Original question:
{question}

Answer:
{answer}

Return only a JSON object with exactly these fields:
- title: a short descriptive title
- summary: a concise summary
- key_points: a list of 3 to 6 important points

Preserve the important meaning and facts. Do not invent information.
"""

    response = await client.aio.models.generate_content(
        model=model_name,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
        },
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response.")

    try:
        data = json.loads(response.text)
        return OrganizedNote.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise ValueError(
            "Gemini returned an invalid organized note."
        ) from exc
