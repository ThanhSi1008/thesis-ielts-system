import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header removed: using global header in layout.tsx */}

      {/* Main Content */}
      <div className="container mx-auto max-w-screen-xl px-4 py-12 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center">Lộ trình học TOEIC</h1>
         
        <div className="relative w-full max-w-2xl py-12">
           {/* The Road Path (SVG) */}
           <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 600" preserveAspectRatio="none">
              {/* Path: Center(200, 50) -> Right Curve -> Left Curve -> Right Curve -> Left Curve -> Arrow */}
              {/* Simplified S-curves */}
              <path 
                d="M200,20 
                   C300,20 350,100 200,150 
                   C50,200 100,280 200,300
                   C300,320 350,400 200,450
                   C50,500 100,580 200,600"
                fill="none" 
                stroke="black" 
                strokeWidth="20" 
                strokeLinecap="round"
              />
              <path 
                d="M200,20 
                   C300,20 350,100 200,150 
                   C50,200 100,280 200,300
                   C300,320 350,400 200,450
                   C50,500 100,580 200,600"
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeDasharray="10,10"
                className="opacity-50"
              />
              
              {/* Arrow Head */}
              <path d="M180,580 L200,610 L220,580" fill="black" />
           </svg>

           {/* Markers */}
           <div className="relative z-10 flex flex-col gap-24 py-8">
              
              {/* Level 1: Nền tảng (Right) */}
              <div className="flex justify-end pr-0 md:pr-16 relative">
                 <Link href="/vocabulary" className="group">
                    <div className="absolute right-[50%] md:right-[50%] translate-x-[50%] top-2 w-10 h-10 bg-[#FFC600] rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg z-20">1</div>
                    <div className="ml-auto bg-white p-4 rounded-xl shadow-lg border-l-4 border-[#FFC600] group-hover:scale-105 transition-transform w-48 relative left-12 md:left-24">
                       <h3 className="font-bold text-[#FFC600]">Nền tảng</h3>
                       <p className="text-xs text-gray-500">Vocabulary & Pronunciation</p>
                    </div>
                 </Link>
              </div>

              {/* Level 2: TOEIC Cơ bản (Left) */}
              <div className="flex justify-start pl-0 md:pl-16 relative">
                 <Link href="/grammar" className="group">
                    <div className="absolute left-[50%] md:left-[50%] translate-x-[-50%] top-2 w-10 h-10 bg-[#5B9557] rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg z-20">2</div>
                    <div className="mr-auto bg-white p-4 rounded-xl shadow-lg border-r-4 border-[#5B9557] group-hover:scale-105 transition-transform w-48 relative right-12 md:right-24 text-right">
                       <h3 className="font-bold text-[#5B9557]">TOEIC Cơ bản</h3>
                       <p className="text-xs text-gray-500">Basic Grammar & Listening</p>
                    </div>
                 </Link>
              </div>

              {/* Level 3: TOEIC Nâng cao (Right) */}
              <div className="flex justify-end pr-0 md:pr-16 relative">
                 <Link href="/lessons" className="group">
                    <div className="absolute right-[50%] md:right-[50%] translate-x-[50%] top-2 w-10 h-10 bg-[#E74C3C] rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg z-20">3</div>
                    <div className="ml-auto bg-white p-4 rounded-xl shadow-lg border-l-4 border-[#E74C3C] group-hover:scale-105 transition-transform w-48 relative left-12 md:left-24">
                       <h3 className="font-bold text-[#E74C3C]">TOEIC Nâng cao</h3>
                       <p className="text-xs text-gray-500">Advanced Practice</p>
                    </div>
                 </Link>
              </div>

              {/* Level 4: TOEIC Chuyên sâu (Left) */}
              <div className="flex justify-start pl-0 md:pl-16 relative">
                 <Link href="/" className="group">
                    <div className="absolute left-[50%] md:left-[50%] translate-x-[-50%] top-2 w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold border-4 border-white shadow-lg z-20">4</div>
                    <div className="mr-auto bg-white p-4 rounded-xl shadow-lg border-r-4 border-[#3B82F6] group-hover:scale-105 transition-transform w-48 relative right-12 md:right-24 text-right">
                       <h3 className="font-bold text-[#3B82F6]">TOEIC Chuyên sâu</h3>
                       <p className="text-xs text-gray-500">Mastery & Simulation</p>
                    </div>
                 </Link>
              </div>
              
           </div>
        </div>

      </div>
    </div>
  );
}
