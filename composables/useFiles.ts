export default function useFiles() {
  const { $config } = useNuxtApp()
  function fileUrl(fileId: string) {
    return `${$config.public.DIRECTUS_URL}/assets/${fileId}`
  }

  return {
    fileUrl,
  }
}
