// import React, { useState, useEffect } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { Link, useSearchParams, useNavigate } from 'react-router-dom';
// import MarketingNavbar from '@/components/marketing/MarketingNavbar';
// import { useAuth } from '@/lib/auth'; // Assuming this will be updated for real auth
// import { useSubscriptionPlanStore, selectPlanById, SubscriptionPlan, selectAllPlans } from '@/lib/store/subscriptionPlans';
// import { toast } from 'sonner';
// import { supabase } from '@/lib/supabase'; // Import Supabase client
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Loader2, Check, Info, Calendar, Crown, Users, CheckCircle } from 'lucide-react';
// import axios from 'axios';

// import { useParams } from 'react-router-dom';
// // --- Zod Schemas ---
// const step1Schema = z.object({
//   businessName: z.string().min(1, 'Business name is required'),
//   ownerName: z.string().min(1, 'Owner name is required'),
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
//   phoneNumber: z.string().optional(),
//   termsAccepted: z.boolean().refine(val => val === true, {
//     message: "You must accept the terms and conditions",
//   }),
// });
// type Step1FormData = z.infer<typeof step1Schema>;

// const step2Schema = z.object({
//   salonName: z.string().min(1, 'Salon name is required'),
//   address: z.string().optional(),
//   city: z.string().optional(),
//   postalCode: z.string().optional(),
//   country: z.string().optional(),
//   phone: z.string().optional(),
//   website: z.string().url().or(z.literal('')).optional(),
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(8, 'Password must be at least 8 characters'),
// });

// type Step2FormData = z.infer<typeof step2Schema>;

// // --- Stripe Promise ---
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY');

// // --- Card Element Styling ---
// const cardElementOptions = {
//    style: {
//      base: { color: "#32325d", fontFamily: '"Helvetica Neue", Helvetica, sans-serif', fontSmoothing: "antialiased", fontSize: "16px", "::placeholder": { color: "#aab7c4" } },
//      invalid: { color: "#fa755a", iconColor: "#fa755a" }
//    }
//  };

// // --- Stepper Component ---
// interface StepperProps { currentStep: number; }
// const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
//   const steps = ['Account Setup', 'Salon Details', 'Billing', 'Confirmation'];
//   return (
//     <nav aria-label="Progress">
//       <ol role="list" className="flex items-center">
//         {steps.map((step, stepIdx) => {
//           const isCompleted = stepIdx < currentStep;
//           const isCurrent = stepIdx === currentStep;
//           return (
//             <li key={step} className={`relative flex-1`}>
//               <div className="flex flex-col items-center">
//                 {stepIdx !== 0 && (
//                   <div className="absolute -left-1/2 top-4 h-0.5 w-full -translate-y-1/2" aria-hidden="true">
//                     <div className={`h-full w-full ${isCompleted || isCurrent ? 'bg-primary' : 'bg-gray-200'}`}></div>
//                   </div>
//                 )}
//                 <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
//                     isCompleted ? 'bg-primary hover:bg-primary/90' :
//                     isCurrent ? 'border-2 border-primary bg-white' :
//                     'border-2 border-gray-300 bg-white group-hover:border-gray-400'
//                 }`}
//                 >
//                   {isCompleted ? <Check className="h-5 w-5 text-white" aria-hidden="true" /> :
//                    isCurrent ? <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true"></span> :
//                    <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true"></span>}
//                   <span className="sr-only">{step}</span>
//                 </span>
//                 <span className={`mt-2 block text-xs font-medium text-center ${isCompleted || isCurrent ? 'text-primary' : 'text-gray-500'}`}>
//                   {step}
//                 </span>
//               </div>
//             </li>
//           );
//         })}
//       </ol>
//     </nav>
//   );
// };

// // --- Main SignUp Form Component (Handles Steps) ---
// function SignUpPage() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//     const { planId, priceId } = useParams();

//   // const planId = searchParams.get('planId'); // Read internal plan ID
//   // const priceId = searchParams.get('priceId'); // Read Stripe Price ID
//   console.log(planId, priceId)
//   // Fetch Plan Details using internal planId
//   const selectedPlan = useSubscriptionPlanStore(state => selectPlanById(state, planId || ''));
//   const trialDuration = selectedPlan?.trialDuration || 14;
//   const planName = selectedPlan?.name || 'Selected';

//   const [currentStep, setCurrentStep] = useState(1);
//   const [step1Data, setStep1Data] = useState<Step1FormData | null>(null);
//   const [step2Data, setStep2Data] = useState<Step2FormData | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [processing, setProcessing] = useState(false);
//   const [countdown, setCountdown] = useState(3);

//   const stripe = useStripe();
//   const elements = useElements();

//   const formStep1 = useForm<Step1FormData>({ resolver: zodResolver(step1Schema), defaultValues: { termsAccepted: false } });
//   const formStep2 = useForm<Step2FormData>({ resolver: zodResolver(step2Schema) });

//   useEffect(() => {
//     if (!planId ) {
//       toast.error("Invalid or missing subscription plan. Redirecting to pricing.");
//       navigate('/pricing');
//     }
//   }, [planId, navigate]);

//   useEffect(() => {
//     let timer: any;
//     if (currentStep === 4 && countdown > 0) {
//       timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
//     } else if (currentStep === 4 && countdown === 0) {
//       navigate('/salon');
//     }
//     return () => clearInterval(timer);
//   }, [currentStep, countdown, navigate]);

//   const nextStep = () => setCurrentStep(prev => prev + 1);
//   const prevStep = () => setCurrentStep(prev => prev - 1);
//   const [ownerId, setOwnerId] = useState<number | null>(null);

// const createSalon = async (data: Step2FormData) => {
//   const formData = new FormData();
//   formData.append('Name', data.salonName);
//   formData.append('Address', data.address || '');
//   formData.append('City', data.city || '');
//   formData.append('Country', data.country || '');
//   formData.append('PostalCode', data.postalCode || '');
//   formData.append('SalonPhone', data.phone || '');
//   formData.append('Website', data.website || '');
//   formData.append('Email', data.email);
//   formData.append('Password', data.password);
//   formData.append('OwnerId', ownerId || null);
//   formData.append('PlanId', planId || '');
//   formData.append('SubscriptionType', 'Monthly');
//   formData.append('Longitude', '0');
//   formData.append('Latitude', '0');

//   try {
//     const response = await axios.post(
//       'https://kapperking.runasp.net/api/Salons/AddSalon',
//       formData
//     );
//     return response;
//   } catch (error: any) {
//     throw error.response || { status: 500, data: { message: 'Unknown error' } };
//   }
// };

//   // const handleStep1Submit = (data: Step1FormData) => { setStep1Data(data); nextStep(); };
//   // const handleStep2Submit = (data: Step2FormData) => { setStep2Data(data); nextStep(); };
// const handleStep2Submit = async (data: Step2FormData) => {
//   try {
//     const response = await createSalon(data);

//     if (response.status === 200) {
//       toast.success("Salon created successfully!");
//       setStep2Data(data);
//       nextStep(); // Proceed to Step 3
//     } else {
//       toast.error(`Failed to create salon. Status code: ${response.status}`);
//     }
//   } catch (error: any) {
//     const message = error?.data?.message || 'Failed to create salon.';
//     console.error("Error creating salon:", error);
//     toast.error(message);
//   }
// };

// const createOwner = async (data: Step1FormData) => {
//   const formData = new FormData();
//   formData.append('FirstName', data.ownerName);
//   formData.append('LastName', data.ownerName);
//   formData.append('Email', data.email);
//   formData.append('Password', data.password);
//   formData.append('Phone', data.phoneNumber || '');

//   try {
//     const response = await axios.post(
//       'https://kapperking.runasp.net/api/Owners/AddOwner',
//       formData
//     );

//     // Return full response
//     return response;
//   } catch (error: any) {
//     throw error.response || { status: 500, data: { message: 'Unknown error' } };
//   }
// };

// const handleStep1Submit = async (data: Step1FormData) => {
//   try {
//     const response = await createOwner(data);

//     if (response.status === 200) {
//          const ownerData = response.data;
//       setOwnerId(ownerData.id); // save ownerId
//       toast.success('Owner created successfully!');
//       setStep1Data(data);
//       nextStep();
//     } else {
//       toast.error(`Failed to create owner. Status code: ${response.status}`);
//     }

//   } catch (error: any) {
//     const message = error?.data?.message || 'Failed to create owner.';
//     console.error("Error creating owner:", error);
//     toast.error(message);
//   }
// };




//   // const handleStep3Submit = async () => {
//   //   if (!stripe || !elements || !step1Data || !step2Data || !priceId || !selectedPlan) {
//   //     toast.error("Missing required information or payment system not ready."); return;
//   //   }
//   //   setProcessing(true); setError(null);
//   //   const cardElement = elements.getElement(CardElement);
//   //   if (!cardElement) { toast.error("Could not find payment details form."); setProcessing(false); return; }
//   //   try {
//   //     const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
//   //       type: 'card', card: cardElement,
//   //       billing_details: { name: step1Data.ownerName, email: step1Data.email },
//   //     });
//   //     if (paymentMethodError) { setError(paymentMethodError.message || "Failed to process payment details."); setProcessing(false); return; }
//   //     const finalSignupData = { ...step1Data, ...step2Data, priceId: priceId, paymentMethodId: paymentMethod.id };
//   //     console.log("Submitting Final Data to backend:", finalSignupData);
//   //     // --- TODO: Replace with actual API call to /create-subscription ---
//   //     const { data: functionData, error: functionError } = await supabase.functions.invoke('create-subscription', { body: finalSignupData });
//   //     if (functionError) throw new Error(functionError.message || 'Failed to create subscription.');
//   //     // --- End API Call ---
//   //     console.log('Function Response:', functionData);
//   //     toast.success(`Signup complete! Starting ${trialDuration}-day trial.`);
//   //     nextStep(); // Go to Step 4
//   //   } catch (err: any) {
//   //     console.error("Final Signup error:", err);
//   //     setError(err.message || "An unexpected error occurred during signup.");
//   //   } finally {
//   //     setProcessing(false);
//   //   }
//   // };

//   // if (planId && !selectedPlan) {
//   //   return <div className="min-h-screen flex items-center justify-center">Loading plan details...</div>;
//   // }
// const [checkoutLoading, setCheckoutLoading] = useState(false);

// //   const handleStripeCheckout = async () => {
// //   try {
// //     if (!priceId) {
// //       toast.error("Missing price information.");
// //       return;
// //     }

// //     // Convert priceId to amount if needed
// //     // For example: priceId = "10" means $10
// //     const amount = parseInt(priceId, 10);
// //     if (isNaN(amount)) {
// //       toast.error("Invalid price amount.");
// //       return;
// //     }

// //     const response = await fetch('https://kapperking.runasp.net/api/Payments/create-checkout-session', {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ amount }),
// //     });

// //     const data = await response.json();

// //     if (data.url) {
// //       window.location.href = data.url; // Redirect to Stripe
// //     } else {
// //       toast.error("Stripe checkout failed: " + (data.error || "Unknown error"));
// //     }
// //   } catch (err) {
// //     console.error("Checkout Error:", err);
// //     toast.error("An error occurred during checkout.");
// //   }
// // };


// const handleSubmitPaymentForm = async () => {
//   try {
//     if (!step1Data || !step2Data || !priceId ) {
//       toast.error("Missing data from previous steps.");
//       return;
//     }

//     const formData = new FormData();
//     const amount = parseInt(priceId, 10);
//     // Amount from priceId
//     formData.append("Amount", amount.toString());

//     // --- Owner Info
//     formData.append("Owner.FirstName", step1Data.ownerName);
//     formData.append("Owner.LastName", step1Data.ownerName);
//     formData.append("Owner.Email", step1Data.email);
//     formData.append("Owner.Password", step1Data.password);
//     formData.append("Owner.Phone", step1Data.phoneNumber || "");

//     // --- Salon Info
//     formData.append("Salon.Name", step2Data.salonName);
//     formData.append("Salon.PostalCode", step2Data.postalCode || ""); // or hardcoded "8754"
//     formData.append("Salon.Email", step2Data.email);
//     formData.append("Salon.Password", step2Data.password);
//     formData.append("Salon.SalonPhone", step2Data.phone || "");
//     formData.append("Salon.Address", step2Data.address || "");
//     formData.append("Salon.City", step2Data.city || "");
//     formData.append("Salon.Country", step2Data.country || "");
//     formData.append("Salon.Latitude", "0"); // placeholder
//     formData.append("Salon.Longitude", "0"); // placeholder
//     formData.append("Salon.Website", step2Data.website || "");
//     formData.append("Salon.PlanId", planId || '');
//     formData.append("Salon.SubscriptionType", "monthly"); // example
//     // Optional image upload: formData.append("Salon.ImageFile", salonImageFile);

//     // Send to API
//     const response = await fetch("https://kapperking.runasp.net/api/Payments/create-checkout-session", {
//       method: "POST",
//       body: formData,
//     });

//     if (response.ok) {
//       const result = await response.json();
//       if (result.url) {
//         window.location.href = result.url;
//       } else {
//         toast.error("Error: " + (result.error || "Something went wrong"));
//       }
//     } else {
//       const errText = await response.text();
//       console.error("Checkout error response:", errText);
//       toast.error(errText);
//     }
//   } catch (err) {
//     console.error("Exception during checkout:", err);
//     toast.error(err);
//   }
// };

//   return (
//     <>
//       <MarketingNavbar />
//       <div className="bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
//         <div className="max-w-xl mx-auto mb-16">
//           <Stepper currentStep={currentStep - 1} />
//         </div>
//         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
//           <div className="lg:col-span-2 bg-white p-8 shadow sm:rounded-lg">
//             {/* Step 1 Form */}
//             {currentStep === 1 && (
//               <form onSubmit={formStep1.handleSubmit(handleStep1Submit)} className="space-y-5">
//                 <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 1: Account Setup</h2>
//                 <p className="text-sm text-gray-600 mb-6">Enter your business and login details.</p>
//                 <div>
//                   <Label htmlFor="businessName">Business Name</Label>
//                   <Input id="businessName" placeholder="Enter your salon name" {...formStep1.register('businessName')} className="mt-1" />
//                   {formStep1.formState.errors.businessName && <p className="mt-1 text-sm text-red-600">{formStep1.formState.errors.businessName.message}</p>}
//                 </div>
//                 <div>
//                   <Label htmlFor="ownerName">Owner Name</Label>
//                   <Input id="ownerName" placeholder="Enter owner's full name" {...formStep1.register('ownerName')} className="mt-1" />
//                   {formStep1.formState.errors.ownerName && <p className="mt-1 text-sm text-red-600">{formStep1.formState.errors.ownerName.message}</p>}
//                 </div>
//                 <div>
//                   <Label htmlFor="email">Email Address</Label>
//                   <Input id="email" type="email" placeholder="Enter your email" {...formStep1.register('email')} className="mt-1" />
//                   {formStep1.formState.errors.email && <p className="mt-1 text-sm text-red-600">{formStep1.formState.errors.email.message}</p>}
//                 </div>
//                 <div>
//                   <Label htmlFor="password">Password</Label>
//                   <Input id="password" type="password" placeholder="Create a secure password" {...formStep1.register('password')} className="mt-1" />
//                   {formStep1.formState.errors.password && <p className="mt-1 text-sm text-red-600">{formStep1.formState.errors.password.message}</p>}
//                 </div>
//                 <div>
//                   <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
//                   <Input id="phoneNumber" type="tel" placeholder="Enter your phone number" {...formStep1.register('phoneNumber')} className="mt-1" />
//                 </div>
//                 <div className="items-top flex space-x-2 pt-2">
//                   <Controller
//                     name="termsAccepted" control={formStep1.control}
//                     render={({ field }) => (
//                       <Checkbox id="termsAccepted" checked={field.value} onCheckedChange={field.onChange} aria-describedby="terms-error"/>
//                     )}
//                   />
//                   <div className="grid gap-1.5 leading-none">
//                     <Label htmlFor="termsAccepted" className="text-sm font-normal text-gray-600">
//                       I agree to the{' '}
//                       <Link to="/terms-of-service" target="_blank" className="underline hover:text-primary">Terms of Service</Link> and{' '}
//                       <Link to="/privacy-policy" target="_blank" className="underline hover:text-primary">Privacy Policy</Link>
//                     </Label>
//                     {formStep1.formState.errors.termsAccepted && <p id="terms-error" className="mt-1 text-sm text-red-600">{formStep1.formState.errors.termsAccepted.message}</p>}
//                   </div>
//                 </div>
//                 <div className="pt-4">
//                   <Button type="submit" className="w-full">Next: Salon Details</Button>
//                 </div>
//               </form>
//             )}
//             {/* Step 2 Form */}
//             {currentStep === 2 && (
//               <form onSubmit={formStep2.handleSubmit(handleStep2Submit)} className="space-y-5">
//                 <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 2: Salon Details</h2>
//                 <p className="text-sm text-gray-600 mb-6">Tell us about your first salon.</p>
//                 <div>
//                   <Label htmlFor="salonName">Salon Name</Label>
//                   <Input id="salonName" placeholder="Enter your first salon's name" {...formStep2.register('salonName')} className="mt-1" />
//                   {formStep2.formState.errors.salonName && <p className="mt-1 text-sm text-red-600">{formStep2.formState.errors.salonName.message}</p>}
//                 </div>
//                  <div>
//                    <Label htmlFor="address">Address</Label>
//                    <Input id="address" placeholder="Street address" {...formStep2.register('address')} className="mt-1" />
//                  </div>
//                  <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-3">
//                     <div>
//                        <Label htmlFor="city">City</Label>
//                        <Input id="city" {...formStep2.register('city')} className="mt-1" />
//                     </div>
//                     <div>
//                        <Label htmlFor="postalCode">Postal Code</Label>
//                        <Input id="postalCode" {...formStep2.register('postalCode')} className="mt-1" />
//                     </div>
//                     <div>
//                        <Label htmlFor="country">Country</Label>
//                        <Input id="country" {...formStep2.register('country')} className="mt-1" />
//                     </div>
//                  </div>
//                  <div>
//                    <Label htmlFor="phone">Salon Phone (Optional)</Label>
//                    <Input id="phone" type="tel" {...formStep2.register('phone')} className="mt-1" />
//                  </div>
//                  <div>
//   <Label htmlFor="email">Salon Owner Email</Label>
//   <Input id="email" type="email" placeholder="Enter email" {...formStep2.register('email')} className="mt-1" />
//   {formStep2.formState.errors.email && (
//     <p className="mt-1 text-sm text-red-600">{formStep2.formState.errors.email.message}</p>
//   )}
// </div>
// <div>
//   <Label htmlFor="password">Password</Label>
//   <Input id="password" type="password" placeholder="Enter password" {...formStep2.register('password')} className="mt-1" />
//   {formStep2.formState.errors.password && (
//     <p className="mt-1 text-sm text-red-600">{formStep2.formState.errors.password.message}</p>
//   )}
// </div>

//                  <div>
//                    <Label htmlFor="website">Website (Optional)</Label>
//                    <Input id="website" type="url" placeholder="https://..." {...formStep2.register('website')} className="mt-1" />
//                    {formStep2.formState.errors.website && <p className="mt-1 text-sm text-red-600">{formStep2.formState.errors.website.message}</p>}
//                  </div>
//                 <div className="flex justify-between pt-4">
//                   <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
//                   <Button type="submit">Next: Billing</Button>
//                 </div>
                
//               </form>
//             )}
//             {/* Step 3 Confirmation & Billing */}
//             {currentStep === 3 && (
//               <div className="space-y-6">
//                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 3: Billing & Confirmation</h2>
//                  <p className="text-sm text-gray-600 mb-6">Confirm your details and add payment method to start your trial.</p>
//                  <div className="p-4 border rounded-md bg-gray-50 space-y-2 text-sm">
//                     <p><strong>Email:</strong> {step1Data?.email}</p>
//                     <p><strong>Business:</strong> {step1Data?.businessName}</p>
//                     <p><strong>Salon:</strong> {step2Data?.salonName}</p>
//                     <p><strong>Location:</strong> {step2Data?.address}, {step2Data?.city} {step2Data?.postalCode}, {step2Data?.country}</p>
//                     <p><strong>Plan:</strong> {planName} ({trialDuration}-day trial)</p>
//                  </div>
//                  <div>
//                    <Label htmlFor="card-element">Payment Details</Label>
//                    <div id="card-element" className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm bg-white">
//                      <CardElement options={cardElementOptions} />
//                    </div>
//                    <p className="mt-2 text-xs text-gray-500 flex items-center">
//                       <Info size={14} className="mr-1" /> Your card will not be charged until the {trialDuration}-day trial ends.
//                    </p>
//                  </div>
//                  {error && <p className="text-sm text-red-600">{error}</p>}
//                  <div className="flex justify-between pt-4">
//                    <Button type="button" variant="outline" onClick={prevStep} disabled={processing}>Back</Button>
//                    {/* <Button type="button" onClick={handleStep3Submit} disabled={!stripe || !elements || processing}>
//                      {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : `Complete Signup & Start Trial`}
//                    </Button> */}
//                                     <Button
//   type="button"
//   variant="default"
//   className="w-full"
//   onClick={handleSubmitPaymentForm}
// >
//   Checkout via Stripe
// </Button>
//                  </div>


//               </div>
//             )}
//             {/* Step 4 Final Confirmation */}
//             {currentStep === 4 && (
//               <div className="flex flex-col items-center justify-center text-center py-16">
//                  <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
//                  <h2 className="text-3xl font-semibold text-gray-900 mb-3">Setup Complete!</h2>
//                  <p className="text-lg text-gray-600 mb-8">
//                    Your account and salon have been created successfully.
//                  </p>
//                  <p className="text-gray-500">
//                    Redirecting you to your dashboard in {countdown}...
//                  </p>
//                  <Loader2 className="h-6 w-6 animate-spin text-gray-400 mt-4" />
//               </div>
//             )}
//           </div>
//           {/* Plan Summary (Right) */}
//           {currentStep !== 4 && (
//              <div className="lg:col-span-1">
//                <div className="bg-white p-6 shadow sm:rounded-lg border border-gray-200 sticky top-28">
//                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
//                       {selectedPlan?.name === 'Basic' ? <Calendar size={14}/> : selectedPlan?.name === 'Professional' ? <Crown size={14}/> : <Users size={14}/>}
//                    </span>
//                    {planName} Plan
//                  </h3>
//                  <p className="mt-4">
//                    <span className="text-4xl font-bold text-gray-900">€{priceId || 'N/A'}</span>
//                    <span className="text-base font-medium text-gray-500">/month</span>
//                  </p>
//                  <p className="text-sm text-gray-500 mt-1">After {trialDuration}-day free trial</p>
//                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
//                    {(selectedPlan?.features || []).slice(0, 5).map((feature: string) => (
//                      <li key={feature} className="flex space-x-3">
//                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
//                        <span>{feature}</span>
//                      </li>
//                    ))}
//                  </ul>
//                  <p className="mt-4 text-xs text-gray-500">
//                    {currentStep === 3 ? 'Payment details required to start trial.' : 'No credit card required for this step.'}
//                  </p>
//                </div>
//              </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// } // Closing brace for SignUpPage component

// // --- Wrap with Stripe Elements Provider ---
// export default function SignUpPageWrapper() {
//   return (
//     <Elements stripe={stripePromise}>
//       <SignUpPage />
//     </Elements>
//   );
// }


import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MarketingNavbar from '@/components/marketing/MarketingNavbar';
import { useSubscriptionPlanStore, selectPlanById } from '@/lib/store/subscriptionPlans';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const step1Schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string().optional(),
});

const step2Schema = z.object({
  salonName: z.string().min(1, 'Salon name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().or(z.literal('')).optional(),
  email: z.string().email('Email required'),
  password: z.string().min(6, 'Password required'),
});

const SignUpPage = () => {
  const navigate = useNavigate();
  const { planId, priceId } = useParams();
  const selectedPlan = useSubscriptionPlanStore(state => selectPlanById(state, planId || ''));
  const planName = selectedPlan?.name || 'Selected';

  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);

  const formStep1 = useForm({ resolver: zodResolver(step1Schema) });
  const formStep2 = useForm({ resolver: zodResolver(step2Schema) });

  useEffect(() => {
    if (!planId) {
      toast.error("Missing subscription plan.");
      navigate('/pricing');
    }
  }, [planId, navigate]);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleStep1Submit = (data) => { setStep1Data(data); nextStep(); };
  const handleStep2Submit = (data) => { setStep2Data(data); nextStep(); };

  const handleSubmitPaymentForm = async () => {
    try {
      if (!step1Data || !step2Data || !priceId ) {
        toast.error("Missing required data...");
        return;
      }

      const formData = new FormData();
    const amount = parseInt(priceId, 10);
    formData.append("Amount", amount.toString());
      formData.append("Owner.FirstName", step1Data.ownerName);
      formData.append("Owner.LastName", step1Data.ownerName);
      formData.append("Owner.Email", step1Data.email);
      formData.append("Owner.Password", step1Data.password);
      formData.append("Owner.Phone", step1Data.phoneNumber || "");

      formData.append("Salon.Name", step2Data.salonName);
      formData.append("Salon.PostalCode", step2Data.postalCode || "0000");
      formData.append("Salon.Email", step2Data.email);
      formData.append("Salon.Password", step2Data.password);
      formData.append("Salon.SalonPhone", step2Data.phone || "");
      formData.append("Salon.Address", step2Data.address || "");
      formData.append("Salon.City", step2Data.city || "");
      formData.append("Salon.Country", step2Data.country || "");
      formData.append("Salon.Latitude", "0");
      formData.append("Salon.Longitude", "0");
      formData.append("Salon.Website", step2Data.website || "");
      formData.append("Salon.PlanId", planId || '');
      formData.append("Salon.SubscriptionType", "monthly");

      const response = await fetch("https://kapperking.runasp.net/api/Payments/create-checkout-session", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.url) {
          window.location.href = result.url;
        } else {
          toast.error("Checkout failed.");
        }
      } else {
        const text = await response.text();
        console.error("Payment error:", text);
        toast.error("Failed to initiate checkout.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error occurred.");
    }
  };

  return (
    <>
      <MarketingNavbar />
      <div className="max-w-2xl mx-auto py-10 px-4">
        {currentStep === 1 && (
          <form onSubmit={formStep1.handleSubmit(handleStep1Submit)} className="space-y-4">
            <h2 className="text-xl font-bold">Step 1: Account Setup</h2>
            <div>
              <Label>Business Name</Label>
              <Input {...formStep1.register('businessName')} />
            </div>
            <div>
              <Label>Owner Name</Label>
              <Input {...formStep1.register('ownerName')} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...formStep1.register('email')} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...formStep1.register('password')} />
            </div>
            <div>
              <Label>Phone (optional)</Label>
              <Input {...formStep1.register('phoneNumber')} />
            </div>
            <Button type="submit">Next</Button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={formStep2.handleSubmit(handleStep2Submit)} className="space-y-4">
            <h2 className="text-xl font-bold">Step 2: Salon Details</h2>
            <div>
              <Label>Salon Name</Label>
              <Input {...formStep2.register('salonName')} />
            </div>
            <div>
              <Label>Address</Label>
              <Input {...formStep2.register('address')} />
            </div>
            <div>
              <Label>City</Label>
              <Input {...formStep2.register('city')} />
            </div>
            <div>
              <Label>Country</Label>
              <Input {...formStep2.register('country')} />
            </div>
            <div>
              <Label>Postal Code</Label>
              <Input {...formStep2.register('postalCode')} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...formStep2.register('phone')} />
            </div>
            <div>
              <Label>Website</Label>
              <Input {...formStep2.register('website')} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...formStep2.register('email')} />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" {...formStep2.register('password')} />
            </div>
            <div className="flex justify-between">
              <Button type="button" onClick={prevStep}>Back</Button>
              <Button type="submit">Next</Button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Step 3: Checkout</h2>
            <p className="text-gray-600">Ready to complete your registration and proceed to payment?</p>
            <Button onClick={handleSubmitPaymentForm} className="w-full">Complete Signup & Go to Payment</Button>
          </div>
        )}
      </div>
    </>
  );
};

export default SignUpPage;
