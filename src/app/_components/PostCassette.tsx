import Link from "next/link";
import type { PostData } from "../lib/utilities";
import { useDaysAgo } from "../lib/hooks/useDaysAgo";

type PostCassetteProps = Omit<PostData, 'id' | 'contentHtml'>

const PostCassette = ({title, date, tags, slug, summary}: PostCassetteProps) => {
  const formattedDate = useDaysAgo(date);
  return (
    <>
      <div className="flex sm:flex-row flex-col justify-between">
          <h3 className="font-bold text-xl">{title}</h3>
          <time className=" sm:mt-0 mt-2" dateTime={formattedDate}>{formattedDate}</time>
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
    </>
  );
};

export default PostCassette;