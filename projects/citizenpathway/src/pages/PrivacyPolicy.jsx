import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-6 md:py-8 px-4 md:px-8 pb-24 md:max-w-3xl md:mx-auto">
      <div className="flex items-center gap-3 mb-6" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Link to="/" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="text-lg font-bold text-foreground">Privacy Policy</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-5 text-sm text-foreground leading-relaxed">
        <p className="text-xs text-muted-foreground">Last updated: April 16, 2026</p>

        <section>
          <h2 className="font-bold text-base mb-2">1. Introduction</h2>
          <p>
            Welcome to Citizen Pathway ("we," "our," or "us"). We are committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
            mobile application.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">2. Information We Collect</h2>
          <p className="mb-2">We may collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Email address and name when you create an account.</li>
            <li><strong>Study Progress:</strong> Your quiz scores, flashcard progress, and learning statistics stored locally on your device.</li>
            <li><strong>N-400 Form Data:</strong> Information you voluntarily enter to personalize mock interviews. This data is stored securely and only accessible to you.</li>
            <li><strong>Voice Data:</strong> When you use voice practice features, audio is processed in real-time by your device's browser and is not recorded or stored by us.</li>
            <li><strong>Community Posts:</strong> Content you voluntarily share in the community feed.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and maintain the application's study features.</li>
            <li>To track your learning progress and provide personalized study recommendations.</li>
            <li>To enable AI-powered feedback on your practice answers.</li>
            <li>To facilitate community interactions.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">4. Data Storage & Security</h2>
          <p>
            Most study progress data is stored locally on your device. Account-related data and community 
            content are stored on secure servers. We implement appropriate technical and organizational 
            measures to protect your personal information.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">5. Third-Party Services</h2>
          <p>
            Our app uses AI services to provide feedback on your answers and generate translations. 
            These services process your input temporarily and do not retain your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">6. Children's Privacy</h2>
          <p>
            Our application is not directed to children under 13. We do not knowingly collect personal 
            information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">7. Your Rights</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You can delete your account and all associated data from the Settings page.</li>
            <li>You can clear your local study progress at any time.</li>
            <li>You may request access to or deletion of your personal data by contacting us.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy within the app.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through the app.
          </p>
        </section>
      </div>
    </div>
  );
}