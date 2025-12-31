from PIL import Image, ImageDraw
import io
import os
from typing import Optional

# Try the new google-genai package first, fall back to older one
try:
    from google import genai
    from google.genai import types
    USE_NEW_SDK = True
except ImportError:
    USE_NEW_SDK = False
    try:
        import google.generativeai as genai_old
    except ImportError:
        genai_old = None


class ImagenService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None

    def _get_client(self):
        if not self.client and self.api_key:
            if USE_NEW_SDK:
                self.client = genai.Client(api_key=self.api_key)
            else:
                if genai_old:
                    genai_old.configure(api_key=self.api_key)
                    self.client = "legacy"
        return self.client

    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1280,
        height: int = 720,
    ) -> Optional[bytes]:
        try:
            client = self._get_client()
            if not client:
                print("Imagen: No API key configured, using fallback")
                return self._generate_fallback(width, height)

            # Build full prompt
            full_prompt = prompt
            if negative_prompt:
                full_prompt += f". Avoid: {negative_prompt}"

            if USE_NEW_SDK:
                # Use Imagen 4.0 for high-quality image generation
                response = self.client.models.generate_images(
                    model="imagen-4.0-generate-001",
                    prompt=full_prompt,
                    config=types.GenerateImagesConfig(
                        number_of_images=1,
                        aspect_ratio="16:9",
                    ),
                )

                if response.generated_images:
                    image_bytes = response.generated_images[0].image.image_bytes
                    return image_bytes
            else:
                # Legacy SDK - Imagen not supported, use fallback
                print("Imagen: Legacy SDK doesn't support image generation")
                return self._generate_fallback(width, height)

            return None

        except Exception as e:
            print(f"Imagen generation error: {e}")
            # Return a fallback gradient background
            return self._generate_fallback(width, height)

    def _generate_fallback(self, width: int, height: int) -> bytes:
        """Generate a dark gradient fallback background."""
        img = Image.new("RGB", (width, height))
        draw = ImageDraw.Draw(img)

        # Create a dark gradient (top to bottom)
        for y in range(height):
            # Dark blue-gray gradient
            r = int(15 + (y / height) * 10)
            g = int(15 + (y / height) * 12)
            b = int(25 + (y / height) * 15)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Add some subtle vignette effect
        for i in range(50):
            alpha = int(255 * (i / 50) * 0.3)
            # Top
            draw.rectangle([0, i, width, i + 1], fill=(0, 0, 0, alpha))
            # Bottom
            draw.rectangle([0, height - i - 1, width, height - i], fill=(0, 0, 0, alpha))

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer.getvalue()

    def is_available(self) -> bool:
        return bool(self.api_key)


# Singleton
imagen = ImagenService()
