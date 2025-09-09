// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Mail, CheckCircle, RefreshCw } from "lucide-react";
// import { useAuth } from "../../hooks/useAuth";
// import toast, { Toaster } from "react-hot-toast";
// import logoImage from "../../assets/024global_logo_200x200.png";

// const AccountActivation = () => {
//   const { activateAccount, resendActivationEmail } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   const [activationCode, setActivationCode] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isResending, setIsResending] = useState(false);
//   const [error, setError] = useState("");
  
//   // Get data passed from registration
//   const email = location.state?.email || "";
//   const username = location.state?.username || "";
//   const message = location.state?.message || "";

//   useEffect(() => {
//     // Redirect to registration if no email is provided
//     if (!email) {
//       navigate("/register");
//       return;
//     }
    
//     // Show welcome message if provided
//     if (message) {
//       toast.success(message);
//     }
//   }, [email, message, navigate]);

//   const handleActivation = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     if (!activationCode.trim()) {
//       setError("Please enter the activation code");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const result = await activateAccount({
//         email: email,
//         activationCode: activationCode.trim()
//       });

//       if (result.success) {
//         toast.success("Account activated successfully! You can now login.");
//         setTimeout(() => {
//           navigate("/login", { 
//             state: { 
//               email: email,
//               message: "Account activated successfully! Please login with your credentials." 
//             } 
//           });
//         }, 2000);
//       } else {
//         const errorMessage = result.error || "Activation failed. Please check your code and try again.";
//         setError(errorMessage);
//         toast.error(errorMessage);
//       }
//     } catch (error) {
//       console.error("Activation error:", error);
//       const errorMessage = "Unexpected error during activation. Please try again.";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResendCode = async () => {
//     setIsResending(true);
//     setError("");

//     try {
//       const result = await resendActivationEmail({ email: email });
      
//       if (result.success) {
//         toast.success("Activation code resent! Please check your email.");
//       } else {
//         const errorMessage = result.error || "Failed to resend activation code. Please try again.";
//         toast.error(errorMessage);
//       }
//     } catch (error) {
//       console.error("Resend error:", error);
//       toast.error("Failed to resend activation code. Please try again.");
//     } finally {
//       setIsResending(false);
//     }
//   };

//   const handleBackToRegistration = () => {
//     navigate("/register");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-blue-light p-4">
//       <Toaster position="top-right" />
//       <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
//         <div className="bg-blue-night text-white p-8 text-center">
//           <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
//           <h1 className="text-2xl font-bold">Account Activation</h1>
//           <p className="text-sm mt-2 opacity-90">Almost there! Just one more step.</p>
//         </div>

//         <div className="p-8">
//           <div className="flex flex-col items-center mb-6">
//             <img src={logoImage} alt="Logo" className="w-16 h-16 rounded-full shadow-md" />
//             <h2 className="text-xl font-semibold mt-4 text-blue-night">Activate Your Account</h2>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center mb-2">
//               <Mail className="w-5 h-5 text-blue-deep mr-2" />
//               <span className="text-sm font-medium text-blue-night">Email sent to:</span>
//             </div>
//             <p className="text-sm text-blue-deep font-medium">{email}</p>
//             <p className="text-xs text-gray-600 mt-2">
//               Please check your inbox and spam folder for the activation code.
//             </p>
//           </div>

//           <form onSubmit={handleActivation} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-blue-night mb-2">
//                 Activation Code
//               </label>
//               <input
//                 type="text"
//                 value={activationCode}
//                 onChange={(e) => setActivationCode(e.target.value)}
//                 placeholder="Enter activation code"
//                 className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-deep ${
//                   error ? "border-red-500" : "border-gray-300"
//                 }`}
//                 required
//               />
//               {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`w-full py-3 px-4 rounded-lg font-medium shadow-md transition duration-200 ${
//                 isLoading 
//                   ? "bg-gray-400 cursor-not-allowed" 
//                   : "bg-blue-deep text-white hover:bg-blue-bright"
//               }`}
//             >
//               {isLoading ? "Activating..." : "Activate Account"}
//             </button>
//           </form>

//           <div className="mt-6 space-y-3">
//             <div className="text-center">
//               <button
//                 onClick={handleResendCode}
//                 disabled={isResending}
//                 className={`text-sm flex items-center justify-center mx-auto ${
//                   isResending 
//                     ? "text-gray-400 cursor-not-allowed" 
//                     : "text-blue-marine hover:underline"
//                 }`}
//               >
//                 <RefreshCw className={`w-4 h-4 mr-1 ${isResending ? "animate-spin" : ""}`} />
//                 {isResending ? "Resending..." : "Resend activation code"}
//               </button>
//             </div>

//             <div className="text-center">
//               <button
//                 onClick={handleBackToRegistration}
//                 className="text-sm text-gray-600 hover:text-blue-deep hover:underline"
//               >
//                 Back to Registration
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountActivation;