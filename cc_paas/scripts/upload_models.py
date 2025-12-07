"""
Upload ML models to Firebase Cloud Storage
Run this script once to upload your trained models before deploying Cloud Functions
"""

import os
import sys
from pathlib import Path
from firebase_admin import credentials, initialize_app, storage

# Configuration
PROJECT_ID = "text-cat-feedback"  # Update with your Firebase project ID
BUCKET_NAME = f"{PROJECT_ID}.appspot.com"
SERVICE_ACCOUNT_KEY = "serviceAccountKey.json"

# Model files to upload
MODEL_FILES = {
    "textcat_model.pkl": "models/textcat_model.pkl",
    "tfidf_vectorizer.pkl": "models/tfidf_vectorizer.pkl"
}


def upload_models():
    """Upload ML models to Cloud Storage"""
    
    print("🚀 Starting model upload to Cloud Storage...")
    print(f"📦 Bucket: {BUCKET_NAME}")
    print("-" * 60)
    
    # Check if service account key exists
    if not os.path.exists(SERVICE_ACCOUNT_KEY):
        print(f"❌ Error: Service account key '{SERVICE_ACCOUNT_KEY}' not found!")
        print("   Please download it from Firebase Console > Project Settings > Service Accounts")
        sys.exit(1)
    
    # Initialize Firebase Admin
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
        initialize_app(cred, {'storageBucket': BUCKET_NAME})
        print("✅ Firebase Admin initialized")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")
        sys.exit(1)
    
    # Get storage bucket
    try:
        bucket = storage.bucket()
        print(f"✅ Connected to bucket: {bucket.name}")
    except Exception as e:
        print(f"❌ Failed to connect to bucket: {e}")
        sys.exit(1)
    
    # Upload each model file
    upload_success = True
    for local_file, cloud_path in MODEL_FILES.items():
        if not os.path.exists(local_file):
            print(f"⚠️  Warning: Local file '{local_file}' not found, skipping...")
            upload_success = False
            continue
        
        try:
            # Get file size
            file_size = os.path.getsize(local_file)
            file_size_mb = file_size / (1024 * 1024)
            
            print(f"\n📤 Uploading: {local_file}")
            print(f"   Size: {file_size_mb:.2f} MB")
            print(f"   Destination: gs://{BUCKET_NAME}/{cloud_path}")
            
            # Upload file
            blob = bucket.blob(cloud_path)
            blob.upload_from_filename(local_file)
            
            # Make it readable by Cloud Functions
            blob.make_public()
            
            print(f"   ✅ Upload successful!")
            print(f"   Public URL: {blob.public_url}")
            
        except Exception as e:
            print(f"   ❌ Upload failed: {e}")
            upload_success = False
    
    print("\n" + "=" * 60)
    if upload_success:
        print("🎉 All models uploaded successfully!")
        print("\n📋 Next steps:")
        print("1. Update CONFIG['model_bucket'] in functions/main.py if needed")
        print("2. Run: firebase deploy --only functions")
        print("3. Test your Cloud Function endpoint")
    else:
        print("⚠️  Some uploads failed. Please check the errors above.")
    print("=" * 60)


def verify_models():
    """Verify that models exist in Cloud Storage"""
    
    print("\n🔍 Verifying uploaded models...")
    
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
        if not storage._apps:
            initialize_app(cred, {'storageBucket': BUCKET_NAME})
        
        bucket = storage.bucket()
        
        for local_file, cloud_path in MODEL_FILES.items():
            blob = bucket.blob(cloud_path)
            if blob.exists():
                print(f"✅ {cloud_path} exists")
                print(f"   Size: {blob.size / (1024*1024):.2f} MB")
                print(f"   Updated: {blob.updated}")
            else:
                print(f"❌ {cloud_path} not found")
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Upload ML models to Firebase Cloud Storage")
    parser.add_argument('--verify', action='store_true', help="Verify uploaded models")
    args = parser.parse_args()
    
    if args.verify:
        verify_models()
    else:
        upload_models()
