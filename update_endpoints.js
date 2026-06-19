
const fs = require('fs');
const path = require('path');
const projectRoot = __dirname;

const filesToUpdate = [
  {
    filePath: path.join(projectRoot, 'src/context/CanteenContext.jsx'),
    importStatement: "import { API_URL } from '../config';\n"
  },
  {
    filePath: path.join(projectRoot, 'src/pages/Student/Cart.jsx'),
    importStatement: "import { API_URL } from '../../config';\n"
  },
  {
    filePath: path.join(projectRoot, 'src/pages/Student/Login.jsx'),
    importStatement: "import { API_URL } from '../../config';\n"
  },
  {
    filePath: path.join(projectRoot, 'src/pages/Admin/StaffManagement.jsx'),
    importStatement: "import { API_URL } from '../../config';\n"
  }
];

filesToUpdate.forEach(({ filePath, importStatement }) => {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Insert import statement right after the first line (or React import)
  if (!content.includes('API_URL')) {
    const lines = content.split('\n');
    lines.splice(1, 0, importStatement.trim());
    content = lines.join('\n');
  }

  // Replace all occurrences of http://localhost:5001
  const pattern1 = /'http:\/\/localhost:5001([^']*)'/g;
  const pattern2 = /"http:\/\/localhost:5001([^"]*)"/g;
  const pattern3 = /`http:\/\/localhost:5001([^`]*)`/g;

  content = content.replace(pattern1, '`${API_URL}$1`');
  content = content.replace(pattern2, '`${API_URL}$1`');
  content = content.replace(pattern3, '`${API_URL}$1`');

  // Also replace socket link
  content = content.replace(/socketIO\('http:\/\/localhost:5001'\)/g, 'socketIO(API_URL)');
  content = content.replace(/socketIO\(`http:\/\/localhost:5001`\)/g, 'socketIO(API_URL)');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated endpoints in: ${path.basename(filePath)}`);
});
