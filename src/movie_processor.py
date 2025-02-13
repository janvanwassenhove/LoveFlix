from openai_client import OpenAIClient

class MovieProcessor:
    def __init__(self):
        self.openai_client = OpenAIClient()

    def create_romantic_title(self, original_title, language):
        prompt = f"Transform the following movie title into a romanticized version in {language}: '{original_title}', only reply back with the title."
        response_text = self.openai_client.call_openai_api_text(prompt)
        romantic_title = response_text.strip().split("\n")[0]  # Take only the first line as the title
        return romantic_title

    def create_romantic_summary(self, original_summary, language):
        prompt = f"Transform the following movie summary into a romanticized version (go wild) in {language}: '{original_summary}'"
        response_text = self.openai_client.call_openai_api_text(prompt)
        return response_text.strip()
