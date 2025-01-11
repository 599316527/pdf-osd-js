import { getDocument, type PDFPageProxy, GlobalWorkerOptions } from 'pdfjs-dist'
import { detectOrientationScript } from './osd'

// cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public
GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs'

type ProgressCallback = (p: number) => void

class ProgressCalculator {
  constructor(private callback: ProgressCallback) {}

  numPages = 0

  loadDoc(p: number) {
    this.callback(0.3 * p)
  }

  processPage(current: number, total: number) {
    this.callback(0.3 + 0.7 * (current / total))
  }
}

export async function checkPdf(file: File, onProgress: ProgressCallback) {
  const arrayBuffer = await file.arrayBuffer()
  const task = await getDocument(arrayBuffer)
  const progress = new ProgressCalculator(onProgress)
  task.onProgress = (p: number) => progress.loadDoc(p)
  const pdf = await task.promise
  const pageResults = []
  for (let i = 1; i <= pdf.numPages; i++) {
    progress.processPage(i - 1, pdf.numPages)
    const result = await checkPage(await pdf.getPage(i))
    pageResults.push(result)
  }
  progress.processPage(pdf.numPages, pdf.numPages)
  console.log(file.name, pageResults)
  task.destroy()
  return pageResults
}

function getViewport(page: PDFPageProxy) {
  const viewport = page.getViewport({ scale: 2 })
  const  { width, height } = viewport
  let [w, h] = [width, height]
  h = Math.min(height, 2160)
  w = width * h / height
  w = Math.min(w, 3840)
  h = height * w / width
  if (w === width && h === height) {
    return viewport
  }
  return page.getViewport({ scale: w / (width / 2) })
}

async function checkPage(page: PDFPageProxy) {
  const viewport = getViewport(page)
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')!
  const renderContext = {
    canvasContext: context,
    viewport,
  }
  await page.render(renderContext).promise
  // document.body.appendChild(canvas)

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg')
  });
  const result = await detectOrientationScript(blob);
  return result
}

export async function renderPdfPages(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const task = await getDocument(arrayBuffer)
  const pdf = await task.promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = getViewport(page)
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    pages.push(canvas)
    const context = canvas.getContext('2d')!
    const renderContext = {
      canvasContext: context,
      viewport,
    }
    await page.render(renderContext).promise
  }
  task.destroy()
  return pages
}
