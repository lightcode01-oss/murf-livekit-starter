import asyncio
import os

from dotenv import load_dotenv
from livekit import api
from twilio.rest import Client

load_dotenv(".env.local", override=True)

TO_NUMBER = "+919437641070"
FROM_NUMBER = os.environ["TWILIO_PHONE_NUMBER"]


async def main():
    lkapi = api.LiveKitAPI(
        url=os.environ["LIVEKIT_URL"],
        api_key=os.environ["LIVEKIT_API_KEY"],
        api_secret=os.environ["LIVEKIT_API_SECRET"],
    )

    room_name = "jana-seva-day6-outbound"

    try:
        print("1. Creating LiveKit Twilio Connector session...")

        response = await lkapi.connector.connect_twilio_call(
            api.ConnectTwilioCallRequest(
                twilio_call_direction=(
                    api.ConnectTwilioCallRequest.TWILIO_CALL_DIRECTION_OUTBOUND
                ),
                room_name=room_name,
                destination_country="IN",
                participant_identity="day6-caller",
                participant_name="Jana Seva Caller",
                agents=[
                    api.RoomAgentDispatch(
                        agent_name="my-agent",
                    )
                ],
            )
        )

        print("2. LiveKit connector created")
        print("3. Connect URL received")
        print(f"Connect URL: {response.connect_url}")

        # IMPORTANT:
        # LiveKit's connector returns the URL Twilio must request.
        twiml_url = response.connect_url.replace("wss://", "https://", 1)

        print(f"4. TwiML URL: {twiml_url}")
        print("5. Creating Twilio call...")

        twilio_client = Client(
            os.environ["TWILIO_ACCOUNT_SID"].strip(),
            os.environ["TWILIO_AUTH_TOKEN"].strip(),
        )

        call = twilio_client.calls.create(
            to=TO_NUMBER,
            from_=FROM_NUMBER,
            url=twiml_url,
        )

        print()
        print("========================================")
        print("JANA SEVA OUTBOUND CALL STARTED")
        print("========================================")
        print(f"Call SID: {call.sid}")
        print(f"From: {FROM_NUMBER}")
        print(f"To: {TO_NUMBER}")
        print(f"Room: {room_name}")
        print(f"Status: {call.status}")
        print("========================================")
        print()
        print("Answer your phone.")
        print("The Jana Seva agent should join the call.")

    finally:
        await lkapi.aclose()


if __name__ == "__main__":
    asyncio.run(main())
