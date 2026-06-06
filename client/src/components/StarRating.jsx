import { useState } from 'react'

export default function StarRating({ value = 0, onChange, size = 20, readOnly = false }) {
  const [hover, setHover] = useState(0)
  const display = hover || value
  return (
    <div
      className={'stars' + (readOnly ? '' : ' interactive')}
      style={{ fontSize: size }}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={'star' + (n <= display ? ' on' : '')}
          onMouseEnter={() => !readOnly && setHover(n)}
          onClick={() => !readOnly && onChange && onChange(n)}
          role={readOnly ? undefined : 'button'}
        >
          ★
        </span>
      ))}
    </div>
  )
}
