const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const build = async () => {
  child_process.execSync('pnpm build', { stdio: 'inherit' });
  // cp preview.py to ./static folder
  fs.copyFileSync('./preview.py', './static/preview.py');
  // replace text in preview.py
  const previewPath = path.resolve(__dirname, './static/preview.py');
  let preview = fs.readFileSync(previewPath, 'utf8');
  preview = preview.replace(`get_target_url(), # replace with 'index.html'`, `'index.html',`);
  fs.writeFileSync(previewPath, preview);
  child_process.execSync('pyinstaller --onefile ./static/preview.py --add-data ./static:./  --noconsole --distpath .', { stdio: 'inherit' });
  fs.rmSync('./static/preview.py');
}

build();