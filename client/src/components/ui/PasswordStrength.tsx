import React from 'react';

interface PasswordStrengthProps {
  password?: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-surface-700' };

    if (pass.length > 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;

    if (score === 0 || score === 1) return { score, label: 'Weak', color: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' };
    if (score === 2 || score === 3) return { score, label: 'Medium', color: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' };
    return { score, label: 'Strong', color: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' };
  };

  const strength = calculateStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5 h-1.5 w-full rounded-full overflow-hidden bg-surface-800">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-full flex-1 rounded-full transition-all duration-500 ${
              index <= strength.score ? strength.color : 'bg-surface-700'
            }`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-xs mt-1.5 text-right font-medium transition-colors duration-300 ${
          strength.label === 'Weak' ? 'text-rose-400' : 
          strength.label === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {strength.label}
        </p>
      )}
    </div>
  );
};

export default PasswordStrength;
