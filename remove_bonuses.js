import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find and remove bonus lines within TOTEM_DATA
// It matches "    bonus: { en: '...', fr: '...' }" followed by optional comma and newline
content = content.replace(/\s+bonus: \{ en: '.*?', fr: '.*?' \},?\r?\n/g, '\n');

// Clean up any double newlines caused by the replacement
content = content.replace(/\n\n\s+/g, '\n    ');

fs.writeFileSync(filePath, content);
console.log('Passive bonuses removed from TOTEM_DATA');
