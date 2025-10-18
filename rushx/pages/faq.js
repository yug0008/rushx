// pages/faq.js
import { useState } from "react";
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How can I join a tournament on RushX?",
      answer:
        "Login to your RushX account, go to the Tournaments section, choose a match, click Join Now, fill your details, and complete the payment. Once your transaction is verified, your enrollment will be confirmed.",
    },
    {
      question: "My payment is done, but it still shows 'Under Review'. What should I do?",
      answer:
        "Please wait a few minutes while our team verifies your transaction ID. If it takes longer than 30 minutes, contact support with your Transaction ID and username.",
    },
    {
      question: "When will I get the Room ID and Password?",
      answer:
        "Room ID and Password will be available in the 'My Team' section about 15–30 minutes before the match begins. You will also receive a notification when it’s released.",
    },
    {
      question: "Can I join a Duo match with only one player?",
      answer:
        "No, all matches are strictly based on their type. Solo matches are for single players, Duo matches for 2-player teams, and Squad matches for 4-player teams.",
    },
    {
      question: "How are points calculated in tournaments?",
      answer:
        "Points are awarded based on kills and placement. Each match type has a unique scoring system — for example, Solo gives 7 points per kill, Duo gives 5, and Squad gives 3. Placement points also vary accordingly.",
    },
    {
      question: "Can I change my Game UID or Nickname after joining?",
      answer:
        "No, once you’ve joined a tournament, your submitted details are locked for fair play. Make sure to enter the correct Game UID and Nickname before submitting.",
    },
    {
      question: "I can’t see my tournament in 'My Team'. What should I do?",
      answer:
        "If your payment has been approved and you still don’t see your tournament, refresh the page or log out and log back in. If the issue continues, contact support.",
    },
    {
      question: "How can I contact RushX support?",
      answer:
        "You can reach out through the in-site Support Chat or email us at support@rushx.gg. Our team is available 24/7 to help with payment, tournament, or technical issues.",
    },
    {
      question: "Is there a refund policy for tournaments?",
      answer:
        "Refunds are only provided if the tournament gets canceled due to technical or server issues from our side. Otherwise, entry fees are non-refundable.",
    },
    {
      question: "Can I play the same tournament on multiple accounts?",
      answer:
        "No, multi-account participation is strictly prohibited. If caught, both accounts will be permanently banned and any rewards forfeited.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-6 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
         <h1 className="text-lg font-extrabold text-cyan-400 flex justify-center items-center space-x-1 
               md:text-4xl md:space-x-2">
  <FaQuestionCircle className="w-5 h-5 md:w-8 md:h-8" />
  <span>Frequently Asked Questions</span>
</h1>

          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Find quick answers about tournaments, payments, points, and support on RushX.
          </p>
        </div>

        {/* FAQ Accordion */}
<div className="space-y-3 md:space-y-4">
  {faqs.map((faq, index) => (
    <div
      key={index}
      className="bg-gray-900/60 rounded-xl md:rounded-2xl border border-cyan-500/20 backdrop-blur-xl overflow-hidden transition-all duration-300"
    >
      <button
        className="w-full flex justify-between items-center px-3 py-3 md:px-5 md:py-4 text-left text-sm md:text-lg font-semibold text-cyan-300 hover:text-cyan-400 focus:outline-none"
        onClick={() => setOpenIndex(openIndex === index ? null : index)}
      >
        <span className="truncate">{faq.question}</span>
        {openIndex === index ? (
          <FaChevronUp className="text-cyan-400 w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        ) : (
          <FaChevronDown className="text-cyan-400 w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
        )}
      </button>

      <div
        className={`transition-all duration-300 ${
          openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <p className="px-3 pb-3 md:px-5 md:pb-4 text-gray-300 text-sm md:text-base leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  ))}
</div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm pt-10 border-t border-gray-800 mt-10">
          © {new Date().getFullYear()} RushX eSports. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
