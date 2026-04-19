import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Leaf, Mail, Lock, User, Eye, EyeOff, Heart, Apple } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from './AuthContext';

export function SignupScreen() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Simulate signup
    signup(name, email, password);
    navigate('/profile');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAF9]">
      {/* Header */}
      <div
        className="px-5 pt-8 pb-12"
        style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div
            className="flex items-center justify-center rounded-3xl mb-4"
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #52B788, #B7E4C7)',
            }}
          >
            <Apple size={40} color="#1B4332" />
          </div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Join Trackify AI
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500, marginTop: '6px' }}>
            Start your wellness journey today
          </p>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-6 pb-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSignup}
          className="rounded-3xl bg-white p-6"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-3 mb-4"
              style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626', textAlign: 'center' }}>
                {error}
              </p>
            </motion.div>
          )}

          {/* Name Input */}
          <div className="mb-4">
            <label
              htmlFor="name"
              style={{ fontSize: '13px', fontWeight: 700, color: '#1B4332', display: 'block', marginBottom: '8px' }}
            >
              Name
            </label>
            <div className="relative">
              <User
                size={18}
                color="#9CA3AF"
                className="absolute left-4 top-1/2"
                style={{ transform: 'translateY(-50%)' }}
              />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-2xl border-2 border-[#E5E7EB] px-12 py-3.5 outline-none transition-all focus:border-[#2D6A4F]"
                style={{ fontSize: '14px', fontWeight: 500, color: '#1B1B1B' }}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              style={{ fontSize: '13px', fontWeight: 700, color: '#1B4332', display: 'block', marginBottom: '8px' }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                color="#9CA3AF"
                className="absolute left-4 top-1/2"
                style={{ transform: 'translateY(-50%)' }}
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-2xl border-2 border-[#E5E7EB] px-12 py-3.5 outline-none transition-all focus:border-[#2D6A4F]"
                style={{ fontSize: '14px', fontWeight: 500, color: '#1B1B1B' }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              style={{ fontSize: '13px', fontWeight: 700, color: '#1B4332', display: 'block', marginBottom: '8px' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                color="#9CA3AF"
                className="absolute left-4 top-1/2"
                style={{ transform: 'translateY(-50%)' }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-2xl border-2 border-[#E5E7EB] px-12 py-3.5 outline-none transition-all focus:border-[#2D6A4F]"
                style={{ fontSize: '14px', fontWeight: 500, color: '#1B1B1B', position: 'relative', zIndex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2"
                style={{ transform: 'translateY(-50%)', zIndex: 2, cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              style={{ fontSize: '13px', fontWeight: 700, color: '#1B4332', display: 'block', marginBottom: '8px' }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={18}
                color="#9CA3AF"
                className="absolute left-4 top-1/2"
                style={{ transform: 'translateY(-50%)' }}
              />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-2xl border-2 border-[#E5E7EB] px-12 py-3.5 outline-none transition-all focus:border-[#2D6A4F]"
                style={{ fontSize: '14px', fontWeight: 500, color: '#1B1B1B', position: 'relative', zIndex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2"
                style={{ transform: 'translateY(-50%)', zIndex: 2, cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full rounded-2xl py-4 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2D6A4F, #52B788)', boxShadow: '0 4px 12px rgba(45,106,79,0.3)' }}
          >
            <span style={{ color: 'white', fontSize: '15px', fontWeight: 800 }}>Create Account</span>
          </button>

          {/* Terms */}
          <p style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.form>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mt-6"
        >
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>
            Already have an account?{' '}
          </span>
          <button
            onClick={() => navigate('/login')}
            className="ml-1"
          >
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#2D6A4F' }}>
              Log In
            </span>
          </button>
        </motion.div>

        {/* Support Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4 mt-6"
          style={{ background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', border: '1.5px solid #93C5FD' }}
        >
          <div className="flex items-start gap-3">
            <Heart size={18} color="#1D4ED8" className="shrink-0 mt-0.5" />
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#1E3A8A', marginBottom: '4px' }}>
                Safe & Supportive Space
              </p>
              <p style={{ fontSize: '11px', fontWeight: 500, color: '#1E40AF', lineHeight: 1.5 }}>
                Nourish AI is designed with care for those on wellness and recovery journeys. Your health and privacy are our priority.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}