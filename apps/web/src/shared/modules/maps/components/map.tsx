import dynamic from 'next/dynamic'

const LazyMap = dynamic(() => import('./map.client'), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
})

export default function LeafletMap(props: React.ComponentProps<typeof LazyMap>) {
  return <LazyMap {...props} />
}

