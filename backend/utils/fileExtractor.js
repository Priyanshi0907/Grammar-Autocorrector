import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')
const mammoth = require('mammoth')

/**
 * Extract plain text from uploaded file buffer based on mimetype and original filename.
 * Supports PDF, DOCX, DOC, TXT, MD, RTF, JSON, CSV, etc.
 */
export async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    throw new Error('No file provided')
  }

  const filename = file.originalname || 'document'
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimetype = file.mimetype || ''

  try {
    // PDF files
    if (ext === 'pdf' || mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: file.buffer })
      const parsed = await parser.getText()
      const text = (typeof parsed === 'string' ? parsed : parsed?.text || '').trim()
      if (!text) {
        throw new Error('The PDF appears to be empty or contains scanned images without selectable text.')
      }
      return text
    }

    // DOCX / DOC files
    if (
      ext === 'docx' ||
      ext === 'doc' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer })
      const text = (result?.value || '').trim()
      if (!text) {
        throw new Error('The Word document appears to be empty.')
      }
      return text
    }

    // Plain text / Markdown / RTF / Code / CSV files
    const text = file.buffer.toString('utf-8').trim()
    if (!text) {
      throw new Error('The text file is empty.')
    }
    return text
  } catch (err) {
    if (err.message && (err.message.includes('empty') || err.message.includes('scanned'))) {
      throw err
    }
    console.error('File extraction error:', err)
    throw new Error(`Failed to extract text from "${filename}". Please make sure the file is not corrupted or password protected.`)
  }
}
