import requests  

def load_movie_data(file_path):
    import json
    with open(file_path, 'r') as file:
        return json.load(file)

def save_image(image_url, file_path):
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(file_path, 'wb') as file:
            file.write(response.content)
    else:
        raise Exception(f"Failed to download image: {response.status_code}")
