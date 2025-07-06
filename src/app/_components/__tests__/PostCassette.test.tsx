import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'; // NOTE: toBeInTheDocumentを使うために必要
import PostCassette from '../PostCassette'

const mockPost = {
  title: 'Test Post Title',
  date: new Date().toISOString().slice(0, -13) + '00:00:00', // Format to YYYY-MM-DDTHH:mm:ss
  slug: 'test-post-slug',
  tags: ['test', 'example'],
  summary: 'This is a test excerpt for the post.',
}

describe('PostCassette', () => {
  beforeAll(() => {
    // 固定日時を2024-01-10T00:00:00に設定
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-10T00:00:00'))
  })

  // NOTE: テストの前に一度だけrenderして、全てのテストで共有する
  beforeEach(() => {
    render(<PostCassette title={mockPost.title} date={mockPost.date} tags={mockPost.tags} slug={mockPost.slug} summary={mockPost.summary} />)
  })

  afterAll(() => {
    jest.useRealTimers()
  })
  it('should render post title', () => {
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('should render post excerpt', () => {
    expect(screen.getByText('This is a test excerpt for the post.')).toBeInTheDocument()
  })

  it('should render post date', () => {
    expect(screen.getByText('1分前')).toBeInTheDocument()
  })

  it('should have correct link to post', () => {
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/blog/test-post-slug')
  })
})