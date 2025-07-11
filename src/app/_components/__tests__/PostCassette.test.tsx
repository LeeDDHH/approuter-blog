import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // NOTE: toBeInTheDocumentを使うために必要
import PostCassette from '../PostCassette';

const mockPost = {
  title: 'Test Post Title',
  date: `${new Date().toISOString().slice(0, -13)}00:00:00`, // Format to YYYY-MM-DDTHH:mm:ss
  slug: 'test-post-slug',
  tags: ['test', 'example'],
  summary: 'This is a test excerpt for the post.',
};

describe('PostCassette', () => {
  beforeAll(() => {
    // 固定日時を2024-01-10T00:00:00に設定
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-10T00:00:00'));
  });

  // NOTE: テストの前に一度だけrenderして、全てのテストで共有する
  beforeEach(() => {
    render(
      <PostCassette
        title={mockPost.title}
        date={mockPost.date}
        tags={mockPost.tags}
        slug={mockPost.slug}
        summary={mockPost.summary}
      />
    );
  });

  afterAll(() => {
    jest.useRealTimers();
  });
  it('タイトルが表示されること', () => {
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('サマリーが表示されること', () => {
    expect(screen.getByText('This is a test excerpt for the post.')).toBeInTheDocument();
  });

  it('投稿日からの日時が表示されること', () => {
    expect(screen.getByText('1分前')).toBeInTheDocument();
  });

  it('タイトルリンクが正しく表示されること', () => {
    const titleLink = screen.getByRole('link', { name: 'Test Post Title' });
    expect(titleLink).toHaveAttribute('href', '/blog/test-post-slug');
  });

  it('Read moreリンクが正しいaria-labelで表示されること', () => {
    const readMoreLink = screen.getByRole('link', { name: 'Read more about Test Post Title' });
    expect(readMoreLink).toHaveAttribute('href', '/blog/test-post-slug');
    expect(readMoreLink).toHaveTextContent('Read more');
  });

  it('両方のリンクが存在すること', () => {
    const allLinks = screen.getAllByRole('link');
    const postLinks = allLinks.filter(
      (link) => link.getAttribute('href') === '/blog/test-post-slug'
    );
    expect(postLinks).toHaveLength(2);
  });

  it('リンクがそれぞれ異なる要素であること', () => {
    const titleLink = screen.getByRole('link', { name: 'Test Post Title' });
    const readMoreLink = screen.getByRole('link', { name: 'Read more about Test Post Title' });

    expect(titleLink).not.toBe(readMoreLink);
    expect(titleLink.textContent).toBe('Test Post Title');
    expect(readMoreLink.textContent).toBe('Read more');
  });
});
