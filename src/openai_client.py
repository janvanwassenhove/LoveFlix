import openai
import os
import json  

class OpenAIClient:
    def __init__(self):
        env_var = "OPENAI_API_KEY"
        openai.api_key = os.getenv(env_var)

    def call_openai_api_text(self, prompt):
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant knowing all about movies but you love romance. Any movie can be romanticized!"},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500
        )
        
        content = response.choices[0].message.content
        return content
    
    def call_openai_api(self, prompt):
        response = openai.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="1024x1024",
            quality="standard", # hd
        )
        return response.data[0].url
    
    def get_movie_data(self, movie_title):
        prompt = f"Provide a summary and details for the movie titled '{movie_title}'."
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant knowing all about movies."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500
        )
        
        # Ensure the response is parsed as a dictionary
        content = response.choices[0].message.content

        try:
            movie_data = json.loads(content)  # Convert response to a dictionary
        except json.JSONDecodeError:
            movie_data = {"summary": content}  # Fallback to storing response as summary

        return movie_data


