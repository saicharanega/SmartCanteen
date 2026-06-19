import React, { useState } from 'react';
import { API_URL } from '../../config';
import { useCanteen } from '../../context/CanteenContext';
import { Lock, UserCheck, AlertCircle, Loader2, ArrowLeft, ClipboardList, Phone, Milestone, Check, HelpCircle } from 'lucide-react';

const Login = ({ portal, navigateTo }) => {
  const { login, logout } = useCanteen();
  
  // View states
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Credentials states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Student Profile states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [department, setDepartment] = useState('');
  
  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Portal-specific configurations
  const getPortalConfig = () => {
    switch (portal) {
      case 'student':
        return {
          title: isSignUp ? 'Create Student Account' : (showForgotPassword ? 'Reset Password' : 'Student Portal'),
          idLabel: 'Roll Number',
          idPlaceholder: 'e.g. 22BD1A0501',
          accentColor: 'from-orange-500 to-amber-500',
          glowClass: 'orange-glow-sm'
        };
      case 'cashier':
        return {
          title: showForgotPassword ? 'Reset Password' : 'Cashier Portal',
          idLabel: 'Username',
          idPlaceholder: 'e.g. cashier1',
          accentColor: 'from-blue-500 to-indigo-500',
          glowClass: 'blue-glow-sm'
        };
      case 'kitchen':
        return {
          title: showForgotPassword ? 'Reset Password' : 'Kitchen Portal',
          idLabel: 'Username',
          idPlaceholder: 'e.g. kitchen1',
          accentColor: 'from-emerald-500 to-teal-500',
          glowClass: 'emerald-glow-sm'
        };
      case 'admin':
        return {
          title: showForgotPassword ? 'Reset Password' : 'Admin Portal',
          idLabel: 'Username',
          idPlaceholder: 'e.g. admin1',
          accentColor: 'from-rose-500 to-pink-500',
          glowClass: 'rose-glow-sm'
        };
      default:
        return {
          title: 'Portal Login',
          idLabel: 'Username / Roll Number',
          idPlaceholder: 'e.g. 22BD1A0501',
          accentColor: 'from-orange-500 to-amber-500',
          glowClass: 'orange-glow-sm'
        };
    }
  };

  const config = getPortalConfig();

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhoneNumber('');
    setDepartment('');
  };

  const handleToggleForgotPassword = () => {
    setShowForgotPassword(!showForgotPassword);
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim()) {
      setError(`${config.idLabel} is required.`);
      return;
    }

    if (showForgotPassword) {
      setLoading(true);
      // Simulate password reset request lookup
      setTimeout(() => {
        setSuccessMsg('Please contact the SmartCanteen Administrator to reset your password.');
        setLoading(false);
      }, 1000);
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Full Name is required.');
        return;
      }
      if (!phoneNumber.trim()) {
        setError('Phone Number is required.');
        return;
      }
      if (!/^\d{10}$/.test(phoneNumber)) {
        setError('Phone number must be exactly 10 digits.');
        return;
      }
      if (!department.trim()) {
        setError('Department is required.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const regRes = await fetch(`${API_URL}/api/auth/student-register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.toLowerCase().trim(),
            password,
            role: 'student',
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            department: department.trim()
          })
        });

        const regData = await regRes.json();
        if (!regData.success) {
          setError(regData.message || 'Registration failed.');
          setLoading(false);
          return;
        }

        setSuccessMsg('Account created successfully! Logging you in...');
        
        setTimeout(async () => {
          try {
            const loginResult = await login(username, password);
            if (!loginResult.success) {
              setError('Account created, but auto-login failed. Please sign in manually.');
              setIsSignUp(false);
              setLoading(false);
            }
          } catch (loginErr) {
            setError('Account created, but connection error on login. Please sign in manually.');
            setIsSignUp(false);
            setLoading(false);
          }
        }, 1500);

      } else {
        const result = await login(username, password);
        if (result.success) {
          if (result.role !== portal) {
            logout();
            setError('Access denied. Please use the correct portal.');
            setLoading(false);
          }
        } else {
          setError(result.message || 'Invalid username or password.');
          setLoading(false);
        }
      }
    } catch (err) {
      setError('Could not connect to authentication server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full">
        {/* Back Link */}
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-6 cursor-pointer bg-transparent border-none outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portals Gateway</span>
        </button>

        <div className={`bg-white rounded-3xl p-8 border border-slate-100 shadow-xl ${config.glowClass} relative overflow-hidden`}>
          {/* Decorative glows */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>

          <div className="text-center mb-8">
            <span className="text-4xl block mb-2" role="img" aria-label="portal-logo">🍽️</span>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{config.title}</h2>
            <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">
              SmartCanteen System Authentication
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-fade-in text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-550 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2.5 animate-fade-in text-left">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 stroke-[3]" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* If forgot password request was sent, hide input forms for clean presentation */}
          {(!successMsg || !showForgotPassword) && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              
              {/* Roll Number / Username */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                  {config.idLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder={config.idPlaceholder}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                    disabled={loading}
                    required
                  />
                  <UserCheck className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* SIGN UP SPECIAL FIELDS */}
              {isSignUp && !showForgotPassword && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        placeholder="e.g. Sai Charan Ega"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                        disabled={loading}
                        required
                      />
                      <ClipboardList className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); setError(''); }}
                        placeholder="e.g. 9876543201"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                        disabled={loading}
                        required
                      />
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                      Department
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => { setDepartment(e.target.value); setError(''); }}
                        placeholder="e.g. CSE, ECE, ME"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                        disabled={loading}
                        required
                      />
                      <Milestone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              {!showForgotPassword && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                      disabled={loading}
                      required
                    />
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}

              {/* Confirm Password (Sign Up Mode Only) */}
              {isSignUp && !showForgotPassword && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white rounded-xl text-sm font-semibold outline-none transition-all"
                      disabled={loading}
                      required
                    />
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer mt-2 flex items-center justify-center gap-1.5 border-none"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <span>{showForgotPassword ? 'Submit Reset Request' : (isSignUp ? 'Create Account' : 'Sign In Securely')}</span>
                )}
              </button>
            </form>
          )}

          {/* Toggle link for Forgot Password / Sign In */}
          {!isSignUp && !loading && (
            <div className="mt-5 text-center flex flex-col gap-2">
              <button
                type="button"
                onClick={handleToggleForgotPassword}
                className="text-xs font-bold text-slate-505 hover:text-slate-700 underline cursor-pointer bg-transparent border-none outline-none"
              >
                {showForgotPassword ? 'Back to Sign In' : 'Forgot Password?'}
              </button>
            </div>
          )}

          {/* Toggle link for Student Register / Sign In */}
          {portal === 'student' && !showForgotPassword && !loading && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-xs font-bold text-orange-550 hover:text-orange-700 underline cursor-pointer bg-transparent border-none outline-none"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
