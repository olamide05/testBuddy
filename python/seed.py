import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime
import re
from faker import Faker

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

# Reference to users collection
users_ref = db.collection('users')

# Initialize Faker for generating fake data
fake = Faker('en_IE')  # Irish locale

# PPSN Validation
def validate_ppsn(ppsn):
    """Validate Irish PPSN format: 7 digits + 1-2 letters"""
    pattern = r'^\d{7}[A-Z]{1,2}$'
    return re.match(pattern, ppsn.upper()) is not None

# Calculate age
def calculate_age(date_of_birth):
    """Calculate age from date of birth"""
    if not date_of_birth:
        return None
    today = datetime.today()
    age = today.year - date_of_birth.year
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        age -= 1
    return age

# Create user in Firebase Authentication and Firestore
def add_user_with_auth(user_data, password):
    """Create user in Firebase Auth and add to Firestore collection"""
    
    # Validate PPSN
    if not validate_ppsn(user_data.get('ppsn', '')):
        raise ValueError('Invalid PPSN format')
    
    try:
        # Create user in Firebase Authentication
        user_record = auth.create_user(
            email=user_data.get('email'),
            password=password,
            display_name=f"{user_data.get('firstName')} {user_data.get('lastName')}",
            email_verified=False
        )
        
        print(f'Created Firebase Auth user: {user_record.uid}')
        
        # Create user document in Firestore
        user_doc = {
            # Firebase Auth UID
            'uid': user_record.uid,
            
            # Personal Information
            'firstName': user_data.get('firstName', ''),
            'lastName': user_data.get('lastName', ''),
            'dateOfBirth': user_data.get('dateOfBirth'),
            'age': calculate_age(user_data.get('dateOfBirth')),
            'ppsn': user_data.get('ppsn', '').upper(),
            'email': user_data.get('email', '').lower(),
            'phone': user_data.get('phone', ''),
            
            # Address
            'address': {
                'street': user_data.get('street', ''),
                'city': user_data.get('city', ''),
                'county': user_data.get('county', ''),
                'eircode': user_data.get('eircode', '')
            },
            
            # Driving Preferences
            'transmissionPreference': user_data.get('transmissionPreference', 'manual'),
            'vehicleCategory': user_data.get('vehicleCategory', 'B'),
            
            # Theory Test
            'theoryTest': {
                'passed': user_data.get('theoryTestPassed', False),
                'passDate': user_data.get('theoryTestDate'),
                'certificateNumber': user_data.get('theoryCertNumber', ''),
                'expiryDate': user_data.get('theoryExpiry')
            },
            
            # Learner Permit
            'learnerPermit': {
                'hasPermit': user_data.get('hasPermit', False),
                'permitNumber': user_data.get('permitNumber', ''),
                'issueDate': user_data.get('permitIssueDate'),
                'expiryDate': user_data.get('permitExpiryDate'),
                'category': user_data.get('permitCategory', 'B')
            },
            
            # EDT Progress
            'edtProgress': {
                'lessonsCompleted': user_data.get('edtLessons', 0),
                'lessonsRemaining': 12 - user_data.get('edtLessons', 0),
                'instructorName': user_data.get('instructorName', ''),
                'completionDate': user_data.get('edtCompletion')
            },
            
            # Driving Test
            'drivingTest': {
                'eligible': user_data.get('testEligible', False),
                'booked': user_data.get('testBooked', False),
                'testDate': user_data.get('testDate'),
                'testCentre': user_data.get('testCentre', ''),
                'attempts': user_data.get('testAttempts', 0),
                'passed': user_data.get('testPassed', False)
            },
            
            # Medical Information
            'medicalInfo': {
                'eyesightReport': user_data.get('eyesightReport', False),
                'eyesightDate': user_data.get('eyesightDate'),
                'medicalReportRequired': user_data.get('medicalRequired', False),
                'medicalReportDate': user_data.get('medicalDate')
            },
            
            # Preferences
            'preferences': {
                'preferredInstructor': user_data.get('preferredInstructor', ''),
                'preferredLessonDays': user_data.get('lessonDays', []),
                'preferredTime': user_data.get('preferredTime', ''),
                'testCentrePreference': user_data.get('testCentrePref', [])
            },
            
            # Account Info
            'account': {
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
                'isActive': True,
                'subscriptionType': user_data.get('subscription', 'free'),
                'paymentStatus': user_data.get('paymentStatus', 'unpaid')
            },
            
            # Emergency Contact
            'emergencyContact': {
                'name': user_data.get('emergencyName', ''),
                'phone': user_data.get('emergencyPhone', ''),
                'relationship': user_data.get('emergencyRelationship', '')
            },
            
            'notes': user_data.get('notes', '')
        }
        
        # Use Firebase Auth UID as document ID
        users_ref.document(user_record.uid).set(user_doc)
        print(f'User added to Firestore with UID: {user_record.uid}')
        
        return user_record.uid
        
    except Exception as e:
        print(f'Error creating user: {e}')
        raise e

# Add user to Firestore only (no authentication)
def add_user(user_data):
    """Add a new user to the users collection (Firestore only)"""
    
    # Validate PPSN
    if not validate_ppsn(user_data.get('ppsn', '')):
        raise ValueError('Invalid PPSN format')
    
    # Create user document
    user_doc = {
        # Personal Information
        'firstName': user_data.get('firstName', ''),
        'lastName': user_data.get('lastName', ''),
        'dateOfBirth': user_data.get('dateOfBirth'),
        'age': calculate_age(user_data.get('dateOfBirth')),
        'ppsn': user_data.get('ppsn', '').upper(),
        'email': user_data.get('email', '').lower(),
        'phone': user_data.get('phone', ''),
        
        # Address
        'address': {
            'street': user_data.get('street', ''),
            'city': user_data.get('city', ''),
            'county': user_data.get('county', ''),
            'eircode': user_data.get('eircode', '')
        },
        
        # Driving Preferences
        'transmissionPreference': user_data.get('transmissionPreference', 'manual'),
        'vehicleCategory': user_data.get('vehicleCategory', 'B'),
        
        # Theory Test
        'theoryTest': {
            'passed': user_data.get('theoryTestPassed', False),
            'passDate': user_data.get('theoryTestDate'),
            'certificateNumber': user_data.get('theoryCertNumber', ''),
            'expiryDate': user_data.get('theoryExpiry')
        },
        
        # Learner Permit
        'learnerPermit': {
            'hasPermit': user_data.get('hasPermit', False),
            'permitNumber': user_data.get('permitNumber', ''),
            'issueDate': user_data.get('permitIssueDate'),
            'expiryDate': user_data.get('permitExpiryDate'),
            'category': user_data.get('permitCategory', 'B')
        },
        
        # EDT Progress
        'edtProgress': {
            'lessonsCompleted': user_data.get('edtLessons', 0),
            'lessonsRemaining': 12 - user_data.get('edtLessons', 0),
            'instructorName': user_data.get('instructorName', ''),
            'completionDate': user_data.get('edtCompletion')
        },
        
        # Driving Test
        'drivingTest': {
            'eligible': user_data.get('testEligible', False),
            'booked': user_data.get('testBooked', False),
            'testDate': user_data.get('testDate'),
            'testCentre': user_data.get('testCentre', ''),
            'attempts': user_data.get('testAttempts', 0),
            'passed': user_data.get('testPassed', False)
        },
        
        # Medical Information
        'medicalInfo': {
            'eyesightReport': user_data.get('eyesightReport', False),
            'eyesightDate': user_data.get('eyesightDate'),
            'medicalReportRequired': user_data.get('medicalRequired', False),
            'medicalReportDate': user_data.get('medicalDate')
        },
        
        # Preferences
        'preferences': {
            'preferredInstructor': user_data.get('preferredInstructor', ''),
            'preferredLessonDays': user_data.get('lessonDays', []),
            'preferredTime': user_data.get('preferredTime', ''),
            'testCentrePreference': user_data.get('testCentrePref', [])
        },
        
        # Account Info
        'account': {
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'isActive': True,
            'subscriptionType': user_data.get('subscription', 'free'),
            'paymentStatus': user_data.get('paymentStatus', 'unpaid')
        },
        
        # Emergency Contact
        'emergencyContact': {
            'name': user_data.get('emergencyName', ''),
            'phone': user_data.get('emergencyPhone', ''),
            'relationship': user_data.get('emergencyRelationship', '')
        },
        
        'notes': user_data.get('notes', '')
    }
    
    # Add document with auto-generated ID
    doc_ref = users_ref.add(user_doc)
    print(f'User added with ID: {doc_ref[1].id}')
    return doc_ref[1].id


# Get user by ID
def get_user(user_id):
    """Get user by document ID"""
    doc = users_ref.document(user_id).get()
    if doc.exists:
        return {'id': doc.id, **doc.to_dict()}
    return None


# Get user by PPSN
def get_user_by_ppsn(ppsn):
    """Get user by PPSN"""
    docs = users_ref.where('ppsn', '==', ppsn.upper()).limit(1).stream()
    for doc in docs:
        return {'id': doc.id, **doc.to_dict()}
    return None


# Get user by email
def get_user_by_email(email):
    """Get user by email"""
    docs = users_ref.where('email', '==', email.lower()).limit(1).stream()
    for doc in docs:
        return {'id': doc.id, **doc.to_dict()}
    return None


# Update user
def update_user(user_id, updates):
    """Update user document"""
    updates['account.updatedAt'] = firestore.SERVER_TIMESTAMP
    users_ref.document(user_id).update(updates)
    print(f'User {user_id} updated successfully')


# Get all users
def get_all_users():
    """Get all users"""
    docs = users_ref.stream()
    users = []
    for doc in docs:
        users.append({'id': doc.id, **doc.to_dict()})
    return users


# Get users by transmission preference
def get_users_by_transmission(transmission):
    """Get users by transmission preference"""
    docs = users_ref.where('transmissionPreference', '==', transmission).stream()
    users = []
    for doc in docs:
        users.append({'id': doc.id, **doc.to_dict()})
    return users


# Delete user
def delete_user(user_id):
    """Delete user document"""
    users_ref.document(user_id).delete()
    print(f'User {user_id} deleted')


# Example Usage - Create Multiple Fake Users
if __name__ == '__main__':
    
    # List of fake users to create
    fake_users = [
        {
            'firstName': 'Seán',
            'lastName': 'Murphy',
            'dateOfBirth': datetime(1999, 5, 15),
            'ppsn': '1234567TA',
            'email': 'sean.murphy@example.ie',
            'password': 'Password123!',
            'phone': '+353 87 123 4567',
            'street': '123 Main Street',
            'city': 'Cork',
            'county': 'Cork',
            'eircode': 'T12 AB34',
            'transmissionPreference': 'manual',
            'vehicleCategory': 'B',
            'theoryTestPassed': True,
            'theoryTestDate': datetime(2025, 8, 1),
            'theoryCertNumber': 'TT12345678',
            'hasPermit': True,
            'permitNumber': 'LP98765432',
            'permitIssueDate': datetime(2025, 9, 1),
            'edtLessons': 5,
            'instructorName': "John O'Connor",
            'lessonDays': ['Monday', 'Wednesday'],
            'preferredTime': 'evening',
            'subscription': 'premium',
            'emergencyName': 'Mary Murphy',
            'emergencyPhone': '+353 87 987 6543',
            'emergencyRelationship': 'Mother'
        },
        {
            'firstName': 'Aoife',
            'lastName': 'Kelly',
            'dateOfBirth': datetime(2002, 3, 22),
            'ppsn': '2345678AB',
            'email': 'aoife.kelly@example.ie',
            'password': 'SecurePass456!',
            'phone': '+353 86 234 5678',
            'street': '45 Grafton Street',
            'city': 'Dublin',
            'county': 'Dublin',
            'eircode': 'D02 X285',
            'transmissionPreference': 'automatic',
            'vehicleCategory': 'B',
            'theoryTestPassed': True,
            'theoryTestDate': datetime(2025, 7, 15),
            'theoryCertNumber': 'TT23456789',
            'hasPermit': True,
            'permitNumber': 'LP87654321',
            'permitIssueDate': datetime(2025, 8, 20),
            'edtLessons': 8,
            'instructorName': "Patrick Ryan",
            'lessonDays': ['Tuesday', 'Thursday'],
            'preferredTime': 'morning',
            'subscription': 'free',
            'emergencyName': 'Tom Kelly',
            'emergencyPhone': '+353 86 876 5432',
            'emergencyRelationship': 'Father'
        },
        {
            'firstName': 'Liam',
            'lastName': "O'Brien",
            'dateOfBirth': datetime(2001, 11, 8),
            'ppsn': '3456789BC',
            'email': 'liam.obrien@example.ie',
            'password': 'MyPass789!',
            'phone': '+353 85 345 6789',
            'street': '78 Patrick Street',
            'city': 'Limerick',
            'county': 'Limerick',
            'eircode': 'V94 E5A0',
            'transmissionPreference': 'manual',
            'vehicleCategory': 'B',
            'theoryTestPassed': False,
            'hasPermit': False,
            'edtLessons': 0,
            'lessonDays': ['Friday'],
            'preferredTime': 'afternoon',
            'subscription': 'free',
            'emergencyName': "Siobhan O'Brien",
            'emergencyPhone': '+353 85 765 4321',
            'emergencyRelationship': 'Mother'
        },
        {
            'firstName': 'Niamh',
            'lastName': 'Walsh',
            'dateOfBirth': datetime(2000, 7, 30),
            'ppsn': '4567890CD',
            'email': 'niamh.walsh@example.ie',
            'password': 'WalshPass321!',
            'phone': '+353 83 456 7890',
            'street': '12 Eyre Square',
            'city': 'Galway',
            'county': 'Galway',
            'eircode': 'H91 C2XH',
            'transmissionPreference': 'automatic',
            'vehicleCategory': 'B',
            'theoryTestPassed': True,
            'theoryTestDate': datetime(2025, 6, 10),
            'theoryCertNumber': 'TT34567890',
            'hasPermit': True,
            'permitNumber': 'LP76543210',
            'permitIssueDate': datetime(2025, 7, 5),
            'edtLessons': 12,
            'instructorName': "Declan Murphy",
            'testEligible': True,
            'testBooked': True,
            'testDate': datetime(2025, 11, 15),
            'testCentre': 'Galway',
            'lessonDays': ['Wednesday', 'Saturday'],
            'preferredTime': 'evening',
            'subscription': 'premium',
            'emergencyName': 'Kevin Walsh',
            'emergencyPhone': '+353 83 987 6543',
            'emergencyRelationship': 'Brother'
        },
        {
            'firstName': 'Cian',
            'lastName': 'Byrne',
            'dateOfBirth': datetime(2003, 1, 18),
            'ppsn': '5678901DE',
            'email': 'cian.byrne@example.ie',
            'password': 'ByrneTest456!',
            'phone': '+353 84 567 8901',
            'street': '34 North Main Street',
            'city': 'Waterford',
            'county': 'Waterford',
            'eircode': 'X91 PK36',
            'transmissionPreference': 'manual',
            'vehicleCategory': 'B',
            'theoryTestPassed': True,
            'theoryTestDate': datetime(2025, 9, 5),
            'theoryCertNumber': 'TT45678901',
            'hasPermit': True,
            'permitNumber': 'LP65432109',
            'permitIssueDate': datetime(2025, 10, 1),
            'edtLessons': 3,
            'instructorName': "Mary Collins",
            'lessonDays': ['Monday', 'Friday'],
            'preferredTime': 'morning',
            'subscription': 'free',
            'emergencyName': 'Sarah Byrne',
            'emergencyPhone': '+353 84 876 5432',
            'emergencyRelationship': 'Sister'
        }
    ]
    
    print("\n=== Creating Multiple Users with Authentication ===\n")
    
    # Create each user
    created_users = []
    for user_data in fake_users:
        try:
            password = user_data.pop('password')  # Remove password from user_data
            user_id = add_user_with_auth(user_data, password)
            created_users.append(user_id)
            print(f"✓ Successfully created: {user_data['firstName']} {user_data['lastName']}")
            print(f"  Email: {user_data['email']} | Password: {password}\n")
        except Exception as e:
            print(f"✗ Failed to create: {user_data['firstName']} {user_data['lastName']}")
            print(f"  Error: {e}\n")
    
    print(f"\n=== Summary ===")
    print(f"Total users created: {len(created_users)}")
    
    # Display all users
    print("\n=== All Users in Database ===\n")
    all_users = get_all_users()
    for user in all_users:
        print(f"- {user['firstName']} {user['lastName']} ({user['email']})")
        print(f"  UID: {user.get('uid', 'N/A')}")
        print(f"  Transmission: {user['transmissionPreference']}")
        print(f"  EDT Lessons: {user['edtProgress']['lessonsCompleted']}/12\n")
