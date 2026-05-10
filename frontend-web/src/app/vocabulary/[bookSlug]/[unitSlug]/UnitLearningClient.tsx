"use client";

import React, { useState } from "react";
import Link from "next/link";

interface UnitLearningClientProps {
  bookName: string;
  unitId: number;
  unitTitle: string;
  bookSlug: string;
}

// Hardcoded data for Unit 1 content matching screenshots
const unit1Data = {
  exercise: [
    {
      id: 1,
      question: "bad or hurting others",
      options: ["a. afraid", "b. clever", "c. cruel", "d. hunt"],
      answer: "c" // cruel
    },
    {
      id: 2,
      question: "at last or at the end",
      options: ["a. angry", "b. clever", "c. finally", "d. reply"],
      answer: "c" // finally
    },
    {
      id: 3,
      question: "to try to fight or hurt",
      options: ["a. attack", "b. middle", "c. pleased", "d. trick"],
      answer: "a" // attack
    },
    {
      id: 4,
      question: "to not let others see",
      options: ["a. agree", "b. hide", "c. safe", "d. well"],
      answer: "b" // hide
    },
    {
      id: 5,
      question: "the lowest part",
      options: ["a. bottom", "b. lot", "c. moment", "d. promise"], // extrapolated options
      answer: "a" // bottom
    }
  ],
  reading: {
    title: "The Lion and the Rabbit",
    text: [
      "A <strong>cruel</strong> lion lived in the forest. Every day, he killed and ate a <strong>lot</strong> of animals. The other animals were afraid the lion would kill them all.",
      "The animals told the lion, \"Let's make a deal. If you <strong>promise</strong> to eat only one animal each day, then one of us will come to you every day. Then you don't have to <strong>hunt</strong> and kill us.\"",
      "The plan sounded <strong>well</strong> thought-out to the lion, so he <strong>agreed</strong>, but he also said, \"If you don't come every day, I promise to kill all of you the next day!\" Each day after that, one animal went to the lion so that the lion could eat it. Then, all the other animals were <strong>safe</strong>. Finally, it was the rabbit's turn to go to the lion. The rabbit went very slowly that day, so the lion was <strong>angry</strong> when the rabbit finally <strong>arrived</strong>.",
      "The lion angrily asked the rabbit, \"Why are you late?\"",
      "\"I was <strong>hiding</strong> from another lion in the forest. That lion said he was the king, so I was afraid.\"",
      "The lion told the rabbit, \"I am the only king here! Take me to that other lion, and I will kill him.\"",
      "The rabbit <strong>replied</strong>, \"I will be happy to show you where he lives.\"",
      "The rabbit led the lion to an old well in the middle of the forest. The well was very deep with water at the <strong>bottom</strong>. The rabbit told the lion, \"Look in there. The lion lives at the bottom.\"",
      "When the lion looked in the well, he could see his own face in the water. He thought that was the other lion. Without waiting another <strong>moment</strong>, the lion jumped into the well to <strong>attack</strong> the other lion. He never came out.",
      "All of the other animal in the forest were very <strong>pleased</strong> with the rabbit's <strong>clever</strong> trick."
    ]
  },
  questions: [
    {
      id: 1,
      question: "What is this story about?",
      options: [
        "a. How a clever rabbit tricked a cruel lion.",
        "b. How rabbits learned to hide from lions.",
        "c. How a rabbit pleased an angry lion.",
        "d. How to be safe when you hunt in the forest."
      ]
    },
    {
      id: 2,
      question: "What did all the animals say to the lion?",
      options: [
        "a. They said they wanted him to be their king.",
        "b. They said that the rabbit would be there in a moment.",
        "c. They said that they would allow him to eat one of them a day.",
        "d. They said that they would hide at the bottom of the well."
      ]
    },
    {
      id: 3,
      question: "Why did the rabbit take the lion to the well in the middle of the forest?",
      options: [
        "a. So a lot of animals could see the rabbit walking with the lion.",
        "b. So the lion could attack the \"other\" lion.",
        "c. So the lion could drink water.",
        "d. So the other animals would be afraid of the rabbit."
      ]
    },
    {
      id: 4,
      question: "Which of the following is true at the end of the story?",
      options: [
        "a. The lion attacked another lion, and they both got hurt.",
        "b. The lion cannot reply to the rabbit, so the rabbit wins.",
        "c. The lion finally dies.",
        "d. The lion is pleased by the rabbit's words, so it does not eat the rabbit."
      ]
    },
    {
      id: 5,
      question: "What did the lion see when it looked in the well?",
      options: [], // Input type answer in demo? Or maybe options cut off. Screenshot shows text input area? No, looks like options in previous, but last one might be text. Actually screenshot shows an input box for #5? "What did the lion see..." and gray box.
      isInput: true
    }
  ]
};

export default function UnitLearningClient({ bookName, unitId, unitTitle, bookSlug }: UnitLearningClientProps) {
  const [activeTab, setActiveTab] = useState<'word-list' | 'exercise' | 'reading' | 'questions'>('word-list');

  // Helper to check if tab is complete (mocked)
  const isComplete = (tab: string) => {
    if (tab === 'word-list' && activeTab !== 'word-list') return true;
    if (tab === 'exercise' && (activeTab === 'reading' || activeTab === 'questions')) return true;
    return false;
  };

  const getTabIcon = (tab: string) => {
    if (activeTab === tab) {
      // Active: Yellow Checkmark style or just filled
      return <div className="w-5 h-5 rounded-full bg-[#FFC600] flex items-center justify-center text-white text-xs font-bold">✓</div>;
    } 
    if (isComplete(tab)) {
       // Complete: Yellow Checkmark
       return <div className="w-5 h-5 rounded-full bg-[#FFC600] flex items-center justify-center text-white text-xs font-bold">✓</div>;
    }
    // Inactive: Empty circle
    return <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>;
  };
  
  const getTabClass = (tab: string) => activeTab === tab ? "text-black font-bold" : "text-gray-500 font-medium";

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
      
      {/* Header */}
      <div className="mb-4">
         <h1 className="text-4xl font-bold mb-2">Vocabulary</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
           <div className="sticky top-8">
             <h3 className="font-bold text-lg mb-4 text-black border-b-2 border-[#FFC600] pb-2 inline-block">Lessons</h3>
             
             <ul className="space-y-6">
               <li 
                 className={`flex items-center gap-3 cursor-pointer ${getTabClass('word-list')}`}
                 onClick={() => setActiveTab('word-list')}
               >
                 {getTabIcon('word-list')}
                 Word List
               </li>
               <li 
                 className={`flex items-center gap-3 cursor-pointer ${getTabClass('exercise')}`}
                 onClick={() => setActiveTab('exercise')}
               >
                 {getTabIcon('exercise')}
                 Exercise
               </li>
               <li 
                 className={`flex items-center gap-3 cursor-pointer ${getTabClass('reading')}`}
                 onClick={() => setActiveTab('reading')}
               >
                 {getTabIcon('reading')}
                 Reading Comprehension
               </li>
               <li 
                 className={`flex items-center gap-3 cursor-pointer ${getTabClass('questions')}`}
                 onClick={() => setActiveTab('questions')}
               >
                 {getTabIcon('questions')}
                 Answer the questions
               </li>
             </ul>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
           {/* TAB 1: WORD LIST */}
           {activeTab === 'word-list' && (
             <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-2">
                   <div className="w-full h-2 bg-gray-200 rounded-full mr-4 relative">
                      <div className="absolute top-0 left-0 h-full w-[5%] bg-black rounded-full"></div>
                   </div>
                   <span className="font-bold text-black">1/20</span>
                </div>

                <div className="border-2 border-blue-400 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[500px] bg-white relative overflow-hidden">
                   <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/white-waves.png')]"></div>

                   <div className="relative z-10 w-full flex flex-col items-center">
                      <div className="w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg">
                         <img 
                           src="https://img.freepik.com/free-photo/portrait-young-scared-asian-woman-looking-camera_171337-1496.jpg" 
                           alt="afraid" 
                           className="w-full h-full object-cover"
                         />
                      </div>
                      
                      <h2 className="text-2xl font-bold mb-2">
                         afraid <span className="text-gray-600 font-normal">[ə'freid] adj.</span>
                      </h2>
                      <div className="w-16 h-1 bg-[#FFC600] mb-8"></div>

                      <p className="text-xl font-medium mb-8 text-gray-800">
                        When someone is afraid, they feel fear.
                      </p>
                      
                      <p className="text-lg text-gray-700">
                        → The woman was <strong>afraid</strong> of what she saw.
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                   <button 
                     className="bg-[#5B9557] hover:bg-[#4a7a47] text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-colors"
                     onClick={() => setActiveTab('exercise')} // Mock completion
                   >
                      ALREADY KNOW
                   </button>
                   <button className="bg-[#E74C3C] hover:bg-[#d64132] text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-colors">
                      ADD TO MY FLASHCARD
                   </button>
                </div>
             </div>
           )}

           {/* TAB 2: EXERCISE */}
           {activeTab === 'exercise' && (
             <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-8 pb-4 border-b">
                   <h2 className="text-xl font-bold">Exercise 1</h2>
                   <span className="font-bold">14/20 correct</span>
                </div>
                
                <h3 className="font-bold text-lg mb-6">Part A: Choose the right word for the given definition.</h3>
                
                <div className="space-y-8">
                  {unit1Data.exercise.map((ex, idx) => (
                    <div key={ex.id}>
                       <p className="font-semibold mb-3">{idx + 1}. {ex.question}</p>
                       <div className="space-y-1 ml-4">
                          {ex.options.map((opt, optIdx) => (
                            <label key={optIdx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded block">
                               <input type="radio" name={`q-${ex.id}`} className="w-4 h-4 text-primary focus:ring-primary" />
                               <span>{opt}</span>
                            </label>
                          ))}
                       </div>
                    </div>
                  ))}
                </div>
             </div>
           )}

           {/* TAB 3: READING */}
           {activeTab === 'reading' && (
             <div className="animate-in fade-in duration-300">
                <div className="flex items-center gap-4 mb-6">
                   <h2 className="text-2xl font-bold">{unit1Data.reading.title}</h2>
                   <button className="p-2 hover:bg-gray-100 rounded-full">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                     </svg>
                   </button>
                   <span className="ml-auto font-bold">3/5 correct</span>
                </div>

                <div className="flex flex-col-reverse xl:flex-row gap-8">
                   <div className="flex-1 text-lg leading-relaxed text-gray-800 space-y-4">
                      {unit1Data.reading.text.map((paragraph, idx) => (
                        <p key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
                      ))}
                   </div>
                   
                   <div className="w-full xl:w-80 flex-shrink-0">
                      <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                         <img 
                           src="https://img.freepik.com/free-vector/lion-rabbit-forest-scene_1308-41088.jpg" 
                           alt="The Lion and the Rabbit" 
                           className="w-full h-auto"
                         />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* TAB 4: QUESTIONS */}
           {activeTab === 'questions' && (
             <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold mb-6">Answer the questions.</h2>

                <div className="space-y-8 mb-8">
                  {unit1Data.questions.map((q, idx) => (
                    <div key={q.id}>
                       <p className="font-semibold mb-3">{idx + 1}. {q.question}</p>
                       
                       {q.isInput ? (
                         <div className="ml-4">
                            <input 
                              type="text" 
                              className="w-full bg-gray-100 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#FFC600]" 
                              placeholder="Type your answer here..."
                            />
                         </div>
                       ) : (
                         <div className="space-y-1 ml-4">
                            {q.options?.map((opt, optIdx) => (
                              <label key={optIdx} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded block">
                                 <input type="radio" name={`q-read-${q.id}`} className="mt-1 w-4 h-4 text-primary focus:ring-primary flex-shrink-0" />
                                 <span>{opt}</span>
                              </label>
                            ))}
                         </div>
                       )}
                    </div>
                  ))}
                </div>

                <button className="bg-[#FFC600] text-black font-bold py-3 px-8 rounded-xl uppercase tracking-wide hover:opacity-90 transition-opacity">
                   Submit
                </button>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
