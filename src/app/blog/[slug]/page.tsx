import { getPostData } from '../../lib/utilities';

type PostPageProps = {
  params: {
    slug: string;
  };
}

const PostPage = async ({ params }: PostPageProps) => {
  // NOTE: サーバーコンポーネントでは、awaitを使用してデータを取得する必要がある
  const { slug } = await params;
  const postData = await getPostData(slug);
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