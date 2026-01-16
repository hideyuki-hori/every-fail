interface Props {
  title: string
  description: string
  publishedAt: string
}

export function ArticleHeader(props: Props) {
  return (
    <header class='mb-8'>
      <h1 class='mb-2 text-3xl font-bold'>{props.title}</h1>
      <p class='mb-2 text-gray-600'>{props.description}</p>
      <time class='text-sm text-gray-500'>{props.publishedAt}</time>
    </header>
  )
}
