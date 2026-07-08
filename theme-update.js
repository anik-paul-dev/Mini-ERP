const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src', 'pages');

const replacements = [
  { from: /text-gray-900/g, to: 'text-slate-100' },
  { from: /text-gray-800/g, to: 'text-slate-200' },
  { from: /text-gray-700/g, to: 'text-slate-300' },
  { from: /text-gray-600/g, to: 'text-surface-300' },
  { from: /text-gray-500/g, to: 'text-surface-400' },
  { from: /text-gray-400/g, to: 'text-surface-500' },
  { from: /bg-white/g, to: 'bg-surface-800/80 backdrop-blur-sm' },
  { from: /border-gray-100/g, to: 'border-surface-700/50' },
  { from: /border-gray-200/g, to: 'border-surface-700' },
  { from: /divide-gray-100/g, to: 'divide-surface-700/50' },
  { from: /divide-gray-200/g, to: 'divide-surface-700' },
  { from: /hover:bg-gray-50/g, to: 'hover:bg-surface-700/30' },
  { from: /hover:bg-gray-100/g, to: 'hover:bg-surface-700/50' },
  { from: /bg-gray-50/g, to: 'bg-surface-900/50' },
  { from: /bg-gray-100/g, to: 'bg-surface-700' },
  { from: /border-gray-300/g, to: 'border-surface-600' },
  { from: /bg-red-100/g, to: 'bg-rose-500/10' },
  { from: /text-red-800/g, to: 'text-rose-400' },
  { from: /border-red-100/g, to: 'border-rose-500/20' },
  { from: /bg-red-50/g, to: 'bg-rose-500/5' },
  { from: /text-red-600/g, to: 'text-rose-400' },
  { from: /hover:text-red-900/g, to: 'hover:text-rose-300' },
  { from: /bg-green-100/g, to: 'bg-emerald-500/10' },
  { from: /text-green-800/g, to: 'text-emerald-400' },
  { from: /text-green-700/g, to: 'text-emerald-400' },
  { from: /text-green-600/g, to: 'text-emerald-400' },
  { from: /bg-yellow-100/g, to: 'bg-amber-500/10' },
  { from: /text-yellow-800/g, to: 'text-amber-400' },
  { from: /bg-blue-100/g, to: 'bg-blue-500/10' },
  { from: /text-blue-800/g, to: 'text-blue-400' },
  { from: /hover:text-blue-600/g, to: 'hover:text-brand-400' },
  { from: /bg-purple-100/g, to: 'bg-purple-500/10' },
  { from: /text-purple-800/g, to: 'text-purple-400' },
  { from: /bg-purple-50/g, to: 'bg-purple-500/5' },
  { from: /border-purple-100/g, to: 'border-purple-500/20' },
  { from: /text-purple-600/g, to: 'text-purple-400' },
  { from: /bg-blue-50/g, to: 'bg-blue-500/5' },
  { from: /border-blue-100/g, to: 'border-blue-500/20' },
  { from: /text-brand-600/g, to: 'text-brand-400' },
  { from: /hover:text-brand-900/g, to: 'hover:text-brand-300' },
  { from: /hover:text-brand-500/g, to: 'hover:text-brand-300' },
  { from: /hover:bg-brand-50/g, to: 'hover:bg-brand-500/10' },
  { from: /bg-white rounded-xl shadow-sm border border-surface-700\/50/g, to: 'card' },
  { from: /bg-surface-800\/80 backdrop-blur-sm rounded-xl shadow-sm border border-surface-700\/50/g, to: 'card' },
  { from: /bg-white shadow sm:rounded-lg/g, to: 'card max-w-md mx-auto p-8' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      replacements.forEach(({ from, to }) => {
        content = content.replace(from, to);
      });
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${fullPath}`);
    }
  }
}

processDirectory(srcDir);
console.log('Theme update complete.');
