"""Migration versions package.

Each migration file should:
- Be named with pattern: m001_description.py, m002_description.py, etc.
- Export NAME: str - Unique migration identifier
- Export up(adapter): async function - Migration logic
"""
