"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.includes("/take/") || pathname.includes("/practice/")) {
    return null;
  }

  return (
    <footer className="relative w-full mt-24 text-white overflow-hidden font-sans">
      {/* Background with explicit separator curve from provided URL */}
      <div
        className="absolute w-[100vw] left-1/2 -ml-[50vw] inset-y-0 z-0 bg-cover bg-top bg-no-repeat opacity-95"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dalaaegob/image/upload/v1773736844/79a7e3c8-67d7-49ff-b819-6a8fcad3dc38.png')" }}
      >
        <div className="absolute inset-0 bg-[#352d27]/40 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 px-6 lg:px-16 pt-36 pb-12 max-w-[1400px] mx-auto">

        {/* Top Section: Logo & Contact Info */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end mb-10 pt-8 lg:pt-16 gap-8 lg:gap-0">
          <div className="flex items-center group cursor-pointer transition-transform hover:scale-[1.02]">
            {/* Provided Logo Image */}
            <div className="relative h-16">
              <img
                src="https://res.cloudinary.com/dalaaegob/image/upload/v1772714388/Logo_rvszzb.png"
                alt="Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(250,204,21,0.2)]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-14 bg-black/20 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-white/5 shadow-lg">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-400 group-hover:text-gray-900 transition-colors duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75" />
                </svg>
              </div>
              <div>
                <div className="text-white/70 font-medium text-xs tracking-wider uppercase mb-0.5 group-hover:text-white transition-colors">Email Us</div>
                <div className="text-gray-200 font-medium tracking-wide">lexonielts.com</div>
              </div>
            </div>

            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-400 group-hover:text-gray-900 transition-colors duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-3.903-7.22-6.596l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div className="text-yellow-400 font-extrabold text-3xl tracking-wide font-mono drop-shadow-md group-hover:text-yellow-300 transition-colors">
                (+84) 123456789
              </div>
            </div>
          </div>
        </div>

        {/* Provided Line Image Separator */}
        <div className="relative my-14 opacity-90 drop-shadow-sm flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dalaaegob/image/upload/v1773736688/0c6015c9-7d83-4347-8551-0f6e41968781.png"
            alt="Separator"
            className="w-full max-w-[1400px] h-auto object-contain"
          />
        </div>

        {/* Main Grid Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-16 gap-x-8 mb-28">

          {/* Column 1: CTA */}
          <div className="lg:col-span-5 pr-4 xl:pr-12">
            <h3 className="text-4xl font-extrabold mb-6 leading-tight text-white tracking-tight drop-shadow-sm">
              Start Your IELTS<br />Journey Today
            </h3>
            <p className="text-[#c5beb7] text-lg leading-relaxed mb-10 font-light">
              Build vocabulary, improve speaking, and track your
              progress with advanced AI-powered learning tools built for success.
            </p>
            <Link href="/ielts" className="group inline-flex items-center justify-between w-48 bg-white text-gray-900 font-bold py-4 px-7 rounded-full hover:bg-gray-50 transition-all duration-300 shadow-[0_4px_14px_0_rgba(255,198,0,0.2)] hover:shadow-[0_6px_20px_rgba(255,198,0,0.4)] hover:-translate-y-1">
              <span className="tracking-widest text-sm uppercase">SIGN UP</span>
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center -mr-2 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white ml-0.5 group-hover:translate-x-0.5 transition-transform duration-300">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Column 2: Platform Links */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold mb-8 text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              PLATFORM
            </h4>
            <ul className="space-y-5">
              {[
                { label: 'Vocab Lab', href: '/vocab-lab' },
                { label: 'Shadowing & Dictation', href: '/shadowing-dictation' },
                { label: 'IELTS', href: '/ielts' }
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[#b5aeA6] text-lg font-medium hover:text-yellow-400 transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources Links */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold mb-8 text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              RESOURCE
            </h4>
            <ul className="space-y-5">
              {['FAQ'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[#b5aeA6] text-lg font-medium hover:text-yellow-400 transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="lg:col-span-2">
            <h4 className="text-base font-bold mb-8 text-white uppercase tracking-widest flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              CONTACT
            </h4>
            <ul className="space-y-5">
              {['Contact Us', 'About'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-[#b5aeA6] text-lg font-medium hover:text-yellow-400 transition-colors flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-300"></span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{item}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 pt-8 border-t border-white/10 text-[#a8a19b]">
          <p className="text-base text-center md:text-left mb-6 md:mb-0">
            &copy; {new Date().getFullYear()} <span className="text-white font-bold tracking-wide">Lexon</span>. All rights reserved.
          </p>

          <div className="flex gap-4">
            {/* Facebook */}
            <a href="#" className="group w-12 h-12 border border-white/20 hover:border-yellow-400 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300">
                <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
              </svg>
            </a>
            {/* Twitter */}
            <a href="#" className="group w-12 h-12 border border-white/20 hover:border-yellow-400 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform duration-300">
                <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="group w-12 h-12 border border-white/20 hover:border-yellow-400 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </a>
            {/* Pinterest */}
            <a href="#" className="group w-12 h-12 border border-white/20 hover:border-yellow-400 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:text-yellow-400 transition-all duration-300 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:-translate-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300">
                <path d="M248 8C111.03 8 0 119.03 0 256c0 105.12 65.48 194.27 159.22 235.65-2.03-19.65-3.86-49.81.8-71.39 4.16-19.34 27-114.47 27-114.47s-6.9-13.84-6.9-34.29c0-32.08 18.6-56.02 41.76-56.02 19.64 0 29.13 14.76 29.13 32.48 0 19.74-12.55 49.33-19.06 76.71-5.46 22.9 11.51 41.56 34.1 41.56 40.92 0 72.37-43.19 72.37-105.57 0-55.27-39.75-93.92-96.53-93.92-65.03 0-103.26 48.83-103.26 99.4 0 19.74 7.61 40.91 17.11 52.37 1.88 2.26 2.14 4.3 1.54 6.78-1.92 7.78-6.17 25.17-6.99 28.59-.97 4.09-3.23 4.96-7.44 2.99-27.76-13-45.16-53.76-45.16-86.44 0-70.4 51.13-134.96 147.28-134.96 77.29 0 137.47 55.05 137.47 128.46 0 76.84-48.42 138.62-115.65 138.62-22.61 0-43.86-11.75-51.11-25.64l-13.9 52.88c-5.02 19.16-18.66 43.14-27.77 57.73 20.35 6.27 41.97 9.68 64.21 9.68 136.97 0 248-111.03 248-248S384.97 8 248 8z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
