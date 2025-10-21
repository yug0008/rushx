import { useState } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaHeadset,
  FaWhatsapp
} from 'react-icons/fa'
import { MdSupportAgent, MdLocationOn } from 'react-icons/md'

const ContactPage = () => {
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError, setContactError] = useState('')

  // SEO Metadata
  const seoData = {
    title: "Contact RushX eSports - 24/7 Support for Tournaments & Gaming Issues",
    description: "Get 24/7 support from RushX eSports team. Contact us for tournament registration help, payment issues, technical support, and gaming queries. Quick response guaranteed.",
    canonical: "https://www.rushx.live/contact",
    keywords: "RushX contact, esports support, tournament help, gaming support, Free Fire tournament issues, BGMI competition help, RushX customer service",
    ogImage: "https://www.rushx.live/og-image.jpg"
  }

  // Structured Data for Contact Page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact RushX eSports Support",
    "description": seoData.description,
    "url": seoData.canonical,
    "mainEntity": {
      "@type": "Organization",
      "name": "RushX eSports",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "telephone": "+917051803655",
          "email": "support@rushx.live",
          "availableLanguage": ["English", "Hindi"],
          "areaServed": "IN",
          "contactOption": "TollFree"
        },
        {
          "@type": "ContactPoint",
          "contactType": "technical support",
          "email": "support@rushx.live",
          "availableLanguage": ["English", "Hindi"]
        }
      ]
    }
  }

  // Contact form handlers
  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
    setContactError('')
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactLoading(true)
    setContactError('')

    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([{
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          subject: contactForm.subject,
          message: contactForm.message,
          status: 'new',
          submitted_at: new Date().toISOString()
        }])

      if (error) throw error

      setContactSuccess(true)
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

      setTimeout(() => setContactSuccess(false), 5000)
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setContactError('Failed to send message. Please try again or contact us directly at support@rushx.live')
    } finally {
      setContactLoading(false)
    }
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
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Header Section */}
          <header className="container mx-auto px-4 py-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Contact RushX Support
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Get 24/7 support from India's premier eSports platform. We're here to help with <strong>tournament registration</strong>, 
                <strong> payment issues</strong>, <strong>technical problems</strong>, and any <strong>gaming-related queries</strong>.
              </p>
            </div>
          </header>

          {/* SEO Content Section */}
          <section className="container mx-auto px-4 mb-12">
            <div className="max-w-4xl mx-auto bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Why Choose RushX Support?</h2>
                  <div className="space-y-4 text-gray-300">
                    <p>
                      As India's leading <strong>eSports tournament platform</strong>, we provide dedicated support for 
                      <strong> Free Fire competitions</strong>, <strong>BGMI tournaments</strong>, and all gaming events. 
                      Our team understands the unique challenges gamers face.
                    </p>
                    <p>
                      Whether you're dealing with payment verification, room ID issues, or tournament rules, 
                      we've got you covered with expert guidance and quick solutions.
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl p-6 border border-cyan-500/20">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FaHeadset className="w-5 h-5 text-cyan-400 mr-2" />
                    Common Support Topics
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Tournament Registration & Payment Issues</li>
                    <li>• Room ID & Password Problems</li>
                    <li>• Score Calculation & Ranking Queries</li>
                    <li>• Technical Support & Game Integration</li>
                    <li>• Prize Distribution & Withdrawal Help</li>
                    <li>• Account Verification & Security</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Contact Info */}
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-4">Get In Touch With Our Team</h2>
                    <p className="text-gray-300 text-lg">
                      Multiple ways to reach us. Choose the method that works best for your query.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Support Availability */}
                    <div className="flex items-center space-x-4 p-6 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <MdSupportAgent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">24/7 eSports Support</h3>
                        <p className="text-gray-400">Round-the-clock assistance for all gaming tournaments</p>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="flex items-center space-x-4 p-6 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <FaClock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Quick Response Time</h3>
                        <p className="text-gray-400">Typically reply within 30-60 minutes</p>
                      </div>
                    </div>

                    {/* Expert Support */}
                    <div className="flex items-center space-x-4 p-6 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <FaHeadset className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">Gaming Experts</h3>
                        <p className="text-gray-400">Professional e-sports tournament guidance</p>
                      </div>
                    </div>

                    {/* Contact Methods Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                      <a 
                        href="mailto:support@rushx.live"
                        className="flex items-center space-x-3 p-4 bg-gray-900/30 border border-cyan-500/10 rounded-xl hover:border-cyan-500/30 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-all">
                          <FaEnvelope className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Email Support</p>
                          <p className="text-white font-semibold">support@rushx.live</p>
                        </div>
                      </a>

                      <a 
                        href="tel:+917051803655"
                        className="flex items-center space-x-3 p-4 bg-gray-900/30 border border-purple-500/10 rounded-xl hover:border-purple-500/30 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-all">
                          <FaHeadset className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Phone Support</p>
                          <p className="text-white font-semibold">+91 70518 03655</p>
                        </div>
                      </a>

                      <a 
                        href="https://wa.me/917051803655"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 bg-gray-900/30 border border-green-500/10 rounded-xl hover:border-green-500/30 transition-all duration-300 group"
                      >
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-all">
                          <FaWhatsapp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">WhatsApp</p>
                          <p className="text-white font-semibold">Quick Chat</p>
                        </div>
                      </a>

                      <div className="flex items-center space-x-3 p-4 bg-gray-900/30 border border-yellow-500/10 rounded-xl">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <MdLocationOn className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Based In</p>
                          <p className="text-white font-semibold">India</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8">
                  {contactSuccess ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheck className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Message Sent Successfully!</h3>
                      <p className="text-gray-300 mb-6">
                        Thank you for contacting <strong>RushX eSports</strong>. Our support team will review your message 
                        and get back to you within 24 hours. For urgent issues, please call us directly.
                      </p>
                      <button
                        onClick={() => setContactSuccess(false)}
                        className="px-6 py-3 border border-cyan-500 text-cyan-400 rounded-xl hover:bg-cyan-500/10 transition-all duration-300"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-white font-semibold flex items-center space-x-2">
                            <FaUser className="w-4 h-4 text-cyan-400" />
                            <span>Full Name *</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={contactForm.name}
                            onChange={handleContactChange}
                            required
                            className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-white font-semibold flex items-center space-x-2">
                            <FaEnvelope className="w-4 h-4 text-cyan-400" />
                            <span>Email Address *</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={contactForm.email}
                            onChange={handleContactChange}
                            required
                            className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                            placeholder="Enter your email address"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-white font-semibold flex items-center space-x-2">
                            <FaPhone className="w-4 h-4 text-cyan-400" />
                            <span>Phone Number</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={contactForm.phone}
                            onChange={handleContactChange}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-white font-semibold flex items-center space-x-2">
                            <FaEnvelope className="w-4 h-4 text-cyan-400" />
                            <span>Subject *</span>
                          </label>
                          <select
                            name="subject"
                            value={contactForm.subject}
                            onChange={handleContactChange}
                            required
                            className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all duration-300"
                          >
                            <option value="">Select a topic</option>
                            <option value="Tournament Registration">Tournament Registration Help</option>
                            <option value="Payment Issues">Payment & Transaction Issues</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Score Dispute">Score & Ranking Dispute</option>
                            <option value="Prize Distribution">Prize Distribution Query</option>
                            <option value="Account Issues">Account & Login Problems</option>
                            <option value="Partnership">Partnership & Business Inquiry</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-white font-semibold flex items-center space-x-2">
                          <FaEnvelope className="w-4 h-4 text-cyan-400" />
                          <span>Message *</span>
                        </label>
                        <textarea
                          name="message"
                          value={contactForm.message}
                          onChange={handleContactChange}
                          required
                          rows="6"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all duration-300 resize-none"
                          placeholder="Please describe your issue in detail. Include tournament names, transaction IDs, or any relevant information that can help us assist you better..."
                        />
                      </div>

                      {contactError && (
                        <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl p-4">
                          <FaTimes className="w-5 h-5" />
                          <span>{contactError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={contactLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                      >
                        {contactLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Sending Message...</span>
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="w-5 h-5" />
                            <span>Send Message to Support Team</span>
                          </>
                        )}
                      </button>

                      <p className="text-gray-400 text-sm text-center">
                        * Required fields. We respect your privacy and will never share your information with third parties. 
                        Your data is protected under our <a href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</a>.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Quick Links */}
          <section className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-8">Quick Help Resources</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <a href="/faq" className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300 group">
                  <FaHeadset className="w-8 h-8 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">FAQ Center</h3>
                  <p className="text-gray-400 text-sm">Find quick answers to common questions</p>
                </a>
                <a href="/help" className="bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-300 group">
                  <FaUser className="w-8 h-8 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Help Guides</h3>
                  <p className="text-gray-400 text-sm">Step-by-step tutorials and guides</p>
                </a>
                <a href="/tournaments" className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 group">
                  <FaHeadset className="w-8 h-8 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold mb-2">Tournaments</h3>
                  <p className="text-gray-400 text-sm">Browse ongoing competitions</p>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default ContactPage