import type { PostData, Tags } from "../lib/utilities";
import PostCassette from "../_components/PostCassette";
import AllTags from "../_components/domains/AllTags";

type BlogClientProps = {
  allPostsData: PostData[];
  allTags: Tags;
}

const BlogClient = ({ allPostsData, allTags }: BlogClientProps) => {
  return (
    <div className="container mx-auto sm:px-4 px-0">
      <h2 className="font-bold sm:text-5xl text-3xl flex items-center justify-center">
          Blog
      </h2>
      <p className="sm:mt-8 mt-4 justify-center text-center">
          フロントエンド、技術、何かしらの備忘録などを言語化する。
      </p>
      {/* Display All Tags */}
      <AllTags allTags={allTags} />
      <h3 className="text-2xl font-semibold sm:mt-8 mt-4">Articles</h3>
      {/* Display All Blog Posts */}
      <ul className="mt-4">
        {allPostsData.map(({ id, title, date, tags, slug, summary }) => (
          <li key={id} className="blog-li shadow-md p-4 mb-6 rounded border-2">
            <PostCassette title={title} date={date} tags={tags} slug={slug} summary={summary} />
          </li>
        ))}
      </ul>
    </div>
    );
};

export default BlogClient