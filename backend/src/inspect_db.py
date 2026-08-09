"""Utility to inspect SQLite caller records directly."""

import json

from memory.database import Database


def inspect_database():
    db = Database()
    print("\n=================== JANA SEVA CALLER MEMORY DB ===================")
    try:
        with db._get_connection() as conn:
            cursor = conn.execute(
                "SELECT user_id, name, language_preference, facts_json, last_interaction, created_at, updated_at FROM users"
            )
            rows = cursor.fetchall()
            if not rows:
                print("No caller records found in database.")
            else:
                for r in rows:
                    facts = json.loads(r["facts_json"]) if r["facts_json"] else {}
                    print(f"User ID            : {r['user_id']}")
                    print(f"Name               : {r['name']}")
                    print(f"Language Preference: {r['language_preference']}")
                    print(f"Facts              : {facts}")
                    print(f"Last Interaction   : {r['last_interaction']}")
                    print(
                        "------------------------------------------------------------------"
                    )
    except Exception as e:
        print(f"Error reading database: {e}")
    print("==================================================================\n")


if __name__ == "__main__":
    inspect_database()
