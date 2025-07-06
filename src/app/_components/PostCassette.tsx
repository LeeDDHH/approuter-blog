import Link from "next/link";
import { useDaysAgo } from "../lib/hooks/useDaysAgo";
import type { PostData } from "../lib/utilities";
import AllTags from "./domains/AllTags";

type PostCassetteProps = Omit<PostData, "id" | "contentHtml">;

const PostCassette = ({
	title,
	date,
	tags,
	slug,
	summary,
}: PostCassetteProps) => {
	const formattedDate = useDaysAgo(date);
	return (
		<>
			<div className="flex sm:flex-row flex-col justify-between">
				<h3 className="font-bold text-xl hover:underline hover:underline-offset-2 hover:text-teal-100">
					<Link href={`/blog/${slug}`}>{title}</Link>
				</h3>
				<time className=" sm:mt-0 mt-2" dateTime={formattedDate}>
					{formattedDate}
				</time>
			</div>
			<p className="sm:my-6 my-2">{summary}</p>
			<div className="flex sm:flex-row flex-col gap-2 sm:items-center justify-between mt-4">
				<div className="flex gap-2 items-center shrink-0 hover:underline hover:underline-offset-2 hover:text-teal-300">
					<Link href={`/blog/${slug}`}>Read more</Link>
				</div>
				<AllTags allTags={tags} />
			</div>
		</>
	);
};

export default PostCassette;
