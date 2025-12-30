import type { Meta, StoryObj } from '@storybook/react'
import {
  PlaceCard,
  PlaceCardRoot,
  PlaceCardThumbnail,
  PlaceCardContent,
  PlaceCardTitle,
  PlaceCardRating,
  PlaceCardAction,
  PlaceCardFooter,
} from './place-card'

const meta: Meta<typeof PlaceCard> = {
  title: 'Web/Places/PlaceCard',
  component: PlaceCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PlaceCard>

const mockPlace = {
  _id: '1',
  name: 'Central Park',
  photos: [
    'https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=2070&auto=format&fit=crop',
  ],
  rating: 4.8,
  reviewCount: 1250,
} as any

export const Default: Story = {
  args: {
    place: mockPlace,
  },
}

export const CustomLayout: Story = {
  render: () => (
    <PlaceCardRoot place={mockPlace} className="max-w-sm">
      <PlaceCardThumbnail />
      <PlaceCardContent>
        <div className="flex items-start justify-between">
          <PlaceCardTitle />
          <PlaceCardRating />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Beautiful park in the middle of the city. Perfect for a walk or a picnic.
        </p>
      </PlaceCardContent>
      <PlaceCardFooter>
        <PlaceCardAction variant="outline">View Map</PlaceCardAction>
        <PlaceCardAction variant="default">Directions</PlaceCardAction>
      </PlaceCardFooter>
    </PlaceCardRoot>
  ),
}
