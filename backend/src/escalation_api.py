"""CLI & API helper for Jana Seva Escalation operations."""

import argparse
import json
import sys
from pathlib import Path

# Add src to path
src_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(src_dir))

from memory.service import MemoryService  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Jana Seva Escalation API CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # List command
    list_parser = subparsers.add_parser("list", help="List escalations")
    list_parser.add_argument("--urgency", default="all", help="Urgency filter")
    list_parser.add_argument("--status", default="all", help="Status filter")
    list_parser.add_argument("--search", default="", help="Search query")

    # Get command
    get_parser = subparsers.add_parser("get", help="Get single escalation")
    get_parser.add_argument("--ref", required=True, help="Reference ID")

    # Update command
    update_parser = subparsers.add_parser("update", help="Update escalation status")
    update_parser.add_argument("--ref", required=True, help="Reference ID")
    update_parser.add_argument(
        "--status",
        required=True,
        help="New status (open, in_progress, resolved)",
    )

    # Seed command
    subparsers.add_parser("seed", help="Seed sample escalations for demonstration")

    args = parser.parse_args()
    service = MemoryService()

    if args.command == "list":
        records = service.get_escalations(
            urgency=args.urgency, status=args.status, search=args.search
        )
        print(json.dumps({"status": "success", "data": records}))
    elif args.command == "get":
        record = service.get_escalation_by_ref(args.ref)
        if record:
            print(json.dumps({"status": "success", "data": record}))
        else:
            print(
                json.dumps(
                    {"status": "error", "message": f"Escalation {args.ref} not found"}
                )
            )
    elif args.command == "update":
        success = service.update_escalation_status(args.ref, args.status)
        if success:
            updated = service.get_escalation_by_ref(args.ref)
            print(json.dumps({"status": "success", "data": updated}))
        else:
            print(
                json.dumps(
                    {
                        "status": "error",
                        "message": f"Failed to update status for {args.ref}",
                    }
                )
            )
    elif args.command == "seed":
        seeded = service.seed_demo_escalations()
        all_recs = service.get_escalations()
        print(
            json.dumps({"status": "success", "seeded": len(seeded), "data": all_recs})
        )
    else:
        all_recs = service.get_escalations()
        print(json.dumps({"status": "success", "data": all_recs}))


if __name__ == "__main__":
    main()
