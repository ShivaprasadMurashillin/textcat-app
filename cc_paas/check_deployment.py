"""
Deployment Preparation Script
Checks if all required files are present and ready for deployment
"""

import os
import sys

def check_file(filepath, required=True):
    """Check if a file exists"""
    exists = os.path.exists(filepath)
    status = "✅" if exists else ("❌" if required else "⚠️")
    print(f"{status} {filepath}")
    return exists

def check_directory(dirpath):
    """Check if a directory exists"""
    exists = os.path.exists(dirpath)
    status = "✅" if exists else "❌"
    print(f"{status} {dirpath}/")
    return exists

def main():
    print("=" * 60)
    print("🚀 DEPLOYMENT READINESS CHECK")
    print("=" * 60)
    print()
    
    all_good = True
    
    # Backend files
    print("📦 Backend Files (Render):")
    all_good &= check_file("app.py")
    all_good &= check_file("requirements.txt")
    all_good &= check_file("Procfile")
    all_good &= check_file("textcat_model.pkl")
    all_good &= check_file("tfidf_vectorizer.pkl")
    check_file("customer_reviews_dataset.csv", required=False)
    print()
    
    # Frontend files
    print("🎨 Frontend Files (Netlify):")
    all_good &= check_directory("frontend")
    all_good &= check_file("frontend/index.html")
    all_good &= check_file("frontend/style.css")
    all_good &= check_file("frontend/script.js")
    print()
    
    # Configuration files
    print("⚙️ Configuration Files:")
    all_good &= check_file(".gitignore")
    check_file("README.md", required=False)
    print()
    
    # Check file sizes
    print("📊 File Sizes:")
    try:
        model_size = os.path.getsize("textcat_model.pkl") / 1024
        vectorizer_size = os.path.getsize("tfidf_vectorizer.pkl") / 1024
        print(f"   Model: {model_size:.1f} KB")
        print(f"   Vectorizer: {vectorizer_size:.1f} KB")
        
        if model_size > 100000:  # 100 MB
            print("   ⚠️  Warning: Model file is very large (>100MB)")
            print("      Consider using Git LFS for large files")
    except:
        pass
    print()
    
    # Check API URL in frontend
    print("🔗 Frontend API Configuration:")
    try:
        with open("frontend/script.js", "r") as f:
            content = f.read()
            if "YOUR-RENDER-APP" in content:
                print("   ⚠️  Remember to update API_BASE_URL in frontend/script.js")
                print("      After deploying to Render!")
            else:
                print("   ✅ API URL looks configured")
    except:
        print("   ❌ Could not read frontend/script.js")
    print()
    
    # Final verdict
    print("=" * 60)
    if all_good:
        print("✅ ALL REQUIRED FILES PRESENT!")
        print("\n📋 Next Steps:")
        print("1. Initialize git: git init")
        print("2. Add files: git add .")
        print("3. Commit: git commit -m 'Initial commit'")
        print("4. Create GitHub repo and push")
        print("5. Deploy backend to Render")
        print("6. Update frontend API URL")
        print("7. Deploy frontend to Netlify")
        print("\n📖 Full instructions: DEPLOYMENT_RENDER_NETLIFY.md")
    else:
        print("❌ MISSING REQUIRED FILES")
        print("Please ensure all required files are present before deployment")
    print("=" * 60)

if __name__ == "__main__":
    main()
