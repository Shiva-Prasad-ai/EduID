import React, { useState } from 'react';
import { 
  GraduationCap, 
  Eye, 
  EyeOff, 
  Lock, 
  Building, 
  Landmark, 
  Shield, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import loginBg from '../assets/login-bg.jpg';
import { API_BASE_URL } from '../config/api';

export default function LoginPage({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('Student'); // 'Student' | 'College' | 'University' | 'Admin'
  const [eduId, setEduId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  const roles = [
    { id: 'Student', label: 'Student', icon: GraduationCap },
    { id: 'College', label: 'College', icon: Building },
    { id: 'University', label: 'University', icon: Landmark },
    { id: 'Admin', label: 'Admin', icon: Shield }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
  };

  const handleUseDemo = () => {
    setSelectedRole('Student');
    setEduId('EUKA2026001');
    setPassword('sample user');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eduId.trim() || !password.trim()) {
      setErrorMessage('Please enter both your EduID and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eduId: eduId.trim(),
          password: password,
          role: selectedRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPassword('');
          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }
          return;
        } else {
          setErrorMessage(data.message || 'Authentication failed. Please check your credentials.');
          return;
        }
      }

      // If backend route returned non-200 (e.g. 404 on static GitHub Pages)
      throw new Error(`Server returned HTTP ${response.status}`);
    } catch (err) {
      console.warn('Live backend unreachable, checking offline demo credentials:', err.message);

      // Graceful Static / Demo Fallback (enables GitHub Pages preview)
      const cleanInput = eduId.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const isDemoId = cleanInput === 'EUKA2026001' || cleanInput.includes('EUKA');
      const isDemoPass = password === 'sample user' || password === 'sampleuser';

      if (isDemoId && isDemoPass) {
        setPassword('');
        if (onLoginSuccess) {
          onLoginSuccess({
            eduId: 'EUKA2026001',
            formattedEduId: 'EU-KA-2026-001',
            name: selectedRole === 'Student' ? 'Ananya Raj' : `${selectedRole} Administrator`,
            role: selectedRole,
            department: 'BCA - 2nd Year',
            institution: 'Bengaluru City University',
            status: 'Verified',
            attendance: '94%',
            cgpa: '8.72',
            dateOfBirth: '12 May 2005',
            state: 'KA',
            year: 2026
          });
        }
        return;
      }

      setErrorMessage('Backend is offline. For demo preview, please use EduID "EUKA2026001" and password "sample user".');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = eduId.trim().length > 0 && password.trim().length > 0;
  const isStudent = selectedRole === 'Student';

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#CDCBD6]/40 via-slate-50 to-[#CDCBD6]/20 flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans antialiased selection:bg-[#D96846]/20 selection:text-[#D96846] overflow-y-auto box-border">
      
      {/* Main Container Card */}
      <div className={`w-full bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl border border-[#CDCBD6]/60 overflow-hidden transition-all duration-500 ease-out my-auto ${
        isStudent 
          ? 'max-w-5xl max-h-[92dvh] grid grid-cols-1 lg:grid-cols-12 min-h-0 sm:min-h-[540px] lg:min-h-[580px]' 
          : 'max-w-lg p-6 sm:p-10 flex flex-col justify-between min-h-[500px] shadow-teal-900/10 border-teal-500/20 animate-in fade-in zoom-in-95'
      }`}>
        
        {/* Login Form Container */}
        <div className={`flex flex-col justify-between overflow-y-auto ${
          isStudent ? 'lg:col-span-7 p-6 sm:p-8 lg:p-10' : 'w-full'
        }`}>
          
          {/* Header Branding */}
          <div>
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#D96846] flex items-center justify-center text-white shadow-md shadow-[#D96846]/25 shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">EduID</span>
                  <span className="bg-[#D96846]/10 text-[#D96846] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#D96846]/25 uppercase tracking-wide">
                    Auth Portal
                  </span>
                </div>
              </div>

              {/* Demo Credentials Quick-Fill Button */}
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-[11px] font-bold text-[#D96846] bg-[#D96846]/10 hover:bg-[#D96846]/20 px-3 py-1.5 rounded-xl border border-[#D96846]/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Fill sample demo credentials (EUKA2026001 / sample user)"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Use Demo Account</span>
                <span className="sm:hidden">Demo</span>
              </button>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-5 sm:mb-6">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                {isStudent ? 'Welcome Back!' : `${selectedRole} Portal Login`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {isStudent ? 'Login to your verified EduID student account' : `Access official ${selectedRole.toLowerCase()} portal dashboard`}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Role Selection ("Login As") */}
            <div className="mb-5 sm:mb-6">
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Login As
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roles.map((r) => {
                  const IconComponent = r.icon;
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={`relative flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-[#D96846]/10 border-[#D96846] text-[#D96846] shadow-md shadow-[#D96846]/15 ring-2 ring-[#D96846]/20'
                          : 'bg-[#CDCBD6]/20 border-[#CDCBD6]/60 text-slate-700 hover:bg-[#CDCBD6]/40 hover:border-[#CDCBD6]'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 mb-1 transition-colors ${
                        isSelected ? 'text-[#D96846]' : 'text-slate-500'
                      }`} />
                      <span className="text-[11px] sm:text-xs">{r.label}</span>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D96846]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              
              {/* EduID Input */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {isStudent ? 'EduID Identifier' : `${selectedRole} Identifier / ID`}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={eduId}
                    onChange={(e) => { setEduId(e.target.value); setErrorMessage(''); }}
                    placeholder={isStudent ? "e.g. EUKA2026001 or EU-KA-2026-001" : `Enter your official ${selectedRole.toLowerCase()} ID`}
                    className="w-full bg-[#CDCBD6]/15 border border-[#CDCBD6] rounded-2xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D96846]/30 focus:border-[#D96846] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Format: <span className="font-semibold text-slate-700">EU-State-Year-XXX</span> (e.g. EUKA2026001)
                </p>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordMsg(!forgotPasswordMsg)}
                    className="text-[11px] sm:text-xs font-bold text-[#D96846] hover:text-[#b85233] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                    placeholder="Enter your password"
                    className="w-full bg-[#CDCBD6]/15 border border-[#CDCBD6] rounded-2xl pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#D96846]/30 focus:border-[#D96846] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {forgotPasswordMsg && (
                  <p className="mt-2 text-xs font-semibold text-[#D96846] bg-[#D96846]/10 p-2.5 rounded-xl border border-[#D96846]/20">
                    💡 Please contact your university/institution EduID administrator or support desk to reset your credentials.
                  </p>
                )}
              </div>

              {/* Primary LOGIN Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full mt-2 py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D96846] via-[#e27351] to-[#b85233] hover:from-[#c25637] hover:to-[#a34428] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#D96846]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>LOGIN AS {selectedRole.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Security Footer */}
          <div className="pt-4 mt-4 border-t border-[#CDCBD6]/40 flex items-center justify-center text-xs font-semibold text-slate-500 gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#D96846]" />
            <span>Encrypted authentication powered by EduID Registry</span>
          </div>

        </div>

        {/* Right Column — EduID Background Visual Area (Exclusive to Student Role) */}
        {isStudent && (
          <div className="hidden lg:block lg:col-span-5 relative overflow-hidden bg-[#FAF0E6] animate-in fade-in duration-500 min-h-[540px] lg:min-h-[580px]">
            <img 
              src={loginBg} 
              alt="EduID Illustration Background" 
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
        )}

      </div>

    </div>
  );
}
