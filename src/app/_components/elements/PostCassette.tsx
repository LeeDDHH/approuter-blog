import Link from 'next/link';
import { useDaysAgo } from '../../lib/hooks/useDaysAgo';
import type { PostData } from '../../lib/utilities';
import AllTags from '../domains/AllTags';

type PostCassetteProps = Omit<PostData, 'id' | 'contentHtml'>;

const PostCassette = ({ title, date, tags, slug, summary }: PostCassetteProps) => {
  const formattedDate = useDaysAgo(date);
  const linkHref = `/blog/${slug}`;

  return (
    <article>
      <div className="flex flex-col justify-between sm:flex-row">
        <h3 className="font-bold text-xl hover:text-teal-100 hover:underline hover:underline-offset-2">
          <Link href={linkHref}>{title}</Link>
        </h3>
        <time className=" mt-2 sm:mt-0" dateTime={formattedDate}>
          {formattedDate}
        </time>
      </div>
      <p className="my-2 sm:my-6">{summary}</p>
      <div className="mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center gap-2 hover:text-teal-300 hover:underline hover:underline-offset-2">
          <Link href={linkHref} aria-label={`Read more about ${title}`}>
            Read more
          </Link>
        </div>
        <AllTags allTags={tags} />
      </div>
    </article>
  );
};

export default PostCassette;
