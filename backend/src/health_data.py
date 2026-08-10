"""Health facility registry and geographical dataset for Jana Seva Dr. Swasthya Sathi agent."""

import logging
from typing import Any

logger = logging.getLogger("agent.health_data")

# Geographical coordinates for Indian districts for live weather & air quality API calls
DISTRICT_COORDINATES: dict[str, tuple[float, float]] = {
    "jaipur": (26.9124, 75.7873),
    "delhi": (28.6139, 77.2090),
    "new delhi": (28.6139, 77.2090),
    "lucknow": (26.8467, 80.9462),
    "patna": (25.5941, 85.1376),
    "bhopal": (23.2599, 77.4126),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "varanasi": (25.3176, 82.9739),
    "ranchi": (23.3441, 85.3096),
    "guwahati": (26.1445, 91.7362),
    "ahmedabad": (23.0225, 72.5714),
    "pune": (18.5204, 73.8567),
    "kolkata": (22.5726, 88.3639),
    "hyderabad": (17.3850, 78.4867),
}

# Cached fallback directory of official government health facilities across Indian districts
CACHED_HEALTH_FACILITIES: dict[str, list[dict[str, Any]]] = {
    "jaipur": [
        {
            "name": "Sangatpura Primary Health Centre (PHC)",
            "type": "Primary Health Centre (PHC)",
            "address": "Main Gram Panchayat Road, Sangatpura, Jaipur District",
            "distance": "1.8 km",
            "operating_hours": "8:00 AM - 4:00 PM",
            "contact": "+91 141 2234567",
            "services": [
                "Free OPD",
                "Routine Immunization",
                "Maternal Health",
                "Essential Medicines",
            ],
            "emergency_24x7": False,
        },
        {
            "name": "Chomu Community Health Centre (CHC)",
            "type": "Community Health Centre (CHC)",
            "address": "NH-52 Highway Junction, Chomu, Jaipur",
            "distance": "4.5 km",
            "operating_hours": "24 Hours Emergency",
            "contact": "+91 141 2789012",
            "services": [
                "24/7 Emergency",
                "Bed Inpatient Facility",
                "Lab Diagnostics",
                "Jan Aushadhi Store",
            ],
            "emergency_24x7": True,
        },
        {
            "name": "SMS District Civil Hospital",
            "type": "District Government Hospital",
            "address": "JLN Marg, Ashok Nagar, Jaipur",
            "distance": "8.2 km",
            "operating_hours": "24 Hours Emergency",
            "contact": "108 / +91 141 2560291",
            "services": [
                "Trauma & ICU",
                "Specialist Doctors",
                "Ayushman Bharat PM-JAY Desk",
                "Free Diagnostics",
            ],
            "emergency_24x7": True,
        },
        {
            "name": "Pradhan Mantri Jan Aushadhi Kendra #104",
            "type": "Jan Aushadhi Generic Chemist",
            "address": "Near Government Bus Stand, Station Road, Jaipur",
            "distance": "2.1 km",
            "operating_hours": "9:00 AM - 8:00 PM",
            "contact": "+91 98290 12345",
            "services": [
                "Up to 90% Generic Medicine Discount",
                "Essential Antibiotics",
                "Diabetes Care Kit",
            ],
            "emergency_24x7": False,
        },
    ],
    "delhi": [
        {
            "name": "Mehrauli Primary Health Centre (PHC)",
            "type": "Primary Health Centre (PHC)",
            "address": "Kalka Das Marg, Mehrauli, South Delhi",
            "distance": "1.2 km",
            "operating_hours": "8:00 AM - 3:00 PM",
            "contact": "+91 11 2664 1234",
            "services": [
                "Free Consultation",
                "Child Immunization",
                "Free Hemoglobin Test",
            ],
            "emergency_24x7": False,
        },
        {
            "name": "Safdarjung Hospital & Emergency Care",
            "type": "Central Government Super Specialty Hospital",
            "address": "Ring Road, Opposite AIIMS, New Delhi",
            "distance": "5.6 km",
            "operating_hours": "24 Hours Emergency",
            "contact": "108 / +91 11 2616 5060",
            "services": [
                "24/7 Emergency & Casualty",
                "Ayushman Bharat Helpdesk",
                "Blood Bank",
                "Multi-Specialty",
            ],
            "emergency_24x7": True,
        },
        {
            "name": "Jan Aushadhi Generic Chemist Counter",
            "type": "Jan Aushadhi Generic Chemist",
            "address": "Gate No. 2, District Health Complex, Green Park, Delhi",
            "distance": "3.0 km",
            "operating_hours": "9:00 AM - 9:00 PM",
            "contact": "+91 98110 54321",
            "services": ["Affordable Generic Medicines", "BP & Sugar Check"],
            "emergency_24x7": False,
        },
    ],
    "lucknow": [
        {
            "name": "Chinhat Primary Health Centre (PHC)",
            "type": "Primary Health Centre (PHC)",
            "address": "Faizabad Road, Chinhat, Lucknow",
            "distance": "2.0 km",
            "operating_hours": "8:00 AM - 4:00 PM",
            "contact": "+91 522 2720100",
            "services": ["Free Doctor Consultation", "ANC/PNC Clinic", "Vaccination"],
            "emergency_24x7": False,
        },
        {
            "name": "Dr. Ram Manohar Lohia Institute CHC & Hospital",
            "type": "District Government Hospital",
            "address": "Vibhuti Khand, Gomti Nagar, Lucknow",
            "distance": "6.1 km",
            "operating_hours": "24 Hours Emergency",
            "contact": "108 / +91 522 6692000",
            "services": [
                "24/7 Ambulance",
                "Emergency Trauma",
                "ICU",
                "Ayushman PM-JAY Helpdesk",
            ],
            "emergency_24x7": True,
        },
    ],
    "patna": [
        {
            "name": "Danapur Primary Health Centre (PHC)",
            "type": "Primary Health Centre (PHC)",
            "address": "Main Cantt Road, Danapur, Patna",
            "distance": "1.5 km",
            "operating_hours": "8:30 AM - 3:30 PM",
            "contact": "+91 612 2210987",
            "services": [
                "General OPD",
                "Child Immunization",
                "Janani Suraksha Yojana Desk",
            ],
            "emergency_24x7": False,
        },
        {
            "name": "PMCH District Medical Hospital",
            "type": "District Government Hospital",
            "address": "Ashok Rajpath, Mahendru, Patna",
            "distance": "5.0 km",
            "operating_hours": "24 Hours Emergency",
            "contact": "108 / +91 612 2300080",
            "services": [
                "Emergency Services",
                "Free Surgery & Medicine",
                "Maternal Care Unit",
            ],
            "emergency_24x7": True,
        },
    ],
    "bhopal": [
        {
            "name": "Bairagarh Primary Health Centre (PHC)",
            "type": "Primary Health Centre (PHC)",
            "address": "BRTS Corridor, Bairagarh, Bhopal",
            "distance": "2.3 km",
            "operating_hours": "8:00 AM - 4:00 PM",
            "contact": "+91 755 2640112",
            "services": ["Primary Care", "Maternal Health", "TB Screening"],
            "emergency_24x7": False,
        },
        {
            "name": "JP District Civil Hospital",
            "type": "District Government Hospital",
            "address": "1226, 1226, Link Road 1, 1226, Tulsi Nagar, Bhopal",
            "distance": "4.8 km",
            "operating_hours": "24 Hours Emergency",
            "contact": "108 / +91 755 2555900",
            "services": ["24/7 Emergency", "Free Medicine Counter", "Dialysis Unit"],
            "emergency_24x7": True,
        },
    ],
}

DEFAULT_HEALTH_FACILITIES: list[dict[str, Any]] = [
    {
        "name": "Central District Primary Health Centre (PHC)",
        "type": "Primary Health Centre (PHC)",
        "address": "Main Gram Panchayat Administrative Block",
        "distance": "2.5 km",
        "operating_hours": "8:00 AM - 4:00 PM",
        "contact": "108 / Local ASHA Helpline",
        "services": [
            "Free OPD Consultation",
            "Routine Child Immunization",
            "Essential Medicines",
        ],
        "emergency_24x7": False,
    },
    {
        "name": "Community Health Centre (CHC) & Emergency Hospital",
        "type": "Community Health Centre (CHC)",
        "address": "District Civil Hospital Complex",
        "distance": "5.0 km",
        "operating_hours": "24 Hours Emergency",
        "contact": "108 Emergency Ambulance",
        "services": [
            "24/7 Emergency Care",
            "Inpatient Beds",
            "Free Diagnostics",
            "Jan Aushadhi Chemist",
        ],
        "emergency_24x7": True,
    },
]


def get_district_coords(district: str) -> tuple[float, float]:
    """Get latitude and longitude for an Indian district name. Defaults to Jaipur if unknown."""
    d_clean = district.strip().lower()
    return DISTRICT_COORDINATES.get(d_clean, (26.9124, 75.7873))


def get_cached_facilities(
    district: str, facility_type: str = "all"
) -> list[dict[str, Any]]:
    """Retrieve cached health facility details for a given district and facility type."""
    d_clean = district.strip().lower()
    facilities = CACHED_HEALTH_FACILITIES.get(d_clean, DEFAULT_HEALTH_FACILITIES)

    if facility_type == "all" or not facility_type:
        return facilities

    ft_clean = facility_type.strip().lower()
    filtered = [
        f
        for f in facilities
        if ft_clean in f["type"].lower() or ft_clean in f["name"].lower()
    ]
    return filtered if filtered else facilities
