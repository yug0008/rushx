// pages/privacy.js
import { FaUserShield, FaShieldAlt, FaFileContract, FaLock, FaMoneyBillWave, FaBell, FaDatabase } from "react-icons/fa";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-4 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-400 flex justify-center items-center space-x-2">
            <FaUserShield className="w-6 h-6 md:w-8 md:h-8" />
            <span>Privacy Policy</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-sm md:text-base">
            Your privacy is important to us. This Privacy Policy explains how RushX collects, uses, and protects your information.
          </p>
        </div>

        {/* Sections */}
        {[
          { icon: FaDatabase, title: "Information We Collect", list: [
            "Personal information you provide: name, email, phone number, address, Game UID, and nickname.",
            "Payment details (transaction ID, payment method) are collected for tournament enrollment.",
            "Usage information, such as pages visited, notifications, and interactions on RushX."
          ]},
          { icon: FaLock, title: "How We Use Your Information", list: [
            "To manage tournament participation and verify payments.",
            "To send notifications about match updates, results, and announcements.",
            "To improve the RushX platform, including user experience and security.",
            "To prevent fraud, cheating, or violations of tournament rules."
          ]},
          { icon: FaMoneyBillWave, title: "Payment Information", content: "All payments are processed via secure QR code scanning. RushX does not store your card details; we only store verified transaction IDs to confirm tournament enrollment."},
          { icon: FaBell, title: "Notifications", content: "RushX uses notifications to keep you updated about match schedules, room IDs, results, and other important announcements. You can manage notification preferences in your account settings."},
          { icon: FaLock, title: "Data Security", list: [
            "We implement reasonable security measures to protect your personal information.",
            "Access to sensitive information is limited to authorized administrators only.",
            "Despite our efforts, no system is 100% secure. Users are responsible for maintaining the confidentiality of their login credentials."
          ]},
          { icon: FaShieldAlt, title: "Third-Party Services", content: "RushX may use third-party services for payments, analytics, or notifications. We do not share personal information with advertisers or external parties without consent, except as required for payment verification or legal obligations."},
          { icon: FaFileContract, title: "Updates & Modifications", content: "RushX reserves the right to update this Privacy Policy at any time. Users are encouraged to review this page periodically. Continued use of the platform after updates indicates acceptance of the new terms."},
        ].map((section, idx) => (
          <section key={idx} className="bg-gray-900/60 p-4 md:p-6 rounded-xl md:rounded-2xl border border-cyan-500/20 backdrop-blur-xl">
            <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-2 md:mb-3 flex items-center space-x-2">
              <section.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span>{idx + 1}. {section.title}</span>
            </h2>
            {section.content && <p className="text-gray-300 text-sm md:text-base leading-relaxed">{section.content}</p>}
            {section.list && (
              <ul className="list-disc list-inside text-gray-300 space-y-1 md:space-y-2 text-xs md:text-sm mt-1 md:mt-2">
                {section.list.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}

        {/* Footer */}
        <footer className="text-center text-gray-500 text-xs md:text-sm pt-8 md:pt-10 border-t border-gray-800">
          Last updated: {new Date().toLocaleDateString()} <br />
          © {new Date().getFullYear()} RushX eSports. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
