// pages/terms.js
import { FaFileContract, FaTrophy, FaShieldAlt, FaGamepad, FaMoneyBillWave, FaUserShield, FaGavel } from "react-icons/fa";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-4 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-400 flex justify-center items-center space-x-2">
            <FaFileContract className="w-6 h-6 md:w-8 md:h-8" />
            <span>Terms & Conditions</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-sm md:text-base">
            Please read these Terms and Conditions carefully before using the RushX eSports platform.
          </p>
        </div>

        {/* Sections */}
        {[
          { icon: FaShieldAlt, title: "Overview", content: "By registering, participating, or accessing RushX (“we”, “our”, or “us”), you agree to comply with and be bound by these Terms & Conditions. If you disagree with any part, please refrain from using our platform or participating in tournaments." },
          { icon: FaUserShield, title: "User Accounts", list: [
            "Users must provide accurate and verifiable information while creating an account.",
            "Only one account per player is allowed. Multiple accounts or fake IDs may result in a permanent ban.",
            "Players are responsible for maintaining the confidentiality of their login credentials."
          ]},
          { icon: FaGamepad, title: "Rules & Fair Play", list: [
            "All participants must follow the official tournament rules stated on the tournament page.",
            "Using hacks, emulators (if not allowed), or third-party cheating tools will result in instant disqualification and account termination.",
            "Players must join using the same Game UID and Nickname submitted during registration.",
            "Room ID and Passwords are confidential — sharing them with non-participants is prohibited.",
            "Each tournament supports only one format at a time (Solo / Duo / Squad)."
          ]},
          { icon: FaMoneyBillWave, title: "Payments & Refund Policy", list: [
            "All tournament entries are paid through secure QR-based payments with transaction ID verification.",
            "After successful payment, users must provide the correct Transaction ID to confirm their entry.",
            "Refunds will only be issued if the tournament is canceled by RushX due to technical or operational reasons.",
            "No refunds will be provided for disqualification, late entry, or user-side connection issues."
          ]},
          { icon: FaTrophy, title: "Scoring & Results", content: "All results are calculated based on kill and placement points as per the tournament type. RushX follows a transparent point structure for Solo, Duo, and Squad matches.", list: [
            "Admins verify and upload match results after reviewing all valid screenshots and kill reports.",
            "In case of disputes, RushX reserves the right to recheck and update the final results."
          ]},
          { icon: FaGavel, title: "Code of Conduct", list: [
            "Respect all players, admins, and staff members at all times.",
            "Abusive chat, hate speech, or any form of harassment will not be tolerated.",
            "Players caught violating community guidelines will face penalties or permanent bans."
          ]},
          { icon: FaShieldAlt, title: "Limitation of Liability", content: "RushX is not responsible for network issues, game crashes, device malfunctions, or any losses caused during gameplay. Players are responsible for ensuring a stable internet connection and proper device functionality."},
          { icon: FaFileContract, title: "Updates & Modifications", content: "RushX reserves the right to update or modify these Terms & Conditions at any time. Continued use of the platform after updates means you accept the revised terms."},
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
