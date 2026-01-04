"""
Competitor Analyzer Service

Analyzes competitor YouTube thumbnails to extract niche patterns.
Uses Gemini 3.0 Flash Vision to read text from thumbnails.
"""

import os
import json
import asyncio
import httpx
from pathlib import Path
from datetime import datetime
from typing import Optional
from dataclasses import dataclass, asdict

try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


@dataclass
class NichePatterns:
    """Extracted patterns from a niche."""
    word_count: dict  # {"avg": 3.2, "min": 1, "max": 6, "best_range": [2, 4]}
    capitalization: str  # "ALL_CAPS", "Title Case", "mixed"
    power_words: dict  # word -> frequency (0-1)
    uses_numbers: float  # 0-1 percentage
    emotional_tone: list


@dataclass
class NicheProfile:
    """Full niche profile with metadata."""
    niche: str
    updated_at: str
    analyzed_channels: list  # [{"name": "...", "channel_id": "...", "videos_analyzed": 50}]
    patterns: NichePatterns


class CompetitorAnalyzer:
    """Analyzes competitor thumbnails to extract niche patterns."""

    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY")
        self.data_dir = Path("./data/analytics/niche-profiles")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.client = None
        self.model_name = "gemini-2.0-flash"  # Gemini 3.0 Flash

    def _get_client(self):
        """Get or create Gemini client."""
        if not self.client and self.gemini_api_key and HAS_GENAI:
            self.client = genai.Client(api_key=self.gemini_api_key)
        return self.client

    def is_available(self) -> bool:
        """Check if the service is available."""
        return bool(self.gemini_api_key and HAS_GENAI)

    async def extract_hook_from_thumbnail(self, thumbnail_url: str) -> Optional[str]:
        """
        Extract hook text from a thumbnail image using Gemini Vision.

        Args:
            thumbnail_url: URL of the thumbnail image

        Returns:
            Extracted hook text or None if extraction failed
        """
        client = self._get_client()
        if not client:
            return None

        try:
            # Download the image
            async with httpx.AsyncClient() as http_client:
                response = await http_client.get(thumbnail_url)
                if response.status_code != 200:
                    return None
                image_bytes = response.content

            # Call Gemini Vision
            result = client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    "What is the main text/headline that appears on this YouTube thumbnail? "
                    "Return ONLY the text, nothing else. If there's no text, return 'NO_TEXT'."
                ],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=100,
                )
            )

            text = result.text.strip()
            if text == "NO_TEXT" or not text:
                return None
            return text

        except Exception as e:
            print(f"Error extracting hook: {e}")
            return None

    async def fetch_channel_videos(self, channel_id: str, max_results: int = 50) -> list:
        """
        Fetch video IDs and thumbnails from a YouTube channel.

        Args:
            channel_id: YouTube channel ID
            max_results: Maximum number of videos to fetch

        Returns:
            List of {"video_id": "...", "thumbnail_url": "...", "title": "..."}
        """
        if not self.youtube_api_key:
            return []

        videos = []
        try:
            async with httpx.AsyncClient() as client:
                url = "https://www.googleapis.com/youtube/v3/search"
                params = {
                    "key": self.youtube_api_key,
                    "channelId": channel_id,
                    "part": "snippet",
                    "type": "video",
                    "maxResults": min(max_results, 50),
                    "order": "date"
                }
                response = await client.get(url, params=params)
                data = response.json()

                for item in data.get("items", []):
                    video_id = item["id"]["videoId"]
                    videos.append({
                        "video_id": video_id,
                        "thumbnail_url": f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg",
                        "title": item["snippet"]["title"]
                    })
        except Exception as e:
            print(f"Error fetching channel videos: {e}")

        return videos

    def _analyze_hooks(self, hooks: list) -> NichePatterns:
        """Analyze a list of hooks to extract patterns."""
        if not hooks:
            return NichePatterns(
                word_count={"avg": 3.0, "min": 1, "max": 5, "best_range": [2, 4]},
                capitalization="ALL_CAPS",
                power_words={},
                uses_numbers=0.0,
                emotional_tone=["general"]
            )

        word_counts = []
        all_words = []
        caps_count = 0
        number_count = 0

        for hook in hooks:
            words = hook.split()
            word_counts.append(len(words))
            all_words.extend([w.upper() for w in words])

            if hook.isupper():
                caps_count += 1
            if any(c.isdigit() for c in hook):
                number_count += 1

        # Calculate patterns
        avg_words = sum(word_counts) / len(word_counts)
        min_words = min(word_counts)
        max_words = max(word_counts)

        # Word frequency
        word_freq = {}
        for word in all_words:
            if len(word) >= 3:  # Skip short words
                word_freq[word] = word_freq.get(word, 0) + 1

        # Normalize and get top power words
        total = len(hooks)
        power_words = {w: round(c / total, 2) for w, c in sorted(word_freq.items(), key=lambda x: -x[1])[:20]}

        # Capitalization
        if caps_count / len(hooks) > 0.7:
            capitalization = "ALL_CAPS"
        elif caps_count / len(hooks) > 0.3:
            capitalization = "mixed"
        else:
            capitalization = "Title Case"

        return NichePatterns(
            word_count={
                "avg": round(avg_words, 1),
                "min": min_words,
                "max": max_words,
                "best_range": [max(1, int(avg_words) - 1), min(6, int(avg_words) + 1)]
            },
            capitalization=capitalization,
            power_words=power_words,
            uses_numbers=round(number_count / len(hooks), 2),
            emotional_tone=["general"]  # TODO: Analyze emotional tone
        )

    async def analyze_channel(self, channel_id: str, channel_name: str, max_videos: int = 50) -> dict:
        """
        Analyze a channel's thumbnails.

        Args:
            channel_id: YouTube channel ID
            channel_name: Channel name for display
            max_videos: Maximum videos to analyze

        Returns:
            Analysis result with extracted hooks and patterns
        """
        videos = await self.fetch_channel_videos(channel_id, max_videos)

        hooks = []
        for video in videos:
            hook = await self.extract_hook_from_thumbnail(video["thumbnail_url"])
            if hook:
                hooks.append(hook)
            await asyncio.sleep(0.1)  # Rate limiting

        patterns = self._analyze_hooks(hooks)

        return {
            "channel_name": channel_name,
            "channel_id": channel_id,
            "videos_analyzed": len(videos),
            "hooks_extracted": len(hooks),
            "hooks": hooks,
            "patterns": asdict(patterns)
        }

    def save_niche_profile(self, niche: str, profile: NicheProfile):
        """Save a niche profile to disk."""
        path = self.data_dir / f"{niche.lower().replace(' ', '-')}.json"
        with open(path, "w") as f:
            json.dump(asdict(profile), f, indent=2)

    def load_niche_profile(self, niche: str) -> Optional[dict]:
        """Load a niche profile from disk."""
        path = self.data_dir / f"{niche.lower().replace(' ', '-')}.json"
        if path.exists():
            with open(path) as f:
                return json.load(f)
        return None

    def list_niches(self) -> list:
        """List all available niche profiles."""
        niches = []
        for path in self.data_dir.glob("*.json"):
            if path.name != ".gitkeep":
                niches.append(path.stem.replace("-", " ").title())
        return niches


# Singleton instance
competitor_analyzer = CompetitorAnalyzer()
