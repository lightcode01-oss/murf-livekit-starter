"""CLI & API helper for Jana Seva Call Analytics operations."""

import argparse
import json
import sys
from pathlib import Path

# Add src to path
src_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(src_dir))

from memory.service import MemoryService  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Jana Seva Call Analytics API CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # Summary command
    subparsers.add_parser("summary", help="Get summary call metrics")

    # Recent list command
    recent_parser = subparsers.add_parser("recent", help="List recent call records")
    recent_parser.add_argument("--outcome", default="all", help="Outcome filter")
    recent_parser.add_argument("--channel", default="all", help="Channel filter")
    recent_parser.add_argument("--limit", type=int, default=50, help="Record limit")

    # Start call record
    start_parser = subparsers.add_parser("start", help="Start call record")
    start_parser.add_argument("--call-id", required=True, help="Call/Room ID")
    start_parser.add_argument("--channel", default="browser", help="Channel (browser or sip)")
    start_parser.add_argument("--language", default="English", help="Language")

    # Complete call record
    complete_parser = subparsers.add_parser("complete", help="Complete call record")
    complete_parser.add_argument("--call-id", required=True, help="Call/Room ID")
    complete_parser.add_argument("--outcome", required=True, help="Outcome (successful or failed)")
    complete_parser.add_argument("--reason", default="", help="Failure reason if failed")

    args = parser.parse_args()
    service = MemoryService()

    if args.command == "summary":
        summary = service.get_analytics_summary()
        print(json.dumps({"status": "success", "data": summary}))
    elif args.command == "recent":
        calls = service.get_calls(
            outcome=args.outcome, channel=args.channel, limit=args.limit
        )
        print(json.dumps({"status": "success", "data": calls}))
    elif args.command == "start":
        res = service.create_call_record(
            call_id=args.call_id, channel=args.channel, language=args.language
        )
        if res:
            print(json.dumps({"status": "success", "data": res}))
        else:
            print(json.dumps({"status": "error", "message": "Failed to create call record"}))
    elif args.command == "complete":
        reason = args.reason if args.reason else None
        success = service.update_call_record(
            call_id=args.call_id, outcome=args.outcome, failure_reason=reason
        )
        if success:
            record = service.get_call_by_id(args.call_id)
            print(json.dumps({"status": "success", "data": record}))
        else:
            print(json.dumps({"status": "error", "message": "Failed to complete call record"}))
    else:
        summary = service.get_analytics_summary()
        calls = service.get_calls(limit=10)
        print(json.dumps({"status": "success", "summary": summary, "data": calls}))


if __name__ == "__main__":
    main()
