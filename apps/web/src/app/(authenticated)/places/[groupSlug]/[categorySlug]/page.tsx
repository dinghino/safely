type Props = {
  params: Promise<{ groupSlug: string; categorySlug: string }>
}

export default function PoiCategoryPage(_props: Props) {
  return (
    <>
      <p>poi category page</p>
      <p>
        dashboard to show places in the given group and category, user added pois for this category
        etc
      </p>
    </>
  )
}
