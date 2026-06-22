const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const heroEnd = content.indexOf('</section>', content.indexOf('{/* 🚀 HERO */}')) + '</section>'.length;
const calcStart = content.indexOf('      {/* КОМПАКТНИЙ PREMIUM КАЛЬКУЛЯТОР */}');
const calcEnd = content.indexOf('</section>', calcStart) + '</section>'.length;

const calcBlock = content.substring(calcStart, calcEnd);

let newCalcBlock = calcBlock.replace(
  '<span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">',
  '<span className="bg-green-500/20 text-green-400 border border-green-400/50 px-3 py-1 rounded-md text-sm md:text-base font-black uppercase tracking-widest shadow-[0_0_20px_rgba(74,222,128,0.4)]">'
);

content = content.slice(0, calcStart) + content.slice(calcEnd);
content = content.slice(0, heroEnd) + '\n\n' + newCalcBlock + content.slice(heroEnd);

fs.writeFileSync(file, content, 'utf8');
console.log('Reordering and badge update done');
