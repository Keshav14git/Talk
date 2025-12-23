import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-base-100 to-base-200">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-center items-center p-6 sm:p-12 relative z-10"
      >
        <div className="w-full max-w-md space-y-8 bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/40">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30 transition-all shadow-lg"
              >
                <img src="/talkw.svg" alt="logo" className="w-10 h-10 object-contain transition-transform duration-300 ease-in-out group-hover:rotate-12" />
              </div>
              <h1 className="text-3xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Welcome Back</h1>
              <p className="text-base-content/60 font-medium">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Email</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  className={`input w-full pl-11 h-12 rounded-xl bg-white/50 border-white/50 focus:border-primary/50 focus:bg-white/80 transition-all shadow-sm`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-base-content/70">Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input w-full pl-11 h-12 rounded-xl bg-white/50 border-white/50 focus:border-primary/50 focus:bg-white/80 transition-all shadow-sm`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40 hover:text-primary transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40 hover:text-primary transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary w-full h-12 rounded-xl text-lg font-semibold shadow-lg shadow-primary/30"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60 font-medium">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary no-underline hover:underline font-bold transition-all">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={"Sign in to continue your conversations and catch up with your messages."}
      />
    </div>
  );
};
export default LoginPage;