import sys
import os
from movie_processor import MovieProcessor
from openai_client import OpenAIClient
from utils import save_image
import re

def main():
    original_title = input("Please enter the movie title: ")

    openai_client = OpenAIClient()
    movie_data = openai_client.get_movie_data(original_title)
    original_summary = movie_data.get('summary', "Summary not found.")

    movie_processor = MovieProcessor()
    romantic_title = movie_processor.create_romantic_title(original_title)
    romantic_summary = movie_processor.create_romantic_summary(original_summary)

    print(f"Romanticized Title: {romantic_title}")
    print(f"Romanticized Summary: {romantic_summary}")

    # Create a new directory named after the romanticized title inside the 'movies' directory
    sanitized_title = re.sub(r'[<>:"/\\|?*]', '', romantic_title.split("\n")[0])
    directory_name = sanitized_title.replace(' ', '_')[:100]
    movies_directory = os.path.join("movies", directory_name)

    os.makedirs(movies_directory, exist_ok=True)

    # Save the image in the new directory
    image_data = openai_client.call_openai_api(f"Create a romanticized movie poster for '{romantic_title}' (this is a romanticized version of the original movie '{original_title}')")
    image_path = os.path.join(movies_directory, f"{directory_name}_poster.png")
    save_image(image_data, image_path)

    # Save the romanticized title, summary, and image in a README file in the new directory
    with open(os.path.join(movies_directory, "README.md"), "w") as readme_file:
        readme_file.write(f"![Movie Poster]({directory_name}_poster.png)\n")
        readme_file.write(f"# {romantic_title} (Originally -{original_title}-)\n")
        readme_file.write(f"## Summary:\n{romantic_summary}\n")
        
if __name__ == "__main__":
    main()