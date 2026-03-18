import Link from 'next/link';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative font-sans overflow-x-hidden" style={{ backgroundImage: "url('https://res.cloudinary.com/dalaaegob/image/upload/v1773729593/fbaa82c7-ae59-41c2-ad61-99ce0bd54014.png')" }}>
      <div className="relative z-10 container mx-auto pt-20 pb-20 flex flex-col lg:flex-row items-center justify-between min-h-[90vh]">

        {/* Left Side: Illustration / Interactive Cards */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-start mb-16 lg:mb-0 relative">

          <div className="relative w-full aspect-square">
            {/* The image assets from the user's screenshot */}
            <div className="absolute top-12 w-2/3 right-20 transform rotate-1 hover:rotate-3 transition-transform duration-500 hover:scale-105 rounded-xl z-10">
              <img
                src="https://res.cloudinary.com/dalaaegob/image/upload/v1773729695/3e3d5ef3-5951-4cb2-8cf8-3266a1304cdf.png"
                alt="Student learning with headset"
              // className="w-full h-auto"
              />
            </div>

            <div className="absolute w-2/3 top-1/2 right-8 transform -rotate-1 hover:-rotate-3 transition-transform duration-500 hover:scale-105 rounded-xl z-20">
              <img
                src="https://res.cloudinary.com/dalaaegob/image/upload/v1773729718/25516531-c70c-44ad-846b-790cbc14e7ae.png"
                alt="Students studying together"
              // className="w-full h-auto"
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-0 -right-10 w-32 h-32 bg-info/20 rounded-full blur-2xl animate-pulse delay-700"></div>
          </div>

        </div>

        {/* Right Side: Hero Text and CTA */}
        <div className="w-full lg:pt-24 lg:w-2/3 flex flex-col items-center lg:items-start text-center lg:text-left text-white px-4 lg:pl-12">

          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight drop-shadow-md">
            Master English<br />
            Ace IELTS<br />
            Smarter with <span className="text-primary inline-flex items-center gap-2">AI <SparklesIcon className="w-10 h-10 lg:w-12 lg:h-12 text-primary animate-bounce" /></span>
          </h1>

          <p className="text-lg lg:text-xl xl:text-2xl font-light mb-10 max-w-2xl drop-shadow-sm opacity-90 leading-relaxed">
            An intelligent learning platform that helps you build vocabulary,
            improve speaking, and prepare for IELTS with personalized guidance
          </p>

          <Link href="/ielts" passHref>
            <button className="group relative bg-primary hover:bg-yellow-400 text-gray-900 font-bold py-4 px-10 rounded-full text-sm shadow-[0_4px_14px_0_rgba(255,198,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,198,0,0.23)] hover:-translate-y-1 transition-all duration-300 flex items-center overflow-hidden">
              <span className="relative z-10 flex items-center gap-2 tracking-wide uppercase">
                START LEARNING
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:translate-x-1 transition-transform">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="absolute inset-0 h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-8 bg-white/20"></div>
              </div>
            </button>
          </Link>

        </div>

      </div>

      <Footer />
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  )
}
