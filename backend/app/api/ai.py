
from fastapi import APIRouter, HTTPException
from app.schemas.ai import OrganizeRequest, OrganizeResponse
from app.services.gemini import organize_answer
from app.schemas.ai import AskRequest, AskResponse
from app.services.gemini import ask_gemini

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    try:
        answer = await ask_gemini(request.question)
        return AskResponse(answer=answer)

    except Exception as exc:
        print(f"Gemini request failed: {exc}")
        raise HTTPException(
            status_code=502,
            detail="The AI service could not generate an answer.",
        ) from exc

@router.post("/organize", response_model=OrganizeResponse)
async def organize_question(request: OrganizeRequest):
    try:
        note = await organize_answer(
            request.question,
            request.answer,
        )
        return OrganizeResponse(note=note)

    except Exception as exc:
        print(f"Note organization failed: {exc}")
        raise HTTPException(
            status_code=502,
            detail="Could not organize the AI answer.",
        ) from exc
