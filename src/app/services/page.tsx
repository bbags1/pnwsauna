import Link from 'next/link'

const services = [
  {
    id: 'community',
    name: 'Community Sauna Sessions',
    description: 'Join our daily community sessions at Atlas Waterfront Park with direct Spokane River access.',
    features: [
      'Daily sessions 7-10 PM (expanding hours coming soon)',
      'Authentic wood-fired Finnish sauna experience',
      'Direct access to pristine Spokane River for cooling',
      'Traditional hot-cold therapy for recovery and wellness',
      'Community atmosphere with experienced sauna enthusiasts',
    ],
    price: '$15 per session'
  },
  {
    id: 'membership',
    name: 'Monthly Unlimited Pass',
    description: 'Unlimited access to all community sessions with our convenient monthly membership.',
    features: [
      'Unlimited sessions throughout the month',
      'Best value for regular sauna enthusiasts',
      'Flexible access to all daily sessions',
      'Perfect for building a consistent wellness routine',
      'Bring a friend for free for their first session',
    ],
    price: '$60 per month'
  },
  {
    id: 'recovery',
    name: 'River Recovery Experience',
    description: 'The complete Finnish sauna experience with natural river cooling at our waterfront location.',
    features: [
      'Traditional hot-cold therapy protocol',
      'Pristine Spokane River access year-round',
      'Beautiful waterfront setting for relaxation',
      'Authentic Finnish cultural experience',
    ],
  }
]

export default function Services() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Our Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Atlas Waterfront Park Sauna Experience
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Experience authentic Finnish sauna culture at our permanent location with direct Spokane River access for traditional hot-cold therapy.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          {services.map((service) => (
            <div key={service.id} id={service.id} className="flex flex-col gap-x-8 gap-y-10 border-t border-gray-900/10 pt-16 lg:flex-row">
              <div className="lg:w-1/2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{service.name}</h2>
                {service.price && (
                  <p className="mt-2 text-xl font-semibold text-blue-600">{service.price}</p>
                )}
                <p className="mt-6 text-base leading-7 text-gray-600">{service.description}</p>
                <div className="mt-10">
                  {(service.id === 'community' || service.id === 'membership') ? (
                    <Link
                      href="/book"
                      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Book Now
                    </Link>
                  ) : (
                    <Link
                      href="/contact"
                      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Learn More
                    </Link>
                  )}
                </div>
              </div>
              <div className="lg:w-1/2">
                <ul role="list" className="mt-8 space-y-4 text-gray-600">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-32 rounded-2xl bg-gray-50 py-10 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ready to join our sauna community?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
                Experience authentic Finnish sauna culture with river recovery at Atlas Waterfront Park. 
                Open daily 7-10 PM in beautiful Coeur d'Alene.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/book"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Book Session - $15
                </Link>
                <Link href="/contact" className="text-sm font-semibold leading-6 text-gray-900">
                  Visit our location <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 