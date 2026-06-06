import { api } from './client'

// ---- books ----
export async function searchBooks(query, target) {
  const { data } = await api.get('/books/search', { params: { query, target } })
  return data.books
}
export async function getBookByIsbn(isbn) {
  const { data } = await api.get(`/books/isbn/${encodeURIComponent(isbn)}`)
  return data.book
}
export async function getRecommendations() {
  const { data } = await api.get('/books/recommend')
  return data.books
}

// ---- records ----
export async function getRecords() {
  const { data } = await api.get('/records')
  return data.records
}
export async function getRecordForBook(isbn) {
  const { data } = await api.get(`/records/${encodeURIComponent(isbn)}`)
  return data.record
}
export async function saveRecord(book, status, progress) {
  const { data } = await api.post('/records', { book, status, progress })
  return data.record
}
export async function updateRecord(isbn, patch) {
  const { data } = await api.patch(`/records/${encodeURIComponent(isbn)}`, patch)
  return data.record
}
export async function deleteRecord(isbn) {
  await api.delete(`/records/${encodeURIComponent(isbn)}`)
}

// ---- reviews ----
export async function getReviews() {
  const { data } = await api.get('/reviews')
  return data.reviews
}
export async function getReviewForBook(isbn) {
  const { data } = await api.get(`/reviews/${encodeURIComponent(isbn)}`)
  return data.review
}
export async function saveReview(book, rating, content) {
  const { data } = await api.post('/reviews', { book, rating, content })
  return data.review
}
export async function deleteReview(isbn) {
  await api.delete(`/reviews/${encodeURIComponent(isbn)}`)
}
