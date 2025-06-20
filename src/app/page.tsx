import Link from 'next/link'
import Gallery from '@/components/Gallery'
import ServiceCard from '@/components/ServiceCard'
import HeroImage from '@/components/HeroImage'
import OptimizedImage from '@/components/OptimizedImage'
import VideoPlayer from '@/components/VideoPlayer'

const services = [
  {
    name: 'Community Sauna Sessions',
    description: 'Join our daily community sessions at our permanent location overlooking the Spokane River. Perfect for recovery and relaxation.',
    href: '/services#community',
    imageSrc: '/images/IMG_2089.jpg',
  },
  {
    name: 'Monthly Unlimited Pass',
    description: 'Unlimited access to our community sessions with a convenient monthly membership. Best value for regular sauna enthusiasts.',
    href: '/services#membership',
    imageSrc: '/images/IMG_2082.jpg',
  },
  {
    name: 'River Recovery Experience',
    description: 'Cool off naturally in the pristine Spokane River after your sauna session for the ultimate Finnish recovery experience.',
    href: '/services#recovery',
    imageSrc: '/images/IMG_2087.jpg',
  },
  {
    name: 'Custom Sauna Building',
    description: 'From design to construction, we create custom saunas tailored to your space and preferences.',
    href: '/contact',
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
                  Experience Authentic Finnish Sauna at Atlas Waterfront Park
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Join our vibrant sauna community at our permanent location in Coeur d'Alene. Open daily 7-10 PM 
                  with direct access to the Spokane River for traditional hot-cold therapy. Experience the 
                  transformative power of authentic Finnish sauna culture in Idaho's most beautiful setting.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/book"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Book Session - $15
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
            Community Sauna Experience
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Located at Atlas Waterfront Park with direct Spokane River access for the complete Finnish sauna experience.
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
            <h2 className="text-base font-semibold leading-7 text-blue-400">Atlas Waterfront Park</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Sauna & River Recovery
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Experience authentic Finnish hot-cold therapy with direct access to the pristine Spokane River. 
              Open daily 7-10 PM for community sessions in Idaho's most beautiful waterfront setting.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-blue-200 hover:text-blue-100"
              >
                Our location <span aria-hidden="true">→</span>
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
            Ready for authentic sauna & river recovery?
            <br />
            Join us daily 7-10 PM at Atlas Waterfront Park.
          </h2>
          <div className="mt-10 flex items-center gap-x-6 lg:mt-0 lg:flex-shrink-0">
            <Link
              href="/book"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Book Session - $15
            </Link>
            <Link href="/services" className="text-sm font-semibold leading-6 text-white">
              Monthly pass - $100 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
