// pages/help.js
import Head from 'next/head';
import { FaQuestionCircle, FaTrophy, FaGamepad, FaUsers, FaRegMoneyBillAlt, FaInfoCircle, FaSearch, FaEnvelope, FaHeadset, FaMobile, FaShieldAlt } from "react-icons/fa";

export default function Help() {
  // SEO Metadata
  const seoData = {
    title: "RushX Help Center - Tournament Guide, Scoring System, Rules & Support",
    description: "Complete guide to RushX eSports tournaments. Learn how to join tournaments, scoring system, payment process, rules, and get 24/7 support for Free Fire, BGMI competitions.",
    canonical: "https://www.rushx.live/help",
    keywords: "RushX help, tournament guide, esports scoring system, Free Fire tournaments, BGMI competitions, how to join tournaments, gaming rules, RushX support",
    ogImage: "https://www.rushx.live/og-image.jpg"
  }

  // Structured Data for How-to Guide
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Join Tournaments on RushX eSports Platform",
    "description": "Complete step-by-step guide to joining eSports tournaments on RushX platform",
    "image": "https://www.rushx.live/og-help.jpg",
    "totalTime": "PT10M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": "50"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "RushX Account"
      },
      {
        "@type": "HowToSupply",
        "name": "Game UID and Nickname"
      },
      {
        "@type": "HowToSupply",
        "name": "Payment Method"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Smartphone or Computer"
      },
      {
        "@type": "HowToTool",
        "name": "Stable Internet Connection"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Create Account",
        "text": "Login or create an account on RushX eSports platform",
        "url": "https://www.rushx.live/help#step1"
      },
      {
        "@type": "HowToStep",
        "name": "Select Tournament",
        "text": "Go to Tournaments section and select any ongoing or upcoming tournament",
        "url": "https://www.rushx.live/help#step2"
      },
      {
        "@type": "HowToStep",
        "name": "Fill Details",
        "text": "Click Join Now and fill your Game Nickname, Phone Number, Game UID, and Address",
        "url": "https://www.rushx.live/help#step3"
      },
      {
        "@type": "HowToStep",
        "name": "Make Payment",
        "text": "Proceed to payment and scan the QR code to complete transaction",
        "url": "https://www.rushx.live/help#step4"
      },
      {
        "@type": "HowToStep",
        "name": "Submit Transaction",
        "text": "Enter your Transaction ID and submit for verification",
        "url": "https://www.rushx.live/help#step5"
      },
      {
        "@type": "HowToStep",
        "name": "Get Confirmation",
        "text": "Wait for admin verification and receive enrollment confirmation",
        "url": "https://www.rushx.live/help#step6"
      }
    ]
  }

  // Scoring System Structured Data
  const scoringStructuredData = {
    "@context": "https://schema.org",
    "@type": "Table",
    "about": "RushX eSports Tournament Scoring System",
    "name": "Tournament Scoring Points Table",
    "description": "Complete scoring system for Solo, Duo and Squad tournaments on RushX platform",
    "columns": ["Game Mode", "Kill Points", "Placement Range", "Placement Points"],
    "rows": [
      {
        "Game Mode": "Solo",
        "Kill Points": "7 points per kill",
        "Placement Range": "1st to 10th",
        "Placement Points": "12 to 1 points"
      },
      {
        "Game Mode": "Duo", 
        "Kill Points": "5 points per kill",
        "Placement Range": "1st to 10th",
        "Placement Points": "15 to 3 points"
      },
      {
        "Game Mode": "Squad",
        "Kill Points": "3 points per kill", 
        "Placement Range": "1st to 10th",
        "Placement Points": "18 to 2 points"
      }
    ]
  }

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{seoData.title}</title>
        <meta name="title" content={seoData.title} />
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="RushX eSports" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={seoData.canonical} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:site_name" content="RushX eSports" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={seoData.canonical} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={seoData.ogImage} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(scoringStructuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header with SEO-rich content */}
          <header className="text-center space-y-4">
            <h1 className="text-2xl font-extrabold text-cyan-400 flex justify-center items-center space-x-2">
              <FaQuestionCircle className="w-8 h-8" />
              <span>RushX Help Center</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Complete guide to <strong>Free Fire tournaments</strong>, <strong>BGMI competitions</strong>, scoring systems, and tournament rules on RushX - India's Premier eSports Platform.
            </p>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <a href="#joining" className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl text-sm hover:bg-cyan-500/30 transition-all">
                Join Tournaments
              </a>
              <a href="#scoring" className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm hover:bg-green-500/30 transition-all">
                Scoring System
              </a>
              <a href="#rules" className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-sm hover:bg-purple-500/30 transition-all">
                Tournament Rules
              </a>
              <a href="#support" className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm hover:bg-yellow-500/30 transition-all">
                24/7 Support
              </a>
            </div>
          </header>

          {/* Section: Joining Tournaments */}
          <section id="joining" className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-xl">
            <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 md:text-2xl md:space-x-2 md:mb-4">
              <FaGamepad className="w-4 h-4 md:w-6 md:h-6" />
              <span>How to Join a Tournament - Complete Guide</span>
            </h2>

            <div className="space-y-4">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-cyan-300 mb-2">Step-by-Step Process</h3>
                <ol className="space-y-3 text-gray-300 list-decimal list-inside">
                  <li><strong>Login or create an account</strong> on RushX eSports platform</li>
                  <li>Go to the <strong>Tournaments section</strong> and select any ongoing or upcoming tournament</li>
                  <li>Click <strong>Join Now</strong> and fill in your details:
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>Game Nickname (Free Fire, BGMI, etc.)</li>
                      <li>Phone Number for verification</li>
                      <li>Game UID (Unique Identification)</li>
                      <li>Address for prize distribution</li>
                    </ul>
                  </li>
                  <li>Click <strong>Proceed to Payment</strong> and scan the displayed QR Code</li>
                  <li>Enter your <strong>Transaction ID</strong> and submit for verification</li>
                  <li>Your registration status will show as <strong>Under Review</strong></li>
                  <li>Once payment is verified by admin, your <strong>enrollment will be confirmed</strong></li>
                </ol>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-green-300 mb-2">📱 Mobile-Friendly Process</h3>
                <p className="text-gray-300">
                  Our platform is optimized for mobile devices. You can easily join tournaments, make payments, 
                  and receive notifications directly on your smartphone for <strong>Free Fire</strong> and <strong>BGMI tournaments</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Section: After Enrollment */}
          <section className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20">
            <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 md:text-2xl md:space-x-2 md:mb-4">
              <FaGamepad className="w-4 h-4 md:w-6 md:h-6" />
              <span>After Enrollment - What Happens Next?</span>
            </h2>

            <div className="space-y-4">
              <p className="text-gray-300">
                Once successfully enrolled, when you revisit the tournament page, it will display <strong>Enrolled</strong> status.  
                You'll gain access to a dedicated <strong>My Team</strong> section containing:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-green-500/20">
                  <h4 className="text-green-400 font-semibold mb-2">📊 Team Information</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Your Unique Team ID</li>
                    <li>• Game UID & Verified Nickname</li>
                    <li>• Payment Status & Transaction Details</li>
                    <li>• Tournament Schedule & Timing</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-blue-500/20">
                  <h4 className="text-blue-400 font-semibold mb-2">🎮 Match Details</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Room ID and Password (Available 15-30 minutes before match)</li>
                    <li>• Live Match Updates</li>
                    <li>• Real-time Score Tracking</li>
                    <li>• Prize Distribution Information</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-400 bg-gray-800/30 rounded-xl p-4 border border-yellow-500/20">
                <strong>💡 Pro Tip:</strong> All match notifications, room details, and important updates will be sent 
                through our notification panel. Enable browser notifications for instant alerts.
              </p>
            </div>
          </section>

          {/* Section: Tournament Info */}
          <section className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20">
            <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 md:text-2xl md:space-x-2 md:mb-4">
              <FaInfoCircle className="w-4 h-4 md:w-6 md:h-6" />
              <span>Complete Tournament Information</span>
            </h2>

            <p className="text-gray-300 mb-4">
              Each tournament page on RushX provides comprehensive details to help you make informed decisions:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-cyan-300">
                  <FaRegMoneyBillAlt className="w-5 h-5" />
                  <span><strong>Entry Fee & Prize Pool</strong></span>
                </div>
                <div className="flex items-center space-x-3 text-green-300">
                  <FaUsers className="w-5 h-5" />
                  <span><strong>Player Capacity & Teams</strong></span>
                </div>
                <div className="flex items-center space-x-3 text-purple-300">
                  <FaGamepad className="w-5 h-5" />
                  <span><strong>Game Rules & Regulations</strong></span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-yellow-300">
                  <FaTrophy className="w-5 h-5" />
                  <span><strong>Scoring System & Points</strong></span>
                </div>
                <div className="flex items-center space-x-3 text-blue-300">
                  <FaMobile className="w-5 h-5" />
                  <span><strong>Match Schedule & Timing</strong></span>
                </div>
                <div className="flex items-center space-x-3 text-red-300">
                  <FaShieldAlt className="w-5 h-5" />
                  <span><strong>Fair Play Guidelines</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Scoring System */}
          <section id="scoring" className="bg-gray-900/60 p-6 rounded-2xl border border-cyan-500/20">
            <h2 className="text-base font-bold text-cyan-400 flex items-center space-x-1 mb-3 md:text-2xl md:space-x-2 md:mb-4">
              <FaTrophy className="w-4 h-4 md:w-6 md:h-6" />
              <span>Tournament Scoring System</span>
            </h2>

            <p className="text-gray-300 mb-6">
              Points are awarded based on <strong>Kills</strong> and <strong>Placement</strong> in each match.  
              Different game modes (Solo, Duo, Squad) have specific scoring structures designed for balanced competition.
            </p>

            {/* SOLO */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
                <FaUsers className="w-5 h-5 mr-2" />
                Solo Mode Scoring
              </h3>
              <p className="text-gray-300 mb-3"><strong>Kill Points:</strong> <span className="text-green-400">7 points per kill</span></p>
              <div className="overflow-x-auto bg-gray-800/50 rounded-xl border border-yellow-500/20">
                <table className="min-w-full text-gray-300">
                  <thead className="bg-yellow-500/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Placement</th>
                      <th className="px-4 py-3 text-center">Points Awarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries({
                      1: 12, 2: 10, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1
                    }).map(([rank, points]) => (
                      <tr key={rank} className="border-t border-gray-700">
                        <td className="px-4 py-3">#{rank} Place</td>
                        <td className="px-4 py-3 text-center font-semibold text-yellow-400">{points} Points</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DUO */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center">
                <FaUsers className="w-5 h-5 mr-2" />
                Duo Mode Scoring
              </h3>
              <p className="text-gray-300 mb-3"><strong>Kill Points:</strong> <span className="text-green-400">5 points per kill</span></p>
              <div className="overflow-x-auto bg-gray-800/50 rounded-xl border border-green-500/20">
                <table className="min-w-full text-gray-300">
                  <thead className="bg-green-500/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Placement</th>
                      <th className="px-4 py-3 text-center">Points Awarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries({
                      1: 15, 2: 12, 3: 10, 4: 9, 5: 8, 6: 7, 7: 6, 8: 5, 9: 4, 10: 3
                    }).map(([rank, points]) => (
                      <tr key={rank} className="border-t border-gray-700">
                        <td className="px-4 py-3">#{rank} Place</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-400">{points} Points</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SQUAD */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                <FaUsers className="w-5 h-5 mr-2" />
                Squad Mode Scoring
              </h3>
              <p className="text-gray-300 mb-3"><strong>Kill Points:</strong> <span className="text-green-400">3 points per kill</span></p>
              <div className="overflow-x-auto bg-gray-800/50 rounded-xl border border-purple-500/20">
                <table className="min-w-full text-gray-300">
                  <thead className="bg-purple-500/20">
                    <tr>
                      <th className="px-4 py-3 text-left">Placement</th>
                      <th className="px-4 py-3 text-center">Points Awarded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries({
                      1: 18, 2: 15, 3: 13, 4: 11, 5: 9, 6: 7, 7: 5, 8: 4, 9: 3, 10: 2
                    }).map(([rank, points]) => (
                      <tr key={rank} className="border-t border-gray-700">
                        <td className="px-4 py-3">#{rank} Place</td>
                        <td className="px-4 py-3 text-center font-semibold text-purple-400">{points} Points</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-gray-300 text-sm">
                <strong>📝 Important Note:</strong> Each tournament match can only include one team type — 
                <span className="text-yellow-400"> Solo</span>, <span className="text-green-400"> Duo</span>, or <span className="text-purple-400"> Squad</span>. 
                Mixed team compositions are not allowed to maintain fair competition.
              </p>
            </div>
          </section>

          {/* Support Section */}
          <section id="support" className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-8 rounded-2xl border border-cyan-500/20 text-center">
            <FaHeadset className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">Need More Help?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Our dedicated support team is available 24/7 to assist you with tournament registrations, 
              payment issues, technical problems, or any other queries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@rushx.live"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaEnvelope className="w-5 h-5" />
                <span>Email Support</span>
              </a>
              <a
                href="/contact"
                className="px-6 py-3 border border-cyan-500 text-cyan-400 font-semibold rounded-xl hover:bg-cyan-500/10 transition-all duration-300"
              >
                Contact Form
              </a>
            </div>
          </section>

          {/* Footer with SEO Content */}
          <footer className="text-center text-gray-500 text-sm pt-10 border-t border-gray-800 mt-10">
            <div className="mb-4">
              <strong className="text-cyan-400">RushX eSports</strong> - India's Premier Gaming Tournaments Platform for 
              <span className="text-green-400 mx-2">Free Fire</span>, 
              <span className="text-blue-400 mx-2">BGMI</span>, and competitive mobile esports.
            </div>
            <div className="space-y-2">
              <div>
                © {new Date().getFullYear()} RushX eSports. All rights reserved. | 
                <span className="mx-2">Tournament Rules</span> | 
                <span className="mx-2">Privacy Policy</span> | 
                <span className="mx-2">Terms of Service</span>
              </div>
              <div className="text-xs text-gray-600">
                Optimized for <strong>Free Fire tournaments</strong>, <strong>BGMI competitions</strong>, and mobile esports gaming.
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}