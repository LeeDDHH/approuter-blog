import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PostCassette from './PostCassette';

const meta = {
  component: PostCassette,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    title: 'Test Post Title',
    date: '2025-01-01T00:00:00', // ISO 8601 形式の固定の日時
    slug: 'test-post-slug',
    tags: ['test', 'example'],
    summary: 'This is a test excerpt for the post.',
  },
} satisfies Meta<typeof PostCassette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
