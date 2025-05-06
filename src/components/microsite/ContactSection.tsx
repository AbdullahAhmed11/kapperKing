import React, { useState } from 'react'; // Import useState
import { MapPin, Phone, Mail, Loader2 } from 'lucide-react'; // Import Loader2
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MicroSite } from '@/lib/store/microsite'; 
import { toast } from 'sonner'; // Import toast
import { supabase } from '@/lib/supabase'; // Import supabase client

interface ContactSectionProps {
  siteConfig: MicroSite | null; 
}

export function ContactSection({ siteConfig }: ContactSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  if (!siteConfig?.salon) {
    return null; 
  }

  const salon = siteConfig.salon;
  // Use detailed address fields if available, otherwise fallback
  const address = [
     salon.address_line1, 
     salon.address_line2, 
     salon.city, 
     salon.postal_code, 
     salon.country
  ].filter(Boolean).join(', ');

  // Make the handler async
  const handleFormSubmit = async (e: React.FormEvent) => { 
     e.preventDefault();
     if (!salon?.id) {
        toast.error("Cannot send message: Salon ID is missing.");
        return;
     }
     setIsSubmitting(true); // Set loading true
     const formData = new FormData(e.target as HTMLFormElement);
     const payload = {
        salonId: salon.id,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        subject: formData.get('subject') as string,
        message: formData.get('message') as string,
     };

     try {
        // Call the edge function
        const { data, error } = await supabase.functions.invoke('send-contact-email', {
           body: payload,
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        toast.success(data.message || "Message sent successfully!");
        (e.target as HTMLFormElement).reset(); // Reset form
     } catch (error: any) {
        console.error("Error sending contact form:", error);
        toast.error(`Failed to send message: ${error.message}`);
     } finally {
        setIsSubmitting(false); // Set loading false
     }
  };

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Get In Touch</h2>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Contact Info & Map */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Contact Information</h3>
              {address && (
                <div className="flex items-start mb-3">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
                  <p className="text-gray-600">{address}</p>
                </div>
              )}
              {salon.phone && (
                <div className="flex items-center mb-3">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <a href={`tel:${salon.phone}`} className="text-gray-600 hover:text-primary">{salon.phone}</a>
                </div>
              )}
              {salon.email && (
                <div className="flex items-center mb-3">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                   <a href={`mailto:${salon.email}`} className="text-gray-600 hover:text-primary">{salon.email}</a>
                </div>
              )}
            </div>
            {/* Map Placeholder */}
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
               Map Placeholder
            </div>
          </div>

          {/* Contact Form */}
          <div>
             <h3 className="text-xl font-semibold mb-3 text-gray-800">Send Us a Message</h3>
             <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                   <Label htmlFor="contact-name">Name</Label>
                   <Input id="contact-name" name="name" required className="mt-1"/>
                </div>
                 <div>
                   <Label htmlFor="contact-email">Email</Label>
                   <Input id="contact-email" name="email" type="email" required className="mt-1"/>
                </div>
                 <div>
                   <Label htmlFor="contact-subject">Subject</Label>
                   <Input id="contact-subject" name="subject" required className="mt-1"/>
                </div>
                <div>
                   <Label htmlFor="contact-message">Message</Label>
                   <Textarea id="contact-message" name="message" rows={4} required className="mt-1"/>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                   {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                   {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
             </form>
          </div>
        </div>
      </div>
    </section>
  );
}