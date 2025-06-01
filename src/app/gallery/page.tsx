import Gallery from '@/components/Gallery'

export default function GalleryPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Our Gallery</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Experience the PNW Sauna Difference
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Take a tour through our authentic Finnish sauna experiences, custom builds, and community events. 
            Each image and video captures the essence of what makes PNW Sauna unique - from our mobile units 
            to the serene environments we create for our clients.
          </p>
        </div>
        <Gallery />
      </div>
    </div>
  )
} 