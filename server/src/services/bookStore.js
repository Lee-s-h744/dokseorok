import { Book } from '../models/index.js'

// 책을 isbn 기준으로 upsert 하고 Book 문서를 반환한다.
// 이미 있으면 그대로 두고($setOnInsert), 없으면 새로 생성한다.
export async function upsertBook(data) {
  if (!data || !data.isbn) throw new Error('isbn이 필요합니다.')
  const book = await Book.findOneAndUpdate(
    { isbn: data.isbn },
    {
      $setOnInsert: {
        isbn: data.isbn,
        title: data.title || '(제목 없음)',
        author: data.author || '',
        publisher: data.publisher || '',
        cover_img: data.cover_img || '',
        contents: data.contents || '',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  return book
}
