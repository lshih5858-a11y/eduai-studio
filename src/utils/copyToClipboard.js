export async function copyToClipboard(text, onSuccess) {
  try {
    await navigator.clipboard.writeText(text)
    if (onSuccess) onSuccess()
  } catch {
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    if (onSuccess) onSuccess()
  }
}
