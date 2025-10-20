import { useState } from 'react'
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
  FaHeadset
} from 'react-icons/fa'
import { MdSupportAgent } from 'react-icons/md'

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
          status: 'new'
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
      setContactError('Failed to send message. Please try again.')
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Get in touch with our support team. We're here to help you with any questions about tournaments, registration, or technical issues.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Contact Info */}
              <div>
                

                <div className="space-y-5">
                  {/* Support Availability */}
                  <div className="flex items-center space-x-4 p-6 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <MdSupportAgent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">24/7 Support</h3>
                      <p className="text-gray-400">We're always here to help you</p>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center space-x-4 p-6 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <FaClock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Quick Response</h3>
                      <p className="text-gray-400">Typically reply within 1 hour</p>
                    </div>
                  </div>

                  {/* Expert Support */}
                  <div className="flex items-center space-x-4 p-6 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center">
                      <FaHeadset className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">Expert Support</h3>
                      <p className="text-gray-400">Professional e-sports guidance</p>
                    </div>
                  </div>

                  {/* Additional Contact Methods */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                    <div className="flex items-center space-x-3 p-4 bg-gray-900/30 border border-cyan-500/10 rounded-xl">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <FaEnvelope className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white font-semibold">support@rushx.live</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-900/30 border border-purple-500/10 rounded-xl">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <FaHeadset className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Support</p>

                        <p className="text-white font-semibold">+917051803655</p>
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
                      Thank you for contacting Elite Esports. Our support team will get back to you within 24 hours.
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
                          placeholder="Enter your email"
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
                        <input
                          type="text"
                          name="subject"
                          value={contactForm.subject}
                          onChange={handleContactChange}
                          required
                          className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                          placeholder="What's this about?"
                        />
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
                        placeholder="Tell us about your inquiry, question, or issue..."
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
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    <p className="text-gray-400 text-sm text-center">
                      * Required fields. We respect your privacy and will never share your information with third parties.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default ContactPage