"""
Quick Deploy Script for Text Categorization System
Automates the deployment process to Firebase
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def run_command(cmd, description, cwd=None):
    """Run shell command with error handling"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"❌ Failed: {result.stderr}")
            return False
        print(f"✅ {description} - Done!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_requirements():
    """Check if required tools are installed"""
    print("\n" + "="*60)
    print("📋 Checking Requirements...")
    print("="*60)
    
    requirements = {
        'python': 'python --version',
        'firebase-cli': 'firebase --version',
        'node': 'node --version'
    }
    
    all_ok = True
    for tool, cmd in requirements.items():
        if run_command(cmd, f"Checking {tool}"):
            pass
        else:
            print(f"❌ {tool} not found. Please install it first.")
            all_ok = False
    
    return all_ok

def check_files():
    """Check if required files exist"""
    print("\n" + "="*60)
    print("📁 Checking Files...")
    print("="*60)
    
    required_files = [
        'textcat_model.pkl',
        'tfidf_vectorizer.pkl',
        'serviceAccountKey.json',
        'functions/main.py',
        'functions/requirements.txt',
        'firebase.json',
        '.firebaserc'
    ]
    
    all_ok = True
    for file in required_files:
        if Path(file).exists():
            print(f"✅ {file}")
        else:
            print(f"❌ {file} - Missing!")
            all_ok = False
    
    return all_ok

def update_project_id():
    """Update project ID in .firebaserc"""
    print("\n" + "="*60)
    print("🔧 Firebase Project Configuration...")
    print("="*60)
    
    try:
        with open('.firebaserc', 'r') as f:
            config = json.load(f)
        
        current_id = config['projects']['default']
        print(f"Current Project ID: {current_id}")
        
        response = input("\nDo you want to update the project ID? (y/N): ").strip().lower()
        if response == 'y':
            new_id = input("Enter your Firebase project ID: ").strip()
            config['projects']['default'] = new_id
            
            with open('.firebaserc', 'w') as f:
                json.dump(config, f, indent=2)
            
            print(f"✅ Updated project ID to: {new_id}")
            return new_id
        else:
            return current_id
            
    except Exception as e:
        print(f"❌ Failed to update project ID: {e}")
        return None

def upload_models():
    """Upload ML models to Cloud Storage"""
    print("\n" + "="*60)
    print("📤 Uploading ML Models...")
    print("="*60)
    
    response = input("Upload models to Cloud Storage? (Y/n): ").strip().lower()
    if response in ['', 'y', 'yes']:
        return run_command(
            'python scripts/upload_models.py',
            "Uploading models"
        )
    else:
        print("⏭️  Skipping model upload")
        return True

def deploy_firebase():
    """Deploy to Firebase"""
    print("\n" + "="*60)
    print("🚀 Deploying to Firebase...")
    print("="*60)
    
    print("\nWhat do you want to deploy?")
    print("1. Everything (Functions + Hosting + Rules)")
    print("2. Functions only")
    print("3. Hosting only")
    print("4. Rules only")
    
    choice = input("\nEnter choice (1-4): ").strip()
    
    deploy_commands = {
        '1': 'firebase deploy',
        '2': 'firebase deploy --only functions',
        '3': 'firebase deploy --only hosting',
        '4': 'firebase deploy --only firestore:rules,storage:rules'
    }
    
    cmd = deploy_commands.get(choice, 'firebase deploy')
    
    return run_command(cmd, "Deploying to Firebase")

def test_deployment(project_id):
    """Test deployed endpoints"""
    print("\n" + "="*60)
    print("🧪 Testing Deployment...")
    print("="*60)
    
    base_url = f"https://{project_id}.web.app"
    
    print(f"\n🌐 Your app should be live at:")
    print(f"   {base_url}")
    
    response = input("\nDo you want to test the health endpoint? (Y/n): ").strip().lower()
    if response in ['', 'y', 'yes']:
        return run_command(
            f'curl {base_url}/api/health',
            "Testing health endpoint"
        )
    
    return True

def main():
    """Main deployment workflow"""
    print("\n" + "="*60)
    print("🚀 Firebase Deployment Wizard")
    print("   Text Categorization System")
    print("="*60)
    
    # Step 1: Check requirements
    if not check_requirements():
        print("\n❌ Please install missing requirements and try again.")
        sys.exit(1)
    
    # Step 2: Check files
    if not check_files():
        print("\n❌ Please ensure all required files exist.")
        sys.exit(1)
    
    # Step 3: Update project ID
    project_id = update_project_id()
    if not project_id:
        print("\n❌ Failed to configure project ID.")
        sys.exit(1)
    
    # Step 4: Firebase login
    print("\n" + "="*60)
    print("🔐 Firebase Login...")
    print("="*60)
    response = input("Are you logged in to Firebase CLI? (Y/n): ").strip().lower()
    if response not in ['', 'y', 'yes']:
        if not run_command('firebase login', "Logging in to Firebase"):
            sys.exit(1)
    
    # Step 5: Upload models
    if not upload_models():
        print("\n⚠️  Model upload failed. Continue anyway? (y/N): ")
        if input().strip().lower() != 'y':
            sys.exit(1)
    
    # Step 6: Deploy
    if not deploy_firebase():
        print("\n❌ Deployment failed. Check logs above.")
        sys.exit(1)
    
    # Step 7: Test
    test_deployment(project_id)
    
    # Success!
    print("\n" + "="*60)
    print("🎉 Deployment Complete!")
    print("="*60)
    print(f"\n✅ Your app is live at: https://{project_id}.web.app")
    print(f"✅ API endpoint: https://{project_id}.web.app/api/predict")
    print(f"✅ Health check: https://{project_id}.web.app/api/health")
    print("\n📊 Monitor your app:")
    print(f"   https://console.firebase.google.com/project/{project_id}")
    print("\n📖 Documentation:")
    print("   See DEPLOYMENT.md for detailed guide")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Deployment cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
