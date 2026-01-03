export default async function NotFoundToolbar({
  params,
}: {
  params: Promise<{ [key: string]: string | string[] }>
}) {
  const awaitedParams = await params
  console.warn('⚠️⚠️⚠️ missing /maps/@toolbar for route', awaitedParams)
  return null
}
