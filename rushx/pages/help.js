// pages/help.js
import { FaQuestionCircle, FaTrophy, FaGamepad, FaUsers, FaRegMoneyBillAlt, FaInfoCircle } from "react-icons/fa";

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-6 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-extrabold text-cyan-400 flex justify-center items-center space-x-2">
            <FaQuestionCircle className="w-8 h-8" />
            <span>RushX Help Center</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about joining tournaments, payments, scoring, and team rules on RushX.
          </p>
        </div>

        {/* Section: Joining Tournaments */}
        <section className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-xl">
          <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 
               md:text-2xl md:space-x-2 md:mb-4">
  <FaGamepad className="w-4 h-4 md:w-6 md:h-6" />
  <span>How to Join a Tournament</span>
</h2>

          <ul className="space-y-2 text-gray-300 list-disc list-inside">
            <li>Login or create an account on RushX.</li>
            <li>Go to the <b>Tournaments</b> section and select any ongoing or upcoming tournament.</li>
            <li>Click <b>Join Now</b> and fill in your details — Game Nickname, Phone Number, Game UID, and Address.</li>
            <li>Click <b>Proceed to Payment</b> and scan the displayed QR Code.</li>
            <li>Enter your Transaction ID and submit. Your registration will move <b>Under Review</b>.</li>
            <li>Once your payment is verified by the admin, your <b>enrollment will be confirmed</b>.</li>
          </ul>
        </section>

        {/* Section: After Enrollment */}
        <section className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20">
          
          <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 
               md:text-2xl md:space-x-2 md:mb-4">
  <FaGamepad className="w-4 h-4 md:w-6 md:h-6" />
  <span>After Enrollment</span>
</h2>

          <p className="text-gray-300 mb-3">
            Once enrolled, when you revisit the tournament page, it will display <b>Enrolled</b> status.  
            You’ll also get access to a new tab called <b>My Team</b> where you can find:
          </p>
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            <li>Your Team ID</li>
            <li>Game UID & Nickname</li>
            <li>Payment Status</li>
            <li>Room ID and Password (Available 15–30 minutes before the match)</li>
          </ul>
          <p className="text-gray-400 mt-3">
            All match notifications and updates will be sent through the notification panel.
          </p>
        </section>

        {/* Section: Tournament Info */}
        <section className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20">
          <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 
               md:text-2xl md:space-x-2 md:mb-4">
  <FaGamepad className="w-4 h-4 md:w-6 md:h-6" />
  <span>Tournament Information</span>
</h2>

          <p className="text-gray-300">
            Each tournament page contains complete details such as:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-1 mt-2">
            <li>Entry Fee</li>
            <li>Number of Players</li>
            <li>Match Overview & Structure</li>
            <li>Game Rules and Regulations</li>
            <li>Prize Pool Breakdown</li>
          </ul>
        </section>

        {/* Section: Scoring System */}
        <section className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20">
         <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 
               md:text-2xl md:space-x-2 md:mb-4">
  <FaGamepad className="w-4 h-4 md:w-6 md:h-6" />
  <span>Scoring System</span>
</h2>


          <p className="text-gray-300 mb-4">
            Points are awarded based on <b>Kills</b> and <b>Placement</b>.  
            Each match type (Solo, Duo, Squad) has a different point structure.
          </p>

          {/* SOLO */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Solo Mode</h3>
            <p className="text-gray-300 mb-2">Kill Points: <b>7 per kill</b></p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-cyan-700 text-sm text-gray-300">
                <thead className="bg-cyan-900/30">
                  <tr>
                    <th className="border border-cyan-800 px-3 py-2">Placement</th>
                    <th className="border border-cyan-800 px-3 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries({
                    1: 12, 2: 10, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1
                  }).map(([rank, points]) => (
                    <tr key={rank}>
                      <td className="border border-cyan-800 px-3 py-1 text-center">#{rank}</td>
                      <td className="border border-cyan-800 px-3 py-1 text-center">{points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DUO */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Duo Mode</h3>
            <p className="text-gray-300 mb-2">Kill Points: <b>5 per kill</b></p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-cyan-700 text-sm text-gray-300">
                <thead className="bg-cyan-900/30">
                  <tr>
                    <th className="border border-cyan-800 px-3 py-2">Placement</th>
                    <th className="border border-cyan-800 px-3 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries({
                    1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3
                  }).map(([rank, points]) => (
                    <tr key={rank}>
                      <td className="border border-cyan-800 px-3 py-1 text-center">#{rank}</td>
                      <td className="border border-cyan-800 px-3 py-1 text-center">{points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SQUAD */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Squad Mode</h3>
            <p className="text-gray-300 mb-2">Kill Points: <b>3 per kill</b></p>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-cyan-700 text-sm text-gray-300">
                <thead className="bg-cyan-900/30">
                  <tr>
                    <th className="border border-cyan-800 px-3 py-2">Placement</th>
                    <th className="border border-cyan-800 px-3 py-2">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries({
                    1: 18, 2: 15, 3: 13, 4: 11, 5: 9, 6: 7, 7: 5, 8: 4, 9: 3, 10: 2
                  }).map(([rank, points]) => (
                    <tr key={rank}>
                      <td className="border border-cyan-800 px-3 py-1 text-center">#{rank}</td>
                      <td className="border border-cyan-800 px-3 py-1 text-center">{points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-gray-400 mt-4 italic">
            Note: Each match can only include one team type — Solo, Duo, or Squad.
          </p>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm pt-6 border-t border-gray-800">
          © {new Date().getFullYear()} RushX eSports. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
