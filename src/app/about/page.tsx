import Link from 'next/link'
import Image from 'next/image'

const stats = [
  { label: 'Years of experience', value: '5+' },
  { label: 'Saunas built', value: '50+' },
  { label: 'Happy customers', value: '1000+' },
  { label: 'Public events hosted', value: '200+' },
]

const values = [
  {
    name: 'Authenticity',
    description: 'We stay true to traditional Finnish sauna practices while incorporating modern comfort and safety standards.',
  },
  {
    name: 'Community',
    description: 'We believe in the power of sauna to bring people together and create meaningful connections.',
  },
  {
    name: 'Wellness',
    description: 'Our mission is to promote holistic wellness through the time-tested benefits of authentic sauna practice.',
  },
  {
    name: 'Quality',
    description: 'From our mobile units to custom builds, we use only the highest quality materials and craftsmanship.',
  },
]

export default function About() {
  return (
    <div className="bg-white">
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Our Story
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The journey of PNW Sauna began during a transformative trip to Norway, where we discovered 
              the profound impact of authentic sauna culture. Amidst the fjords and northern lights, 
              we experienced how saunas weren't just about heat – they were about community, wellness, 
              and connection with both nature and each other.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Returning to the Pacific Northwest, we found the perfect location at Atlas Waterfront Park 
              in Coeur d'Alene. With direct access to the pristine Spokane River and surrounded by Idaho's 
              natural beauty, we established our permanent sauna community where traditional Finnish 
              hot-cold therapy comes alive.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our daily community sessions from 7-10 PM create a welcoming space for recovery, wellness, 
              and connection. Whether you're seeking post-workout recovery, stress relief, or simply the 
              joy of authentic sauna culture with river cooling, our Atlas Waterfront location offers 
              the complete Finnish experience in Idaho's most beautiful setting.
            </p>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="relative w-[37rem] overflow-hidden rounded-xl bg-white shadow-lg">
                <Image
                  src="/images/IMG_2082.jpg"
                  alt="PNW Sauna Experience"
                  width={1000}
                  height={800}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Values</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We believe in the power of authentic sauna experiences to transform lives and build community.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <div>
            <dt className="font-semibold text-gray-900">Authenticity</dt>
            <dd className="mt-1 text-gray-600">
              We stay true to traditional Finnish sauna practices while adapting to modern needs.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Community</dt>
            <dd className="mt-1 text-gray-600">
              Building connections and fostering a sense of belonging through shared sauna experiences.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Wellness</dt>
            <dd className="mt-1 text-gray-600">
              Promoting holistic health benefits through proper sauna practices and education.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Sustainability</dt>
            <dd className="mt-1 text-gray-600">
              Using eco-friendly materials and practices in our operations and builds.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Education</dt>
            <dd className="mt-1 text-gray-600">
              Sharing knowledge about proper sauna practices and their benefits.
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-900">Innovation</dt>
            <dd className="mt-1 text-gray-600">
              Blending traditional methods with modern technology for the best experience.
            </dd>
          </div>
        </dl>
      </div>

      {/* CTA section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-40 sm:py-40 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/90" />
          <Image
            src="/images/IMG_2087.jpg"
            alt="Sauna interior"
            fill
            className="object-cover brightness-50"
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Experience Sauna & River Recovery
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Join our vibrant community at Atlas Waterfront Park. Daily sessions 7-10 PM with direct Spokane River access.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="https://flutterwbdev.azurewebsites.net/#/tenantDetails?tenantName=PNW_Sauna_LLC"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Book Session - $15
            </Link>
            <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
              Visit our location <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 