import firebase_admin
from firebase_admin import credentials, firestore
import random
from datetime import date, timedelta

# --- IMPORTANT ---
# 1. Make sure 'pip install firebase-admin' has been run.
# 2. Ensure 'serviceAccountKey.json' is in the same directory as this script.
# -----------------

try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"❌ Error initializing Firebase Admin SDK: {e}")
    print("Please ensure your 'serviceAccountKey.json' file is correct and in the same directory.")
    exit()

# --- Expanded Seed Data for 30 Instructors ---
instructors_seed_data = [
    # (The original 12 instructors)
    {"name": "John Kavanagh", "imageUrl": "https://i.pravatar.cc/150?img=1", "rating": 4.9, "reviews": 125, "bio": "Over 15 years of experience, specializing in nervous beginners in South Dublin.", "areas": ["South Dublin", "City Centre"], "qualifications": ["Garda Vetted", "Manual & Automatic"], "passRate": 92},
    {"name": "Aoife Murphy", "imageUrl": "https://i.pravatar.cc/150?img=2", "rating": 5.0, "reviews": 98, "bio": "Friendly approach with a high pass rate. Offers lessons in both manual and automatic cars.", "areas": ["North Dublin", "Malahide"], "qualifications": ["Garda Vetted", "Automatic Specialist"], "passRate": 95},
    {"name": "Ciara O'Brien", "imageUrl": "https://i.pravatar.cc/150?img=3", "rating": 4.8, "reviews": 210, "bio": "Specializing in pre-test preparation and mock tests in Cork.", "areas": ["Cork City", "Ballincollig"], "qualifications": ["Garda Vetted", "Pre-Test Expert"], "passRate": 90},
    {"name": "Liam Walsh", "imageUrl": "https://i.pravatar.cc/150?img=4", "rating": 4.7, "reviews": 85, "bio": "A calm and reassuring instructor, perfect for building confidence. Based in Galway.", "areas": ["Galway City", "Salthill"], "qualifications": ["Garda Vetted"], "passRate": 88},
    {"name": "Siobhan Kelly", "imageUrl": "https://i.pravatar.cc/150?img=5", "rating": 4.9, "reviews": 150, "bio": "Structured lesson plans ensure you cover all aspects of the curriculum efficiently. Limerick specialist.", "areas": ["Limerick City", "Raheen"], "qualifications": ["Garda Vetted", "EDT Specialist"], "passRate": 93},
    {"name": "Paddy O'Connor", "imageUrl": "https://i.pravatar.cc/150?img=6", "rating": 4.6, "reviews": 72, "bio": "Focusing on defensive driving techniques in the Waterford area.", "areas": ["Waterford City", "Tramore"], "qualifications": ["Garda Vetted"], "passRate": 85},
    {"name": "Niamh Doyle", "imageUrl": "https://i.pravatar.cc/150?img=7", "rating": 5.0, "reviews": 112, "bio": "Expert in navigating Dublin's city centre traffic and complex junctions.", "areas": ["City Centre", "Dublin 2"], "qualifications": ["Garda Vetted", "Advanced Driving Instructor"], "passRate": 96},
    {"name": "Sean Ryan", "imageUrl": "https://i.pravatar.cc/150?img=8", "rating": 4.8, "reviews": 180, "bio": "Offers intensive courses to get you test-ready in a short time. Based in Kildare.", "areas": ["Naas", "Newbridge"], "qualifications": ["Garda Vetted", "Intensive Course Specialist"], "passRate": 91},
    {"name": "Fionnuala Byrne", "imageUrl": "https://i.pravatar.cc/150?img=9", "rating": 4.9, "reviews": 95, "bio": "With a background in teaching, Fionnuala excels at explaining complex maneuvers. Wicklow coverage.", "areas": ["Bray", "Greystones"], "qualifications": ["Garda Vetted"], "passRate": 94},
    {"name": "Conor McCarthy", "imageUrl": "https://i.pravatar.cc/150?img=10", "rating": 4.7, "reviews": 130, "bio": "Focus on hazard perception and awareness in busy areas. Dún Laoghaire expert.", "areas": ["Dún Laoghaire", "Blackrock"], "qualifications": ["Garda Vetted"], "passRate": 89},
    {"name": "Eoin Gallagher", "imageUrl": "https://i.pravatar.cc/150?img=11", "rating": 4.8, "reviews": 90, "bio": "Specializes in motorway driving and building confidence at high speeds. Covers M50 corridor.", "areas": ["M50", "Lucan", "Tallaght"], "qualifications": ["Garda Vetted", "Motorway Specialist"], "passRate": 92},
    {"name": "Maeve Sullivan", "imageUrl": "https://i.pravatar.cc/150?img=12", "rating": 4.9, "reviews": 160, "bio": "Patient and friendly demeanor, a favorite among first-time drivers. Based in Drogheda.", "areas": ["Drogheda", "Dundalk"], "qualifications": ["Garda Vetted"], "passRate": 93},
    # (New 18 instructors)
    {"name": "Aidan Lynch", "imageUrl": "https://i.pravatar.cc/150?img=13", "rating": 4.8, "reviews": 115, "bio": "Aidan focuses on rural road safety and techniques for country driving. Based in Co. Clare.", "areas": ["Ennis", "Shannon"], "qualifications": ["Garda Vetted", "Rural Driving"], "passRate": 89},
    {"name": "Orlaith Brennan", "imageUrl": "https://i.pravatar.cc/150?img=14", "rating": 4.9, "reviews": 140, "bio": "Orlaith is an expert in electric vehicle (EV) instruction and regenerative braking techniques.", "areas": ["Dublin 15", "Blanchardstown"], "qualifications": ["Garda Vetted", "EV Certified"], "passRate": 94},
    {"name": "Diarmuid Casey", "imageUrl": "https://i.pravatar.cc/150?img=15", "rating": 4.6, "reviews": 88, "bio": "Specializing in older drivers and refresher courses. Diarmuid serves the greater Belfast area.", "areas": ["Belfast", "Lisburn"], "qualifications": ["Garda Vetted", "Refresher Courses"], "passRate": 87},
    {"name": "Roisin Fitzgerald", "imageUrl": "https://i.pravatar.cc/150?img=16", "rating": 5.0, "reviews": 195, "bio": "Known for her 'first-time pass' guarantee, Roisin's methods are highly effective. Kerry.", "areas": ["Tralee", "Killarney"], "qualifications": ["Garda Vetted", "First Time Pass"], "passRate": 98},
    {"name": "Tadhg Nolan", "imageUrl": "https://i.pravatar.cc/150?img=17", "rating": 4.7, "reviews": 105, "bio": "Tadhg makes learning to drive fun and engaging, with a focus on positive reinforcement.", "areas": ["Sligo", "Letterkenny"], "qualifications": ["Garda Vetted"], "passRate": 90},
    {"name": "Grainne Healy", "imageUrl": "https://i.pravatar.cc/150?img=18", "rating": 4.8, "reviews": 122, "bio": "Grainne provides specialized training for drivers with disabilities. Fully adapted vehicle available.", "areas": ["Athlone", "Mullingar"], "qualifications": ["Garda Vetted", "Disability Specialist"], "passRate": 91},
    {"name": "Cian Connolly", "imageUrl": "https://i.pravatar.cc/150?img=19", "rating": 4.9, "reviews": 155, "bio": "Former motorsport competitor, Cian teaches advanced car control and skid prevention.", "areas": ["Mondello Park", "Kildare"], "qualifications": ["Garda Vetted", "Advanced Car Control"], "passRate": 93},
    {"name": "Saoirse Daly", "imageUrl": "https://i.pravatar.cc/150?img=20", "rating": 4.8, "reviews": 135, "bio": "Saoirse's calm presence helps even the most anxious learners feel at ease behind the wheel.", "areas": ["Wexford", "Enniscorthy"], "qualifications": ["Garda Vetted", "Anxious Drivers"], "passRate": 92},
    {"name": "Ronan Quinn", "imageUrl": "https://i.pravatar.cc/150?img=21", "rating": 4.7, "reviews": 110, "bio": "An expert in the rules of the road, Ronan ensures you know the theory inside and out.", "areas": ["Carlow", "Kilkenny"], "qualifications": ["Garda Vetted", "Theory Test Expert"], "passRate": 89},
    {"name": "Deirdre Power", "imageUrl": "https://i.pravatar.cc/150?img=22", "rating": 4.9, "reviews": 170, "bio": "Deirdre focuses on eco-driving techniques to help you save fuel and drive efficiently.", "areas": ["Clonmel", "Thurles"], "qualifications": ["Garda Vetted", "Eco-Driving"], "passRate": 94},
    {"name": "Barry Dunne", "imageUrl": "https://i.pravatar.cc/150?img=23", "rating": 4.6, "reviews": 80, "bio": "No-nonsense, direct instruction to get you passed quickly. Ideal for confident learners.", "areas": ["Navan", "Trim"], "qualifications": ["Garda Vetted"], "passRate": 86},
    {"name": "Emer Hayes", "imageUrl": "https://i.pravatar.cc/150?img=24", "rating": 5.0, "reviews": 200, "bio": "Emer has a perfect 5-star rating for a reason. Her students rave about her teaching style.", "areas": ["Swords", "Dublin Airport"], "qualifications": ["Garda Vetted", "Top Rated"], "passRate": 99},
    {"name": "Finnian Joyce", "imageUrl": "https://i.pravatar.cc/150?img=25", "rating": 4.8, "reviews": 145, "bio": "Specializing in night driving and adverse weather conditions.", "areas": ["Donegal", "Ballyshannon"], "qualifications": ["Garda Vetted", "Night Driving"], "passRate": 91},
    {"name": "Clodagh Egan", "imageUrl": "https://i.pravatar.cc/150?img=26", "rating": 4.7, "reviews": 99, "bio": "Clodagh offers lessons in Irish and English. Fáilte roimh chách!", "areas": ["Connemara", "Spiddal"], "qualifications": ["Garda Vetted", "As Gaeilge"], "passRate": 90},
    {"name": "Cathal Maguire", "imageUrl": "https://i.pravatar.cc/150?img=27", "rating": 4.9, "reviews": 165, "bio": "Cathal's technical knowledge of car mechanics helps learners understand the vehicle better.", "areas": ["Limerick", "Shannon"], "qualifications": ["Garda Vetted", "Mechanics"], "passRate": 93},
    {"name": "Sinead Hogan", "imageUrl": "https://i.pravatar.cc/150?img=28", "rating": 4.8, "reviews": 128, "bio": "Specialist in test routes for the Finglas and Raheny test centres.", "areas": ["Finglas", "Raheny", "Artane"], "qualifications": ["Garda Vetted", "Test Route Expert"], "passRate": 95},
    {"name": "Darragh Walsh", "imageUrl": "https://i.pravatar.cc/150?img=29", "rating": 4.7, "reviews": 118, "bio": "Darragh's lessons are perfect for students and young drivers in the Maynooth area.", "areas": ["Maynooth", "Leixlip", "Celbridge"], "qualifications": ["Garda Vetted", "Student Deals"], "passRate": 89},
    {"name": "Aisling Brady", "imageUrl": "https://i.pravatar.cc/150?img=30", "rating": 5.0, "reviews": 220, "bio": "One of the most sought-after instructors in Dublin, with a long waiting list but guaranteed results.", "areas": ["Rathmines", "Ranelagh", "Terenure"], "qualifications": ["Garda Vetted", "Premium Instructor"], "passRate": 97},
]

# This function generates some random availability slots
def generate_availability():
  slots = []
  today = date.today()
  for i in range(1, 8):
    future_date = today + timedelta(days=i)
    date_str = future_date.strftime("%Y-%m-%d")
    slots.append({ "date": date_str, "time": "10:00 - 12:00", "free": random.choice([True, False]) })
    slots.append({ "date": date_str, "time": "14:00 - 16:00", "free": random.choice([True, False]) })
  return slots

# The main upload function
def upload_data():
  batch = db.batch()
  print("Starting upload of 30 instructors...")

  for instructor_data in instructors_seed_data:
    instructor_ref = db.collection('instructorInfo').document()
    batch.set(instructor_ref, instructor_data)
    
    availability_slots = generate_availability()
    for slot in availability_slots:
      availability_ref = instructor_ref.collection('availability').document()
      batch.set(availability_ref, slot)
    
    print(f"  - Preparing {instructor_data['name']} for upload...")

  try:
    batch.commit()
    print("\n✅ Successfully uploaded all 30 instructors and their availability!")
  except Exception as e:
    print(f"❌ Error uploading data: {e}")

# --- Run the upload script ---
if __name__ == "__main__":
  upload_data()
