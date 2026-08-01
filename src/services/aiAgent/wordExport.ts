import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'

// 클라이언트에서 실제 .docx 파일을 생성한다(서버·API 키 불필요).
// 최종 결과 패키지의 텍스트 카드에서만 사용하며, PPT/PDF는 실제 파일 생성을 지원하지 않는다
// (사용자 확인에 따라 Word만 실제 생성 범위로 구현).

function isHeadingLine(line: string): boolean {
  return line.startsWith('■') || line.startsWith('[') || /^\d+주차/.test(line) || /^\d+\./.test(line)
}

function contentToParagraphs(content: string): Paragraph[] {
  const lines = content.split('\n')
  return lines.map((line) => {
    if (line.trim().length === 0) {
      return new Paragraph({ text: '' })
    }
    if (isHeadingLine(line)) {
      return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: line, bold: true })],
      })
    }
    return new Paragraph({ children: [new TextRun({ text: line })] })
  })
}

export async function buildWordBlob(title: string, content: string): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: title, bold: true })] }),
          new Paragraph({ text: '' }),
          ...contentToParagraphs(content),
        ],
      },
    ],
  })
  return Packer.toBlob(doc)
}

export async function downloadWordDoc(title: string, content: string): Promise<void> {
  const blob = await buildWordBlob(title, content)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
