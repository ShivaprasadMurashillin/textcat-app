"""
Quick Deployment Checklist
Run this before deploying to ensure everything is ready
"""

import os
import sys

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def print_step(number, text, status=""):
    print(f"\n{number}. {text} {status}")

def check_yes_no(prompt):
    """Ask user for yes/no confirmation"""
    while True:
        response = input(f"   {prompt} (y/n): ").lower()
        if response in ['y', 'yes']:
            return True
        elif response in ['n', 'no']:
            return False
        print("   Please enter 'y' or 'n'")

def main():
    print_header("🚀 DEPLOYMENT READINESS CHECKLIST")
    
    print("\nThis script will guide you through the deployment process.")
    print("Answer each question honestly to ensure smooth deployment.\n")
    
    # Phase 1: Files
    print_header("📦 PHASE 1: File Verification")
    
    files_ok = True
    files_ok &= os.path.exists("app_production.py")
    files_ok &= os.path.exists("requirements.txt")
    files_ok &= os.path.exists("Procfile")
    files_ok &= os.path.exists("textcat_model.pkl")
    files_ok &= os.path.exists("tfidf_vectorizer.pkl")
    files_ok &= os.path.exists("web-frontend/index.html")
    files_ok &= os.path.exists("web-frontend/script.js")
    files_ok &= os.path.exists("web-frontend/style.css")
    
    if files_ok:
        print("✅ All required files present")
    else:
        print("❌ Some files are missing!")
        print("   Please run: python check_deployment.py")
        return
    
    # Phase 2: Git
    print_header("📝 PHASE 2: Git Repository")
    
    if check_yes_no("Have you initialized git? (git init)"):
        print("   ✅ Git initialized")
    else:
        print("   ❌ Run: git init")
        return
    
    if check_yes_no("Have you committed your code? (git add . && git commit)"):
        print("   ✅ Code committed")
    else:
        print("   ❌ Run:")
        print("      git add .")
        print("      git commit -m 'Initial commit'")
        return
    
    if check_yes_no("Have you created a GitHub repository?"):
        print("   ✅ GitHub repo created")
    else:
        print("   ❌ Create repo at: https://github.com/new")
        return
    
    if check_yes_no("Have you pushed to GitHub? (git push)"):
        print("   ✅ Code on GitHub")
    else:
        print("   ❌ Run:")
        print("      git remote add origin https://github.com/YOUR_USERNAME/textcat-app.git")
        print("      git push -u origin main")
        return
    
    # Phase 3: Render
    print_header("🗄️ PHASE 3: Render.com Setup")
    
    if check_yes_no("Have you signed up for Render.com?"):
        print("   ✅ Render account ready")
    else:
        print("   ❌ Sign up at: https://render.com")
        return
    
    if check_yes_no("Have you created PostgreSQL database on Render?"):
        print("   ✅ Database created")
    else:
        print("   ❌ Create at: Render Dashboard → New+ → PostgreSQL")
        return
    
    if check_yes_no("Have you copied the DATABASE_URL?"):
        print("   ✅ DATABASE_URL saved")
    else:
        print("   ❌ Copy from: Render → Your Database → Internal Database URL")
        return
    
    if check_yes_no("Have you deployed Web Service on Render?"):
        print("   ✅ Web service deployed")
        
        if check_yes_no("   Did you add DATABASE_URL environment variable?"):
            print("      ✅ Environment variable set")
        else:
            print("      ❌ Add in: Render → Your Service → Environment → Add Variable")
            return
        
        if check_yes_no("   Is your backend LIVE?"):
            print("      ✅ Backend running")
            render_url = input("   Enter your Render URL: ").strip()
            if render_url:
                print(f"      📝 Saved: {render_url}")
            else:
                print("      ⚠️  You'll need this for the frontend!")
        else:
            print("      ❌ Check Render logs for errors")
            return
    else:
        print("   ❌ Deploy at: Render Dashboard → New+ → Web Service")
        return
    
    # Phase 4: Frontend
    print_header("🎨 PHASE 4: Frontend Configuration")
    
    if check_yes_no("Have you updated API URL in web-frontend/script.js?"):
        print("   ✅ API URL configured")
    else:
        print("   ❌ Edit web-frontend/script.js and replace:")
        print("      'https://YOUR-RENDER-APP.onrender.com'")
        print("      with your actual Render URL")
        return
    
    if check_yes_no("Have you committed and pushed the frontend changes?"):
        print("   ✅ Changes pushed to GitHub")
    else:
        print("   ❌ Run:")
        print("      git add web-frontend/script.js")
        print("      git commit -m 'Update API URL'")
        print("      git push")
        return
    
    # Phase 5: Netlify
    print_header("🌐 PHASE 5: Netlify Deployment")
    
    if check_yes_no("Have you signed up for Netlify?"):
        print("   ✅ Netlify account ready")
    else:
        print("   ❌ Sign up at: https://netlify.com")
        return
    
    if check_yes_no("Have you deployed your frontend to Netlify?"):
        print("   ✅ Frontend deployed")
        netlify_url = input("   Enter your Netlify URL: ").strip()
        if netlify_url:
            print(f"      📝 Saved: {netlify_url}")
        else:
            print("      ⚠️  Get this from Netlify dashboard")
    else:
        print("   ❌ Deploy at: Netlify → Drag frontend/ folder")
        return
    
    # Phase 6: Testing
    print_header("🧪 PHASE 6: Testing")
    
    if check_yes_no("Have you tested the backend health endpoint?"):
        print("   ✅ Backend health check passed")
    else:
        print("   ⚠️  Test at: https://YOUR-RENDER-URL/health")
    
    if check_yes_no("Have you tested a prediction from the frontend?"):
        print("   ✅ Frontend → Backend working")
    else:
        print("   ⚠️  Visit your Netlify URL and try a prediction")
    
    if check_yes_no("Have you checked browser console for errors? (F12)"):
        print("   ✅ No console errors")
    else:
        print("   ⚠️  Press F12 in browser and check Console tab")
    
    # Phase 7: Keep-Alive
    print_header("🔄 PHASE 7: Keep Backend Alive")
    
    if check_yes_no("Have you set up a keep-alive service (Cron-Job.org)?"):
        print("   ✅ Keep-alive configured")
    else:
        print("   ⚠️  Recommended: Set up at https://cron-job.org")
        print("      Without this, your backend sleeps after 15 minutes")
    
    # Final Summary
    print_header("🎉 DEPLOYMENT COMPLETE!")
    
    print("\n✅ Congratulations! Your app is deployed!\n")
    print("📊 Your Live URLs:")
    if 'netlify_url' in locals() and netlify_url:
        print(f"   Frontend: {netlify_url}")
    else:
        print("   Frontend: https://YOUR-SITE.netlify.app")
    
    if 'render_url' in locals() and render_url:
        print(f"   Backend: {render_url}")
    else:
        print("   Backend: https://YOUR-APP.onrender.com")
    
    print("\n📝 Next Steps:")
    print("   1. Share your app URL with others")
    print("   2. Test all features thoroughly")
    print("   3. Monitor usage in Render/Netlify dashboards")
    print("   4. Consider custom domain (optional)")
    
    print("\n💰 Cost: $0/month (Free tier)")
    print("\n🎓 Add to your portfolio/resume!")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Checklist interrupted")
        sys.exit(1)
