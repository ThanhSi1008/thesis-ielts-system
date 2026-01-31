"use client";

import React, { useState } from "react";

interface GrammarLessonClientProps {
  topicName: string;
  unitId: string; // e.g. "1"
  unitTitle: string; // e.g. "Present continuous"
}

const grammarData = {
  theory: `
    <div class="space-y-6 text-gray-800">
      <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <p class="font-medium">Sarah is in her car. She is on her way to work.</p>
        <p>She's driving to work. (= She is driving ...)</p>
        <p class="text-sm text-gray-600 mt-2">This means: she is driving now, at the time of speaking. The action is not finished.</p>
      </div>

      <div>
        <h3 class="font-bold text-lg mb-2">am/is/are + -ing is the present continuous:</h3>
        <table class="w-full text-sm border-collapse">
            <tr class="bg-gray-100"><td class="p-2 border">I</td><td class="p-2 border">am</td><td class="p-2 border">(= I'm)</td><td class="p-2 border" rowspan="3">driving<br>working<br>doing etc.</td></tr>
            <tr class="bg-white"><td class="p-2 border">he/she/it</td><td class="p-2 border">is</td><td class="p-2 border">(= he's etc.)</td></tr>
            <tr class="bg-gray-100"><td class="p-2 border">we/you/they</td><td class="p-2 border">are</td><td class="p-2 border">(= we're etc.)</td></tr>
        </table>
      </div>

      <div>
        <h3 class="font-bold text-lg mb-2">Example:</h3>
        <ul class="list-disc pl-5 space-y-2">
           <li>Steve is talking to a friend on the phone. He says:<br>
               "I'm reading..." <span class="text-gray-500">...but he is not reading the book at the time of speaking.</span><br>
               He means that he has started reading the book but has not finished it yet. He is in the middle of reading it.
           </li>
        </ul>
      </div>

      <div class="bg-yellow-50 p-4 rounded-lg">
         <p class="font-bold">I am doing something = I started doing it and I haven't finished; I'm in the middle of doing it.</p>
         <ul class="list-disc pl-5 mt-2 space-y-1">
           <li>Please don't make so much noise. I'm trying to work. (not I try)</li>
           <li>"Where's Mark?" "He's having a shower." (not He has a shower)</li>
           <li>Let's go out now. It isn't raining any more. (not It doesn't rain)</li>
           <li>How's your new job? Are you enjoying it?</li>
           <li>What's all that noise? What's going on? or What's happening?</li>
         </ul>
      </div>
    </div>
  `,
  exercises: [
    {
      id: "1.1",
      question: "What's happening in the pictures? Choose from these verbs:",
      verbs: ["cross", "hide", "scratch", "take", "tie", "wave"],
      items: [
        { label: "1. She's taking a picture.", isExample: true },
        { label: "2. He ________________ a shoelace.", answer: "is tying" },
        { label: "3. ________________ the road.", answer: "They are crossing" },
        { label: "4. ________________ his head.", answer: "He is scratching" },
        { label: "5. ________________ behind a tree.", answer: "She is hiding" },
        { label: "6. ________________ to somebody.", answer: "They are waving" }
      ]
    },
    {
      id: "1.2",
      question: "The sentences on the right follow those on the left. Which sentence goes with which?",
      matches: [
        { left: "1. Please don't make so much noise.", right: "f. I'm trying to work.", isExample: true },
        { left: "2. We need to leave soon.", right: "e. It's getting late." },
        { left: "3. I don't have anywhere to live right now.", right: "g. I'm staying with friends." },
        { left: "4. I need to eat something soon.", right: "a. I'm getting hungry." },
        { left: "5. They don't need their car any more.", right: "d. They're trying to sell it." },
        { left: "6. Things are not so good at work.", right: "h. The company is losing money." },
        { left: "7. It isn't true what they say.", right: "b. They're lying." },
        { left: "8. We're going to get wet.", right: "c. It's starting to rain." }
      ]
    },
    {
       id: "1.3",
       question: "Write questions. Use the present continuous.",
       items: [
         { label: "1. What's all that noise? What's happening? (what / happen?)", isExample: true },
         { label: "2. What's the matter? (why / you / cry?)", answer: "Why are you crying?" },
         { label: "3. Where's your mother? (she / work / today?)", answer: "Is she working today?" },
         { label: "4. I haven't seen you for ages. (what / you / do / these days?)", answer: "What are you doing these days?" }
       ]
    }
  ]
}

export default function GrammarLessonClient({ topicName, unitId, unitTitle }: GrammarLessonClientProps) {
  const [activeTab, setActiveTab] = useState<'theory' | 'exercise'>('theory');

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8">
       {/* Header */}
      <h1 className="text-4xl font-bold mb-8">Grammar</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full lg:w-48 flex-shrink-0">
           <div className="sticky top-8">
             <h3 className="font-bold text-lg mb-4 text-black border-b-2 border-[#FFC600] pb-2 inline-block">Lessons</h3>
             
             <ul className="space-y-4">
               <li 
                 className={`flex items-center gap-3 cursor-pointer ${activeTab === 'theory' ? 'font-bold text-black' : 'text-gray-500'}`}
                 onClick={() => setActiveTab('theory')}
               >
                 <div className={`w-5 h-5 rounded-full border-2 ${activeTab === 'theory' ? 'bg-[#FFC600] border-[#FFC600] text-white flex items-center justify-center' : 'border-gray-200'}`}>
                    {activeTab === 'theory' && '✓'}
                 </div>
                 Theory
               </li>
               <li 
                 className={`flex items-center gap-3 cursor-pointer ${activeTab === 'exercise' ? 'font-bold text-black' : 'text-gray-500'}`}
                 onClick={() => setActiveTab('exercise')}
               >
                 <div className={`w-5 h-5 rounded-full border-2 ${activeTab === 'exercise' ? 'bg-[#FFC600] border-[#FFC600] text-white flex items-center justify-center' : 'border-gray-200'}`}>
                   {activeTab === 'exercise' && '✓'}
                 </div>
                 Exercise
               </li>
             </ul>
           </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white min-h-[600px] border-l border-gray-100 pl-0 lg:pl-12">
           <div className="border-b border-gray-200 pb-4 mb-8">
              <h2 className="text-xl font-bold">Unit {unitId}: {unitTitle}</h2>
           </div>

           {activeTab === 'theory' && (
             <div className="animate-in fade-in duration-300">
                <div dangerouslySetInnerHTML={{ __html: grammarData.theory }} />
             </div>
           )}

           {activeTab === 'exercise' && (
             <div className="animate-in fade-in duration-300 space-y-12">
                {grammarData.exercises.map((ex) => (
                   <div key={ex.id}>
                      <h3 className="font-bold text-lg mb-4">{ex.id} {ex.question}</h3>
                      {ex.verbs && (
                        <div className="bg-gray-100 p-4 rounded-lg mb-4 flex flex-wrap gap-4 font-mono text-sm">
                           {ex.verbs.map(v => <span key={v}>{v}</span>)}
                        </div>
                      )}
                      
                      <div className="space-y-4">
                         {ex.items && ex.items.map((item, idx) => (
                           <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2">
                              <span>{item.label.split('___')[0]}</span>
                              {!item.isExample && (
                                <input 
                                  type="text" 
                                  className="border-b-2 border-gray-300 bg-transparent px-2 py-1 focus:border-blue-500 outline-none w-48"
                                />
                              )}
                              <span>{item.label.split('___')[1]}</span>
                           </div>
                         ))}
                         
                         {ex.matches && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                <h4 className="font-bold text-gray-500 text-sm uppercase">Left Sentence</h4>
                                {ex.matches.map((m, idx) => (
                                  <div key={idx} className="p-2 bg-white border rounded shadow-sm">
                                     {m.left}
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-bold text-gray-500 text-sm uppercase">Right Sentence</h4>
                                {ex.matches.map((m, idx) => (
                                  <div key={idx} className="p-2 bg-gray-50 border border-dashed rounded flex justify-between items-center group cursor-pointer hover:bg-blue-50">
                                     <span>{m.right.substring(0, 30)}...</span>
                                     <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs group-hover:border-blue-500">?</div>
                                  </div>
                                ))}
                              </div>
                           </div>
                         )}
                      </div>
                   </div>
                ))}

                <div className="pt-8 flex justify-end">
                   <button className="bg-[#FFC600] hover:bg-[#ffd633] text-black font-bold py-3 px-8 rounded-lg shadow-sm transition-colors">
                      Submit
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
