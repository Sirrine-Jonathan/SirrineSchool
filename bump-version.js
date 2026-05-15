import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

if (!fs.existsSync(gradlePath)) {
  console.log('Android build.gradle not found. Skipping version bump.');
  process.exit(0);
}

let content = fs.readFileSync(gradlePath, 'utf8');

// Increment versionCode
const versionCodeMatch = content.match(/versionCode (\d+)/);
if (versionCodeMatch) {
  const currentCode = parseInt(versionCodeMatch[1]);
  const newCode = currentCode + 1;
  content = content.replace(`versionCode ${currentCode}`, `versionCode ${newCode}`);
  console.log(`Bumped versionCode to: ${newCode}`);
}

// Increment versionName (patch version)
const versionNameMatch = content.match(/versionName "(\d+)\.(\d+)\.(\d+)"/);
if (versionNameMatch) {
  const major = versionNameMatch[1];
  const minor = versionNameMatch[2];
  const patch = parseInt(versionNameMatch[3]);
  const newName = `${major}.${minor}.${patch + 1}`;
  content = content.replace(`versionName "${major}.${minor}.${patch}"`, `versionName "${newName}"`);
  console.log(`Bumped versionName to: ${newName}`);
}

fs.writeFileSync(gradlePath, content);
