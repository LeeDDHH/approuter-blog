import { getPostData } from '../../lib/utilities';
import 'github-markdown-css/github-markdown.css'

// cf. https://nextjs.org/docs/app/api-reference/file-conventions/page
type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
}

const PostPage = async ({ params }: PostPageProps) => {
  // NOTE: サーバーコンポーネントでは、awaitを使用してデータを取得する必要がある
  const { slug } = await params;
  const postData = await getPostData(slug);
  return (
    <div className="blog-article">
      <article>
        <h2 className="font-bold text-4xl flex items-center justify-center mb-6">
            {postData.title}
        </h2>
        {/* cf. https://github.com/sindresorhus/github-markdown-css */}
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>)
}

export default PostPage;