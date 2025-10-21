// pages/faq.js
import { useState } from "react";
import Head from 'next/head';
import { FaQuestionCircle, FaChevronDown, FaChevronUp, FaSearch, FaEnvelope, FaHeadset } from "react-icons/fa";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // SEO Metadata
  const seoData = {
    title: "FAQ - RushX eSports Tournaments | Payments, Rules, Support",
    description: "Get answers to all your questions about RushX eSports tournaments. Payment issues, tournament rules, scoring system, support contact, and more.",
    canonical: "https://www.rushx.live/faq",
    keywords: "RushX FAQ, esports tournament questions, payment issues, tournament rules, RushX support, gaming tournament help, Free Fire tournaments, BGMI competitions",
    ogImage: "https://www.rushx.live/og-image.jpg"
  }

  // Structured Data for FAQ
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How can I join a tournament on RushX?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Login to your RushX account, go to the Tournaments section, choose a match, click Join Now, fill your details, and complete the payment. Once your transaction is verified, your enrollment will be confirmed."
        }
      },
      {
        "@type": "Question",
        "name": "My payment is done, but it still shows 'Under Review'. What should I do?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Please wait a few minutes while our team verifies your transaction ID. If it takes longer than 30 minutes, contact support with your Transaction ID and username."
        }
      },
      {
        "@type": "Question",
        "name": "When will I get the Room ID and Password?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Room ID and Password will be available in the 'My Team' section about 15–30 minutes before the match begins. You will also receive a notification when it's released."
        }
      },
      {
        "@type": "Question",
        "name": "Can I join a Duo match with only one player?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, all matches are strictly based on their type. Solo matches are for single players, Duo matches for 2-player teams, and Squad matches for 4-player teams."
        }
      },
      {
        "@type": "Question",
        "name": "How are points calculated in tournaments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Points are awarded based on kills and placement. Each match type has a unique scoring system — for example, Solo gives 7 points per kill, Duo gives 5, and Squad gives 3. Placement points also vary accordingly."
        }
      },
      {
        "@type": "Question",
        "name": "Can I change my Game UID or Nickname after joining?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, once you've joined a tournament, your submitted details are locked for fair play. Make sure to enter the correct Game UID and Nickname before submitting."
        }
      },
      {
        "@type": "Question",
        "name": "I can't see my tournament in 'My Team'. What should I do?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If your payment has been approved and you still don't see your tournament, refresh the page or log out and log back in. If the issue continues, contact support."
        }
      },
      {
        "@type": "Question",
        "name": "How can I contact RushX support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can reach out through the in-site Support Chat or email us at support@rushx.live. Our team is available 24/7 to help with payment, tournament, or technical issues."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a refund policy for tournaments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Refunds are only provided if the tournament gets canceled due to technical or server issues from our side. Otherwise, entry fees are non-refundable."
        }
      },
      {
        "@type": "Question",
        "name": "Can I play the same tournament on multiple accounts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, multi-account participation is strictly prohibited. If caught, both accounts will be permanently banned and any rewards forfeited."
        }
      }
    ]
  }

  const faqs = [
    {
      question: "How can I join a tournament on RushX?",
      answer: "Login to your RushX account, go to the Tournaments section, choose a match, click Join Now, fill your details, and complete the payment. Once your transaction is verified, your enrollment will be confirmed.",
      category: "registration"
    },
    {
      question: "My payment is done, but it still shows 'Under Review'. What should I do?",
      answer: "Please wait a few minutes while our team verifies your transaction ID. If it takes longer than 30 minutes, contact support with your Transaction ID and username.",
      category: "payments"
    },
    {
      question: "When will I get the Room ID and Password?",
      answer: "Room ID and Password will be available in the 'My Team' section about 15–30 minutes before the match begins. You will also receive a notification when it's released.",
      category: "tournament"
    },
    {
      question: "Can I join a Duo match with only one player?",
      answer: "No, all matches are strictly based on their type. Solo matches are for single players, Duo matches for 2-player teams, and Squad matches for 4-player teams.",
      category: "rules"
    },
    {
      question: "How are points calculated in tournaments?",
      answer: "Points are awarded based on kills and placement. Each match type has a unique scoring system — for example, Solo gives 7 points per kill, Duo gives 5, and Squad gives 3. Placement points also vary accordingly.",
      category: "scoring"
    },
    {
      question: "Can I change my Game UID or Nickname after joining?",
      answer: "No, once you've joined a tournament, your submitted details are locked for fair play. Make sure to enter the correct Game UID and Nickname before submitting.",
      category: "rules"
    },
    {
      question: "I can't see my tournament in 'My Team'. What should I do?",
      answer: "If your payment has been approved and you still don't see your tournament, refresh the page or log out and log back in. If the issue continues, contact support.",
      category: "technical"
    },
    {
      question: "How can I contact RushX support?",
      answer: "You can reach out through the in-site Support Chat or email us at support@rushx.live. Our team is available 24/7 to help with payment, tournament, or technical issues.",
      category: "support"
    },
    {
      question: "Is there a refund policy for tournaments?",
      answer: "Refunds are only provided if the tournament gets canceled due to technical or server issues from our side. Otherwise, entry fees are non-refundable.",
      category: "payments"
    },
    {
      question: "Can I play the same tournament on multiple accounts?",
      answer: "No, multi-account participation is strictly prohibited. If caught, both accounts will be permanently banned and any rewards forfeited.",
      category: "rules"
    },
  ];

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Category counts for SEO content
  const categoryCounts = {
    registration: faqs.filter(f => f.category === 'registration').length,
    payments: faqs.filter(f => f.category === 'payments').length,
    tournament: faqs.filter(f => f.category === 'tournament').length,
    rules: faqs.filter(f => f.category === 'rules').length,
    scoring: faqs.filter(f => f.category === 'scoring').length,
    technical: faqs.filter(f => f.category === 'technical').length,
    support: faqs.filter(f => f.category === 'support').length,
  };

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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-12 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Header with SEO-rich content */}
          <header className="text-center mb-10">
            <h1 className="text-lg font-extrabold text-cyan-400 flex justify-center items-center space-x-1 md:text-4xl md:space-x-2">
              <FaQuestionCircle className="w-5 h-5 md:w-8 md:h-8" />
              <span>Frequently Asked Questions</span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-lg">
              Find quick answers about tournaments, payments, points, and support on RushX - India's Premier eSports Platform.
            </p>
          </header>

          {/* SEO Content Section */}
          <section className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">RushX eSports Support Center</h2>
                <p className="text-gray-300 mb-4">
                  Get instant answers to common questions about <strong>Free Fire tournaments</strong>, <strong>BGMI competitions</strong>, 
                  payment processing, tournament rules, and technical support. Our comprehensive FAQ covers everything from 
                  registration to prize distribution.
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full">Tournament Registration</span>
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full">Payment Issues</span>
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">Game Rules</span>
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full">Technical Support</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl p-4 border border-cyan-500/20">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FaHeadset className="w-5 h-5 text-cyan-400 mr-2" />
                  Quick Support
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  Can't find your answer? Our support team is available 24/7 to help you.
                </p>
                <div className="flex items-center space-x-2 text-cyan-400">
                  <FaEnvelope className="w-4 h-4" />
                  <span className="text-sm">support@rushx.live</span>
                </div>
              </div>
            </div>
          </section>

          {/* Search Bar */}
          <div className="relative mb-8">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs... (e.g., payment, tournament, rules)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all duration-300"
            />
          </div>

          {/* FAQ Accordion with Schema Markup */}
          <section itemScope itemType="https://schema.org/FAQPage">
            <div className="space-y-3 md:space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-900/60 rounded-xl md:rounded-2xl border border-cyan-500/20 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-cyan-500/40"
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <button
                    className="w-full flex justify-between items-center px-3 py-3 md:px-5 md:py-4 text-left text-sm md:text-lg font-semibold text-cyan-300 hover:text-cyan-400 focus:outline-none"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="truncate" itemProp="name">{faq.question}</span>
                    {openIndex === index ? (
                      <FaChevronUp className="text-cyan-400 w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    ) : (
                      <FaChevronDown className="text-cyan-400 w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    )}
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={`transition-all duration-300 ${
                      openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p className="px-3 pb-3 md:px-5 md:pb-4 text-gray-300 text-sm md:text-base leading-relaxed" itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results Message */}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <FaQuestionCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No FAQs Found</h3>
                <p className="text-gray-400 mb-6">Try searching with different keywords or contact our support team.</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>

          {/* Additional Help Section */}
          <section className="mt-12 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Still Need Help?</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Our support team is dedicated to helping you with any issues related to tournaments, payments, 
                or technical problems. We typically respond within 30 minutes.
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
            </div>
          </section>

          {/* Footer with SEO Keywords */}
          <footer className="text-center text-gray-500 text-sm pt-10 border-t border-gray-800 mt-10">
            <div className="mb-4">
              <strong>RushX eSports</strong> - Premier Gaming Tournaments Platform for 
              <span className="text-cyan-400 mx-2">Free Fire</span>, 
              <span className="text-cyan-400 mx-2">BGMI</span>, 
              <span className="text-cyan-400 mx-2">Valorant</span> 
              and other competitive games.
            </div>
            <div>
              © {new Date().getFullYear()} RushX eSports. All rights reserved. | 
              <span className="mx-2">Tournament Rules</span> | 
              <span className="mx-2">Privacy Policy</span> | 
              <span className="mx-2">Terms of Service</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}