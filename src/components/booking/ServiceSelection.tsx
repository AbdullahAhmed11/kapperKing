import React, { useEffect, useState } from 'react';
import { useServiceStore } from '@/lib/store/services';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

interface ServiceSelectionProps {
  salonId: string;
  onServiceSelected: (serviceId: string) => void;
}

export function ServiceSelection({ salonId, onServiceSelected }: ServiceSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { services, loading, fetchServices } = useServiceStore();

  useEffect(() => {
    if (salonId) { // Ensure salonId is available
      fetchServices(salonId); // Pass salonId
    }
  }, [salonId, fetchServices]); // Add dependencies

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Select a Service</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose the service you'd like to book
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {filteredServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onServiceSelected(service.id)}
            className="w-full text-left bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-1 text-sm text-gray-500">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(service.price)}
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  {service.duration} min
                </p>
              </div>
            </div>
          </button>
        ))}

        {filteredServices.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              No services found matching your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// import React, { useState } from 'react';
// import { Search } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { formatCurrency } from '@/lib/utils';

// interface Service {
//   id: string;
//   name: string;
//   description?: string;
//   price: number;
//   duration: number;
// }

// export function ServiceSelection() {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedService, setSelectedService] = useState<string | null>(null);

//   // Static data
//   const services: Service[] = [
//     {
//       id: '1',
//       name: 'Haircut',
//       description: 'Professional haircut with styling',
//       price: 45,
//       duration: 30
//     },
//     {
//       id: '2',
//       name: 'Beard Trim',
//       description: 'Precision beard shaping and trimming',
//       price: 25,
//       duration: 15
//     },
//     {
//       id: '3',
//       name: 'Hair Color',
//       description: 'Full hair coloring service',
//       price: 85,
//       duration: 60
//     },
//     {
//       id: '4',
//       name: 'Hot Towel Shave',
//       price: 35,
//       duration: 25
//     },
//   ];

//   const filteredServices = services.filter(service =>
//     service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     service.description?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleServiceSelect = (serviceId: string) => {
//     setSelectedService(serviceId);
//     console.log('Selected service:', serviceId);
//     // You can add your own logic here for what happens when a service is selected
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-lg font-medium text-gray-900">Select a Service</h2>
//         <p className="mt-1 text-sm text-gray-500">
//           Choose the service you'd like to book
//         </p>
//       </div>

//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <Input
//           type="text"
//           placeholder="Search services..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className="pl-9"
//         />
//       </div>

//       <div className="grid gap-4">
//         {filteredServices.map((service) => (
//           <button
//             key={service.id}
//             onClick={() => handleServiceSelect(service.id)}
//             className={`w-full text-left bg-white rounded-lg border p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
//               selectedService === service.id 
//                 ? 'border-indigo-500 ring-1 ring-indigo-500' 
//                 : 'border-gray-200 hover:border-indigo-500'
//             }`}
//           >
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="text-sm font-medium text-gray-900">
//                   {service.name}
//                 </h3>
//                 {service.description && (
//                   <p className="mt-1 text-sm text-gray-500">
//                     {service.description}
//                   </p>
//                 )}
//               </div>
//               <div className="text-right">
//                 <span className="text-sm font-medium text-gray-900">
//                   {formatCurrency(service.price)}
//                 </span>
//                 <p className="mt-1 text-xs text-gray-500">
//                   {service.duration} min
//                 </p>
//               </div>
//             </div>
//           </button>
//         ))}

//         {filteredServices.length === 0 && (
//           <div className="text-center py-12 bg-gray-50 rounded-lg">
//             <p className="text-sm text-gray-500">
//               No services found matching your search
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }