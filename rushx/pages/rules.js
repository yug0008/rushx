// pages/rules.js
import { FaShieldAlt, FaUsers, FaGamepad, FaTrophy, FaExclamationTriangle } from "react-icons/fa";

export default function Rules() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-4 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">

        {/* Header */}
        <div className="text-center space-y-2 md:space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold text-cyan-400 flex justify-center items-center space-x-2">
            <FaShieldAlt className="w-6 h-6 md:w-8 md:h-8" />
            <span>Tournament Rules</span>
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-sm md:text-base">
            Follow these rules carefully to ensure fair play and an enjoyable competitive experience on RushX.
          </p>
        </div>

        {/* Sections */}
        {[
          { icon: FaExclamationTriangle, title: "General Conduct", list: [
            "Respect all players, admins, and staff at all times.",
            "Any form of cheating, hacking, or exploiting glitches is strictly prohibited.",
            "Abusive language, harassment, or unsportsmanlike behavior will lead to penalties or bans."
          ]},
          { icon: FaUsers, title: "Tournament Participation", list: [
            "Each tournament is limited to its match type: Solo, Duo, or Squad.",
            "Players must join using the same Game UID and Nickname submitted during registration.",
            "Only enrolled participants may join matches. Sharing accounts or multiple registrations is prohibited.",
            "Room ID and Password will be provided 15–30 minutes before the match and must remain confidential."
          ]},
          { icon: FaGamepad, title: "Match Structure", list: [
            "Matches follow the official game rules and settings.",
            "Solo matches consist of individual players competing for kills and placement points.",
            "Duo matches consist of 2-player teams; Squad matches consist of 4-player teams.",
            "The scoring system is based on kills and placement as per match type:",
            "   • Solo: 7 points per kill, Placement points 1st=12, 2nd=10, 3rd=8, etc.",
            "   • Duo: 5 points per kill, Placement points 1st=15, 2nd=12, 3rd=10, etc.",
            "   • Squad: 3 points per kill, Placement points 1st=18, 2nd=15, 3rd=13, etc."
          ]},
          { icon: FaTrophy, title: "Prize & Rewards", list: [
            "Prize pools, reward distribution, and payout details are listed on the tournament page.",
            "Rewards will be issued only to the registered account used for tournament enrollment.",
            "RushX reserves the right to withhold rewards in case of rule violations or fraud."
          ]},
          { icon: FaShieldAlt, title: "Disputes & Admin Decisions", list: [
            "Admins have the final authority on disputes regarding scores, disqualifications, or rule interpretations.",
            "Players are encouraged to provide valid screenshots or evidence in case of conflicts.",
            "Decisions made by RushX are final and binding for all participants."
          ]},
        ].map((section, idx) => (
          <section key={idx} className="bg-gray-900/60 p-4 md:p-6 rounded-xl md:rounded-2xl border border-cyan-500/20 backdrop-blur-xl">
            <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-2 md:mb-3 flex items-center space-x-2">
              <section.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span>{idx + 1}. {section.title}</span>
            </h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1 md:space-y-2 text-xs md:text-sm mt-1 md:mt-2">
              {section.list.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
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
