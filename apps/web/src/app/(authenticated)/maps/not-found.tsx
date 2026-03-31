export default async function NotFoundMaps({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] }>
}) {
  const awaitedParams = await params
  console.warn('⚠️⚠️⚠️ missing /maps/* for route', awaitedParams)
  return null
}
