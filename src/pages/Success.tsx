import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Success = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Success!
        </h2>
        <p className="text-gray-600 mb-6">
          Your checkout is complete and your salon has been created successfully.
        </p>
        <Button onClick={handleLoginRedirect} className="w-full">
          Go to Login
        </Button>
      </div>
    </div>
  );
};

export default Success;
