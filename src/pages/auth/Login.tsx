import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/marketing/Logo';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie'; // Add this import at the top

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // const onSubmit = async (data: LoginFormData) => {
  //   const { email, password } = data;

  //   // Static login logic
  //   if (email === 'superAdmin@gmail.com' && password === '123456789') {
  //     toast.success('Welcome Super Admin!');
  //     navigate('/platform');
  //   } else if (email === 'admin@kapperking.com' && password === 'admin123') {
  //     toast.success('Welcome Admin!');
  //     navigate('/salon');
  //   } else {
  //     toast.error('Invalid email or password');
  //   }
  // };

const onSubmit = async (data: LoginFormData) => {
  const { email, password } = data;

  // Demo login logic
  if (email === 'superAdmin@gmail.com' && password === '123456789') {
    toast.success('Welcome Super Admin!');
    navigate('/platform');
    return;
  }

  if (email === 'admin@kapperking.com' && password === 'admin123') {
    toast.success('Welcome Admin!');
    navigate('/salon');
    return;
  }

  // Real API login logic
  try {
    const response = await fetch('https://kapperking.runasp.net/api/Salons/Login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.status === 200) {
     const result = await response.text(); // change from .json() to .text()

  Cookies.set('salonUser', result, { expires: 7 });

      toast.success('Login successful!');
      navigate('/salon');
    } else {
      toast.error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Something went wrong. Please try again.');
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
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Signing in...' : 'Sign in'}
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
