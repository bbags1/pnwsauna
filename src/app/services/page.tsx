import Link from 'next/link'

const services = [
  {
    id: 'rentals',
    name: 'Mobile Sauna Rentals',
    description: 'Bring the authentic Finnish sauna experience to your location.',
    features: [
      'Authentic wood-fired or electric sauna options',
      'Professional delivery and setup',
      'Available for events, parties, or personal wellness retreats',
      'Flexible rental periods',
      'Complete instructions and safety guidelines provided',
      'Optional add-ons like traditional vihta/vasta (birch branches)',
    ],
  },
  {
    id: 'building',
    name: 'Custom Sauna Building',
    description: 'Create your perfect sauna space with our expert building services.',
    features: [
      'Custom design consultation',
      'Traditional and modern sauna styles',
      'Indoor and outdoor installations',
      'High-quality materials and craftsmanship',
      'Expert installation',
      'Warranty and maintenance support',
    ],
  },
  {
    id: 'consultation',
    name: 'Sauna Project Consultation',
    description: 'Get expert guidance for your sauna project from start to finish.',
    features: [
      'Site evaluation and recommendations',
      'Design and layout planning',
      'Material selection guidance',
      'Technical specifications',
      'Ventilation and safety planning',
      'Budget optimization',
    ],
  },
]

export default function Services() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Our Services</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Comprehensive Sauna Solutions
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            From mobile rentals to custom builds, we provide everything you need to experience authentic Finnish sauna culture.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          {services.map((service) => (
            <div key={service.id} id={service.id} className="flex flex-col gap-x-8 gap-y-10 border-t border-gray-900/10 pt-16 lg:flex-row">
              <div className="lg:w-1/2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{service.name}</h2>
                <p className="mt-6 text-base leading-7 text-gray-600">{service.description}</p>
                <div className="mt-10">
                  {service.id === 'rentals' ? (
                    <Link
                      href="https://wunderbook-production-mobilewebapp.azurewebsites.net/app/Discover?tenancyName=PNW_Sauna_LLC"
                      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Book Now
                    </Link>
                  ) : (
                    <Link
                      href="/contact"
                      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Contact Us
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
                Ready to experience authentic sauna?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
                Contact us to discuss your sauna needs or book a session today.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="https://wunderbook-production-mobilewebapp.azurewebsites.net/app/Discover?tenancyName=PNW_Sauna_LLC"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Book Now
                </Link>
                <Link href="/contact" className="text-sm font-semibold leading-6 text-gray-900">
                  Contact us <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 