import google.generativeai as genai
from PIL import Image
import io
import os
from typing import Optional


class ImagenService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        self.model = None

    def _get_model(self):
        if not self.model:
            # Use Imagen 3 model
            self.model = genai.ImageGenerationModel("imagen-3.0-generate-002")
        return self.model

    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1280,
        height: int = 720,
    ) -> Optional[bytes]:
        try:
            model = self._get_model()

            # Build full prompt
            full_prompt = prompt
            if negative_prompt:
                full_prompt += f". Avoid: {negative_prompt}"

            # Generate image
            response = model.generate_images(
                prompt=full_prompt,
                number_of_images=1,
                aspect_ratio="16:9",  # YouTube thumbnail ratio
                safety_filter_level="block_only_high",
            )

            if response.images:
                image = response.images[0]
                buffer = io.BytesIO()
                image._pil_image.save(buffer, format="PNG")
                buffer.seek(0)
                return buffer.getvalue()

            return None

        except Exception as e:
            print(f"Imagen generation error: {e}")
            return None

    def is_available(self) -> bool:
        return bool(os.getenv("GEMINI_API_KEY"))


# Singleton
imagen = ImagenService()
