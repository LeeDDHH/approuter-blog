const fs = require('fs');
const path = require('path');

/**
 * posts配下の画像をpublic/imagesにコピーするスクリプト
 */
async function copyImages() {
  const postsDir = path.join(__dirname, '..', 'posts');
  const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
  
  // public/imagesディレクトリを作成
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }
  
  // posts/imagesディレクトリの確認
  const postsImagesDir = path.join(postsDir, 'images');
  if (!fs.existsSync(postsImagesDir)) {
    console.log('posts/images directory does not exist. Creating...');
    fs.mkdirSync(postsImagesDir, { recursive: true });
    console.log('posts/images directory created. Proceeding with the copy process...');
  }
  
  // 既存のpublic/images内容をクリア
  const existingFiles = fs.readdirSync(publicImagesDir);
  for (const file of existingFiles) {
    const filePath = path.join(publicImagesDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }
  
  // posts/images内の全ファイルをコピー
  function copyRecursive(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${srcPath} -> ${destPath}`);
      }
    }
  }
  
  copyRecursive(postsImagesDir, publicImagesDir);
  console.log('Images copied successfully!');
}

// スクリプトが直接実行された場合
if (require.main === module) {
  copyImages().catch(console.error);
}

module.exports = { copyImages };