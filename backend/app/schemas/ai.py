
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=10000,
    )


class AskResponse(BaseModel):
    answer: str

class OrganizeRequest(BaseModel):
    question: str = Field(min_length=1, max_length=10000)
    answer: str = Field(min_length=1, max_length=20000)


class OrganizedNote(BaseModel):
    title: str
    summary: str
    key_points: list[str]


class OrganizeResponse(BaseModel):
    note: OrganizedNote
