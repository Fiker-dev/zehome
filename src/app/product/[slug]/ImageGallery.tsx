'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative overflow-hidden bg-cream" style={{ aspectRatio: '1/1' }}>
        <Image
          src={images[selected]}
          alt={alt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative flex-shrink-0 overflow-hidden border-2 transition-colors focus:outline-none ${
                i === selected
                  ? 'border-terracotta'
                  : 'border-border hover:border-warm-gray'
              }`}
              style={{ width: 72, height: 72 }}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${alt} — view ${i + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
