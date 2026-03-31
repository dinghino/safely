export default async function NotFoundLayers({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] }>
}) {
  const awaitedParams = await params
  console.warn('⚠️⚠️⚠️ missing /maps/@layers for route', awaitedParams)
  return null
}
