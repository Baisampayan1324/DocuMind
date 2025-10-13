# backend/history_db.py
import sqlite3
import json
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime

from .config import Config

DB_PATH = Path(Config.HISTORY_DB_PATH)

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources TEXT,
    provider TEXT,
    duration_s REAL,
    status TEXT
);
"""

INSERT_SQL = """
INSERT INTO conversations (timestamp, question, answer, sources, provider, duration_s, status)
VALUES (?, ?, ?, ?, ?, ?, ?)
"""

SELECT_SQL = """
SELECT id, timestamp, question, answer, sources, provider, duration_s, status
FROM conversations
ORDER BY id DESC
LIMIT ?
"""

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    try:
        cur = con.cursor()
        cur.execute(CREATE_TABLE_SQL)
        con.commit()
    finally:
        con.close()

def save_entry(entry: Dict) -> Optional[int]:
    """
    entry keys: timestamp (ISO str), q, a, sources (list), provider, duration_s (float), status
    returns inserted row id or None on error
    """
    init_db()  # ensure DB exists
    con = sqlite3.connect(DB_PATH)
    try:
        cur = con.cursor()
        sources_json = json.dumps(entry.get("sources", []))
        cur.execute(INSERT_SQL, (
            entry.get("timestamp", datetime.utcnow().isoformat() + "Z"),
            entry.get("q", "")[:10000],
            entry.get("a", "")[:100000],  # cap to avoid extremely large inserts
            sources_json,
            entry.get("provider"),
            entry.get("duration_s"),
            entry.get("status", "ok")
        ))
        con.commit()
        return cur.lastrowid
    finally:
        con.close()

def list_entries(limit: int = 100) -> List[Dict]:
    init_db()
    con = sqlite3.connect(DB_PATH)
    try:
        cur = con.cursor()
        cur.execute(SELECT_SQL, (limit,))
        rows = cur.fetchall()
        out = []
        for r in rows:
            out.append({
                "id": r[0],
                "timestamp": r[1],
                "question": r[2],
                "answer": r[3],
                "sources": json.loads(r[4]) if r[4] else [],
                "provider": r[5],
                "duration_s": r[6],
                "status": r[7]
            })
        return out
    finally:
        con.close()
