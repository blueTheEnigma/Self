import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000', // Pure black for better device masking
        }}
      >
        <div
          style={{
            width: '180px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #080912 0%, #040508 100%)',
            borderRadius: '40px',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '12px solid #6c9ef8',
              boxShadow: '0 0 40px rgba(108, 158, 248, 0.8), inset 0 0 20px rgba(108, 158, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(108, 158, 248, 0.2)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
