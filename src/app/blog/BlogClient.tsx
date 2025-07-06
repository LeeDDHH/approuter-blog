import AllTags from '../_components/domains/AllTags';
import PostCassette from '../_components/PostCassette';
import type { PostData, Tags } from '../lib/utilities';

type BlogClientProps = {
  allPostsData: PostData[];
  allTags: Tags;
};

const BlogClient = ({ allPostsData, allTags }: BlogClientProps) => {
  return (
    <div className="container mx-auto px-0 sm:px-4">
      <h2 className="flex items-center justify-center font-bold text-3xl sm:text-5xl">camolog</h2>
      <p className="mt-4 justify-center text-center sm:mt-8">
        フロントエンド、技術、何かしらの備忘録などを言語化する。
      </p>
      {/* Display All Tags */}
      <div className="mt-4">
        <h3 className="mb-4 font-semibold text-2xl">Tags</h3>
        <AllTags allTags={allTags} />
      </div>
      <h3 className="mt-4 font-semibold text-2xl sm:mt-8">Articles</h3>
      {/* Display All Blog Posts */}
      <ul className="mt-4">
        {allPostsData.map(({ id, title, date, tags, slug, summary }) => (
          <li key={id} className="blog-li mb-6 rounded border-2 p-4 shadow-md">
            <PostCassette title={title} date={date} tags={tags} slug={slug} summary={summary} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlogClient;
