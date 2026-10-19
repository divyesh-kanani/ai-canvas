
import asyncio

from app.services.ollama import ask_ollama


async def main():
    question = "Explain neural networks in three simple sentences."

    print("Sending question to Ollama...")

    answer = await ask_ollama(question)

    print("\nAI answer:")
    print(answer)


if __name__ == "__main__":
    asyncio.run(main())
