'use client';

import OptimizedImage from './OptimizedImage';
import VideoPlayer from './VideoPlayer';

const mediaFiles = [
  { type: 'image', src: '/images/IMG_2089.jpg', alt: 'PNW Sauna Experience' },
  { type: 'image', src: '/images/IMG_2087.jpg', alt: 'Sauna Interior' },
  { type: 'image', src: '/images/IMG_2086.jpg', alt: 'Sauna Setup' },
  { type: 'video', src: '/images/IMG_2092.mp4' },
  { type: 'image', src: '/images/IMG_2083.jpg', alt: 'Sauna Experience' },
  { type: 'image', src: '/images/IMG_2082.jpg', alt: 'Sauna Exterior' },
  { type: 'video', src: '/images/IMG_2091.mp4' },
  { type: 'image', src: '/images/IMG_2093.jpg', alt: 'Sauna Detail' },
  { type: 'image', src: '/images/IMG_2081.jpg', alt: 'Sauna Environment' },
  { type: 'video', src: '/images/IMG_2090.mp4' },
  { type: 'video', src: '/images/IMG_2088.mp4' }
];

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaFiles.map((media, index) => (
          <div 
            key={media.src}
            className="aspect-square relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {media.type === 'image' ? (
              <OptimizedImage
                src={media.src}
                alt={media.alt || 'PNW Sauna'}
                priority={index < 4}
                className="w-full h-full"
              />
            ) : (
              <VideoPlayer
                src={media.src}
                className="w-full h-full"
                muted
                loop
                scale={1.2}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 