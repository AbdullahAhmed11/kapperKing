import  { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail,  Clock, LogOut, CircleUserRound   } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; 
import { ClassNames } from '@emotion/react';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  imagePath?: string;
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
  Image?:string;
  // any other fields you expect
};

const SalonMicrosite = () => {
  
  const token = Cookies.get('customerToken');
  
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
 
  if (token && decoded) {
    console.log('customer ID:', decoded);
  }

  // Mock data for static preview
  const {id} = useParams()
  type SalonData = {
    name: string;
    primaryColor?: string;
    bodyFont?: string;
    instagramLink?: string;
    facebookLink?: string;
    twitterLink?: string; 
    pageTitle?: string; 
    aboutDescription?:string;
    aboutImage?:string;
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
    salonPhone?:string;
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
  const [galary, setAllGallary] = useState<any[]>([])
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
  const getAllGallaries = async () => {
    try{
      const res = await axios.get(`https://kapperking.runasp.net/api/Salons/GetMicrositeGallaries?micrositeId=${id}`)
      setAllGallary(res.data)
    }catch(error) {
      console.log(error)
    }
  }
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
      getStylists();
      fetchServices();
      getAllGallaries();
    }, [ ]);

  const getSalonData = async () => {
    try {
      const response  = await axios.get(`https://kapperking.runasp.net/api/Salons/GetMicrositeInfo?salonId=${id}`)
      setAllSalonData(response.data)
      console.log(response.data, "testData")
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
      console.log(response.data, "testInfo")
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
const handleLogout = () => {
  Cookies.remove('customerToken');
  window.location.reload(); // Refresh the page
};
  return (
    <div className="microsite-wrapper font-sans" style={{ fontFamily: salonData?.bodyFont }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">
                {/* {microSiteConfig.salon.name} */}
                {salonData?.pageTitle}
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
  {token ? (
    <div className="flex items-center space-x-4">
      <p className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
        {decoded?.FirstName} {decoded?.LastName}
      </p>
      <button 
        onClick={handleLogout}
        className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
      >
        <LogOut className="h-4 w-4 mr-1" /> Logout
      </button>

      <div className='w-[50px] h-[50px] rounded-full '>
        {
          decoded?.Image ? (
            <Link to="/booked">
              <img className="w-full h-fulll" src={`https://kapperking.runasp.net${decoded?.Image}`} alt="img" />
            </Link>
          ) : (
            <Link to="/booked">
              <CircleUserRound className="w-full h-fulll"/>
            </Link>
          )
        }
      </div>
    </div>
  ) : (
    <a href={`${id}/login`} className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
      My Account
    </a>
  )}
</div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative bg-gray-800 text-white py-24 md:py-32 lg:py-40 overflow-hidden" style={{ backgroundColor: salonData?.primaryColor }}>
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

            <Link to={`/s/${salonInfo?.name}/book`}>
           <Button size="lg" className="bg-white text-black hover:opacity-90">
              Book Now
            </Button>
            </Link>
              ) : (

            <Link to={`/s/${salonInfo?.name}/${id}/login`}>
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
            <p className="text-gray-600 leading-relaxed">{salonData?.aboutDescription}</p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg bg-gray-200 h-64">
            <img src={`https://kapperking.runasp.net${salonData?.aboutImage}`} className='w-full h-full'/>
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
                {/* <p className="text-sm text-primary mb-2">{member.email}</p> */}
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
            {galary.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-lg shadow-md aspect-square bg-gray-200">
                  <img src={`https://kapperking.runasp.net${image.image}`}  className='w-full h-full'/>
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
      {/* <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} {microSiteConfig.salon.name}. All rights reserved.
          </p>
        </div>
      </footer> */}
      {/* Updated Footer Section */}
<footer className="bg-gray-900 border-t border-gray-800">
  <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Social Media Links */}
      <div className="flex space-x-6">
        {salonData?.facebookLink && (
          <a 
            href={salonData.facebookLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
        )}
        
        {salonData?.instagramLink && (
          <a 
            href={salonData.instagramLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        )}
        
        {salonData?.twitterLink && (
          <a 
            href={salonData.twitterLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </a>
        )}
      </div>
      
      {/* Copyright */}
      <p className="text-center text-base text-gray-400">
        &copy; {new Date().getFullYear()} {salonInfo?.name || 'Your Salon'}. All rights reserved. Powered by KapperKing.
      </p>
    </div>
  </div>
</footer>
    </div>
  );
};

export default SalonMicrosite;