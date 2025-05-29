// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Link, useNavigate } from 'react-router-dom';
// import { Logo } from '@/components/marketing/Logo';
// import { toast } from 'sonner';
// import { Loader2 } from 'lucide-react';
// import { jwtDecode } from 'jwt-decode';

// const loginSchema = z.object({
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
// });

// type LoginFormData = z.infer<typeof loginSchema>;

// function Login() {
//   const [loading, setLoading] = React.useState(false);
//   const navigate = useNavigate();
//   const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: 'admin@kapperking.com',
//       password: 'admin123'
//     }
//   });

//   const login = async (email: string, password: string) => {
//     setLoading(true);
//     try {
//       // For demo account, bypass the API call
//       if (email === 'admin@kapperking.com' && password === 'admin123') {
//         return { error: null };
//       }

//       const response = await fetch('https://kapperking.runasp.net/api/Users/Login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           password
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         return { error: new Error(errorData.message || 'Login failed') };
//       }

//       // const data = await response.json();
//       // Store the token if the API returns one
//       if (response.status === 200) {
//         const token = await response.text(); // Or use response.json() if the token is in JSON format
//         localStorage.setItem('authToken', token);
//         const decoded = jwtDecode<any>(token);
//         console.log('Decoded token:', decoded);
//           if (decoded?.Role === 'SalonOwner') {
//             navigate('/platform');
//           } else {
//             toast.error('Access denied: Not a SalonOwner');
//             return { error: new Error('Unauthorized role') };
//           }
//       }
      
//       return { error: null };
//     } catch (error) {
//       return { error: error instanceof Error ? error : new Error('Network error') };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = async (data: LoginFormData) => {
//     const { error } = await login(data.email, data.password);
//     if (error) {
//       console.error('Login error:', error);
//       toast.error(`Login failed: ${error.message}`);
//     } else {
//       toast.success('Login successful!');
//       navigate('/salon');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       {/* Rest of your JSX remains exactly the same */}
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="flex justify-center">
//           <Logo size="lg" />
//         </div>
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           Sign in to your account
//         </h2>
//         <p className="mt-2 text-center text-sm text-gray-600">
//           Or{' '}
//           <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
//             start your 14-day free trial
//           </Link>
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
//           <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email address
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="email"
//                   type="email"
//                   autoComplete="email"
//                   {...register('email')}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 />
//                 {errors.email && (
//                   <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
//                 Password
//               </label>
//               <div className="mt-1">
//                 <input
//                   id="password"
//                   type="password"
//                   autoComplete="current-password"
//                   {...register('password')}
//                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
//                 />
//                 {errors.password && (
//                   <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading || isSubmitting}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
//               >
//                 {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 {(loading || isSubmitting) ? 'Signing in...' : 'Sign in'}
//               </button>
//             </div>
//           </form>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300" />
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Demo Account</span>
//               </div>
//             </div>

//             <div className="mt-6 text-center text-sm text-gray-600">
//               Email:{' '}
//               <span className="font-medium text-primary-600">admin@kapperking.com</span>
//               <br />
//               Password:{' '}
//               <span className="font-medium text-primary-600">admin123</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Logo } from '@/components/marketing/Logo';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@kapperking.com',
      password: 'admin123'
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    const { error,  } = await login(data.email, data.password);
    
    if (error) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error.message}`);
      return;
    }

    toast.success('Login successful!');
    
    // Redirect based on user type
    if (data.email === 'superAdmin@gmail.com') {
      navigate('/platform');
    } else if (data.email === 'admin@kapperking.com') {
      navigate('/salon');
    } else {
      // Default redirect for regular users
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
            start your 14-day free trial
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {(loading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {(loading || isSubmitting) ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
              <div>
                <span className="font-semibold">Super Admin:</span><br />
                Email: <span className="font-medium text-primary-600">superAdmin@gmail.com</span><br />
                Password: <span className="font-medium text-primary-600">123456789</span>
              </div>
              <div>
                <span className="font-semibold">Regular Admin:</span><br />
                Email: <span className="font-medium text-primary-600">admin@kapperking.com</span><br />
                Password: <span className="font-medium text-primary-600">admin123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;