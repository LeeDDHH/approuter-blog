import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AllTags from './AllTags';

const meta = {
  component: AllTags,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    allTags: ['React', 'Next.js'],
  },
} satisfies Meta<typeof AllTags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
