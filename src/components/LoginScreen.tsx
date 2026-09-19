import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { AmadeusLogo } from './AmadeusLogo';

interface LoginScreenProps {
  onLoginSuccess: (userData: { username: string; officeId: string; dutyCode: string }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [dutyCode, setDutyCode] = useState('Select');
  const [officeId, setOfficeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!username.trim() || !officeId.trim() || !password.trim()) {
      setErrorMessage('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    if (dutyCode === 'Select') {
      setErrorMessage('Please select a valid Duty Code (Student or Teacher).');
      return;
    }

    // Required Hardcoded validation
    // Username: Shohoj360
    // Password: 21368575
    // Office ID: DAC360
    // Duty Code: Must NOT be "Select" (either "Student" or "Teacher")
    const validUsername = username.trim().toLowerCase() === 'shohoj360';
    const validPassword = password.trim() === '21368575';
    const validOfficeId = officeId.trim().toUpperCase() === 'DAC360';
    const validDuty = dutyCode === 'Student' || dutyCode === 'Teacher';

    if (validUsername && validPassword && validOfficeId && validDuty) {
      onLoginSuccess({
        username: username.trim(),
        officeId: officeId.trim().toUpperCase(),
        dutyCode,
      });
    } else {
      setErrorMessage(
        'Authentication failed. Invalid username, password, duty code, or office ID. Please verify your credentials.'
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#051336]" id="amadeus-login-root">
      {/* Left 50%: Dark Navy Branding with Curved Vector Waves */}
      <div
        className="w-full md:w-1/2 min-h-[280px] md:min-h-screen bg-[#051336] relative overflow-hidden flex flex-col justify-center px-8 md:px-16 py-12"
        id="login-branding-panel"
      >
        {/* Subtle Curved Concentric Amadeus Vector Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 1000"
          preserveAspectRatio="none"
          id="login-curved-arcs"
        >
          <path
            d="M 100,-100 C 500,200 700,600 400,1100"
            fill="none"
            stroke="#1d428a"
            strokeWidth="2"
          />
          <path
            d="M -50,-50 C 400,250 600,650 300,1150"
            fill="none"
            stroke="#193370"
            strokeWidth="1.5"
          />
          <path
            d="M 250,-150 C 650,200 850,550 550,1100"
            fill="none"
            stroke="#214fa3"
            strokeWidth="2.5"
          />
          <path
            d="M 400,-200 C 800,250 1000,600 700,1100"
            fill="none"
            stroke="#1d428a"
            strokeWidth="2"
          />
          <path
            d="M -150,100 C 350,400 500,750 200,1200"
            fill="none"
            stroke="#132752"
            strokeWidth="2"
          />
        </svg>

        {/* Branding text matching IMG_3765 */}
        <div className="relative z-10 max-w-md">
          <div className="mb-6 flex items-center gap-3">
            <AmadeusLogo variant="white" size="lg" />
          </div>
          <h1 className="text-white text-3xl md:text-4xl font-normal tracking-tight mb-2 font-sans" id="login-heading-text">
            Selling Platform Connect
          </h1>
          <p className="text-[#8ba3d4] text-sm mt-3 leading-relaxed">
            Global Distribution System (GDS) Professional Airline Reservation & Ticketing Training Environment.
          </p>

          <div className="mt-8 pt-6 border-t border-[#132752] text-xs text-[#627cae] flex flex-wrap gap-4">
            <span>Amadeus IT Group SA</span>
            <span>•</span>
            <span>Version 24.2.0</span>
            <span>•</span>
            <span>Secure Port 443</span>
          </div>
        </div>
      </div>

      {/* Right 50%: Clean White Login Card */}
      <div
        className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-6 md:px-16 py-12"
        id="login-form-panel"
      >
        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="mb-7">
            <h2 className="text-2xl md:text-3xl font-normal text-[#1a1a1a] mb-2 font-sans" id="signin-card-title">
              Sign in
            </h2>
            <div className="text-xs text-[#555555]">
              <span className="text-[#d9383a] font-bold">*</span> Mandatory
            </div>
          </div>

          {/* Authentic Amadeus Error Toast Notice */}
          {errorMessage && (
            <div
              className="mb-5 p-3.5 bg-[#fdf2f2] border-l-4 border-[#d9383a] text-[#a51d24] text-xs leading-relaxed flex items-start gap-2.5 rounded-sm shadow-xs animate-in fade-in duration-200"
              role="alert"
              id="login-error-alert"
            >
              <AlertCircle className="w-4 h-4 text-[#d9383a] shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Error</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="amadeus-login-form">
            {/* Row 1: Username & Duty code */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label
                  htmlFor="login-username"
                  className="block text-xs font-normal text-[#333333] mb-1"
                >
                  Username <span className="text-[#d9383a] font-semibold">*</span>
                </label>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-9 px-3 py-1.5 text-sm text-[#111111] bg-white border border-[#c4cdd5] rounded-xs focus:border-[#005eb8] focus:ring-1 focus:ring-[#005eb8] outline-none transition-colors"
                  autoComplete="username"
                />
              </div>

              <div className="w-[120px] sm:w-[130px]">
                <label
                  htmlFor="login-dutycode"
                  className="block text-xs font-normal text-[#333333] mb-1"
                >
                  Duty code <span className="text-[#d9383a] font-semibold">*</span>
                </label>
                <select
                  id="login-dutycode"
                  value={dutyCode}
                  onChange={(e) => setDutyCode(e.target.value)}
                  className="w-full h-9 px-2.5 py-1.5 text-sm text-[#111111] bg-white border border-[#c4cdd5] rounded-xs focus:border-[#005eb8] focus:ring-1 focus:ring-[#005eb8] outline-none transition-colors cursor-pointer"
                >
                  <option value="Select">Select</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                </select>
              </div>
            </div>

            {/* Row 2: Office ID */}
            <div>
              <label
                htmlFor="login-officeid"
                className="block text-xs font-normal text-[#333333] mb-1"
              >
                Office ID <span className="text-[#d9383a] font-semibold">*</span>
              </label>
              <input
                id="login-officeid"
                type="text"
                value={officeId}
                onChange={(e) => setOfficeId(e.target.value)}
                className="w-full h-9 px-3 py-1.5 text-sm text-[#111111] bg-white border border-[#c4cdd5] rounded-xs focus:border-[#005eb8] focus:ring-1 focus:ring-[#005eb8] outline-none transition-colors uppercase"
                autoComplete="organization"
              />
            </div>

            {/* Row 3: Password with eye toggle */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-normal text-[#333333] mb-1"
              >
                Password <span className="text-[#d9383a] font-semibold">*</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 px-3 pr-10 py-1.5 text-sm text-[#111111] bg-white border border-[#c4cdd5] rounded-xs focus:border-[#005eb8] focus:ring-1 focus:ring-[#005eb8] outline-none transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#767676] hover:text-[#111111] focus:outline-none p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Row 4: Remember me */}
            <div className="flex items-center pt-1">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#005eb8] border-[#c4cdd5] rounded-xs focus:ring-[#005eb8] cursor-pointer"
              />
              <label
                htmlFor="remember-me-checkbox"
                className="ml-2 text-xs font-normal text-[#333333] cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>

            {/* Row 5: Sign In button */}
            <div className="pt-2">
              <button
                id="signin-submit-btn"
                type="submit"
                className="w-full h-10 bg-[#005eb8] hover:bg-[#004b93] active:bg-[#003d78] text-white text-sm font-medium rounded-[3px] transition-colors shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </div>

            {/* Row 6: Forgot password */}
            <div className="text-center pt-2">
              <button
                type="button"
                id="forgot-password-link"
                onClick={() =>
                  setErrorMessage(
                    'Please contact your system administrator or local Amadeus help desk to reset your password.'
                  )
                }
                className="text-xs text-[#005eb8] hover:underline focus:outline-none cursor-pointer"
              >
                I forgot my password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
