import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Element, Root } from 'hast';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export type Tags = string[];

// NOTE: マークダウンファイルから取得したデータの型定義
export type PostData = {
  id: string;
  title: string;
  date: string;
  tags: Tags;
  summary: string;
  slug: string;
  contentHtml: string;
};

const LOCAL_IMAGE_PATH_PREFIX = './images/';
const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * ローカル画像パスを変換するRehypeプラグイン
 *
 * @returns {Function} HASTツリー構造を処理して画像パスを更新する関数
 * <img>タグの`src`属性を環境に応じて変換する
 */
function rehypeImagePath() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties && node.properties['src']) {
        const src = node.properties['src'];
        // ./images/... のパスを環境に応じて変換する
        if (typeof src === 'string' && src.startsWith(LOCAL_IMAGE_PATH_PREFIX)) {
          // 開発時: /api/posts-images/... (API route直接)
          // 本番時: /images/... (public配下)
          const isDevelopment = process.env.NODE_ENV === 'development';
          const basePath = isDevelopment ? '/api/posts-images/' : '/images/';
          node.properties['src'] = src.replace(LOCAL_IMAGE_PATH_PREFIX, basePath);
        }
      }
    });
  };
}

/**
 * postsディレクトリからすべてのマークダウンデータを取得して処理する
 *
 * @returns {Array<Object>} それぞれ id、slug、その他のメタデータを含むpostデータ オブジェクトの並べ替えられた配列
 * @throws {Error} postsディレクトリが存在しない場合
 * @throws {Error} マークダウンファイルの読み込みに失敗した場合
 * @throws {Error} マークダウンファイルのメタデータが不正な場合
 */
const getAllPostsData = (): PostData[] => {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: PostData[] = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return {
        id,
        slug: matterResult.data['slug'],
        date: matterResult.data['date'],
        title: matterResult.data['title'],
        tags: matterResult.data['tags'],
        summary: matterResult.data['summary'],
        contentHtml: matterResult.content,
      };
    });
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
};

/**
 * 指定されたslugのpostデータを取得する
 *
 * @param {string} slug - 取得するpostのslug
 * @returns {Promise<Object>} slug、contentHtml、その他のメタデータを含む投稿データ
 * @throws {Error} 指定されたslugを持つ投稿が見つからない場合
 */
async function getPostData(slug: string): Promise<PostData> {
  const fileNames = fs.readdirSync(postsDirectory);
  const matchedFile = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .find((fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      return matterResult.data['slug'] === slug;
    });

  if (!matchedFile) {
    throw new Error(`Post with slug '${slug}' not found`);
  }

  const fullPath = path.join(postsDirectory, matchedFile);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeImagePath)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id: matterResult.data['id'],
    title: matterResult.data['title'],
    date: matterResult.data['date'],
    tags: matterResult.data['tags'],
    summary: matterResult.data['summary'],
    slug,
    contentHtml,
  };
}

/**
 * postsからすべての一意のタグを取得する
 * @returns {string[]} 一意のタグの配列
 * @throws {Error} postsディレクトリが存在しない場合
 * @throws {Error} マークダウンファイルの読み込みに失敗した場合
 * @throws {Error} マークダウンファイルのメタデータが不正な場合
 */
const getAllTags = (): Tags => {
  const fileNames = fs.readdirSync(postsDirectory);
  const allTags = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .reduce((acc: string[], fileName: string) => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);
      if (matterResult.data['tags'] && Array.isArray(matterResult.data['tags'])) {
        acc.push(...matterResult.data['tags']);
      }
      return acc;
    }, []);

  // Remove duplicate tags
  return Array.from(new Set(allTags));
};

export { getAllPostsData, getPostData, getAllTags };
