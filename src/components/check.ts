import { getDocument, type PDFPageProxy, GlobalWorkerOptions } from 'pdfjs-dist'
import Tesseract, { createWorker, PSM } from 'tesseract.js'

// cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public
GlobalWorkerOptions.workerSrc = window.location.origin + '/pdf.worker.min.mjs'
// const osdModelPath = window.location.origin + ''

export const osdCheckerPromise = initOsdChecker()

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
    pageResults.push(result.data)
  }
  progress.processPage(pdf.numPages, pdf.numPages)
  console.log(file.name, pageResults)
  task.destroy()
  return pageResults
}

async function checkPage(page: PDFPageProxy) {
  const viewport = page.getViewport({ scale: 1 })
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

  const osdChecker = await osdCheckerPromise
  const result = await osdChecker.detect(canvas)
  return result
}

async function initOsdChecker() {
  const worker = await createWorker('osd', Tesseract.OEM.TESSERACT_ONLY, {
    legacyCore: true,
    legacyLang: true,
    corePath: '/tesseract',
    langPath: '/tesseract',
    workerPath: '/tesseract/worker.min.js',
    logger: (...args) => console.log('[TESSERACT]', ...args),
  })
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.OSD_ONLY,
  })
  return worker
}

export async function renderPdfPages(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const task = await getDocument(arrayBuffer)
  const pdf = await task.promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
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
