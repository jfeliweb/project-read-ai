import type { Meta, StoryObj } from '@storybook/react';
import BookView from '@/components/BookView';

const meta: Meta<typeof BookView> = {
  title: 'Components/BookView',
  component: BookView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BookView>;

export const Default: Story = {};
