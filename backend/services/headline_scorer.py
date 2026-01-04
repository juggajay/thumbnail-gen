"""
Headline Scorer Service

Scores YouTube thumbnail hook text based on research-backed rules.
Uses the same knowledge base as the thumbnail analyzer.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class HeadlineScore:
    """Result of scoring a headline."""
    overall_score: int  # 0-100
    length_score: int
    readability_score: int
    power_words_score: int
    issues: list[str]
    suggestions: list[str]


# Research-backed rules (from MrBeast, VidIQ data)
OPTIMAL_WORD_COUNT = (2, 4)
MAX_WORD_COUNT = 5
MIN_CHARS_PER_WORD = 2  # Avoid single-letter words
MAX_CHARS_FOR_MOBILE = 25  # Rough limit for mobile readability

# Universal power words that drive CTR
POWER_WORDS = {
    "urgency": ["NOW", "JUST", "BREAKING", "URGENT", "FINALLY", "NEW"],
    "danger": ["CRITICAL", "WARNING", "STOP", "NEVER", "DANGER", "ALERT"],
    "curiosity": ["SECRET", "HIDDEN", "TRUTH", "REVEALED", "WHY", "HOW"],
    "shock": ["INSANE", "SHOCKING", "WTF", "UNBELIEVABLE", "CRAZY", "EXPOSED"],
    "value": ["FREE", "EASY", "FAST", "SIMPLE", "BEST", "ULTIMATE"],
    "action": ["HACK", "EXPLOIT", "ATTACK", "DESTROY", "FOUND", "DISCOVERED"],
}

ALL_POWER_WORDS = set()
for words in POWER_WORDS.values():
    ALL_POWER_WORDS.update(words)


class HeadlineScorer:
    """Scores hook text based on research-backed rules."""

    def score(self, text: str, niche_profile: Optional[dict] = None) -> HeadlineScore:
        """
        Score a hook text.

        Args:
            text: The hook/headline text
            niche_profile: Optional niche-specific patterns from competitor analysis

        Returns:
            HeadlineScore with overall score, dimension scores, issues, and suggestions
        """
        text = text.strip()
        if not text:
            return HeadlineScore(
                overall_score=0,
                length_score=0,
                readability_score=0,
                power_words_score=0,
                issues=["No text provided"],
                suggestions=["Enter a hook to get feedback"]
            )

        words = text.split()
        word_count = len(words)
        char_count = len(text)
        upper_text = text.upper()

        issues = []
        suggestions = []

        # --- Length Score (30%) ---
        if word_count < OPTIMAL_WORD_COUNT[0]:
            length_score = 70  # Too short
            issues.append(f"Very short ({word_count} word{'s' if word_count != 1 else ''}) — consider adding impact")
        elif word_count <= OPTIMAL_WORD_COUNT[1]:
            length_score = 100  # Perfect
        elif word_count <= MAX_WORD_COUNT:
            length_score = 80  # Acceptable
            issues.append(f"Slightly long ({word_count} words) — top performers use 2-4 words")
        else:
            length_score = max(20, 100 - (word_count - MAX_WORD_COUNT) * 15)
            issues.append(f"Too long ({word_count} words) — aim for 3-4 words max")
            # Suggest shorter version
            if word_count > 4:
                short_version = " ".join(words[:4])
                suggestions.append(f'Try: "{short_version}"')

        # --- Readability Score (25%) ---
        if char_count <= MAX_CHARS_FOR_MOBILE:
            readability_score = 100
        elif char_count <= 35:
            readability_score = 75
            issues.append("May be hard to read on mobile")
        else:
            readability_score = max(20, 100 - (char_count - MAX_CHARS_FOR_MOBILE) * 2)
            issues.append("Too long for mobile — text will be very small")

        # Check for all caps (generally good for thumbnails)
        if text.isupper():
            pass  # Good
        elif text == text.title():
            suggestions.append("Consider ALL CAPS for more impact")
        else:
            suggestions.append("Try ALL CAPS — it's standard for thumbnails")

        # --- Power Words Score (25%) ---
        found_power_words = []
        for word in words:
            if word.upper() in ALL_POWER_WORDS:
                found_power_words.append(word.upper())

        if len(found_power_words) >= 2:
            power_words_score = 100
        elif len(found_power_words) == 1:
            power_words_score = 80
        else:
            power_words_score = 40
            # Suggest power words based on context
            if any(w in upper_text for w in ["BUG", "VULN", "CVE", "RCE", "XSS"]):
                suggestions.append('Add urgency: "CRITICAL" or "WARNING"')
            else:
                suggestions.append('Add impact: "CRITICAL", "INSANE", or "STOP"')

        if found_power_words:
            pass  # Will show as positive in UI
        else:
            issues.append("No power words — add urgency or emotion")

        # --- Niche-specific scoring (if profile provided) ---
        niche_bonus = 0
        if niche_profile and "patterns" in niche_profile:
            patterns = niche_profile["patterns"]
            niche_power_words = patterns.get("power_words", {})

            for word in words:
                if word.upper() in niche_power_words:
                    niche_bonus += 5  # Bonus for using niche-specific words

            # Check if word count matches niche patterns
            niche_word_range = patterns.get("word_count", {}).get("best_range", [2, 4])
            if niche_word_range[0] <= word_count <= niche_word_range[1]:
                niche_bonus += 5

        # --- Calculate Overall Score ---
        base_score = (
            length_score * 0.30 +
            readability_score * 0.25 +
            power_words_score * 0.25 +
            50 * 0.20  # Placeholder for emotional pull
        )

        overall_score = min(100, int(base_score + niche_bonus))

        return HeadlineScore(
            overall_score=overall_score,
            length_score=length_score,
            readability_score=readability_score,
            power_words_score=power_words_score,
            issues=issues,
            suggestions=suggestions[:3]  # Limit to 3 suggestions
        )


# Singleton instance
headline_scorer = HeadlineScorer()
