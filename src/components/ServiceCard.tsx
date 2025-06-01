'use client';

import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

interface ServiceCardProps {
  name: string;
  description: string;
  href: string;
  imageSrc: string;
}

export default function ServiceCard({ name, description, href, imageSrc }: ServiceCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48">
        <OptimizedImage
          src={imageSrc}
          alt={name}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between p-6 bg-white">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          <p className="mt-3 text-base text-gray-600">{description}</p>
        </div>
        <div className="mt-6">
          <Link
            href={href}
            className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 