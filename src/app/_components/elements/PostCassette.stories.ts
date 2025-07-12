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
    date: `${new Date().toISOString().slice(0, -13)}00:00:00`, // Format to YYYY-MM-DDTHH:mm:ss
    slug: 'test-post-slug',
    tags: ['test', 'example'],
    summary: 'This is a test excerpt for the post.',
  },
} satisfies Meta<typeof PostCassette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
