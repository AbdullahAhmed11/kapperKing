import React, { useState, useEffect } from 'react'; // Import useState
import { useSubscriberStore, selectAllSubscribers, Subscriber } from '@/lib/store/subscribers'; // Import Subscriber type
import { Button } from '@/components/ui/button';
import { Trash2, Mail as MailIcon } from 'lucide-react'; // Import Mail icon
import { toast } from 'sonner'; 
import { IndividualEmailForm } from './IndividualEmailForm'; // Import the new form
import axios from 'axios';

export function SubscriberList() {
  const [allsubscribers, setAllSubscripers] = useState<any[]>([]); // Local state for subscribers

  const subscribers = useSubscriberStore(selectAllSubscribers);
  const deleteSubscriber = useSubscriberStore((state) => state.deleteSubscriber); 
  const [showEmailForm, setShowEmailForm] = useState(false); // State for modal visibility
  const [selectedRecipient, setSelectedRecipient] = useState<Subscriber | null>(null); // State for recipient data

const handleDeleteSubscriber = async (id: string, email: string) => {
  if (window.confirm(`Are you sure you want to delete subscriber ${email}?`)) {
    try {
      const url = `https://kapperking.runasp.net/api/SuperAdmin/DeleteSubscriber/${id}`;
      await axios.delete(url);
      toast.success(`Subscriber ${email} deleted successfully.`);
      // Refresh the subscriber list after deletion
      getAllSubscribers();
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      toast.error('Failed to delete subscriber');
    }
  }
};


  // Placeholder function for sending individual email
  const handleSendIndividualEmail = async (recipient: string, subject: string, body: string): Promise<boolean> => {
    console.log(`Simulating sending email to ${recipient} with subject "${subject}"`);
    // --- !!! ---
    // Real implementation would use an email service here
    // --- !!! ---
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    toast.success(`Email sent to ${recipient} (simulated).`);
    return true; // Indicate success for now
  };
  console.log('Subscribers:', subscribers); // Debugging line

  const getAllSubscribers = async () => {
    try { 
      const res = await axios.get('https://kapperking.runasp.net/api/SuperAdmin/GetSubscribers');
      const data = res.data || [];
      console.log('Fetched subscribers:', data); // Debugging line
      setAllSubscripers(data);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast.error('Failed to fetch subscribers');
    }
  };

  useEffect(() => { 
    getAllSubscribers();
  }, []);


  return (
    <div className="bg-white shadow rounded-lg border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium text-gray-900">Subscribers ({allsubscribers.length})</h3>
        {/* Add search/filter controls here later if needed */}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allsubscribers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No subscribers yet.</td>
              </tr>
            )}
            {allsubscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subscriber.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(subscriber.subscribedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                     subscriber.status === 'subscribed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {subscriber.status}
                   </span>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1"> 
                   {/* Send Individual Email Button */}
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => { 
                       setSelectedRecipient(subscriber); 
                       setShowEmailForm(true); 
                     }}
                     title="Send Individual Email"
                   >
                     <MailIcon className="h-4 w-4" />
                   </Button>
                   {/* Delete Button */}
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="text-red-600 hover:text-red-700"
                     onClick={() => handleDeleteSubscriber(subscriber.id, subscriber.email)}
                     title="Delete Subscriber"
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                 </td>
              </tr>
            ))}


          </tbody>
        </table>
      </div>

      {/* Individual Email Form Modal */}
      <IndividualEmailForm
        open={showEmailForm}
        onClose={() => {
          setShowEmailForm(false);
          setSelectedRecipient(null);
        }}
        selectedRecipient={selectedRecipient}
        recipientEmail={selectedRecipient?.email || null}
        onSend={handleSendIndividualEmail}
      />
    </div>
  );
}