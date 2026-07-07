import React from 'react';

interface PasswordStrengthProps {
  password?: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password = '' }) => {
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };

    if (pass.length > 8) score += 1;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z\d]/.test(pass)) score += 1;

    if (score === 0 || score === 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2 || score === 3) return { score, label: 'Medium', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = calculateStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden bg-gray-200">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-full flex-1 transition-colors duration-300 ${
              index <= strength.score ? strength.color : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      {password && (
        <p className={`text-xs mt-1 text-right font-medium ${
          strength.label === 'Weak' ? 'text-red-500' : 
          strength.label === 'Medium' ? 'text-yellow-600' : 'text-green-500'
        }`}>
          {strength.label}
        </p>
      )}
    </div>
  );
};

export default PasswordStrength;
