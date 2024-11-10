import openai
import tiktoken
from key import KEY
import time


# initializations
openai.api_key = KEY
encoding = tiktoken.get_encoding("cl100k_base")


def count_tokens(text):
    return len(encoding.encode(text))


def send_request_with_throttling(
    prompt: str, max_tokens: int = 100, delay: int = 1, max_total_tokens: int = 2000
):
    """
    Sends a request to the ChatGPT API, checks token count, and throttles if close to limit.

    :param prompt: str - the prompt string to send to ChatGPT
    :param max_tokens: int - max tokens in the response
    :param delay: float - delay in seconds between requests
    :param max_total_tokens: int - maximum allowed tokens for input + output
    :return: str - response text
    """

    # Count tokens in the prompt
    prompt_tokens = count_tokens(prompt)

    # Check if request would exceed max allowed tokens
    if prompt_tokens + max_tokens > max_total_tokens:
        raise ValueError(
            f"Prompt exceeds max token limit. Prompt tokens: {prompt_tokens}, Max tokens: {max_total_tokens}"
        )

    # Call the ChatGPT API
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
        )

        # Get response content and token usage
        response_text = response["choices"][0]["message"]["content"]
        response_tokens = response["usage"]["total_tokens"]

        print(f"Used tokens: {response_tokens}")

        # Throttle requests by sleeping
        time.sleep(delay)

        return response_text

    except openai.error.RateLimitError:
        print("Rate limit reached, waiting...")
        time.sleep(10)  # Wait a bit longer if rate limit reached
        return send_request_with_throttling(prompt, max_tokens, delay, max_total_tokens)


# Example usage
prompt = "What is the capital of France?"
response = send_request_with_throttling(prompt, max_tokens=50)
print(response)
