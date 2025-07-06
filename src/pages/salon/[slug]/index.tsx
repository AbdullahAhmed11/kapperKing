// import React, { useEffect } from 'react';
// import { useParams, Link, useLocation } from 'react-router-dom'; // Added useLocation back
// import { useMicroSiteStore, MicroSite, GalleryImage, Testimonial, ThemeConfig } from '@/lib/store/microsite'; // Import ThemeConfig
// import { useServiceStore, Service } from '@/lib/store/services'; 
// import { useStaffStore, StaffMember } from '@/lib/store/staff'; 
// import { useProductStore, Product } from '@/lib/store/products'; 
// import { Button } from '@/components/ui/button';
// import { ContactSection } from '@/components/microsite/ContactSection'; 
// import { MapPin, Phone, Mail, Star, Clock, Scissors, Loader2, AlertCircle, Settings } from 'lucide-react'; 
// import { formatCurrency } from '@/lib/utils'; 
// import { toast } from 'sonner'; 

// // Helper function to apply theme variables for the microsite
// const applyMicrositeTheme = (themeConfig: ThemeConfig | null | undefined) => {
//   const root = document.documentElement;
//   // Define defaults matching ThemeConfig structure
//   const defaultTheme: ThemeConfig = { 
//      colors: { primary: '#6366f1', secondary: '#ec4899' }, 
//      fonts: { heading: 'Inter', body: 'Inter' }, 
//      layout: { header: 'default', footer: 'default' } 
//   };

//   const colors = themeConfig?.colors || defaultTheme.colors;
//   const fonts = themeConfig?.fonts || defaultTheme.fonts;
//   // const layout = themeConfig?.layout || defaultTheme.layout; // Use if applying layout styles

//   root.style.setProperty('--primary', colors.primary); 
//   root.style.setProperty('--secondary', colors.secondary); 
//   root.style.setProperty('--font-heading', fonts.heading);
//   root.style.setProperty('--font-body', fonts.body);
// };

// // Helper to parse query params (needed for booking link)
// function useQuery() {
//   return new URLSearchParams(useLocation().search);
// }


// export default function SalonMicrosite() {
//   const { slug } = useParams<{ slug: string }>(); 
//   const { site: microSiteConfig, loading, error, fetchSite } = useMicroSiteStore(); 
//   const { services, fetchServices } = useServiceStore();
//   const { staff, fetchStaff } = useStaffStore();
//   const { products, fetchProducts } = useProductStore(); 

//   useEffect(() => {
//     if (slug) {
//       fetchSite(slug);
//     }
//   }, [slug, fetchSite]);

//   // Fetch related data and apply theme once salon ID and theme config are available
//   useEffect(() => {
//     const salonId = microSiteConfig?.salon?.id;
//     const themeConfig = microSiteConfig?.themeConfig; // Use themeConfig from site object
    
//     if (salonId) {
//       fetchServices(salonId);
//       fetchStaff(salonId);
//       fetchProducts(salonId); 
//     }
//     applyMicrositeTheme(themeConfig); 

//   }, [microSiteConfig?.salon?.id, microSiteConfig?.themeConfig, fetchServices, fetchStaff, fetchProducts]); 


//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" /> 
//       </div>
//     );
//   }

// //   if (error || !microSiteConfig) { 
// //     return (
// //       <div className="flex items-center justify-center min-h-screen">
// //         <div className="text-center">
// //           <h1 className="text-2xl font-bold text-gray-900">Error</h1>
// //           <p className="mt-2 text-gray-500">{error || 'Salon not found'}</p>
// //           <Link to="/"><Button className="mt-4">Back to Home</Button></Link>
// //         </div>
// //       </div>
// //     );
// //   }

//   const salonServices = services; 
//   const staffMembers = staff; 
//   const salonProducts = products; 
//   const galleryImages = microSiteConfig?.gallery || []; 
//   const testimonials = microSiteConfig?.testimonials || []; 

//   const address = [
//      microSiteConfig?.salon.address_line1, microSiteConfig?.salon.address_line2, 
//      microSiteConfig?.salon.city, microSiteConfig?.salon.postal_code, microSiteConfig?.salon.country
//   ].filter(Boolean).join(', ');

//   return (
//     <div className="microsite-wrapper font-sans" style={{ fontFamily: 'var(--font-body)' }}> 
//       {/* Header */}
//       <header className="bg-white shadow-sm sticky top-0 z-50">
//         <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex-shrink-0 flex items-center">
//               {microSiteConfig?.salon?.logo_url ? (
//                 <img src={microSiteConfig?.salon.logo_url} alt={microSiteConfig?.salon.name} className="h-10 w-auto" />
//               ) : (
//                 <span className="text-xl font-bold text-gray-900">{microSiteConfig?.salon?.name || 'Salon'}</span>
//               )}
//             </div>
//             <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
//                {(microSiteConfig?.navigation && microSiteConfig?.navigation.length > 0 ? microSiteConfig?.navigation : [
//                   { label: 'Home', url: '#home' }, { label: 'Services', url: '#services' }, { label: 'Team', url: '#team' },
//                   { label: 'Gallery', url: '#gallery' }, { label: 'Contact', url: '#contact' },
//                ]).map((item) => (
//                  <a key={item.url} href={item.url} className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
//                    {item.label}
//                  </a>
//                ))}
//                <Link to={`/c/login?salonId=${microSiteConfig?.salon?.id || ''}`} className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
//                   My Account
//                </Link>
//             </div>
//           </div>
//         </nav>
//       </header>

//       {/* Hero Section */}
//       <section id="home" className="relative bg-gray-800 text-white py-24 md:py-32 lg:py-40 overflow-hidden">
//          {microSiteConfig?.hero?.background_image_url && (
//              <img src={microSiteConfig?.hero.background_image_url} alt="Salon Hero" className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"/>
//          )}
//          <div className="relative z-10 container mx-auto px-4 text-center">
//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading" style={{ fontFamily: 'var(--font-heading)' }}>
//                <span className="block">{microSiteConfig?.hero?.title || `Experience Luxury Hair Care`}</span>
//                <span className="block text-primary mt-2">{microSiteConfig?.hero?.subtitle || `Style, Elegance, Professionalism`}</span> 
//             </h1>
//             <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
//                {microSiteConfig?.about?.content || `Discover your best look with our expert stylists and premium services.`} 
//             </p>
//             <div className="mt-10">
//                <Link to={microSiteConfig?.hero?.cta_url || `/s/${slug}/book`}>
//                   <Button size="lg" className="bg-primary hover:opacity-90 text-primary-foreground"> 
//                      {microSiteConfig?.hero?.cta_label || 'Book Now'}
//                   </Button>
//                </Link>
//             </div>
//          </div>
//       </section>

//       {/* About Section */}
//       <section id="about" className="py-16">
//          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
//             <div>
//                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>{microSiteConfig?.about?.heading || 'About Us'}</h2>
//                <p className="text-gray-600 leading-relaxed">{microSiteConfig.about?.content || 'Information about the salon goes here.'}</p>
//             </div>
//             {microSiteConfig.about?.image_url && (
//                <div className="rounded-lg overflow-hidden shadow-lg">
//                   <img src={microSiteConfig.about.image_url} alt="About the salon" className="w-full h-auto object-cover"/>
//                </div>
//             )}
//          </div>
//       </section>

//       {/* Services Section */}
//       <section id="services" className="py-16 bg-gray-50">
//          <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>Our Premium Services</h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//                {salonServices.map((service: Service) => ( 
//                   <div key={service.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
//                      <h3 className="text-xl font-semibold mb-2 text-gray-800 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>{service.name}</h3>
//                      <p className="text-sm text-gray-500 mb-3">{service.description || 'No description available.'}</p>
//                      <div className="flex justify-between items-center text-sm text-gray-600">
//                         <span className="flex items-center"><Clock className="h-4 w-4 mr-1"/> {service.duration} min</span>
//                         <span className="font-medium text-primary">{formatCurrency(service.price)}</span>
//                      </div>
//                   </div>
//                ))}
//                {salonServices.length === 0 && <p className="col-span-full text-center text-gray-500">No services listed currently.</p>}
//             </div>
//          </div>
//       </section>

//       {/* Team Section */}
//       <section id="team" className="py-16">
//          <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>Meet Our Expert Team</h2>
//             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
//                {staffMembers.map((member: StaffMember) => ( 
//                   <div key={member.id} className="text-center bg-white p-6 rounded-lg shadow-md border border-gray-100">
//                      <img src={member.imageUrl || '/images/placeholders/avatar.png'} alt={`${member.firstName} ${member.lastName}`} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"/>
//                      <h3 className="text-lg font-semibold text-gray-800 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>{member.firstName} {member.lastName}</h3>
//                      <p className="text-sm text-primary mb-2">{member.title || member.role}</p>
//                   </div>
//                ))}
//                {staffMembers.length === 0 && <p className="col-span-full text-center text-gray-500">Team information coming soon.</p>}
//             </div>
//          </div>
//       </section>

//       {/* Gallery Section */}
//       <section id="gallery" className="py-16 bg-gray-50">
//          <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>Gallery</h2>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                {galleryImages.map((image) => (
//                   <div key={image.id} className="overflow-hidden rounded-lg shadow-md aspect-square">
//                      <img src={image.src} alt={image.alt || 'Salon gallery image'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"/>
//                   </div>
//                ))}
//                {galleryImages.length === 0 && <p className="col-span-full text-center text-gray-500">Gallery coming soon.</p>}
//             </div>
//          </div>
//       </section>
      
//       {/* Products Section */}
//       <section id="products" className="py-16">
//          <div className="container mx-auto px-4">
//             <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>Featured Products</h2>
//             <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                {salonProducts.map((product: Product) => ( 
//                   <div key={product.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-100 text-center">
//                      <img src={product.image_url || '/images/placeholders/product.png'} alt={product.name} className="w-full h-40 object-contain mb-3"/>
//                      <h4 className="font-semibold text-gray-800 font-heading" style={{ fontFamily: 'var(--font-heading)' }}>{product.name}</h4>
//                      <p className="text-sm text-primary font-medium">{formatCurrency(product.price)}</p>
//                   </div>
//                ))}
//                {salonProducts.length === 0 && <p className="col-span-full text-center text-gray-500">Products coming soon.</p>}
//             </div>
//          </div>
//       </section>

//       {/* Contact Section Component */}
//       <ContactSection siteConfig={microSiteConfig} /> 

//       {/* Footer */}
//       <footer className="bg-gray-900 border-t border-gray-800">
//         <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//           <p className="text-center text-base text-gray-400">
//             &copy; {new Date().getFullYear()} {microSiteConfig.salon?.name || 'Your Salon'}. All rights reserved. Powered by KapperKing.
//           </p>
//           {/* TODO: Render Social Links Here */}
//         </div>
//       </footer>

//       {/* Custom CSS/Scripts */}
//       {microSiteConfig.customCss && <style>{microSiteConfig.customCss}</style>}
//       {microSiteConfig.customScripts && <script dangerouslySetInnerHTML={{ __html: microSiteConfig.customScripts || '' }} />}
//     </div> 
//   );
// }



import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Star, Clock, Scissors } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; 

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}
interface Service {
  id: number;
  name: string;
  categoryName: string;
  duration: number;
  price: number;
  description?: string;
  active: boolean;
  salon_id: number;
}
type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  name?: string;
  FirstName?: string;
  LastName?: string;
  // any other fields you expect
};

const SalonMicrosite = () => {
  
  const token = Cookies.get('customerToken');
  
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
  if (token && decoded) {
    console.log('User ID:', decoded.Id);
  }

  // Mock data for static preview
  const {id} = useParams()
  type SalonData = {
    name: string;
    primaryColor?: string;
    bodyFont?: string;
    // add other fields as needed
  };
  const [salonData, setAllSalonData] = useState<SalonData | null>(null)
  type SalonInfo = {
    address?: string;
    city?: string;
    name?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    // add other fields as needed
  };
  const [salonInfo, setAllSalonInfo] = useState<SalonInfo | null>(null)
  const [loading, setLoading] = useState(true);
  type SalonProduct = {
    id: number;
    name: string;
    price: number;
    imagePath?: string;
    image_url?: string;
  };
  const [salonProductss, setSalonProducts] = useState<SalonProduct[]>([])
  const [stylists, setStylists] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/${id}`);
      setServices(response.data);
    } catch (err) {
     console.log(err)
    } finally {
      setLoading(false);
    }
  };
  const getStylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${id}`);
      setStylists(response.data)
    } catch (err) {
      console.error('Error fetching stylists:', err);
    } finally {
      setLoading(false);
    }
  };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://kapperking.runasp.net/api/Products/GetProducts/${id}`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setSalonProducts(data);
        console.log('Fetched products:', data);
      } catch (err: any) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchProducts();
      getStylists()
      fetchServices()
    }, [ ]);

  const getSalonData = async () => {
    try {
      const response  = await axios.get(`https://kapperking.runasp.net/api/Salons/GetMicrositeInfo?salonId=${id}`)
      setAllSalonData(response.data)
      console.log(response.data, "test")
    }catch(error) {
      console.log(error)
    }finally {
      setLoading(false);
    }
  }
  const getSalonInfo = async () => {
    try {
      const response  = await axios.get(`https://kapperking.runasp.net/api/Salons/GetSalonById/${id}`)
      setAllSalonInfo(response.data)
      console.log(response.data, "test")
    }catch(error) {
      console.log(error)
    }finally {
      setLoading(false);
    }
  }
    useEffect(() => {
      getSalonData()
      getSalonInfo()
    },[])


  const microSiteConfig = {
    salon: {
      id: 1,
      name: 'Luxury Hair Studio',
      logo_url: '/placeholder-logo.png',
      address_line1: '123 Beauty Street',
      city: 'New York',
      postal_code: '10001',
      country: 'USA',
      phone: '+1 (555) 123-4567',
      email: 'info@luxuryhairstudio.com'
    },
    hero: {
      title: 'Experience Luxury Hair Care',
      subtitle: 'Style, Elegance, Professionalism',
      cta_label: 'Book Now',
      cta_url: '/book',
      background_image_url: '/placeholder-hero.jpg'
    },
    about: {
      heading: 'About Us',
      content: 'Our salon has been providing premium hair services for over 10 years. Our team of expert stylists is dedicated to making you look and feel your best.',
      image_url: '/placeholder-about.jpg'
    },
    navigation: [
      { label: 'Home', url: '#home' },
      { label: 'Services', url: '#services' },
      { label: 'Team', url: '#team' },
      { label: 'Gallery', url: '#gallery' },
      { label: 'Contact', url: '#contact' }
    ],
    themeConfig: {
      colors: {
        primary: '#6366f1',
        secondary: '#ec4899'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter'
      }
    }
  };


  const galleryImages = [
    { id: 1, src: '/placeholder-gallery1.jpg', alt: 'Salon interior' },
    { id: 2, src: '/placeholder-gallery2.jpg', alt: 'Hair styling' },
    { id: 3, src: '/placeholder-gallery3.jpg', alt: 'Color service' }
  ];



const address = [
    salonInfo?.address,
    salonInfo?.city,
    salonInfo?.postalCode,
    salonInfo?.country
  ].filter(Boolean).join(', ');

  if (loading) return <div className="text-center py-20">Loading...</div>;

  // if (!salonData) return <div className="text-center py-20">No salon data found.</div>;

  return (
    <div className="microsite-wrapper font-sans" style={{ fontFamily: salonData?.bodyFont }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">
                {microSiteConfig.salon.name}
              </span>
            </div>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              {microSiteConfig.navigation.map((item) => (
                <a
                  key={item.url}
                  href={item.url}
                  className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                >
                  {item.label}
                </a>
              ))}
              {
                token ? (
                    <p className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                      {decoded?.FirstName} {decoded?.LastName}
                    </p>
                ) : (

                  <a href={`${id}/login`} className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    My Account
                  </a>
                )
              }
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-gray-800 text-white py-24 md:py-32 lg:py-40 overflow-hidden" style={{ backgroundColor: salonData.primaryColor }}>
        <div className="absolute inset-0 w-full h-full bg-gray-700 opacity-40"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            <span className="block">{microSiteConfig.hero.title}</span>
            <span className="block text-primary mt-2">{microSiteConfig.hero.subtitle}</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
            {microSiteConfig.about.content}
          </p>
          <div className="mt-10">
            {
              token ? (

            <Link to={`/s/${salonInfo.name}/book`}>
           <Button size="lg" className="bg-white text-black hover:opacity-90">
              Book Now
            </Button>
            </Link>
              ) : (

            <Link to={`/s/${salonInfo.name}/${id}/login`}>
         <Button size="lg" className="bg-white text-black hover:opacity-90">
              Book Now
            </Button>
            </Link>
              )
            }
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{microSiteConfig.about.heading}</h2>
            <p className="text-gray-600 leading-relaxed">{microSiteConfig.about.content}</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg bg-gray-200 h-64">
            {/* Placeholder for about image */}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Premium Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{service.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> {service.duration} min
                  </span>
                  <span className="font-medium text-primary">{formatCurrency(service.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet Our Expert Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stylists.map((member) => (
              <div key={member.id} className="text-center bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200">
                   {
                      member.imagePath ? (
                        <img src={`https://kapperking.runasp.net/${member.imagePath}` || '/images/placeholders/product-default.png'} alt={member.firstName} className="h-full w-full object-contain" />
                        
                      ) : (
                        <div  className="h-full w-full object-contain"></div>

                      )
                    }
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-sm text-primary mb-2">{member.phone}</p>
                <p className="text-sm text-primary mb-2">{member.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg shadow-md aspect-square bg-gray-200">
                {/* Placeholder for gallery image */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Products</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {salonProductss.map((product) => (
              <div key={product?.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-100 text-center">
                 <div className="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                    {
                      product.imagePath ? (
                        <img src={`https://kapperking.runasp.net/${product.imagePath}` || '/images/placeholders/product-default.png'} alt={product.name} className="h-full w-full object-contain" />
                        
                      ) : (
                        <img src={'/images/placeholders/product-default.png'} alt={product.name} className="h-full w-full object-contain" />

                      )
                    }
                  </div>
                <h4 className="font-semibold text-gray-800">{product.name}</h4>
                <p className="text-sm text-primary font-medium">{formatCurrency(product.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Contact Us</h2>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium text-gray-900">Address</h3>
                  <p className="text-gray-600">{address}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium text-gray-900">Phone</h3>
                  <p className="text-gray-600">{salonInfo?.salonPhone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 mt-1 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">{salonInfo?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} {microSiteConfig.salon.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SalonMicrosite;