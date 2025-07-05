import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

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
}

const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * Retrieves and processes all markdown posts data from the posts directory.
 *
 * @returns {Array<Object>} Sorted array of post data objects, each containing id, slug, and other metadata.
 */
const getAllPostsData = (): PostData[] => {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData: PostData[] = fileNames.map((fileName) => {
        const id = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        return {
            id,
            slug: matterResult.data.slug,
            date: matterResult.data.date,
            title: matterResult.data.title,
            tags: matterResult.data.tags,
            summary: matterResult.data.summary,
            contentHtml: matterResult.content
        };
    });
    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Retrieves the post data for a given slug.
 *
 * @param {string} slug - The slug of the post to retrieve.
 * @returns {Promise<Object>} The post data including slug, contentHtml, and other metadata.
 * @throws {Error} If no post with the given slug is found.
 */
async function getPostData(slug:string): Promise<PostData> {
    const fileNames = fs.readdirSync(postsDirectory);
    const matchedFile = fileNames.find((fileName) => {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        return matterResult.data.slug === slug;
    });

    if (!matchedFile) {
        throw new Error(`Post with slug '${slug}' not found`);
    }

    const fullPath = path.join(postsDirectory, matchedFile);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark().use(html).process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id: matterResult.data.id,
        title: matterResult.data.title,
        date: matterResult.data.date,
        tags: matterResult.data.tags,
        summary: matterResult.data.summary,
        slug,
        contentHtml,
    };
}

/**
 * Retrieves all unique tags from the blog posts.
 * @returns {string[]} Array of unique tags.
 */
const getAllTags = (): Tags => {
    const fileNames = fs.readdirSync(postsDirectory);
    const allTags = fileNames.reduce((acc: string[], fileName: string) => {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        if (matterResult.data.tags && Array.isArray(matterResult.data.tags)) {
            acc.push(...matterResult.data.tags);
        }
        return acc;
    }, []);

    // Remove duplicate tags
    return Array.from(new Set(allTags));
}

export { getAllPostsData, getPostData, getAllTags };
