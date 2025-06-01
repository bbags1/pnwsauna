'use client';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  scale?: number;
}

export default function VideoPlayer({
  src,
  className = '',
  autoPlay = false,
  muted = true,
  loop = false,
  scale = 1,
}: VideoPlayerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        className={`w-full h-full object-cover scale-[${scale}]`}
        style={{ transform: `scale(${scale})` }}
        controls
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
} 