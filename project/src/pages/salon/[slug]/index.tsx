import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMicroSiteStore } from '@/lib/store/microsite';

export default function SalonMicrosite() {
  const { slug } = useParams();
  const { site, loading, error, fetchSite } = useMicroSiteStore();

  useEffect(() => {
    if (slug) {
      fetchSite(slug);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="mt-2 text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Salon Not Found</h1>
          <p className="mt-2 text-gray-500">The salon you're looking for doesn't exist or isn't published.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        '--primary-color': site.salon.theme_colors.primary,
        '--secondary-color': site.salon.theme_colors.secondary,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {site.salon.logo_url ? (
                  <img 
                    src={site.salon.logo_url} 
                    alt={site.salon.name}
                    className="h-8 w-auto"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    {site.salon.name}
                  </span>
                )}
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {site.navigation.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center">
              <a
                href="#book"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-primary-600">{site.salon.name}</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Professional hair salon services tailored to your style.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <a
                  href="#services"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                >
                  View Services
                </a>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a
                  href="#contact"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Services</h2>
            <p className="mt-4 text-lg text-gray-500">
              Professional services for every style and occasion
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {site.services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{service.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-primary-600 font-medium">€{service.price}</span>
                  <span className="text-sm text-gray-500">{service.duration} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Section */}
      <div id="staff" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Team</h2>
            <p className="mt-4 text-lg text-gray-500">
              Meet our experienced stylists
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {site.staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-center"
              >
                <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {member.services.map((serviceId) => {
                    const service = site.services.find(s => s.id === serviceId);
                    return service ? (
                      <span
                        key={serviceId}
                        className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800"
                      >
                        {service.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      {site.testimonials.length > 0 && (
        <div id="testimonials" className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">What Our Clients Say</h2>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {site.testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15.934l-6.18 3.246 1.18-6.874L.001 7.684l6.902-1.003L10 .5l3.097 6.181 6.902 1.003-4.999 4.622 1.18 6.874z"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600">{testimonial.content}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                      {testimonial.client.firstName} {testimonial.client.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div id="contact" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Contact Us</h2>
            <p className="mt-4 text-lg text-gray-500">
              Get in touch with us
            </p>
          </div>

          <div className="mt-16 max-w-lg mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Location</h3>
                  <p className="mt-2 text-gray-500">{site.salon.address}</p>
                  <p className="text-gray-500">{site.salon.city}, {site.salon.country}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Contact</h3>
                  <p className="mt-2 text-gray-500">{site.salon.email}</p>
                  {site.salon.phone && (
                    <p className="text-gray-500">{site.salon.phone}</p>
                  )}
                </div>

                {Object.keys(site.socialLinks).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Follow Us</h3>
                    <div className="mt-2 flex space-x-4">
                      {Object.entries(site.socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          className="text-gray-400 hover:text-gray-500"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} {site.salon.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom CSS */}
      {site.customCss && (
        <style>{site.customCss}</style>
      )}

      {/* Custom Scripts */}
      {site.customScripts && (
        <script dangerouslySetInnerHTML={{ __html: site.customScripts }} />
      )}
    </div>
  );
}