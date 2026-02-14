"""
Safe console utilities for Windows compatibility
"""

import sys
import os
from rich.console import Console


def get_safe_console() -> Console:
    """
    Get a console instance that safely handles Unicode on Windows
    """
    # Force UTF-8 encoding on Windows
    if sys.platform == 'win32':
        # Try to set console to UTF-8
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except (AttributeError, OSError):
            # Python < 3.7 or reconfigure not available
            pass
    
    return Console(force_terminal=True, legacy_windows=False)


def safe_emoji(emoji: str, fallback: str = "") -> str:
    """
    Return emoji on UTF-8 systems, fallback on others
    """
    if sys.platform == 'win32':
        try:
            # Test if emoji can be encoded
            emoji.encode('cp1252')
            return emoji
        except UnicodeEncodeError:
            return fallback
    return emoji


# Common emoji replacements for Windows
EMOJI_MAP = {
    '📊': '[STATS]',
    '🔍': '[SEARCH]',
    '✅': '[OK]',
    '❌': '[ERROR]',
    '⚠️': '[WARN]',
    '🚀': '[DEPLOY]',
    '📦': '[PACKAGE]',
    '🔧': '[CONFIG]',
    '💡': '[TIP]',
    '🎯': '[TARGET]',
    '🌐': '[WEB]',
    '📝': '[NOTE]',
    '🔑': '[KEY]',
    '🤖': '[AI]',
    '📈': '[CHART]',
}


def replace_emojis(text: str) -> str:
    """
    Replace emojis with Windows-safe alternatives
    """
    if sys.platform == 'win32':
        for emoji, fallback in EMOJI_MAP.items():
            text = text.replace(emoji, fallback)
    return text
