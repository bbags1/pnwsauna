# PNW Sauna Website

This is the official website for PNW Sauna, offering sauna sessions, community memberships, and custom sauna building at our Atlas Waterfront Park location in Coeur d'Alene, Idaho.

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Next SEO
- Headless UI
- Framer Motion

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pnwsauna.git
cd pnwsauna
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                    # App router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── events/            # Events page
│   ├── services/          # Services page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── Navigation.tsx     # Navigation component
│   └── Footer.tsx         # Footer component
└── styles/               # Global styles
    └── globals.css       # Global CSS
```

## Development

- The site uses Next.js 14 with the App Router
- Styling is done with Tailwind CSS
- Components are built with TypeScript for type safety
- SEO is handled through Next SEO and metadata configuration

## Deployment

The site is configured to be deployed on Cloudflare Pages. Follow these steps to deploy:

1. Create a new project on Cloudflare Pages
2. Connect your GitHub repository
3. Configure the build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Environment variables: None required

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Contact

PNW Sauna - [pnwsaunacda@gmail.com](mailto:pnwsaunacda@gmail.com) | [(360) 977-3487](tel:+13609773487)

Project Link: [https://github.com/yourusername/pnwsauna](https://github.com/yourusername/pnwsauna)
