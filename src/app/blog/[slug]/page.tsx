import { getPostData } from '../../lib/utilities';
import 'github-markdown-css/github-markdown.css'; // NOTE: GitHubのMarkdown CSSをインポート
import 'highlight.js/styles/hybrid.css'; // NOTE: コードハイライト用のCSSをインポート
import '../../_css/post.css';

// cf. https://nextjs.org/docs/app/api-reference/file-conventions/page
type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const PostPage = async ({ params }: PostPageProps) => {
  // NOTE: サーバーコンポーネントでは、awaitを使用してデータを取得する必要がある
  const { slug } = await params;
  const postData = await getPostData(slug);
  return (
    <div className="blog-article">
      <article>
        <h2 className="mb-6 flex items-center justify-center font-bold text-4xl">
          {postData.title}
        </h2>
        {/* cf. https://github.com/sindresorhus/github-markdown-css */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Markdownレンダリングのため必要 */}
        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </div>
  );
};

export default PostPage;
