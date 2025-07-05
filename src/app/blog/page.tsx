import BlogClient from './BlogClient';
import { getAllPostsData, getAllTags } from '../lib/utilities';

export const metadata = {
  title: 'Blog',
  description: 'A collection of blog posts on various topics.',
  image: '/og-image.png',
  url: 'https://expfrom.me',
};

const BlogPage = async () => {
  const allPostsData = getAllPostsData();
  const allTags = getAllTags();

  return <BlogClient allPostsData={allPostsData} allTags={allTags} />
};
export default BlogPage;