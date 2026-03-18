import Link from 'next/link';

export default function IELTSHomePage() {
   return (
      <div className="bg-[url('https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/8_ulba1f.png'),linear-gradient(#ededed,#ededed)] bg-cover w-full rounded-lg h-full py-12 min-h-screen font-sans">
         <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-extrabold text-[#212529] text-center mb-2 uppercase tracking-wide">
               YOUR IELTS LEARNING JOURNEY
            </h2>
            <div className="flex justify-center mb-12">
               <img src="https://demo2.pavothemes.com/gopet/wp-content/uploads/2021/11/h3_divider.png" alt="" className="h-2" />
            </div>

            <div className="relative flex justify-center mt-20">
               {/* Roadmap Background Image */}
               <div className="relative">
                  <img
                     src="https://res.cloudinary.com/dalaaegob/image/upload/v1773837908/06ea1b8b-4b0f-48cb-9ae5-b883fb9a1f59.png"
                     alt="IELTS Roadmap"
                     className="w-[500px] h-auto"
                  />

                  {/* STEP 1: Foundation IELTS (Top Right) */}
                  <div className="absolute top-[5%] -right-[70%] w-80 text-center">
                     <div className="flex items-start gap-4">
                        <div>
                           <h3 className="text-3xl font-extrabold text-success mb-1">Foundation IELTS</h3>
                           <p className="text-[#4CAF50] text-sm font-medium mb-4 leading-relaxed">
                              Master the basics of English to<br />prepare effectively for the test
                           </p>
                           <div className="flex flex-col justify-center items-center gap-3 w-56">
                              <Link href="/vocabulary" className="bg-success text-black font-bold py-3.5 px-6 rounded-xl text-center hover:bg-opacity-90 transition-all shadow-sm">
                                 Vocabulary
                              </Link>
                              <Link href="/grammar" className="bg-success text-black font-bold py-3.5 px-6 rounded-xl text-center hover:bg-opacity-90 transition-all shadow-sm">
                                 Grammar
                              </Link>
                              <Link href="/pronunciation" className="bg-success text-black font-bold py-3.5 px-6 rounded-xl text-center hover:bg-opacity-90 transition-all shadow-sm">
                                 Pronunciation
                              </Link>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* STEP 2: Basic IELTS (Middle Left) */}
                  <div className="absolute top-[32%] -left-[55%] w-64 text-right">
                     <div className="flex items-center justify-end gap-4">
                        <h3 className="text-3xl font-extrabold text-info uppercase">Basic IELTS</h3>
                     </div>
                  </div>

                  {/* STEP 3: Advanced IELTS (Lower Right) */}
                  <div className="absolute top-[60%] -right-[55%] w-64 text-left">
                     <div className="flex items-center gap-4">
                        <h3 className="text-3xl font-extrabold text-warning uppercase">Advanced IELTS</h3>
                     </div>
                  </div>

                  {/* STEP 4: Intensive IELTS (Bottom Left) */}
                  <div className="absolute bottom-[2%] -left-[70%] w-80 text-center">
                     <div className="flex items-start justify-end gap-4">
                        <div className="order-1">
                           <h3 className="text-3xl font-extrabold text-danger mb-1">Intensive IELTS</h3>
                           <p className="text-danger text-sm font-medium mb-4 leading-relaxed">
                              Take the test in real time with<br />instant feedback on your results
                           </p>
                           <Link href="/ielts/intensive" className="bg-danger text-white font-bold py-3.5 px-6 rounded-xl inline-flex items-center gap-3 hover:bg-opacity-90 transition-all shadow-lg group">
                              Get Started
                              <div className="bg-black rounded-full p-1 group-hover:translate-x-1 transition-transform">
                                 <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                    <path d="M8 5v14l11-7z" />
                                 </svg>
                              </div>
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
