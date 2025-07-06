import Link from "next/link";
import type { PostData, Tags } from "../lib/utilities";

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
          Incessant yapping about frontend, tech, hacks and life&#39;s nuances manifested in its
          textual form.
      </p>
      {/* Display All Tags */}
      <div className="mt-4">
        <h3 className="text-2xl font-semibold mb-4">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            return (
              <button
                  key={tag}
                  className="text-black dark:text-white bg-white dark:bg-black border-2 border-black dark:border-white font-medium text-md rounded-lg p-2 mr-2"
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
      <h3 className="text-2xl font-semibold sm:mt-8 mt-4">Articles</h3>
      {/* Display All Blog Posts */}
      <ul className="mt-4">
        {allPostsData.map(({ id, title, date, tags, slug, summary }) => (
          <li key={id} className="blog-li shadow-md p-4 mb-6 rounded border-2">
            <div className="flex sm:flex-row flex-col justify-between">
                <h3 className="font-bold text-xl">{title}</h3>
                <p className=" sm:mt-0 mt-2">{date}</p>
            </div>
            <p className="sm:my-6 my-2">{summary}</p>
            <div className="flex sm:flex-row flex-col gap-2 sm:items-center justify-between mt-4">
              <div className="flex gap-2 items-center">
                  <Link href={`/blog/${slug}`}>Read more</Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags &&
                  tags.map((tag, index) => (
                  <span key={index}
                    className="text-black dark:text-white bg-white dark:bg-black border-2 border-black dark:border-white font-medium text-md rounded-lg p-2 mr-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
    );
};

export default BlogClient