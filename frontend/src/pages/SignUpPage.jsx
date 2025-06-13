import React from 'react'
import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { User , Mail , Eye, EyeOff, Lock , Loader2} from 'lucide-react'
import { Link } from 'react-router-dom'
import AuthImagePattern from "../components/AuthImagePattern2";
import toast from "react-hot-toast";

const SignUpPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: ""
    });

    const {signup , isSigningUp} = useAuthStore();

    const validateForm = () => {
        if (!formData.fullName.trim()) return toast.error("Full name is required");
        if (!formData.email.trim()) return toast.error("Email is required");
        if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
        if (!formData.password) return toast.error("Password is required");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    
        return true;
    };
    const handleSubmit = (e) => {
        e.preventDefault(); 

        const success = validateForm();

        if (success === true) signup(formData);
      };
    


  return (
    <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
            <div className="w-full max-w-md space-y-8">
                {/* Logo */}
            <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors min-w-[150px] min-h-[150px]::"
              >
                <img src="/talkb.svg" alt="logo" className="w-[100px] h-[100px] translate-y-6 object-contain transition-transform duration-300 ease-in-out group-hover:scale-150" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>
          
          <form onSubmit = {handleSubmit} className="space-y-6">
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="size-5 text-base-content/40" />
                    </div>
                    <input 
                    type="text"
                    className={'input input-bordered w-full pl-10'}
                    placeholder="enter your full name"
                    value= {formData.fullName}
                    onChange = {(e) => setFormData({...formData, fullName: e.target.value})}
                     />
                </div>
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">email</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="size-5 text-base-content/40" />
                    </div>
                    <input 
                    type="email"
                    className={'input input-bordered w-full pl-10'}
                    placeholder="you@example.com"
                    value= {formData.email}
                    onChange = {(e) => setFormData({...formData, email: e.target.value})}
                     />
                </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
        </div>
       </div>
     </div>

     <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
};

export default SignUpPage