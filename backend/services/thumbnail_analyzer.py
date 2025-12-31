"""
Thumbnail CTR Analyzer Service

Uses Gemini 2.5 Flash Vision to analyze YouTube thumbnails for CTR optimization.
Incorporates research-backed guidelines from MrBeast, VidIQ, and industry studies.
"""

import os
import json
import base64
from typing import Optional, Dict, Any

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


# Comprehensive CTR research prompt incorporating MrBeast rules, VidIQ data, and industry studies
THUMBNAIL_ANALYSIS_PROMPT = """You are a world-class YouTube thumbnail analyst with deep expertise in CTR optimization.

## YOUR KNOWLEDGE BASE (Research-Backed CTR Factors)

### MrBeast's Thumbnail Rules (200M+ subscribers):
1. "If I can't understand the thumbnail in 1 second, it's a failure"
2. Maximum 3 elements: face, text (3 words max), one focal object
3. Faces must show EXTREME emotion - no neutral expressions
4. Text must be readable at the size of a mobile thumbnail (40px on mobile = your test)
5. Colors must POP - high saturation, high contrast against YouTube's white UI
6. Never put text in the bottom-right (timestamp covers it)
7. Left-side composition works better (eye tracking studies confirm)

### VidIQ Data (50M+ thumbnails analyzed):
- Thumbnails with faces get 38% higher CTR on average
- Surprised/shocked expressions: +67% CTR vs neutral
- High contrast thumbnails: +32% CTR
- 3 or fewer text words: +25% CTR vs 4+ words
- Human presence: +95% watch time

### Mobile-First Reality:
- 70%+ of YouTube views are mobile
- Thumbnail displays at ~160x90px on mobile feed
- Text under 48pt font is unreadable on mobile
- Fine details completely disappear
- Faces need to take up 40%+ of frame to have impact

### Psychology Triggers That Drive Clicks:
1. CURIOSITY GAP: Show outcome without explaining how
2. FEAR OF MISSING OUT: "Everyone's watching this"
3. PATTERN INTERRUPT: Something unexpected/impossible
4. EMOTIONAL CONTAGION: Extreme faces trigger mirror neurons
5. CONTROVERSY: Implies conflict or debate
6. TRANSFORMATION: Before/after, journey implied
7. SOCIAL PROOF: Numbers, reactions, crowds

### Technical Requirements:
- YouTube displays at 1280x720 but tests at 168x94
- Safe zones: avoid edges (YouTube UI overlays)
- Bottom-right: timestamp overlay (avoid text/faces)
- Compression: avoid tiny text, thin lines, gradients with banding

## CONTEXT FOR THIS ANALYSIS
{context_section}

## YOUR TASK

Analyze this thumbnail image for CTR optimization. Consider:
1. How it appears at MOBILE size (160x90px) - this is critical
2. First-impression impact (< 1 second comprehension)
3. Emotional resonance and curiosity triggers
4. Technical execution (contrast, readability, composition)
5. How it would perform in the YouTube feed against competitors

## CATEGORY ANALYSIS ORDER (by CTR impact)

Analyze in this exact order, as this reflects research-proven impact on CTR:

1. **Mobile Readability** (CRITICAL - 70% of views)
   - Can you understand the thumbnail at 160x90px?
   - Is text readable? Are faces recognizable?
   - Does the message come across instantly?

2. **Face & Emotion** (CRITICAL - 38-67% CTR lift)
   - Is there a human face? What percentage of frame?
   - What emotion is displayed? Is it EXTREME enough?
   - Does the expression match the content?

3. **Visual Simplicity** (HIGH - cognitive load affects CTR)
   - Element count (ideal: 3 or fewer)
   - Clear focal hierarchy
   - Clean background vs cluttered

4. **Text Effectiveness** (HIGH - when used correctly)
   - Word count (ideal: 0-3 words)
   - Font size and readability
   - Positioning (avoiding timestamp area)
   - Does text add value or just repeat title?

5. **Contrast & Pop** (MEDIUM - +32% CTR for high contrast)
   - Color saturation and vibrancy
   - Contrast against YouTube's white UI
   - Visual "pop" factor

6. **Curiosity Factor** (MEDIUM - psychological triggers)
   - Does it create a curiosity gap?
   - Pattern interrupt potential
   - Emotional hook strength

## OUTPUT FORMAT

You MUST respond with ONLY valid JSON. No markdown, no explanation, just the JSON object.

{{
  "overall_score": <number 1-100>,
  "verdict": "<one compelling sentence summarizing the thumbnail's CTR potential>",
  "top_priorities": [
    {{
      "issue": "<specific problem>",
      "fix": "<actionable solution>",
      "impact": "<high|medium|low>"
    }}
  ],
  "categories": [
    {{
      "name": "Mobile Readability",
      "score": <number 1-100>,
      "status": "<excellent|good|needs_work|poor>",
      "summary": "<2-3 sentence assessment>",
      "why_it_matters": "<research-backed reason this category matters for CTR>",
      "whats_working": ["<specific positive element>"],
      "whats_not": ["<specific issue>"],
      "fixes": ["<actionable improvement>"]
    }},
    {{
      "name": "Face & Emotion",
      "score": <number 1-100>,
      "status": "<excellent|good|needs_work|poor>",
      "summary": "<2-3 sentence assessment>",
      "why_it_matters": "<research-backed reason>",
      "whats_working": ["<positive>"],
      "whats_not": ["<issue>"],
      "fixes": ["<improvement>"]
    }},
    {{
      "name": "Visual Simplicity",
      "score": <number 1-100>,
      "status": "<excellent|good|needs_work|poor>",
      "summary": "<2-3 sentence assessment>",
      "why_it_matters": "<research-backed reason>",
      "whats_working": ["<positive>"],
      "whats_not": ["<issue>"],
      "fixes": ["<improvement>"]
    }},
    {{
      "name": "Text Effectiveness",
      "score": <number 1-100>,
      "status": "<excellent|good|needs_work|poor>",
      "summary": "<2-3 sentence assessment>",
      "why_it_matters": "<research-backed reason>",
      "whats_working": ["<positive>"],
      "whats_not": ["<issue>"],
      "fixes": ["<improvement>"]
    }},
    {{
      "name": "Contrast & Pop",
      "score": <number 1-100>,
      "status": "<excellent|good|needs_work|poor>",
      "summary": "<2-3 sentence assessment>",
      "why_it_matters": "<research-backed reason>",
      "whats_working": ["<positive>"],
      "whats_not": ["<issue>"],
      "fixes": ["<improvement>"]
    }},
    {{
      "name": "Curiosity Factor",
      "score": <number 1-100>,
      "status": "<excellent|good|needs_work|poor>",
      "summary": "<2-3 sentence assessment>",
      "why_it_matters": "<research-backed reason>",
      "whats_working": ["<positive>"],
      "whats_not": ["<issue>"],
      "fixes": ["<improvement>"]
    }}
  ]
}}

IMPORTANT SCORING GUIDELINES:
- 90-100: Exceptional - Would compete with top 1% of YouTube thumbnails
- 80-89: Excellent - Professional quality, minor optimizations possible
- 70-79: Good - Solid foundation but missing key CTR triggers
- 60-69: Needs Work - Has potential but significant issues
- Below 60: Poor - Major overhaul needed

Be honest and specific. Generic feedback is useless. Every "fix" should be immediately actionable.
"""


class ThumbnailAnalyzerService:
    """Service for analyzing YouTube thumbnails for CTR optimization using Gemini Vision."""

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        self.model_name = "gemini-2.5-flash"

    def _get_client(self):
        """Get or create the Gemini client."""
        if not self.client and self.api_key:
            if USE_NEW_SDK:
                self.client = genai.Client(api_key=self.api_key)
            else:
                if genai_old:
                    genai_old.configure(api_key=self.api_key)
                    self.client = "legacy"
        return self.client

    def is_available(self) -> bool:
        """Check if the service is available (API key is configured)."""
        return bool(self.api_key)

    def _build_context_section(
        self,
        niche: Optional[str] = None,
        target_audience: Optional[str] = None,
        channel_style: Optional[str] = None,
        competitors: Optional[str] = None,
        video_title: Optional[str] = None,
        target_emotion: Optional[str] = None,
    ) -> str:
        """Build the context section of the prompt from provided parameters."""
        context_parts = []

        if video_title:
            context_parts.append(f"- **Video Title**: {video_title}")
        if niche:
            context_parts.append(f"- **Niche/Category**: {niche}")
        if target_audience:
            context_parts.append(f"- **Target Audience**: {target_audience}")
        if target_emotion:
            context_parts.append(f"- **Target Emotion**: {target_emotion}")
        if channel_style:
            context_parts.append(f"- **Channel Style**: {channel_style}")
        if competitors:
            context_parts.append(f"- **Key Competitors**: {competitors}")

        if context_parts:
            return "\n".join(context_parts)
        else:
            return "No specific context provided. Analyze for general YouTube best practices."

    def _error_response(self, error_message: str) -> Dict[str, Any]:
        """Generate a structured error response."""
        return {
            "error": True,
            "error_message": error_message,
            "overall_score": 0,
            "verdict": f"Analysis failed: {error_message}",
            "top_priorities": [],
            "categories": [
                {
                    "name": category_name,
                    "score": 0,
                    "status": "poor",
                    "summary": "Analysis could not be completed.",
                    "why_it_matters": "N/A",
                    "whats_working": [],
                    "whats_not": ["Analysis failed"],
                    "fixes": ["Please try again"]
                }
                for category_name in [
                    "Mobile Readability",
                    "Face & Emotion",
                    "Visual Simplicity",
                    "Text Effectiveness",
                    "Contrast & Pop",
                    "Curiosity Factor"
                ]
            ]
        }

    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the JSON response from the model, handling potential formatting issues."""
        # Clean up the response - remove markdown code blocks if present
        cleaned = response_text.strip()

        # Remove markdown code block markers
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]

        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]

        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Try to find JSON object in the response
            start_idx = cleaned.find("{")
            end_idx = cleaned.rfind("}") + 1

            if start_idx != -1 and end_idx > start_idx:
                try:
                    return json.loads(cleaned[start_idx:end_idx])
                except json.JSONDecodeError:
                    pass

            raise ValueError(f"Failed to parse JSON response")

    async def analyze(
        self,
        image_bytes: bytes,
        niche: Optional[str] = None,
        target_audience: Optional[str] = None,
        channel_style: Optional[str] = None,
        competitors: Optional[str] = None,
        video_title: Optional[str] = None,
        target_emotion: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a thumbnail image for CTR optimization.

        Args:
            image_bytes: The thumbnail image as bytes (PNG, JPEG, etc.)
            niche: The YouTube niche/category (e.g., "Gaming", "Tech Reviews")
            target_audience: Description of target audience
            channel_style: Description of channel's visual style
            competitors: List or description of competitor channels
            video_title: The video title this thumbnail is for
            target_emotion: The intended emotional response

        Returns:
            Dict containing analysis results with scores and recommendations
        """
        try:
            client = self._get_client()

            if not client:
                return self._error_response("No API key configured. Please set GEMINI_API_KEY.")

            # Build context section
            context_section = self._build_context_section(
                niche=niche,
                target_audience=target_audience,
                channel_style=channel_style,
                competitors=competitors,
                video_title=video_title,
                target_emotion=target_emotion,
            )

            # Build the full prompt
            full_prompt = THUMBNAIL_ANALYSIS_PROMPT.format(context_section=context_section)

            if USE_NEW_SDK:
                # Use the new SDK with vision capabilities
                # Encode image to base64
                image_base64 = base64.b64encode(image_bytes).decode("utf-8")

                # Determine image mime type (assume JPEG if not clear)
                # Check for PNG magic bytes
                if image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
                    mime_type = "image/png"
                elif image_bytes[:2] == b'\xff\xd8':
                    mime_type = "image/jpeg"
                elif image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP':
                    mime_type = "image/webp"
                else:
                    mime_type = "image/jpeg"  # Default assumption

                # Create the content with image
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=[
                        types.Part.from_bytes(
                            data=image_bytes,
                            mime_type=mime_type,
                        ),
                        full_prompt,
                    ],
                    config=types.GenerateContentConfig(
                        temperature=0.3,
                        max_output_tokens=4096,
                    ),
                )

                # Extract the response text
                try:
                    response_text = response.text
                except Exception as text_err:
                    # Try to get text from candidates directly
                    if hasattr(response, 'candidates') and response.candidates:
                        candidate = response.candidates[0]
                        if hasattr(candidate, 'content') and candidate.content.parts:
                            response_text = candidate.content.parts[0].text
                        else:
                            return self._error_response(f"Could not extract text: {text_err}")
                    else:
                        return self._error_response(f"Could not extract text: {text_err}")

                if response_text:
                    result = self._parse_json_response(response_text)
                    result["error"] = False
                    return result
                else:
                    return self._error_response("No response generated from model.")

            else:
                # Legacy SDK handling
                if not genai_old:
                    return self._error_response("Google Generative AI SDK not installed.")

                # Use legacy SDK
                model = genai_old.GenerativeModel(self.model_name)

                # Create image part
                image_part = {
                    "mime_type": "image/jpeg",  # Assume JPEG for legacy
                    "data": base64.b64encode(image_bytes).decode("utf-8")
                }

                response = model.generate_content(
                    [full_prompt, image_part],
                    generation_config=genai_old.GenerationConfig(
                        temperature=0.3,
                        max_output_tokens=4096,
                    )
                )

                if response.text:
                    result = self._parse_json_response(response.text)
                    result["error"] = False
                    return result
                else:
                    return self._error_response("No response generated from model.")

        except Exception as e:
            error_msg = str(e)
            print(f"Thumbnail analysis error: {error_msg}")
            return self._error_response(f"Analysis failed: {error_msg}")

    def analyze_sync(
        self,
        image_bytes: bytes,
        niche: Optional[str] = None,
        target_audience: Optional[str] = None,
        channel_style: Optional[str] = None,
        competitors: Optional[str] = None,
        video_title: Optional[str] = None,
        target_emotion: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Synchronous version of analyze for non-async contexts.

        Args:
            image_bytes: The thumbnail image as bytes
            niche: The YouTube niche/category
            target_audience: Description of target audience
            channel_style: Description of channel's visual style
            competitors: List or description of competitor channels
            video_title: The video title this thumbnail is for
            target_emotion: The intended emotional response

        Returns:
            Dict containing analysis results with scores and recommendations
        """
        import asyncio

        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        return loop.run_until_complete(
            self.analyze(
                image_bytes=image_bytes,
                niche=niche,
                target_audience=target_audience,
                channel_style=channel_style,
                competitors=competitors,
                video_title=video_title,
                target_emotion=target_emotion,
            )
        )


# Singleton instance
thumbnail_analyzer = ThumbnailAnalyzerService()
