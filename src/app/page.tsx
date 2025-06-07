import Link from 'next/link'
import Gallery from '@/components/Gallery'
import ServiceCard from '@/components/ServiceCard'
import HeroImage from '@/components/HeroImage'
import OptimizedImage from '@/components/OptimizedImage'
import VideoPlayer from '@/components/VideoPlayer'

const services = [
  {
    name: 'Mobile Sauna Rentals',
    description: 'Experience authentic Finnish sauna at your location. Perfect for events, parties, or personal wellness retreats.',
    href: '/services#rentals',
    imageSrc: '/images/IMG_2089.jpg',
  },
  {
    name: 'Custom Sauna Building',
    description: 'From design to construction, we create custom saunas tailored to your space and preferences.',
    href: '/contact',
    imageSrc: '/images/IMG_2082.jpg',
  },
  {
    name: 'Sauna Consultation',
    description: 'Expert guidance for your sauna project, ensuring authentic design and optimal functionality.',
    href: '/contact',
    imageSrc: '/images/IMG_2087.jpg',
  },
  {
    name: 'Public Events',
    description: 'Join our community events and experience the social and health benefits of traditional sauna culture.',
    href: '/events',
    imageSrc: '/images/IMG_2083.jpg',
  },
]

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        <HeroImage />
        <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Experience Authentic Finnish Sauna in Idaho
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  PNW Sauna brings the authentic Finnish sauna experience to Coeur d'Alene and surrounding areas. 
                  Whether you're looking to rent a mobile sauna, build your own, or join our community events, 
                  we're here to share the transformative power of traditional sauna culture.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="https://wunderbook-production-mobilewebapp.azurewebsites.net/app/Discover?tenancyName=PNW_Sauna_LLC"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Book Now
                  </Link>
                  <Link href="/services" className="text-sm font-semibold leading-6 text-gray-900">
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Our Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for your sauna experience
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            From mobile rentals to custom builds, we provide comprehensive sauna services in the Pacific Northwest.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {services.map((service) => (
            <ServiceCard
              key={service.name}
              name={service.name}
              description={service.description}
              href={service.href}
              imageSrc={service.imageSrc}
            />
          ))}
        </div>
      </div>

      {/* Feature section */}
      <div className="relative isolate overflow-hidden bg-gray-900 py-24 sm:py-32">
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-20">
          <VideoPlayer
            src="/images/PNW_Sauna_Short.mp4"
            className="h-full w-full"
            autoPlay={true}
            muted={true}
            loop={true}
            scale={1}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-400">The PNW Sauna Experience</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Authentic Finnish Sauna Culture
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Experience the traditional Finnish sauna ritual, promoting wellness, relaxation, and community in the heart of Idaho.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/gallery"
                className="text-sm font-semibold leading-6 text-blue-200 hover:text-blue-100"
              >
                View our gallery <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <OptimizedImage
            src="/images/IMG_2086.jpg"
            alt="Sauna interior"
            className="h-full w-full object-cover brightness-50"
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to experience authentic sauna?
            <br />
            Book your session today.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              href="https://wunderbook-production-mobilewebapp.azurewebsites.net/app/Discover?tenancyName=PNW_Sauna_LLC"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Book Now
            </Link>
            <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
              Contact us <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
