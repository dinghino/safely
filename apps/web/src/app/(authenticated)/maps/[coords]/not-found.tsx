export default async function NotFoundPage({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] }>
}) {
  const awaitedParams = await params
  console.warn('⚠️⚠️⚠️ missing /maps/[coords] for route', awaitedParams)
  return null
}
