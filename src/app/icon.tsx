import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1C1C1C',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#FBF9F6',
            fontSize: 21,
            fontWeight: 600,
            fontFamily: 'sans-serif',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          z
        </span>
      </div>
    ),
    { ...size }
  )
}
