import { getPostData } from '../../lib/utilities';

type PostPageProps = {
  params: {
    slug: string;
  };
}

const PostPage = async ({ params }: PostPageProps) => {
  const postData = await getPostData(params.slug);
  return (
    <div className="whitespace-pre-line	blog-article">
      <article>
        <h2 className="font-bold text-4xl flex items-center justify-center mb-6">
            {postData.title}
        </h2>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>)
}

export default PostPage;