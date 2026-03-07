import Link from 'next/link';

export default function HomePage() {
   return (
      <div className="bg-[url('https://res.cloudinary.com/dalaaegob/image/upload/v1769788980/8_ulba1f.png'),linear-gradient(#ededed,#ededed)] bg-cover w-full rounded-lg h-full py-12 min-h-screen">
         <h2 className="text-3xl font-bold text-center py-4">Your TOEIC Learning Journey</h2>
         <div className="flex justify-center mb-4">
            <img src="https://demo2.pavothemes.com/gopet/wp-content/uploads/2021/11/h3_divider.png" alt="" />
         </div>
         <div className="flex items-center justify-center relative">
            <span className="relative">
               {/* Foundation - Step 1 (Right side) */}
               <div className="absolute top-4 -right-full p-8 rounded-lg flex flex-col gap-3">
                  <h3 className="text-xl font-semibold text-center">Foundation</h3>
                  <Link href="/vocabulary" className="bg-primary py-4 px-8 rounded-2xl text-white text-center hover:bg-opacity-90 transition-colors">Vocabulary</Link>
                  <Link href="/grammar" className="bg-primary py-4 px-8 rounded-2xl text-white text-center hover:bg-opacity-90 transition-colors">Grammar</Link>
                  <Link href="/pronunciation" className="bg-primary py-4 px-8 rounded-2xl text-white text-center hover:bg-opacity-90 transition-colors">Pronunciation</Link>
               </div>
               {/* Practice - Step 2 (Left side) */}
               <div className="absolute top-[15%] -left-full p-8 rounded-lg flex flex-col gap-3">
                  <h3 className="text-xl font-semibold text-center">Practice</h3>
                  <Link href="/shadowing-dictation" className="bg-success py-4 px-8 rounded-2xl text-white text-center hover:bg-opacity-90 transition-colors">Dictation & Shadowing</Link>
               </div>
               <img src="https://res.cloudinary.com/dalaaegob/image/upload/v1769786381/roadmap_zxq0ki.png" alt="" className="w-72" />
            </span>
         </div>
      </div>
   );
}
