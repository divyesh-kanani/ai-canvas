
import asyncio

from app.services.gemini import ask_gemini


async def main():
    print("Sending a test question to Gemini...")

    answer = await ask_gemini(
        "Explain neural networks in three simple sentences."
    )

    print("\nGemini's answer:")
    print(answer)


if __name__ == "__main__":
    asyncio.run(main())
