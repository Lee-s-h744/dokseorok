import { Link } from 'react-router-dom'
import BookCover from './BookCover'

export default function BookCard({ book }) {
  return (
    <Link to={`/book/${encodeURIComponent(book.isbn)}`} state={{ book }} className="book-card">
      <BookCover book={book} />
      <div className="meta">
        <p className="bk-title">{book.title}</p>
        <span className="bk-author">{book.author}</span>
        {book.publisher && <div><span className="bk-genre">{book.publisher}</span></div>}
      </div>
    </Link>
  )
}
