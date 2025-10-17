import Link from 'next/link';
import { 
  FaTwitch, 
  FaYoutube, 
  FaTwitter, 
  FaDiscord, 
  FaInstagram,
  FaEnvelope,
  FaCrown,
  FaUsers,
  FaTrophy,
  FaCalendarAlt,
  FaGamepad,
  FaShieldAlt,
  FaQuestionCircle,
  FaHeadset
} from 'react-icons/fa';
import { GiTrophyCup } from 'react-icons/gi';
import { SiNvidia, SiRazer } from 'react-icons/si';
import { IoGameController } from 'react-icons/io5';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Tournaments',
      icon: <GiTrophyCup className="w-4 h-4" />,
      links: [
        { name: 'Upcoming Events', href: '/tournaments', icon: <FaCalendarAlt className="w-3 h-3" /> },
        { name: 'Past Tournaments', href: '/results', icon: <FaTrophy className="w-3 h-3" /> },
        { name: 'Tournament Rules', href: '/rules', icon: <FaShieldAlt className="w-3 h-3" /> },
        { name: 'Watch', href: '/watch', icon: <FaTwitch className="w-3 h-3" /> },
      ],
    },
    {
      title: 'Games',
      icon: <FaGamepad className="w-4 h-4" />,
      links: [
        { name: 'Free Fire', href: '/games/valorant', icon: <IoGameController className="w-3 h-3" /> },
        { name: 'CS2', href: '/games/cs2', icon: <IoGameController className="w-3 h-3" /> },
        { name: 'League of Legends', href: '/games/lol', icon: <IoGameController className="w-3 h-3" /> },
        { name: 'BGMI', href: '/games/dota2', icon: <IoGameController className="w-3 h-3" /> },
        { name: 'Overwatch 2', href: '/games/overwatch', icon: <IoGameController className="w-3 h-3" /> },
      ],
    },
    {
      title: 'Community',
      icon: <FaUsers className="w-4 h-4" />,
      links: [
        
        { name: 'Players', href: '/players', icon: <FaCrown className="w-3 h-3" /> },
        
        { name: 'Forums', href: '/forums', icon: <FaDiscord className="w-3 h-3" /> },
        { name: 'Discord', href: 'https://discord.gg/esports', icon: <FaDiscord className="w-3 h-3" /> },
      ],
    },
    {
      title: 'Support',
      icon: <FaHeadset className="w-4 h-4" />,
      links: [
        { name: 'Help Center', href: '/help', icon: <FaQuestionCircle className="w-3 h-3" /> },
        { name: 'Contact Us', href: '/contact', icon: <FaEnvelope className="w-3 h-3" /> },
        { name: 'FAQ', href: '/faq', icon: <FaQuestionCircle className="w-3 h-3" /> },
        { name: 'Terms of Service', href: '/terms', icon: <FaShieldAlt className="w-3 h-3" /> },
        { name: 'Privacy Policy', href: '/privacy', icon: <FaShieldAlt className="w-3 h-3" /> },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Twitch', icon: <FaTwitch className="w-5 h-5" />, href: 'https://twitch.tv' },
    { name: 'YouTube', icon: <FaYoutube className="w-5 h-5" />, href: 'https://youtube.com' },
    { name: 'Twitter', icon: <FaTwitter className="w-5 h-5" />, href: 'https://twitter.com' },
    { name: 'Discord', icon: <FaDiscord className="w-5 h-5" />, href: 'https://discord.gg' },
    { name: 'Instagram', icon: <FaInstagram className="w-5 h-5" />, href: 'https://instagram.com' },
  ];

  const partners = [
    { name: 'NVIDIA', icon: <SiNvidia className="w-6 h-6" /> },
    { name: 'RAZER', icon: <SiRazer className="w-6 h-6" /> },
    { name: 'RED BULL', icon: <FaCrown className="w-5 h-5" /> },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 border-t border-cyan-500/20">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center">
                <GiTrophyCup className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-wider">RUSHX</span>
                <span className="text-cyan-400 text-xs font-semibold tracking-widest">ESPORTS</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The premier destination for competitive gaming. Join thousands of players 
              in our elite tournaments and experience esports like never before.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white hover:bg-cyan-500 hover:scale-110 transition-all duration-300 group"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-bold text-lg mb-6 relative inline-flex items-center space-x-2">
                {section.icon}
                <span>{section.title}</span>
                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-600"></span>
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="flex items-center space-x-2">
                        {link.icon}
                        <span>{link.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-white font-bold text-2xl mb-4 flex items-center justify-center space-x-2">
              <FaEnvelope className="w-6 h-6 text-cyan-400" />
              <span>Stay in the RUSHX</span>
            </h3>
            <p className="text-gray-400 mb-6">
              Get the latest tournament updates, meta shifts, and exclusive content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              />
              <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
                <FaEnvelope className="w-4 h-4" />
                <span>Subscribe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} RUSHX Esports. All rights reserved. Powered by passion.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Partners:</span>
              <div className="flex space-x-4 opacity-60">
                {partners.map((partner) => (
                  <div key={partner.name} className="flex items-center space-x-1 hover:text-cyan-400 cursor-pointer transition-colors">
                    {partner.icon}
                    <span>{partner.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;