import { Link } from 'react-router-dom';
import { useThemeStore } from '@/lib/theme';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function MarketingFooter() {
  const logoUrl = useThemeStore((state) => state.currentTheme.logoUrl);
  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    support: [
      { name: 'Help Center', href: '/contact' },
      { name: 'Terms of Service', href: '/terms-of-service' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
    { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
    { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  ];

  return (
    // Dark background, light text
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {/* Remove items-start to allow natural vertical alignment based on content height */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Logo and Brand Section - Logo on left, text stack on right */}
          {/* Logo & Social Links Column */}
          <div className="space-y-6 xl:col-span-1"> {/* Added space-y-6 */}
             {/* Large Logo */}
             {/* <img
               src={logoUrl || '/logos/marketing-logo.png'} // Assumes this URL points to the logo with text included
               alt="KapperKing Logo"
               className="h-[15rem] w-auto mx-auto xl:mx-0" // Ensure logo is large, center on small screens, left-align on xl
               onError={(e) => (e.currentTarget.src = '/logos/marketing-logo.png')}
             /> */}
             {/* Tagline Removed */}
             {/* Center social links below logo */}
            <div className="mt-8 flex justify-center space-x-5 xl:justify-start"> {/* Center on small, left-align on xl */}
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          {/* Remove top margin on xl screens as items-start handles alignment */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-3 md:gap-8"> {/* Use 3 columns for links */}
              <div>
                {/* Style header differently */}
                <h3 className="text-base font-semibold text-white tracking-wider uppercase">
                  Product
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                 {/* Style header differently */}
                 <h3 className="text-base font-semibold text-white tracking-wider uppercase">
                   Company
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                 {/* Style header differently */}
                 <h3 className="text-base font-semibold text-white tracking-wider uppercase">
                   Support
                </h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} KapperKing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default MarketingFooter;