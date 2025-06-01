'use client';

import VideoPlayer from './VideoPlayer';
import OptimizedImage from './OptimizedImage';

export default function HeroImage() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/90 via-blue-100/70 to-transparent z-10" />
      <div className="absolute inset-0">
        <VideoPlayer
          src="/images/PNW_Sauna.mp4"
          className="w-full h-full"
          autoPlay={true}
          muted={true}
          loop={true}
          scale={1
          }
        />
      </div>
    </div>
  );
} 