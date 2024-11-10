import chainlit as cl
import openai
import os
from dotenv import load_dotenv

load_dotenv()
client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

@cl.on_chat_start
def start_chat():
    cl.Message(content="Hello! I'm your foraging assistant. I can help identify plants and suggest uses based on your inventory.").send()

@cl.on_message
async def main(message: cl.Message):
    # Get response from OpenAI using new API format
    response = client.chat.completions.create(
        model="gpt-4",  # or gpt-3.5-turbo
        messages=[
            {"role": "system", "content": "You are a helpful foraging assistant. Help users identify plants and provide advice on their uses."},
            {"role": "user", "content": message.content}
        ],
        temperature=0.7
    )
    
    await cl.Message(
        content=response.choices[0].message.content,
    ).send()