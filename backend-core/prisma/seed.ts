import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// CAMBRIDGE IELTS (Intensive Mock Tests)
// ============================================================

const cambridgeIelts17ListeningTest1Questions = {
  test_title: "Test 1",
  section: "Listening",
  parts: [
    {
      part_number: 1,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843893/ELT_IELTS17_t1_audio1_yaagme.mp3",
      questions: "1Ã¢â‚¬â€œ10",
      instructions:
        "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
      topic: "Buckworth Conservation Group",
      question_type: "Note Completion",
      content: [
        {
          heading: "Regular activities",
          subsections: [
            {
              subheading: "Beach",
              points: [
                {
                  question_number: 1,
                  text: "making sure the beach does not have 1 .............................. on it",
                  answer: "litter",
                },
                {
                  question_number: 2,
                  text: "no 2 ..............................",
                  answer: "dogs",
                },
              ],
            },
            {
              subheading: "Nature reserve",
              points: [
                { text: "maintaining paths" },
                { text: "nesting boxes for birds installed" },
                {
                  question_number: 3,
                  text: "next task is taking action to attract 3 .............................. to the place",
                  answer: "insects",
                },
                {
                  question_number: 4,
                  text: "identifying types of 4 ..............................",
                  answer: "butterflies",
                },
                {
                  question_number: 5,
                  text: "building a new 5 ..............................",
                  answer: "wall",
                },
              ],
            },
          ],
        },
        {
          heading: "Forthcoming events",
          subsections: [
            {
              subheading: "Saturday",
              points: [
                { text: "meet at Dunsmore Beach car park" },
                {
                  question_number: 6,
                  text: "walk across the sands and reach the 6 ..............................",
                  answer: "island",
                },
                { text: "take a picnic" },
                {
                  question_number: 7,
                  text: "wear appropriate 7 ..............................",
                  answer: "boots",
                },
              ],
            },
            {
              subheading: "Woodwork session",
              points: [
                {
                  question_number: 8,
                  text: "suitable for 8 .............................. to participate in",
                  answer: "beginners",
                },
                {
                  question_number: 9,
                  text: "making 9 .............................. out of wood",
                  answer: "spoons",
                },
                { text: "17th, from 10 a.m. to 3 p.m." },
                {
                  question_number: 10,
                  text: "cost of session (no camping): 10 Ã‚Â£ ..............................",
                  answer: "35 / thirty five",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      part_number: 2,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843894/ELT_IELTS17_t1_audio2_fshrgc.mp3",
      questions: "11Ã¢â‚¬â€œ20",
      topic: "Boat trip round Tasmania",
      question_groups: [
        {
          questions: "11Ã¢â‚¬â€œ14",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 11,
              question_text:
                "What is the maximum number of people who can stand on each side of the boat?",
              options: { A: "9", B: "15", C: "18" },
              answer: "A",
            },
            {
              question_number: 12,
              question_text: "What colour are the tour boats?",
              options: { A: "dark red", B: "jet black", C: "light green" },
              answer: "C",
            },
            {
              question_number: 13,
              question_text:
                "Which lunchbox is suitable for someone who doesnÃ¢â‚¬â„¢t eat meat or fish?",
              options: { A: "Lunchbox 1", B: "Lunchbox 2", C: "Lunchbox 3" },
              answer: "B",
            },
            {
              question_number: 14,
              question_text: "What should people do with their litter?",
              options: {
                A: "take it home",
                B: "hand it to a member of staff",
                C: "put it in the bins provided on the boat",
              },
              answer: "B",
            },
          ],
        },
        {
          questions: "15Ã¢â‚¬â€œ20",
          instructions: "Choose TWO letters, AÃ¢â‚¬â€œE.",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [15, 16],
              question_text:
                "Which TWO features of the lighthouse does Lou mention?",
              options: {
                A: "why it was built",
                B: "who built it",
                C: "how long it took to build",
                D: "who staffed it",
                E: "what it was built with",
              },
              answer: ["A", "D"],
              grading_note: "IN EITHER ORDER",
            },
            {
              question_numbers: [17, 18],
              question_text:
                "Which TWO types of creature might come close to the boat?",
              options: {
                A: "sea eagles",
                B: "fur seals",
                C: "dolphins",
                D: "whales",
                E: "penguins",
              },
              answer: ["B", "C"],
              grading_note: "IN EITHER ORDER",
            },
            {
              question_numbers: [19, 20],
              question_text: "Which TWO points does Lou make about the caves?",
              options: {
                A: "Only large tourist boats can visit them.",
                B: "The entrances to them are often blocked.",
                C: "It is too dangerous for individuals to go near them.",
                D: "Someone will explain what is inside them.",
                E: "They cannot be reached on foot.",
              },
              answer: ["D", "E"],
              grading_note: "IN EITHER ORDER",
            },
          ],
        },
      ],
    },
    {
      part_number: 3,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843896/ELT_IELTS17_t1_audio3_eidh3p.mp3",
      questions: "21Ã¢â‚¬â€œ30",
      topic: "Work experience for veterinary science students",
      question_groups: [
        {
          questions: "21Ã¢â‚¬â€œ26",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 21,
              question_text:
                "What problem did both Diana and Tim have when arranging their work experience?",
              options: {
                A: "making initial contact with suitable farms",
                B: "organising transport to and from the farm",
                C: "finding a placement for the required length of time",
              },
              answer: "A",
            },
            {
              question_number: 22,
              question_text: "Tim was pleased to be able to help",
              options: {
                A: "a lamb that had a broken leg.",
                B: "a sheep that was having difficulty giving birth.",
                C: "a newly born lamb that was having trouble feeding.",
              },
              answer: "B",
            },
            {
              question_number: 23,
              question_text: "Diana says the sheep on her farm",
              options: {
                A: "were of various different varieties.",
                B: "were mainly reared for their meat.",
                C: "had better quality wool than sheep on the hills.",
              },
              answer: "B",
            },
            {
              question_number: 24,
              question_text:
                "What did the students learn about adding supplements to chicken feed?",
              options: {
                A: "These should only be given if specially needed.",
                B: "It is worth paying extra for the most effective ones.",
                C: "The amount given at one time should be limited.",
              },
              answer: "A",
            },
            {
              question_number: 25,
              question_text: "What happened when Diana was working with dairy cows?",
              options: {
                A: "She identified some cows incorrectly.",
                B: "She accidentally threw some milk away.",
                C: "She made a mistake when storing milk.",
              },
              answer: "C",
            },
            {
              question_number: 26,
              question_text: "What did both farmers mention about vets and farming?",
              options: {
                A: "Vets are failing to cope with some aspects of animal health.",
                B: "There needs to be a fundamental change in the training of vets.",
                C: "Some jobs could be done by the farmer rather than by a vet.",
              },
              answer: "C",
            },
          ],
        },
        {
          questions: "27Ã¢â‚¬â€œ30",
          instructions:
            "What opinion do the students give about each of the following modules on their veterinary science course? Choose FOUR answers from the box and write the correct letter, AÃ¢â‚¬â€œF, next to questions 27Ã¢â‚¬â€œ30.",
          question_type: "Matching",
          options_box: {
            title: "Opinions",
            options: {
              A: "Tim found this easier than expected.",
              B: "Tim thought this was not very clearly organised.",
              C: "Diana may do some further study on this.",
              D: "They both found the reading required for this was difficult.",
              E: "Tim was shocked at something he learned on this module.",
              F: "They were both surprised how little is known about some aspects of this.",
            },
          },
          items: [
            { question_number: 27, prompt: "Medical terminology", answer: "A" },
            { question_number: 28, prompt: "Diet and nutrition", answer: "E" },
            { question_number: 29, prompt: "Animal disease", answer: "F" },
            { question_number: 30, prompt: "Wildlife medication", answer: "C" },
          ],
        },
      ],
    },
    {
      part_number: 4,
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843901/ELT_IELTS17_t1_audio4_yvhjwu.mp3",
      questions: "31Ã¢â‚¬â€œ40",
      topic: "Labyrinths",
      instructions:
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
      question_type: "Note Completion",
      content: [
        {
          heading: "Definition",
          points: [{ text: "a winding spiral path leading to a central area" }],
        },
        {
          heading: "Labyrinths compared with mazes",
          points: [
            {
              question_number: 31,
              text: "Mazes are a type of 31 ..............................",
              answer: "puzzle",
            },
            {
              question_number: 32,
              text: "32 .............................. is needed to navigate through a maze",
              answer: "logic",
            },
            {
              question_number: 33,
              text: "the word 'maze' is derived from a word meaning a feeling of 33 ..............................",
              answer: "confusion",
            },
            { text: "Labyrinths represent a journey through life" },
            {
              question_number: 34,
              text: "they have frequently been used in 34 .............................. and prayer",
              answer: "meditation",
            },
          ],
        },
        {
          heading: "Early examples of the labyrinth spiral",
          points: [
            {
              question_number: 35,
              text: "Ancient carvings on 35 .............................. have been found across many cultures",
              answer: "stone",
            },
            {
              text: "The Pima, a Native American tribe, wove the symbol on baskets",
            },
            {
              question_number: 36,
              text: "Ancient Greeks used the symbol on 36 ..............................",
              answer: "coins",
            },
          ],
        },
        {
          heading: "Walking labyrinths",
          points: [
            {
              question_number: 37,
              text: "The largest surviving example of a turf labyrinth once had a big 37 .............................. at its centre",
              answer: "tree",
            },
          ],
        },
        {
          heading: "Labyrinths nowadays",
          points: [
            {
              question_number: 38,
              text: "Believed to have a beneficial impact on mental and physical health, e.g., walking a maze can reduce a person's 38 .............................. rate",
              answer: "breathing",
            },
            {
              text: "Used in medical and health and fitness settings and also prisons",
            },
            {
              text: "Popular with patients, visitors and staff in hospitals",
            },
            {
              question_number: 39,
              text: "patients who can't walk can use 'finger labyrinths' made from 39 ..............................",
              answer: "paper",
            },
            {
              question_number: 40,
              text: "research has shown that Alzheimer's sufferers experience less 40 ..............................",
              answer: "anxiety",
            },
          ],
        },
      ],
    },
  ],
};

const cambridgeIelts17ListeningTest2Questions = {
  test_title: "Test 2",
  section: "Listening",
  parts: [
    {
      part_number: 1,
      part_type: "Basic Conversation",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773917628/ELT_IELTS17_t2_audio1_xaf0r1.mp3",
      questions: "1Ã¢â‚¬â€œ10",
      transcript: [
        { speaker: "JANE", text: "Hello, Jane Fairbanks speaking." },
        { speaker: "FRANK", text: "Oh, good morning. My name's Frank Pritchard. I've just retired and moved to Southoe. I'd like to become a volunteer, and I gather you co-ordinate voluntary work in the village." },
        { speaker: "JANE", text: "That's right." },
        { speaker: "FRANK", text: "What sort of thing could I do?" },
        { speaker: "JANE", text: "Well, we need help with the village library. We borrow books from the town library, and individuals also donate them. So, one thing you could do is get involved in collecting them Ã¢â‚¬â€œ if you've got a car, that is.", question_number: 1, highlight_text: "collecting" },
        { speaker: "FRANK", text: "Yes, that's no problem." },
        { speaker: "JANE", text: "The times are pretty flexible so we can arrange it to suit you. Another thing is the records that we keep of the books we're given, and those we borrow and need to return to the town library. It would be very useful to have another person to help keep them up to date.", question_number: 2, highlight_text: "the records that we keep of the books we're given" },
        { speaker: "FRANK", text: "Right. I'm used to working on a computer Ã¢â‚¬â€œ I presume they're computerised?" },
        { speaker: "JANE", text: "Oh yes." },
        { speaker: "FRANK", text: "Is the library purpose-built? I haven't noticed it when I've walked round the village." },
        { speaker: "JANE", text: "No, we simply have the use of a room in the village hall, the West Room. It's on the left as you go in.", question_number: 3, highlight_text: "West" },
        { speaker: "FRANK", text: "I must go and have a look inside the hall." },
        { speaker: "JANE", text: "Yes, it's a nice building." },
        { speaker: "FRANK", text: "Do you run a lunch club in the village for elderly people? I know a lot of places do." },
        { speaker: "JANE", text: "Yes, we have a very successful club." },
        { speaker: "FRANK", text: "I could help with transport, if that's of any use.", question_number: 4, highlight_text: "transport" },
        { speaker: "JANE", text: "Ooo definitely. People come to the club from neighbouring villages, and we're always in need of more drivers." },
        { speaker: "FRANK", text: "And does the club have groups that focus on a particular hobby, too? I could get involved in one or two, particularly if there are any art groups.", question_number: 5, highlight_text: "any art groups" },
        { speaker: "JANE", text: "Excellent. I'll find out where we need help and get back to you." },
        { speaker: "FRANK", text: "Fine. What about help for individual residents? Do you arrange that at all?" },
        { speaker: "JANE", text: "Yes, we do it as a one-off. In fact, there's Mrs Carroll. She needs a lift to the hospital next week, and we're struggling to find someone.", question_number: 6, highlight_text: "hospital" },
        { speaker: "FRANK", text: "When's her appointment?" },
        { speaker: "JANE", text: "On Tuesday. It would take the whole morning." },
        { speaker: "FRANK", text: "I could do that." },
        { speaker: "JANE", text: "Oh, that would be great. Thank you. And also, next week, we're arranging to have some work done to Mr Selsbury's house before he moves, as he isn't healthy enough to do it himself. We've got some people to decorate his kitchen, but if you could do some weeding in his garden, that would be wonderful.", question_number: 7, highlight_text: "some weeding in his garden" },
        { speaker: "FRANK", text: "OK. I'd enjoy that. And presumably the day and time are flexible." },
        { speaker: "JANE", text: "Oh yes. Just say when would suit you best, and we'll let Mr Selsbury know." },
        { speaker: "FRANK", text: "Good." },
        { speaker: "JANE", text: "The volunteers group also organises monthly social events, which is a great way to meet other people, of course." },
        { speaker: "FRANK", text: "Uhuh." },
        { speaker: "JANE", text: "So next month, on the 19th of October, we're holding a quiz Ã¢â‚¬â€œ a couple of residents are great at planning unusual ones, and we always fill the village hall.", question_number: 8, highlight_text: "a quiz" },
        { speaker: "FRANK", text: "That sounds like fun. Can I do anything to help?" },
        { speaker: "JANE", text: "Well, because of the number of people, we need plenty of refreshments for halfway through. So, if you could provide any, we'd be grateful." },
        { speaker: "FRANK", text: "I'm sure I could. I'll think about what to make, and let you know." },
        { speaker: "JANE", text: "Thank you. Then on November the 18th, we're holding a dance, also in the village hall. We've booked a band that specialises in music of the 1930s Ã¢â‚¬â€œ they've been before, and we've had a lot of requests to bring them back." },
        { speaker: "FRANK", text: "I'm not really a dancer, but I'd like to do something to help." },
        { speaker: "JANE", text: "Well, we sell tickets in advance, and having an extra person to check them at the door, as people arrive, would be good Ã¢â‚¬â€œ it can be quite a bottleneck if everyone arrives at once!", question_number: 9, highlight_text: "tickets" },
        { speaker: "FRANK", text: "OK, I'm happy with that." },
        { speaker: "JANE", text: "We're also arranging a New Year's Eve party. We're expecting that to be a really big event, so instead of the village hall, it'll be held in the Mountfort Hotel." },
        { speaker: "FRANK", text: "The Ã¢â‚¬Â¦?" },
        { speaker: "JANE", text: "Mountfort. M-O-U-N-T-F-O-R-T Hotel. It isn't in Southoe itself, but it's only a couple of miles away. The hotel will be providing dinner and we've booked a band. The one thing we haven't got yet is a poster. That isn't something you could do, by any chance, is it?", question_number: 10, highlight_text: "a poster" },
        { speaker: "FRANK", text: "Well actually, yes. Before I retired I was a graphic designer, so that's right up my street." },
        { speaker: "JANE", text: "Oh perfect! I'll give you the details, and then perhaps you could send me a draft Ã¢â‚¬Â¦" },
        { speaker: "FRANK", text: "Of course." }
      ],
      question_groups: [
        {
          questions: "1Ã¢â‚¬â€œ7",
          instructions: "Complete the notes below. Write ONE WORD ONLY for each answer.",
          topic: "Opportunities for voluntary work in Southoe village",
          question_type: "Note Completion",
          content: [
            {
              heading: "Library",
              points: [
                { question_number: 1, text: "Help with 1 .............................. books (times to be arranged)", answer: "collecting", timestamp_seconds: 119 },
                { question_number: 2, text: "Help needed to keep 2 .............................. of books up to date", answer: "records", timestamp_seconds: 133 },
                { question_number: 3, text: "Library is in the 3 .............................. Room in the village hall", answer: "West", timestamp_seconds: 160 }
              ]
            },
            {
              heading: "Lunch club",
              points: [
                { question_number: 4, text: "Help by providing 4 ..............................", answer: "transport", timestamp_seconds: 183 },
                { question_number: 5, text: "Help with hobbies such as 5 ..............................", answer: "art", timestamp_seconds: 199 }
              ]
            },
            {
              heading: "Help for individuals needed next week",
              points: [
                { question_number: 6, text: "Taking Mrs Carroll to 6 ..............................", answer: "hospital", timestamp_seconds: 219 },
                { question_number: 7, text: "Work in the 7 .............................. at Mr Selsbury's house", answer: "garden", timestamp_seconds: 251 }
              ]
            }
          ]
        },
        {
          questions: "8Ã¢â‚¬â€œ10",
          instructions: "Complete the table below. Write ONE WORD ONLY for each answer.",
          topic: "Village social events",
          question_type: "Table Completion",
          table: {
            headers: ["Date", "Event", "Location", "Help needed"],
            rows: [
              [
                { text: "19 Oct" },
                { question_number: 8, text: "8 ..............................", answer: "quiz", timestamp_seconds: 309 },
                { text: "Village hall" },
                { text: "providing refreshments" }
              ],
              [
                { text: "18 Nov" },
                { text: "dance" },
                { text: "Village hall" },
                { question_number: 9, text: "checking 9 ..............................", answer: "tickets", timestamp_seconds: 364 }
              ],
              [
                { text: "31 Dec" },
                { text: "New Year's Eve party" },
                { text: "Mountfort Hotel" },
                { question_number: 10, text: "designing the 10 ..............................", answer: "poster", timestamp_seconds: 413 }
              ]
            ]
          }
        }
      ]
    },
    {
      part_number: 2,
      part_type: "Short Monologue",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773917629/ELT_IELTS17_t2_audio2_d65ewa.mp3",
      questions: "11Ã¢â‚¬â€œ20",
      topic: "Oniton Hall",
      transcript: [
        { speaker: "NICK", text: "Good morning, and welcome to Oniton Hall, one of the largest estates in the area. My name's Nick, and I'm one of the guides. I'll give you a brief introduction to the estate while you're sitting down, and then we'll walk round." },
        { speaker: "NICK", text: "The estate consists of the house, gardens, parkland and farm, and it dates back to the fourteenth century. The original house was replaced in the late seventeenth century, and of course it has had a large number of owners. Almost all of them have left their mark, generally by adding new rooms, like the ballroom and conservatory, or by demolishing others. The farm looks much as it's always done, although the current owner has done a great deal of work to the flower beds.", question_number: 11, highlight_text: "Almost all of them have left their mark, generally by adding new rooms" },
        { speaker: "NICK", text: "In the seventeenth century, the estate was owned by a very wealthy man called Sir Edward Downes. His intention was to escape from the world of politics, after years as an active politician, and to build a new house worthy of his big collection of books, paintings and sculptures. He broke off contact with his former political allies, and hosted meetings of creative and literary people, like painters and poets. Unusually for his time, he didn't care whether his guests were rich or poor, as long as they had talent.", question_number: 12, highlight_text: "hosted meetings of creative and literary people, like painters and poets" },
        { speaker: "NICK", text: "Big houses like Oniton had dozens of servants until the 1920s or 30s, and we've tried to show what their working lives were like. Photographs of course don't give much of an idea, so instead, as you go round the house, you'll see volunteers dressed up as nineteenth-century servants, going about their work. They'll explain what they're doing, and tell you their recipes, or what tools they're using. We've just introduced this feature to replace the audio guide we used to have available.", question_number: 13, highlight_text: "volunteers dressed up as nineteenth-century servants" },
        { speaker: "NICK", text: "I see there are a number of children here with you today. Well, we have several activities specially for children, like dressing up in the sorts of clothes that children wore in the past, and as it's a fine day, some of you will probably want to play in the adventure playground. Our latest addition is child-sized tractors, that you can drive around the grounds.", question_number: 14, highlight_text: "Our latest addition is child-sized tractors, that you can drive around the grounds" },
        { speaker: "NICK", text: "We'll also be going into the farm that's part of the estate, where there's plenty to do. Most of the buildings date from the eighteenth century, so you can really step back into an agricultural past." },
        { speaker: "NICK", text: "Until recently, the dairy was where milk from the cows was turned into cheese. It's now the place to go for lunch, or afternoon tea, or just a cup of coffee and a slice of homemade cake.", question_number: 15, highlight_text: "the place to go for lunch, or afternoon tea, or just a cup of coffee and a slice of homemade cake" },
        { speaker: "NICK", text: "The big stone building that dominates the farm is the large barn, and in here is our collection of agricultural tools. These were used in the past to plough the earth, sow seeds, make gates, and much more.", question_number: 16, highlight_text: "our collection of agricultural tools" },
        { speaker: "NICK", text: "There's a small barn, also made of stone, where you can groom the donkeys and horses, to keep their coats clean. They really seem to enjoy having it done, and children love grooming them.", question_number: 17, highlight_text: "you can groom the donkeys and horses, to keep their coats clean" },
        { speaker: "NICK", text: "The horses no longer live in the stables, which instead is the place to go to buy gifts, books, our own jams and pickles, and clothes and blankets made of wool from our sheep.", question_number: 18, highlight_text: "the place to go to buy gifts, books, our own jams and pickles" },
        { speaker: "NICK", text: "Outside the shed, which is the only brick building, you can climb into a horse-drawn carriage for a lovely, relaxing tour of the park and farm. The carriages are well over a hundred years old.", question_number: 19, highlight_text: "climb into a horse-drawn carriage for a lovely, relaxing tour" },
        { speaker: "NICK", text: "And finally, the parkland, which was laid out in the eighteenth century, with a lake and trees that are now well established. You'll see types of cattle and sheep that are hardly ever found on farms these days. We're helping to preserve them, to stop their numbers falling further.", question_number: 20, highlight_text: "types of cattle and sheep that are hardly ever found on farms these days" },
        { speaker: "NICK", text: "OK, well if you'd like to come with me Ã¢â‚¬Â¦" }
      ],
      question_groups: [
        {
          questions: "11Ã¢â‚¬â€œ14",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            { question_number: 11, question_text: "Many past owners made changes to", options: { A: "the gardens.", B: "the house.", C: "the farm." }, answer: "B", timestamp_seconds: 87 },
            { question_number: 12, question_text: "Sir Edward Downes built Oniton Hall because he wanted", options: { A: "a place for discussing politics.", B: "a place to display his wealth.", C: "a place for artists and writers." }, answer: "C", timestamp_seconds: 133 },
            { question_number: 13, question_text: "Visitors can learn about the work of servants in the past from", options: { A: "audio guides.", B: "photographs.", C: "people in costume." }, answer: "C", timestamp_seconds: 168 },
            { question_number: 14, question_text: "What is new for children at Oniton Hall?", options: { A: "clothes for dressing up", B: "mini tractors", C: "the adventure playground" }, answer: "B", timestamp_seconds: 223 }
          ]
        },
        {
          questions: "15Ã¢â‚¬â€œ20",
          instructions: "Which activity is offered at each of the following locations on the farm? Choose SIX answers from the box and write the correct letter, AÃ¢â‚¬â€œH, next to Questions 15Ã¢â‚¬â€œ20.",
          question_type: "Matching",
          options_box: {
            title: "Activities",
            options: {
              A: "shopping",
              B: "watching cows being milked",
              C: "seeing old farming equipment",
              D: "eating and drinking",
              E: "starting a trip",
              F: "seeing rare breeds of animals",
              G: "helping to look after animals",
              H: "using farming tools"
            }
          },
          items: [
            { question_number: 15, prompt: "dairy", answer: "D", timestamp_seconds: 302 },
            { question_number: 16, prompt: "large barn", answer: "C", timestamp_seconds: 311 },
            { question_number: 17, prompt: "small barn", answer: "G", timestamp_seconds: 330 },
            { question_number: 18, prompt: "stables", answer: "A", timestamp_seconds: 345 },
            { question_number: 19, prompt: "shed", answer: "E", timestamp_seconds: 361 },
            { question_number: 20, prompt: "parkland", answer: "F", timestamp_seconds: 377 }
          ]
        }
      ]
    },
    {
      part_number: 3,
      part_type: "Academic Discussion",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773917628/ELT_IELTS17_t2_audio3_cwmdq3.mp3",
      questions: "21Ã¢â‚¬â€œ30",
      topic: "Romeo and Juliet review",
      transcript: [
        { speaker: "ED", text: "Did you make notes while you were watching the performances of Romeo and Juliet, Gemma?" },
        { speaker: "GEMMA", text: "Yes, I did. I found it quite hard though. I kept getting too involved in the play." },
        { speaker: "ED", text: "Me too. I ended up not taking notes. I wrote down my impressions when I got home. Do you mind if I check a few things with you? In case I've missed anything. And I've also got some questions about our assignment." },
        { speaker: "GEMMA", text: "No, it's good to talk things through. I may have missed things too." },
        { speaker: "ED", text: "OK great. So first of all, I'm not sure how much information we should include in our reviews." },
        { speaker: "GEMMA", text: "Right. Well, I don't think we need to describe what happens. Especially as Romeo and Juliet is one of Shakespeare's most well-known plays." },
        { speaker: "ED", text: "Yeah, everyone knows the story. In an essay we'd focus on the poetry and Shakespeare's use of imagery etc., but that isn't really relevant in a review. We're supposed to focus on how effective this particular production is." },
        { speaker: "GEMMA", text: "Mmm. We should say what made it a success or a failure." },
        { speaker: "ED", text: "And part of that means talking about the emotional impact the performance had on us. I think that's important.", question_number: 21, highlight_text: "emotional impact the performance had on us" },
        { speaker: "GEMMA", text: "Yes. And we should definitely mention how well the director handled important bits of the play Ã¢â‚¬â€œ like when Romeo climbs onto Juliet's balcony.", question_number: 22, highlight_text: "how well the director handled important bits of the play" },
        { speaker: "ED", text: "And the fight between Mercutio and Tybalt." },
        { speaker: "GEMMA", text: "Yes. It would also be interesting to mention the theatre space and how the director used it but I don't think we'll have space in 800 words." },
        { speaker: "ED", text: "No. OK. That all sounds quite straightforward." },
        { speaker: "ED", text: "So what about The Emporium Theatre's production of the play?" },
        { speaker: "GEMMA", text: "I thought some things worked really well but there were some problems too." },
        { speaker: "ED", text: "Yeah. What about the set, for example?" },
        { speaker: "GEMMA", text: "I think it was visually really stunning. I'd say that was probably the most memorable thing about this production.", question_number: 23, highlight_text: "I think it was visually really stunning" },
        { speaker: "ED", text: "You're right. The set design was really amazing, but actually I have seen similar ideas used in other productions." },
        { speaker: "GEMMA", text: "What about the lighting? Some of the scenes were so dimly lit it was quite hard to see." },
        { speaker: "ED", text: "I didn't dislike it. It helped to change the mood of the quieter scenes.", question_number: 24, highlight_text: "It helped to change the mood of the quieter scenes" },
        { speaker: "GEMMA", text: "That's a good point." },
        { speaker: "ED", text: "What did you think of the costumes?" },
        { speaker: "GEMMA", text: "I was a bit surprised by the contemporary dress, I must say.", question_number: 25, highlight_text: "a bit surprised by the contemporary dress" },
        { speaker: "ED", text: "Yeah Ã¢â‚¬â€œ I think it worked well, but I had assumed it would be more conventional." },
        { speaker: "GEMMA", text: "Me too. I liked the music at the beginning and I thought the musicians were brilliant, but I thought they were wasted because the music didn't have much impact in Acts 2 and 3.", question_number: 26, highlight_text: "they were wasted because the music didn" },
        { speaker: "ED", text: "Yes Ã¢â‚¬â€œ that was a shame." },
        { speaker: "GEMMA", text: "One problem with this production was that the actors didn't deliver the lines that well. They were speaking too fast.", question_number: 27, highlight_text: "They were speaking too fast" },
        { speaker: "ED", text: "It was a problem I agree, but I thought it was because they weren't speaking loudly enough Ã¢â‚¬â€œ especially at key points in the play." },
        { speaker: "GEMMA", text: "I actually didn't have a problem with that." },
        { speaker: "ED", text: "It's been an interesting experience watching different versions of Romeo and Juliet, hasn't it?" },
        { speaker: "GEMMA", text: "Definitely. It's made me realise how relevant the play still is." },
        { speaker: "ED", text: "Right. I mean a lot's changed since Shakespeare's time, but in many ways nothing's changed. There are always disagreements and tension between teenagers and their parents.", question_number: 28, highlight_text: "disagreements and tension between teenagers and their parents" },
        { speaker: "GEMMA", text: "Yes, that's something all young people can relate to Ã¢â‚¬â€œ more than the violence and the extreme emotions in the play." },
        { speaker: "ED", text: "How did you find watching it in translation?" },
        { speaker: "GEMMA", text: "Really interesting. I expected to find it more challenging, but I could follow the story pretty well." },
        { speaker: "ED", text: "I stopped worrying about not being able to understand all the words and focused on the actors' expressions. The ending was pretty powerful.", question_number: 29, highlight_text: "The ending was pretty powerful" },
        { speaker: "GEMMA", text: "Yes. That somehow intensified the emotion for me." },
        { speaker: "ED", text: "Did you know Shakespeare's been translated into more languages than any other writer?" },
        { speaker: "GEMMA", text: "What's the reason for his international appeal, do you think?" },
        { speaker: "ED", text: "I was reading that it's because his plays are about basic themes that people everywhere are familiar with." },
        { speaker: "GEMMA", text: "Yeah, and they can also be understood on different levels. The characters have such depth.", question_number: 30, highlight_text: "they can also be understood on different levels. The characters have such depth" },
        { speaker: "ED", text: "Right Ã¢â‚¬â€œ which allows directors to experiment and find new angles." },
        { speaker: "GEMMA", text: "That's really important because Ã¢â‚¬Â¦" }
      ],
      question_groups: [
        {
          questions: "21Ã¢â‚¬â€œ22",
          instructions: "Choose TWO letters, AÃ¢â‚¬â€œE.",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [21, 22],
              question_text: "Which TWO things do the students agree they need to include in their reviews of Romeo and Juliet?",
              options: { A: "analysis of the text", B: "a summary of the plot", C: "a description of the theatre", D: "a personal reaction", E: "a reference to particular scenes" },
              answer: ["D", "E"],
              grading_note: "IN EITHER ORDER",
              timestamp_seconds: 100
            }
          ]
        },
        {
          questions: "23Ã¢â‚¬â€œ27",
          instructions: "Which opinion do the speakers give about each of the following aspects of The Emporium's production of Romeo and Juliet? Choose FIVE answers from the box and write the correct letter, AÃ¢â‚¬â€œG, next to Questions 23Ã¢â‚¬â€œ27.",
          question_type: "Matching",
          options_box: {
            title: "Opinions",
            options: {
              A: "They both expected this to be more traditional.",
              B: "They both thought this was original.",
              C: "They agree this created the right atmosphere.",
              D: "They agree this was a major strength.",
              E: "They were both disappointed by this.",
              F: "They disagree about why this was an issue.",
              G: "They disagree about how this could be improved."
            }
          },
          items: [
            { question_number: 23, prompt: "the set", answer: "D", timestamp_seconds: 209 },
            { question_number: 24, prompt: "the lighting", answer: "C", timestamp_seconds: 231 },
            { question_number: 25, prompt: "the costume design", answer: "A", timestamp_seconds: 240 },
            { question_number: 26, prompt: "the music", answer: "E", timestamp_seconds: 249 },
            { question_number: 27, prompt: "the actors' delivery", answer: "F", timestamp_seconds: 263 }
          ]
        },
        {
          questions: "28Ã¢â‚¬â€œ30",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            { question_number: 28, question_text: "The students think the story of Romeo and Juliet is still relevant for young people today because", options: { A: "it illustrates how easily conflict can start.", B: "it deals with problems that families experience.", C: "it teaches them about relationships." }, answer: "B", timestamp_seconds: 291 },
            { question_number: 29, question_text: "The students found watching Romeo and Juliet in another language", options: { A: "frustrating.", B: "demanding.", C: "moving." }, answer: "C", timestamp_seconds: 321 },
            { question_number: 30, question_text: "Why do the students think Shakespeare's plays have such international appeal?", options: { A: "The stories are exciting.", B: "There are recognisable characters.", C: "They can be interpreted in many ways." }, answer: "C", timestamp_seconds: 346 }
          ]
        }
      ]
    },
    {
      part_number: 4,
      part_type: "Academic Lecture",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773917631/ELT_IELTS17_t2_audio4_ypz7rv.mp3",
      questions: "31Ã¢â‚¬â€œ40",
      topic: "The impact of digital technology on the Icelandic language",
      instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
      question_type: "Note Completion",
      transcript: [
        { speaker: "LECTURER", text: "Right, everyone, let's make a start. Over the past few sessions, we've been considering the reasons why some world languages are in decline, and today I'm going to introduce another factor that affects languages, and the speakers of those languages, and that's technology and, in particular, digital technology. In order to illustrate its effect, I'm going to focus on the Icelandic language, which is spoken by around 321,000 people, most of whom live in Iceland Ã¢â‚¬â€œ an island in the North Atlantic Ocean.", question_number: 31, highlight_text: "spoken by around 321,000 people" },
        { speaker: "LECTURER", text: "The problem for this language is not the number of speakers Ã¢â‚¬â€œ even though this number is small. Nor is it about losing words to other languages, such as English. In fact, the vocabulary of Icelandic is continually increasing because when speakers need a new word for something, they tend to create one, rather than borrowing from another language. All this makes Icelandic quite a special language Ã¢â‚¬â€œ it's changed very little in the past millennium, yet it can handle twenty-first-century concepts related to the use of computers and digital technology. Take, for example, the word for web browser Ã¢â‚¬Â¦ this is vafri in Icelandic, which comes from the verb 'to wander'. I can't think of a more appropriate term because that's exactly what you do mentally when you browse the internet. Then there's an Icelandic word for podcast Ã¢â‚¬â€œ which is too hard to pronounce! And so on.", question_number: 32, highlight_text: "the vocabulary of Icelandic is continually increasing", question_markers: [{ question_number: 32, highlight_text: "the vocabulary of Icelandic is continually increasing" }, { question_number: 33, highlight_text: "an Icelandic word for podcast" }] },
        { speaker: "LECTURER", text: "Icelandic, then, is alive and growing, but Ã¢â‚¬â€œ and it's a big but Ã¢â‚¬â€œ young Icelanders spend a great deal of time in the digital world and this world is predominantly English. Think about smartphones. They didn't even exist until comparatively recently, but today young people use them all the time to read books, watch TV or films, play games, listen to music, and so on.", question_number: 34, highlight_text: "Think about smartphones. They didn" },
        { speaker: "LECTURER", text: "Obviously, this is a good thing in many respects because it promotes their bilingual skills, but the extent of the influence of English in the virtual world is staggering and it's all happening really fast.", question_number: 35, highlight_text: "it promotes their bilingual skills" },
        { speaker: "LECTURER", text: "For their parents and grandparents, the change is less concerning because they already have their native-speaker skills in Icelandic. But for young speakers Ã¢â‚¬â€œ well, the outcome is a little troubling. For example, teachers have found that playground conversations in Icelandic secondary schools can be conducted entirely in English, while teachers of much younger children have reported situations where their classes find it easier to say what is in a picture using English, rather than Icelandic. The very real and worrying consequence of all this is that the young generation in Iceland is at risk of losing its mother tongue.", question_number: 36, highlight_text: "playground conversations in Icelandic secondary schools can be conducted entirely in English", question_markers: [{ question_number: 36, highlight_text: "playground conversations in Icelandic secondary schools can be conducted entirely in English" }, { question_number: 37, highlight_text: "find it easier to say what is in a picture using English, rather than Icelandic" }] },
        { speaker: "LECTURER", text: "Of course, this is happening to other European languages too, but while internet companies might be willing to offer, say, French options in their systems, it's much harder for them to justify the expense of doing the same for a language that has a population the size of a French town, such as Nice. The other drawback of Icelandic is the grammar, which is significantly more complex than in most languages. At the moment, the tech giants are simply not interested in tackling this.", question_number: 38, highlight_text: "the grammar, which is significantly more complex than in most languages" },
        { speaker: "LECTURER", text: "So, what is the Icelandic government doing about this? Well, large sums of money are being allocated to a language technology fund that it is hoped will lead to the development of Icelandic sourced apps and other social media and digital systems, but clearly this is going to be an uphill struggle." },
        { speaker: "LECTURER", text: "On the positive side, they know that Icelandic is still the official language of education and government. It has survived for well over a thousand years and the experts predict that its future in this nation state is sound and will continue to be so. However, there's no doubt that it's becoming an inevitable second choice in young people's lives." },
        { speaker: "LECTURER", text: "This raises important questions. When you consider how much of the past is tied up in a language, will young Icelanders lose their sense of their own identity? Another issue that concerns the government of Iceland is this. If children are learning two languages through different routes, neither of which they are fully fluent in, will they be able to express themselves properly?", question_number: 39, highlight_text: "will young Icelanders lose their sense of their own identity", question_markers: [{ question_number: 39, highlight_text: "will young Icelanders lose their sense of their own identity" }, { question_number: 40, highlight_text: "neither of which they are fully fluent in" }] }
      ],
      content: [
        {
          heading: "The Icelandic language",
          points: [
            { question_number: 31, text: "has approximately 31 .............................. speakers", answer: "321,000", timestamp_seconds: 96 },
            { question_number: 32, text: "has a 32 .............................. that is still growing", answer: "vocabulary", timestamp_seconds: 121 },
            { text: "has not changed a lot over the last thousand years" },
            { question_number: 33, text: "has its own words for computer-based concepts, such as web browser and 33 ..............................", answer: "podcast", timestamp_seconds: 162 }
          ]
        },
        {
          heading: "Young speakers",
          points: [
            { question_number: 34, text: "are big users of digital technology, such as 34 ..............................", answer: "smartphones", timestamp_seconds: 180 },
            { question_number: 35, text: "are becoming 35 .............................. very quickly", answer: "bilingual", timestamp_seconds: 195 },
            { question_number: 36, text: "are having discussions using only English while they are in the 36 .............................. at school", answer: "playground", timestamp_seconds: 221 },
            { question_number: 37, text: "are better able to identify the content of a 37 .............................. in English than Icelandic", answer: "picture", timestamp_seconds: 239 }
          ]
        },
        {
          heading: "Technology and internet companies",
          points: [
            { question_number: 38, text: "write very little in Icelandic because of the small number of speakers and because of how complicated its 38 .............................. is", answer: "grammar", timestamp_seconds: 271 }
          ]
        },
        {
          heading: "The Icelandic government",
          points: [
            { text: "has set up a fund to support the production of more digital content in the language" },
            { text: "believes that Icelandic has a secure future" },
            { question_number: 39, text: "is worried that young Icelanders may lose their 39 .............................. as Icelanders", answer: "identity", timestamp_seconds: 326 },
            { question_number: 40, text: "is worried about the consequences of children not being 40 .............................. in either Icelandic or English", answer: "fluent", timestamp_seconds: 337 }
          ]
        }
      ]
    }
  ]
};


const cambridgeIelts17ListeningTest3Questions = {
  "test_title": "Test 3",
  "section": "Listening",
  "parts": [
    {
      "part_number": 1,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio1_cvxzfz.mp3",
      "questions": "1Ã¢â‚¬â€œ10",
      "question_groups": [
        {
          "questions": "1Ã¢â‚¬â€œ10",
          "instructions": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
          "topic": "Advice on surfing holidays",
          "question_type": "Note Completion",
          "content": [
            {
              "heading": "JackÃ¢â‚¬â„¢s advice",
              "points": [
                {
                  "question_number": 1,
                  "text": "Recommends surfing for 1 .............................. holidays in the summer",
                  "answer": "family"
                },
                {
                  "question_number": 2,
                  "text": "Need to be quite 2 ..............................",
                  "answer": "fit"
                }
              ]
            },
            {
              "heading": "Irish surfing locations",
              "points": [
                {
                  "text": "County Clare"
                },
                {
                  "question_number": 3,
                  "text": "Lahinch has some good quality 3 .............................. and surf schools",
                  "answer": "hotels"
                },
                {
                  "text": "There are famous cliffs nearby"
                },
                {
                  "text": "County Mayo"
                },
                {
                  "question_number": 4,
                  "text": "Good surf school at 4 .............................. beach",
                  "answer": "Carrowniskey"
                },
                {
                  "question_number": 5,
                  "text": "Surf camp lasts for one 5 ..............................",
                  "answer": "week"
                },
                {
                  "question_number": 6,
                  "text": "Can also explore the local 6 .............................. by kayak",
                  "answer": "bay"
                }
              ]
            },
            {
              "heading": "Weather",
              "points": [
                {
                  "question_number": 7,
                  "text": "Best month to go: 7 ..............................",
                  "answer": "September"
                },
                {
                  "question_number": 8,
                  "text": "Average temperature in summer: approx. 8 .............................. degrees",
                  "answer": "19 / nineteen"
                }
              ]
            },
            {
              "heading": "Costs",
              "points": [
                {
                  "text": "Equipment"
                },
                {
                  "question_number": 9,
                  "text": "Wetsuit and surfboard: 9 .............................. euros per day",
                  "answer": "30 / thirty"
                },
                {
                  "question_number": 10,
                  "text": "Also advisable to hire 10 .............................. for warmth",
                  "answer": "boots"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "part_number": 2,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio2_vedume.mp3",
      "questions": "11Ã¢â‚¬â€œ20",
      "question_groups": [
        {
          "questions": "11 and 12",
          "instructions": "Choose TWO letters, AÃ¢â‚¬â€œE.",
          "question_type": "Multiple Choice (more than one answer)",
          "items": [
            {
              "question_numbers": [
                11,
                12
              ],
              "question_text": "Which TWO facts are given about the schoolÃ¢â‚¬â„¢s extended hours childcare service?",
              "options": {
                "A": "It started recently.",
                "B": "More children attend after school than before school.",
                "C": "An average of 50 children attend in the mornings.",
                "D": "A child cannot attend both the before and after school sessions.",
                "E": "The maximum number of children who can attend is 70."
              },
              "answer": [
                "B",
                "E"
              ],
              "grading_note": "IN EITHER ORDER"
            }
          ]
        },
        {
          "questions": "13Ã¢â‚¬â€œ15",
          "instructions": "Choose the correct letter, A, B or C.",
          "question_type": "Multiple Choice (one answer)",
          "items": [
            {
              "question_number": 13,
              "question_text": "How much does childcare cost for a complete afternoon session per child?",
              "options": {
                "A": "Ã‚Â£3.50",
                "B": "Ã‚Â£5.70",
                "C": "Ã‚Â£7.20"
              },
              "answer": "C"
            },
            {
              "question_number": 14,
              "question_text": "What does the manager say about food?",
              "options": {
                "A": "Children with allergies should bring their own food.",
                "B": "Children may bring healthy snacks with them.",
                "C": "Children are given a proper meal at 5 p.m."
              },
              "answer": "C"
            },
            {
              "question_number": 15,
              "question_text": "What is different about arrangements in the school holidays?",
              "options": {
                "A": "Children from other schools can attend.",
                "B": "Older children can attend.",
                "C": "A greater number of children can attend."
              },
              "answer": "A"
            }
          ]
        },
        {
          "questions": "16Ã¢â‚¬â€œ20",
          "instructions": "What information is given about each of the following activities on offer?\n\nChoose FIVE answers from the box and write the correct letter, AÃ¢â‚¬â€œG, next to Questions 16Ã¢â‚¬â€œ20.",
          "question_type": "Matching",
          "options_box": {
            "title": "Information",
            "options": {
              "A": "has limited availability",
              "B": "is no longer available",
              "C": "is for over 8s only",
              "D": "requires help from parents",
              "E": "involves an additional fee",
              "F": "is a new activity",
              "G": "was requested by children"
            }
          },
          "items": [
            {
              "question_number": 16,
              "prompt": "Spanish",
              "answer": "E"
            },
            {
              "question_number": 17,
              "prompt": "Music",
              "answer": "D"
            },
            {
              "question_number": 18,
              "prompt": "Painting",
              "answer": "G"
            },
            {
              "question_number": 19,
              "prompt": "Yoga",
              "answer": "F"
            },
            {
              "question_number": 20,
              "prompt": "Cooking",
              "answer": "C"
            }
          ]
        }
      ]
    },
    {
      "part_number": 3,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio3_hvwu9u.mp3",
      "questions": "21Ã¢â‚¬â€œ30",
      "topic": "HollyÃ¢â‚¬â„¢s Work Placement Tutorial",
      "question_groups": [
        {
          "questions": "21Ã¢â‚¬â€œ24",
          "instructions": "Choose the correct letter, A, B or C.",
          "question_type": "Multiple Choice (one answer)",
          "items": [
            {
              "question_number": 21,
              "question_text": "Holly has chosen the Orion Stadium placement because",
              "options": {
                "A": "it involves children.",
                "B": "it is outdoors.",
                "C": "it sounds like fun."
              },
              "answer": "B"
            },
            {
              "question_number": 22,
              "question_text": "Which aspect of safety does Dr Green emphasise most?",
              "options": {
                "A": "ensuring children stay in the stadium",
                "B": "checking the equipment children will use",
                "C": "removing obstacles in changing rooms"
              },
              "answer": "A"
            },
            {
              "question_number": 23,
              "question_text": "What does Dr Green say about the spectators?",
              "options": {
                "A": "They can be hard to manage.",
                "B": "They make useful volunteers.",
                "C": "They shouldnÃ¢â‚¬â„¢t take photographs."
              },
              "answer": "A"
            },
            {
              "question_number": 24,
              "question_text": "What has affected the schedule in the past?",
              "options": {
                "A": "bad weather",
                "B": "an injury",
                "C": "extra time"
              },
              "answer": "B"
            }
          ]
        },
        {
          "questions": "25Ã¢â‚¬â€œ30",
          "instructions": "What do Holly and her tutor agree is an important aspect of each of the following events management skills?\n\nChoose SIX answers from the box and write the correct letter, AÃ¢â‚¬â€œH, next to Questions 25Ã¢â‚¬â€œ30.",
          "question_type": "Matching",
          "options_box": {
            "title": "Important aspects",
            "options": {
              "A": "being flexible",
              "B": "focusing on details",
              "C": "having a smart appearance",
              "D": "hiding your emotions",
              "E": "relying on experts",
              "F": "trusting your own views",
              "G": "doing one thing at a time",
              "H": "thinking of the future"
            }
          },
          "items": [
            {
              "question_number": 25,
              "prompt": "Communication",
              "answer": "C"
            },
            {
              "question_number": 26,
              "prompt": "Organisation",
              "answer": "A"
            },
            {
              "question_number": 27,
              "prompt": "Time management",
              "answer": "D"
            },
            {
              "question_number": 28,
              "prompt": "Creativity",
              "answer": "B"
            },
            {
              "question_number": 29,
              "prompt": "Leadership",
              "answer": "F"
            },
            {
              "question_number": 30,
              "prompt": "Networking",
              "answer": "H"
            }
          ]
        }
      ]
    },
    {
      "part_number": 4,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio4_n7sbsh.mp3",
      "questions": "31Ã¢â‚¬â€œ40",
      "question_groups": [
        {
          "questions": "31Ã¢â‚¬â€œ40",
          "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
          "topic": "Bird Migration Theory",
          "question_type": "Note Completion",
          "content": [
            {
              "heading": "",
              "points": [
                {
                  "text": "Most birds are believed to migrate seasonally."
                }
              ]
            },
            {
              "heading": "Hibernation theory",
              "points": [
                {
                  "question_number": 31,
                  "text": "It was believed that birds hibernated underwater or buried themselves in 31 ..............................",
                  "answer": "mud"
                },
                {
                  "text": "This theory was later disproved by experiments on caged birds."
                }
              ]
            },
            {
              "heading": "Transmutation theory",
              "points": [
                {
                  "text": "Aristotle believed birds changed from one species into another in summer and winter."
                },
                {
                  "question_number": 32,
                  "text": "In autumn he observed that redstarts experience the loss of 32 .............................. and thought they then turned into robins.",
                  "answer": "feathers"
                },
                {
                  "question_number": 33,
                  "text": "AristotleÃ¢â‚¬â„¢s assumptions were logical because the two species of birds had a similar 33 ..............................",
                  "answer": "shape"
                }
              ]
            },
            {
              "heading": "17th century",
              "points": [
                {
                  "question_number": 34,
                  "text": "Charles Morton popularised the idea that birds fly to the 34 .............................. in winter.",
                  "answer": "moon"
                }
              ]
            },
            {
              "heading": "Scientific developments",
              "points": [
                {
                  "question_number": 35,
                  "text": "In 1822, a stork was killed in Germany which had an African spear in its 35 ..............................",
                  "answer": "neck"
                },
                {
                  "question_number": 36,
                  "text": "previously there had been no 36 .............................. that storks migrate to Africa",
                  "answer": "evidence"
                },
                {
                  "question_number": 37,
                  "text": "Little was known about the 37 .............................. and journeys of migrating birds until the practice of ringing was established.",
                  "answer": "destinations"
                },
                {
                  "question_number": 38,
                  "text": "It was thought large birds carried small birds on some journeys because they were considered incapable of travelling across huge 38 ..............................",
                  "answer": "oceans"
                },
                {
                  "question_number": 39,
                  "text": "Ringing depended on what is called the 39 Ã¢â‚¬Ëœ..............................Ã¢â‚¬â„¢ of dead birds.",
                  "answer": "recovery"
                },
                {
                  "question_number": 40,
                  "text": "In 1931, the first 40 .............................. to show the migration of European birds was printed.",
                  "answer": "atlas"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const cambridgeIelts17ListeningTest4Questions = {
  "test_title": "Test 4",
  "section": "Listening",
  "parts": [
    {
      "part_number": 1,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773923257/IELTS17_t4_audio1_cbp8q6.mp3",
      "questions": "1Ã¢â‚¬â€œ10",
      "question_groups": [
        {
          "questions": "1Ã¢â‚¬â€œ10",
          "instructions": "Complete the notes below. Write ONE WORD for each answer.",
          "topic": "Easy Life Cleaning Services",
          "question_type": "Note Completion",
          "content": [
            {
              "heading": "Basic cleaning package offered",
              "points": [
                {
                  "text": "Cleaning all surfaces"
                },
                {
                  "question_number": 1,
                  "text": "Cleaning the 1 .............................. throughout the apartment",
                  "answer": "floor(s)"
                },
                {
                  "text": "Cleaning shower, sinks, toilet etc."
                }
              ]
            },
            {
              "heading": "Additional services agreed",
              "points": [
                {
                  "text": "Every week"
                },
                {
                  "question_number": 2,
                  "text": "Cleaning the 2 ..............................",
                  "answer": "fridge"
                },
                {
                  "question_number": 3,
                  "text": "Ironing clothes Ã¢â‚¬â€œ 3 .............................. only",
                  "answer": "shirts"
                },
                {
                  "text": "Every month"
                },
                {
                  "question_number": 4,
                  "text": "Cleaning all the 4 .............................. from the inside",
                  "answer": "windows"
                },
                {
                  "question_number": 5,
                  "text": "Washing down the 5 ..............................",
                  "answer": "balcony"
                }
              ]
            },
            {
              "heading": "Other possibilities",
              "points": [
                {
                  "question_number": 6,
                  "text": "They can organise a plumber or an 6 .............................. if necessary.",
                  "answer": "electrician"
                },
                {
                  "question_number": 7,
                  "text": "A special cleaning service is available for customers who are allergic to 7 .............................. .",
                  "answer": "dust"
                }
              ]
            },
            {
              "heading": "Information on the cleaners",
              "points": [
                {
                  "question_number": 8,
                  "text": "Before being hired, all cleaners have a background check carried out by the 8 .............................. .",
                  "answer": "police"
                },
                {
                  "text": "References are required."
                },
                {
                  "question_number": 9,
                  "text": "All cleaners are given 9 .............................. for two weeks.",
                  "answer": "training"
                },
                {
                  "question_number": 10,
                  "text": "Customers send a 10 .............................. after each visit.",
                  "answer": "review"
                },
                {
                  "text": "Usually, each customer has one regular cleaner."
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "part_number": 2,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773923262/ELT_IELTS17_t4_audio2_yt1v8e.mp3",
      "questions": "11Ã¢â‚¬â€œ20",
      "question_groups": [
        {
          "questions": "11Ã¢â‚¬â€œ14",
          "instructions": "Choose the correct letter, A, B or C.",
          "question_type": "Multiple Choice (one answer)",
          "items": [
            {
              "question_number": 11,
              "question_text": "Many hotel managers are unaware that their staff often leave because of",
              "options": {
                "A": "a lack of training.",
                "B": "long hours.",
                "C": "low pay."
              },
              "answer": "A"
            },
            {
              "question_number": 12,
              "question_text": "What is the impact of high staff turnover on managers?",
              "options": {
                "A": "an increased workload",
                "B": "low morale",
                "C": "an inability to meet targets"
              },
              "answer": "A"
            },
            {
              "question_number": 13,
              "question_text": "What mistake should managers always avoid?",
              "options": {
                "A": "failing to treat staff equally",
                "B": "reorganising shifts without warning",
                "C": "neglecting to have enough staff during busy periods"
              },
              "answer": "A"
            },
            {
              "question_number": 14,
              "question_text": "What unexpected benefit did Dunwich Hotel notice after improving staff retention rates?",
              "options": {
                "A": "a fall in customer complaints",
                "B": "an increase in loyalty club membership",
                "C": "a rise in spending per customer"
              },
              "answer": "C"
            }
          ]
        },
        {
          "questions": "15Ã¢â‚¬â€œ20",
          "instructions": "Which way of reducing staff turnover was used in each of the following hotels?\n\nWrite the correct letter, A, B or C, next to Questions 15Ã¢â‚¬â€œ20.",
          "question_type": "Matching",
          "options_box": {
            "title": "Ways of reducing staff turnover",
            "options": {
              "A": "improving relationships and teamwork",
              "B": "offering incentives and financial benefits",
              "C": "providing career opportunities"
            }
          },
          "items": [
            {
              "question_number": 15,
              "prompt": "The Sun Club",
              "answer": "A"
            },
            {
              "question_number": 16,
              "prompt": "The Portland",
              "answer": "C"
            },
            {
              "question_number": 17,
              "prompt": "Bluewater Hotels",
              "answer": "B"
            },
            {
              "question_number": 18,
              "prompt": "Pentlow Hotels",
              "answer": "C"
            },
            {
              "question_number": 19,
              "prompt": "Green Planet",
              "answer": "B"
            },
            {
              "question_number": 20,
              "prompt": "The Amesbury",
              "answer": "A"
            }
          ]
        }
      ]
    },
    {
      "part_number": 3,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773923258/ELT_IELTS17_t4_audio3_mggdln.mp3",
      "questions": "21Ã¢â‚¬â€œ30",
      "question_groups": [
        {
          "questions": "21 and 22",
          "instructions": "Choose TWO letters, AÃ¢â‚¬â€œE.",
          "question_type": "Multiple Choice (more than one answer)",
          "items": [
            {
              "question_numbers": [
                21,
                22
              ],
              "question_text": "Which TWO points do Thomas and Jeanne make about ThomasÃ¢â‚¬â„¢s sporting activities at school?",
              "options": {
                "A": "He should have felt more positive about them.",
                "B": "The training was too challenging for him.",
                "C": "He could have worked harder at them.",
                "D": "His parents were disappointed in him.",
                "E": "His fellow students admired him."
              },
              "answer": [
                "C",
                "E"
              ],
              "grading_note": "IN EITHER ORDER"
            }
          ]
        },
        {
          "questions": "23 and 24",
          "instructions": "Choose TWO letters, AÃ¢â‚¬â€œE.",
          "question_type": "Multiple Choice (more than one answer)",
          "items": [
            {
              "question_numbers": [
                23,
                24
              ],
              "question_text": "Which TWO feelings did Thomas experience when he was in Kenya?",
              "options": {
                "A": "disbelief",
                "B": "relief",
                "C": "stress",
                "D": "gratitude",
                "E": "homesickness"
              },
              "answer": [
                "A",
                "D"
              ],
              "grading_note": "IN EITHER ORDER"
            }
          ]
        },
        {
          "questions": "25Ã¢â‚¬â€œ30",
          "instructions": "What comment do the students make about the development of each of the following items of sporting equipment?\n\nChoose SIX answers from the box and write the correct letter, AÃ¢â‚¬â€œH, next to Questions 25Ã¢â‚¬â€œ30.",
          "question_type": "Matching",
          "options_box": {
            "title": "Comments about the development of the equipment",
            "options": {
              "A": "It could cause excessive sweating.",
              "B": "The material was being mass produced for another purpose.",
              "C": "People often needed to make their own.",
              "D": "It often had to be replaced.",
              "E": "The material was expensive.",
              "F": "It was unpopular among spectators.",
              "G": "It caused injuries.",
              "H": "No one using it liked it at first."
            }
          },
          "items": [
            {
              "question_number": 25,
              "prompt": "the table tennis bat",
              "answer": "B"
            },
            {
              "question_number": 26,
              "prompt": "the cricket helmet",
              "answer": "F"
            },
            {
              "question_number": 27,
              "prompt": "the cycle helmet",
              "answer": "A"
            },
            {
              "question_number": 28,
              "prompt": "the golf club",
              "answer": "D"
            },
            {
              "question_number": 29,
              "prompt": "the hockey stick",
              "answer": "C"
            },
            {
              "question_number": 30,
              "prompt": "the football",
              "answer": "G"
            }
          ]
        }
      ]
    },
    {
      "part_number": 4,
      "audio_url": "https://res.cloudinary.com/dalaaegob/video/upload/v1773923264/ELT_IELTS17_t4_audio4_kyhuxj.mp3",
      "questions": "31Ã¢â‚¬â€œ40",
      "question_groups": [
        {
          "questions": "31Ã¢â‚¬â€œ40",
          "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
          "topic": "Maple syrup",
          "question_type": "Note Completion",
          "content": [
            {
              "heading": "What is maple syrup?",
              "points": [
                {
                  "text": "made from the sap of the maple tree"
                },
                {
                  "text": "added to food or used in cooking"
                },
                {
                  "question_number": 31,
                  "text": "colour described as 31 ..............................",
                  "answer": "golden"
                },
                {
                  "question_number": 32,
                  "text": "very 32 .............................. compared to refined sugar",
                  "answer": "healthy"
                }
              ]
            },
            {
              "heading": "The maple tree",
              "points": [
                {
                  "text": "has many species"
                },
                {
                  "text": "needs sunny days and cool nights"
                },
                {
                  "text": "maple leaf has been on the Canadian flag since 1964"
                },
                {
                  "text": "needs moist soil but does not need fertiliser as well"
                },
                {
                  "question_number": 33,
                  "text": "best growing conditions and 33 .............................. are in Canada and North America",
                  "answer": "climate"
                }
              ]
            },
            {
              "heading": "Early maple sugar producers",
              "points": [
                {
                  "text": "made holes in the tree trunks"
                },
                {
                  "question_number": 34,
                  "text": "used hot 34 .............................. to heat the sap",
                  "answer": "rock(s)"
                },
                {
                  "text": "used tree bark to make containers for collection"
                },
                {
                  "text": "sweetened food and drink with sugar"
                }
              ]
            },
            {
              "heading": "TodayÃ¢â‚¬â„¢s maple syrup",
              "subsections": [
                {
                  "subheading": "The trees",
                  "points": [
                    {
                      "question_number": 35,
                      "text": "Tree trunks may not have the correct 35 .............................. until they have been growing for 40 years.",
                      "answer": "diameter"
                    },
                    {
                      "text": "The changing temperature and movement of water within the tree produces the sap."
                    }
                  ]
                },
                {
                  "subheading": "The production",
                  "points": [
                    {
                      "question_number": 36,
                      "text": "A tap is drilled into the trunk and a 36 .............................. carries the sap into a bucket.",
                      "answer": "tube"
                    },
                    {
                      "question_number": 37,
                      "text": "Large pans of sap called evaporators are heated by means of a 37 .............................. .",
                      "answer": "fire"
                    },
                    {
                      "question_number": 38,
                      "text": "A lot of 38 .............................. is produced during the evaporation process.",
                      "answer": "steam"
                    },
                    {
                      "question_number": 39,
                      "text": "Ã¢â‚¬ËœSugar sandÃ¢â‚¬â„¢ is removed because it makes the syrup look 39 .............................. and affects the taste.",
                      "answer": "cloudy"
                    },
                    {
                      "text": "The syrup is ready for use."
                    },
                    {
                      "question_number": 40,
                      "text": "A huge quantity of sap is needed to make a 40 .............................. of maple syrup.",
                      "answer": "litre / liter"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

async function upsertCambridgeExam(params: {
  title: string;
  type: "LISTENING" | "READING" | "WRITING" | "SPEAKING" | "FULL_TEST" | "PRACTICE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  durationMinutes: number;
  imageUrl?: string;
  questions: any;
  isPublished: boolean;
}) {
  const existing = await prisma.exam.findFirst({
    where: { title: params.title, type: params.type as any },
    select: { id: true },
  });

  if (existing) {
    await prisma.exam.update({
      where: { id: existing.id },
      data: {
        difficulty: params.difficulty as any,
        duration: params.durationMinutes,
        imageUrl: params.imageUrl,
        questions: params.questions,
        isPublished: params.isPublished,
      },
    });
    console.log(`  Ã¢Å“â€œ Updated exam: ${params.title}`);
    return;
  }

  await prisma.exam.create({
    data: {
      title: params.title,
      description: null,
      imageUrl: params.imageUrl,
      type: params.type as any,
      difficulty: params.difficulty as any,
      duration: params.durationMinutes,
      questions: params.questions,
      isPublished: params.isPublished,
    },
  });
  console.log(`  Ã¢Å“â€œ Created exam: ${params.title}`);
}

// ============================================================
// VOCABULARY DATA - 4000 Essential English Words
// ============================================================

const unit1Words = [
  { word: 'afraid', meaning: 'feeling fear', ipa: '/Ã‰â„¢Ã‹Ë†freÃ‰Âªd/', partOfSpeech: 'adj', example: 'The woman was afraid of what she saw.', imageUrl: 'https://img.freepik.com/free-photo/portrait-young-scared-asian-woman-looking-camera_171337-1496.jpg', order: 1 },
  { word: 'agree', meaning: 'to say yes or to think the same way', ipa: '/Ã‰â„¢Ã‹Ë†Ã‰Â¡riÃ‹Â/', partOfSpeech: 'v', example: 'I agree with you.', order: 2 },
  { word: 'angry', meaning: 'feeling upset or mad', ipa: '/Ã‹Ë†ÃƒÂ¦Ã…â€¹Ã‰Â¡ri/', partOfSpeech: 'adj', example: 'The lion was angry when the rabbit arrived late.', order: 3 },
  { word: 'arrive', meaning: 'to reach a place', ipa: '/Ã‰â„¢Ã‹Ë†raÃ‰Âªv/', partOfSpeech: 'v', example: 'The bus will arrive soon.', order: 4 },
  { word: 'attack', meaning: 'to try to fight or hurt', ipa: '/Ã‰â„¢Ã‹Ë†tÃƒÂ¦k/', partOfSpeech: 'v', example: 'The lion jumped into the well to attack.', order: 5 },
  { word: 'bottom', meaning: 'the lowest part', ipa: '/Ã‹Ë†bÃ‰â€™tÃ‰â„¢m/', partOfSpeech: 'n', example: 'The lion lives at the bottom of the well.', order: 6 },
  { word: 'clever', meaning: 'smart or intelligent', ipa: '/Ã‹Ë†klevÃ‰â„¢r/', partOfSpeech: 'adj', example: 'The rabbit was very clever.', order: 7 },
  { word: 'cruel', meaning: 'bad or hurting others', ipa: '/Ã‹Ë†kruÃ‹ÂÃ‰â„¢l/', partOfSpeech: 'adj', example: 'A cruel lion lived in the forest.', order: 8 },
  { word: 'finally', meaning: 'at last or at the end', ipa: '/Ã‹Ë†faÃ‰ÂªnÃ‰â„¢li/', partOfSpeech: 'adv', example: 'Finally, it was the rabbit\'s turn.', order: 9 },
  { word: 'hide', meaning: 'to not let others see', ipa: '/haÃ‰Âªd/', partOfSpeech: 'v', example: 'I was hiding from another lion.', order: 10 },
  { word: 'hunt', meaning: 'to look for animals to kill', ipa: '/hÃŠÅ’nt/', partOfSpeech: 'v', example: 'You don\'t have to hunt and kill us.', order: 11 },
  { word: 'lot', meaning: 'a large amount', ipa: '/lÃ‰â€™t/', partOfSpeech: 'n', example: 'He killed a lot of animals.', order: 12 },
  { word: 'middle', meaning: 'the center of something', ipa: '/Ã‹Ë†mÃ‰Âªdl/', partOfSpeech: 'n', example: 'The well was in the middle of the forest.', order: 13 },
  { word: 'moment', meaning: 'a very short time', ipa: '/Ã‹Ë†moÃŠÅ mÃ‰â„¢nt/', partOfSpeech: 'n', example: 'Without waiting another moment, the lion jumped.', order: 14 },
  { word: 'pleased', meaning: 'feeling happy', ipa: '/pliÃ‹Âzd/', partOfSpeech: 'adj', example: 'All animals were pleased with the rabbit.', order: 15 },
  { word: 'promise', meaning: 'to say you will do something', ipa: '/Ã‹Ë†prÃ‰â€™mÃ‰Âªs/', partOfSpeech: 'v', example: 'If you promise to eat only one animal each day.', order: 16 },
  { word: 'reply', meaning: 'to answer', ipa: '/rÃ‰ÂªÃ‹Ë†plaÃ‰Âª/', partOfSpeech: 'v', example: 'The rabbit replied, "I will show you."', order: 17 },
  { word: 'safe', meaning: 'not in danger', ipa: '/seÃ‰Âªf/', partOfSpeech: 'adj', example: 'All the other animals were safe.', order: 18 },
  { word: 'trick', meaning: 'a clever idea to fool someone', ipa: '/trÃ‰Âªk/', partOfSpeech: 'n', example: 'They were pleased with the rabbit\'s clever trick.', order: 19 },
  { word: 'well', meaning: 'a deep hole with water', ipa: '/wel/', partOfSpeech: 'n', example: 'The rabbit led the lion to an old well.', order: 20 },
];

const unit1Exercises = [
  { question: 'bad or hurting others', answer: 'cruel', options: ['afraid', 'clever', 'cruel', 'hunt'], order: 1 },
  { question: 'at last or at the end', answer: 'finally', options: ['angry', 'clever', 'finally', 'reply'], order: 2 },
  { question: 'to try to fight or hurt', answer: 'attack', options: ['attack', 'middle', 'pleased', 'trick'], order: 3 },
  { question: 'to not let others see', answer: 'hide', options: ['agree', 'hide', 'safe', 'well'], order: 4 },
  { question: 'the lowest part', answer: 'bottom', options: ['bottom', 'lot', 'moment', 'promise'], order: 5 },
];

const unit1Questions = [
  { question: 'What is this story about?', type: 'multiple_choice', options: ['How a clever rabbit tricked a cruel lion.', 'How rabbits learned to hide from lions.', 'How a rabbit pleased an angry lion.', 'How to be safe when you hunt in the forest.'], answer: 'How a clever rabbit tricked a cruel lion.', order: 1 },
  { question: 'What did all the animals say to the lion?', type: 'multiple_choice', options: ['They said they wanted him to be their king.', 'They said that the rabbit would be there in a moment.', 'They said that they would allow him to eat one of them a day.', 'They said that they would hide at the bottom of the well.'], answer: 'They said that they would allow him to eat one of them a day.', order: 2 },
  { question: 'Why did the rabbit take the lion to the well in the middle of the forest?', type: 'multiple_choice', options: ['So a lot of animals could see the rabbit walking with the lion.', 'So the lion could attack the "other" lion.', 'So the lion could drink water.', 'So the other animals would be afraid of the rabbit.'], answer: 'So the lion could attack the "other" lion.', order: 3 },
  { question: 'Which of the following is true at the end of the story?', type: 'multiple_choice', options: ['The lion attacked another lion, and they both got hurt.', 'The lion cannot reply to the rabbit, so the rabbit wins.', 'The lion finally dies.', 'The lion is pleased by the rabbit\'s words, so it does not eat the rabbit.'], answer: 'The lion finally dies.', order: 4 },
  { question: 'What did the lion see when it looked in the well?', type: 'fill_blank', answer: 'his own face', order: 5 },
];

const unit1Story = {
  title: 'The Lion and the Rabbit',
  content: `<p>A <strong>cruel</strong> lion lived in the forest. Every day, he killed and ate a <strong>lot</strong> of animals. The other animals were <strong>afraid</strong> the lion would kill them all.</p>
<p>The animals told the lion, "Let's make a deal. If you <strong>promise</strong> to eat only one animal each day, then one of us will come to you every day. Then you don't have to <strong>hunt</strong> and kill us."</p>
<p>The plan sounded <strong>well</strong> thought-out to the lion, so he <strong>agreed</strong>, but he also said, "If you don't come every day, I <strong>promise</strong> to kill all of you the next day!" Each day after that, one animal went to the lion so that the lion could eat it. Then, all the other animals were <strong>safe</strong>. <strong>Finally</strong>, it was the rabbit's turn to go to the lion. The rabbit went very slowly that day, so the lion was <strong>angry</strong> when the rabbit <strong>finally</strong> arrived.</p>
<p>The lion angrily asked the rabbit, "Why are you late?"</p>
<p>"I was <strong>hiding</strong> from another lion in the forest. That lion said he was the king, so I was <strong>afraid</strong>."</p>
<p>The lion told the rabbit, "I am the only king here! Take me to that other lion, and I will kill him."</p>
<p>The rabbit <strong>replied</strong>, "I will be happy to show you where he lives."</p>
<p>The rabbit led the lion to an old well in the <strong>middle</strong> of the forest. The well was very deep with water at the <strong>bottom</strong>. The rabbit told the lion, "Look in there. The lion lives at the <strong>bottom</strong>."</p>
<p>When the lion looked in the well, he could see his own face in the water. He thought that was the other lion. Without waiting another <strong>moment</strong>, the lion jumped into the well to <strong>attack</strong> the other lion. He never came out.</p>
<p>All of the other animals in the forest were very <strong>pleased</strong> with the rabbit's <strong>clever</strong> <strong>trick</strong>.</p>`,
  imageUrl: 'https://img.freepik.com/free-vector/lion-rabbit-forest-scene_1308-41088.jpg',
};

const unit2Words = [
  { word: 'allow', meaning: 'to let someone do something', ipa: '/Ã‰â„¢Ã‹Ë†laÃŠÅ /', partOfSpeech: 'v', example: 'Allow me to help you.', order: 1 },
  { word: 'apart', meaning: 'separated by distance or time', ipa: '/Ã‰â„¢Ã‹Ë†pÃ‰â€˜Ã‹Ârt/', partOfSpeech: 'adv', example: 'The two cities are far apart.', order: 2 },
  { word: 'beside', meaning: 'next to', ipa: '/bÃ‰ÂªÃ‹Ë†saÃ‰Âªd/', partOfSpeech: 'prep', example: 'He sat beside his friend.', order: 3 },
  { word: 'cabinet', meaning: 'a piece of furniture with shelves', ipa: '/Ã‹Ë†kÃƒÂ¦bÃ‰ÂªnÃ‰â„¢t/', partOfSpeech: 'n', example: 'The plates are in the cabinet.', order: 4 },
  { word: 'charge', meaning: 'to ask for money for something', ipa: '/tÃŠÆ’Ã‰â€˜Ã‹ÂrdÃŠâ€™/', partOfSpeech: 'v', example: 'They charge $10 for parking.', order: 5 },
  { word: 'cloth', meaning: 'material used for making clothes', ipa: '/klÃ‰â€™ÃŽÂ¸/', partOfSpeech: 'n', example: 'The cloth is soft.', order: 6 },
  { word: 'compare', meaning: 'to examine for differences', ipa: '/kÃ‰â„¢mÃ‹Ë†peÃ‰â„¢r/', partOfSpeech: 'v', example: 'Compare the two answers.', order: 7 },
  { word: 'contain', meaning: 'to have something inside', ipa: '/kÃ‰â„¢nÃ‹Ë†teÃ‰Âªn/', partOfSpeech: 'v', example: 'The box contains books.', order: 8 },
  { word: 'create', meaning: 'to make something new', ipa: '/kriÃ‹Ë†eÃ‰Âªt/', partOfSpeech: 'v', example: 'Scientists create new medicines.', order: 9 },
  { word: 'electric', meaning: 'powered by electricity', ipa: '/Ã‰ÂªÃ‹Ë†lektrÃ‰Âªk/', partOfSpeech: 'adj', example: 'The car is electric.', order: 10 },
  { word: 'experiment', meaning: 'a test to find out something', ipa: '/Ã‰ÂªkÃ‹Ë†sperÃ‰ÂªmÃ‰â„¢nt/', partOfSpeech: 'n', example: 'The experiment was successful.', order: 11 },
  { word: 'include', meaning: 'to have as part of a group', ipa: '/Ã‰ÂªnÃ‹Ë†kluÃ‹Âd/', partOfSpeech: 'v', example: 'The price includes breakfast.', order: 12 },
  { word: 'knife', meaning: 'a tool for cutting', ipa: '/naÃ‰Âªf/', partOfSpeech: 'n', example: 'Use a sharp knife.', order: 13 },
  { word: 'laboratory', meaning: 'a room for scientific work', ipa: '/lÃ‰â„¢Ã‹Ë†bÃ‰â€™rÃ‰â„¢tri/', partOfSpeech: 'n', example: 'They work in a laboratory.', order: 14 },
  { word: 'liquid', meaning: 'something that flows like water', ipa: '/Ã‹Ë†lÃ‰ÂªkwÃ‰Âªd/', partOfSpeech: 'n', example: 'Water is a liquid.', order: 15 },
  { word: 'measure', meaning: 'to find the size or amount', ipa: '/Ã‹Ë†meÃŠâ€™Ã‰â„¢r/', partOfSpeech: 'v', example: 'Measure the length.', order: 16 },
  { word: 'medicine', meaning: 'something to treat illness', ipa: '/Ã‹Ë†medÃ‰Âªsn/', partOfSpeech: 'n', example: 'Take the medicine three times a day.', order: 17 },
  { word: 'pour', meaning: 'to make liquid flow', ipa: '/pÃ‰â€Ã‹Âr/', partOfSpeech: 'v', example: 'Pour the water into the glass.', order: 18 },
  { word: 'prove', meaning: 'to show something is true', ipa: '/pruÃ‹Âv/', partOfSpeech: 'v', example: 'Can you prove it?', order: 19 },
  { word: 'smooth', meaning: 'having an even surface', ipa: '/smuÃ‹ÂÃƒÂ°/', partOfSpeech: 'adj', example: 'The table is smooth.', order: 20 },
];

const unit2Exercises = [
  { question: 'a room for scientific work', answer: 'laboratory', options: ['cabinet', 'laboratory', 'medicine', 'liquid'], order: 1 },
  { question: 'to make something new', answer: 'create', options: ['allow', 'compare', 'create', 'prove'], order: 2 },
  { question: 'something that flows like water', answer: 'liquid', options: ['cloth', 'liquid', 'knife', 'charge'], order: 3 },
  { question: 'a test to find out something', answer: 'experiment', options: ['apart', 'beside', 'experiment', 'smooth'], order: 4 },
  { question: 'to find the size or amount', answer: 'measure', options: ['contain', 'include', 'measure', 'pour'], order: 5 },
];

const vocabularyBooks = [
  {
    name: "4000 essential English words book 1",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_1_axjltv.png",
    wordCount: 600,
    order: 1,
    units: [
      { title: "The Lion and the Rabbit", order: 1, words: unit1Words, exercises: unit1Exercises, questions: unit1Questions, story: unit1Story },
      { title: "The Laboratory", order: 2, words: unit2Words, exercises: unit2Exercises, questions: [], story: null },
      { title: "The Report", order: 3 },
      { title: "The Dog's Bell", order: 4 },
      { title: "The Jackal and the Sun Child", order: 5 },
      { title: "The Friendly Ghost", order: 6 },
    ],
  },
  {
    name: "4000 essential English words book 2",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab-2_zpuyp9.png",
    wordCount: 600,
    order: 2,
    units: [
      { title: "The Twelve Months", order: 1 },
      { title: "The Dragon", order: 2 },
      { title: "The Battle of Thermopylae", order: 3 },
      { title: "The Deer and His Image", order: 4 },
      { title: "May 29, 1953", order: 5 },
      { title: "The Frog Prince", order: 6 },
    ],
  },
  {
    name: "4000 essential English words book 3",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_3_gt3hcu.png",
    wordCount: 600,
    order: 3,
    units: [
      { title: "The Real St. Nick", order: 1 },
      { title: "The Shepherd and the Wild Sheep", order: 2 },
      { title: "The Boy and his Sled", order: 3 },
      { title: "Tiny Tina", order: 4 },
      { title: "Trick-or-treat!", order: 5 },
      { title: "The Senator and the Worm", order: 6 },
    ],
  },
  {
    name: "4000 essential English words book 4",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab_4_dujqob.png",
    wordCount: 600,
    order: 4,
    units: [
      { title: "The History of Chocolate", order: 1 },
      { title: "Monkey Island", order: 2 },
      { title: "The Young Man and the Old Man", order: 3 },
      { title: "The Tricky Fox", order: 4 },
      { title: "The Magic Computer", order: 5 },
      { title: "Jack Frost and the Pudding", order: 6 },
    ],
  },
  {
    name: "4000 essential English words book 5",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_5_uxrn7b.png",
    wordCount: 600,
    order: 5,
    units: [
      { title: "The Little Mice", order: 1 },
      { title: "The Helpful Abbey", order: 2 },
      { title: "The Bachelor's Lesson", order: 3 },
      { title: "The Corrupt Administrator", order: 4 },
      { title: "A Famous Accident", order: 5 },
      { title: "The Island", order: 6 },
    ],
  },
  {
    name: "4000 essential English words book 6",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774254/vocab_6_rf9ub1.png",
    wordCount: 600,
    order: 6,
    units: [
      { title: "The North Star", order: 1 },
      { title: "The Fossil Hunters", order: 2 },
      { title: "Dressed to Excess", order: 3 },
      { title: "The Butler's Bad Day", order: 4 },
      { title: "A Bet", order: 5 },
      { title: "Amazing Komodo Dragons", order: 6 },
    ],
  },
];

const grammarBooks = [
  {
    slug: "elementary",
    name: "Essential Grammar in Use",
    author: "Raymond Murphy",
    level: "Elementary",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_1_axjltv.png",
    color: "#EF4444",
    unitCount: 115,
    units: [
      { title: "am/is/are", order: 1 },
      { title: "am/is/are (questions)", order: 2 },
      { title: "I am doing (present continuous)", order: 3 },
      { title: "are you doing? (present continuous questions)", order: 4 },
      { title: "I do/work/like etc. (present simple)", order: 5 },
      { title: "I don't ... (present simple negative)", order: 6 },
      { title: "Do you ...? (present simple questions)", order: 7 },
      { title: "I am doing and I do (present continuous vs present simple)", order: 8 },
      { title: "I have ... and I've got ...", order: 9 },
      { title: "was/were", order: 10 },
    ],
  },
  {
    slug: "intermediate",
    name: "English Grammar in Use",
    author: "Raymond Murphy",
    level: "Intermediate",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774253/vocab-2_zpuyp9.png",
    color: "#3B82F6",
    unitCount: 145,
    units: [
      { title: "Present continuous (I am doing)", order: 1 },
      { title: "Present simple (I do)", order: 2 },
      { title: "Present continuous and present simple 1", order: 3 },
      { title: "Present continuous and present simple 2", order: 4 },
      { title: "Past simple (I did)", order: 5 },
    ],
  },
  {
    slug: "advanced",
    name: "Advanced Grammar in Use",
    author: "Martin Hewings",
    level: "Advanced",
    imageUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1769774252/vocab_3_gt3hcu.png",
    color: "#15803D",
    unitCount: 105,
    units: [
      { title: "Present continuous and present simple", order: 1 },
      { title: "Present perfect and past simple", order: 2 },
      { title: "Future forms", order: 3 },
    ],
  },
];

const pronunciationSounds = [
  // Monophthongs
  { symbol: "i:", word: "sleep", type: "monophthong", order: 1 },
  { symbol: "Ã‰Âª", word: "slip", type: "monophthong", order: 2 },
  { symbol: "ÃŠÅ ", word: "good", type: "monophthong", order: 3 },
  { symbol: "u:", word: "food", type: "monophthong", order: 4 },
  { symbol: "e", word: "bed", type: "monophthong", order: 5 },
  { symbol: "Ã‰â„¢", word: "teacher", type: "monophthong", order: 6 },
  { symbol: "Ã‰Å“:", word: "bird", type: "monophthong", order: 7 },
  { symbol: "Ã‰â€:", word: "door", type: "monophthong", order: 8 },
  { symbol: "ÃƒÂ¦", word: "cat", type: "monophthong", order: 9 },
  { symbol: "ÃŠÅ’", word: "up", type: "monophthong", order: 10 },
  { symbol: "Ã‰â€˜:", word: "far", type: "monophthong", order: 11 },
  { symbol: "Ã‰â€™", word: "on", type: "monophthong", order: 12 },
  // Diphthongs
  { symbol: "Ã‰ÂªÃ‰â„¢", word: "here", type: "diphthong", order: 1 },
  { symbol: "eÃ‰Âª", word: "wait", type: "diphthong", order: 2 },
  { symbol: "ÃŠÅ Ã‰â„¢", word: "tourist", type: "diphthong", order: 3 },
  { symbol: "Ã‰â€Ã‰Âª", word: "boy", type: "diphthong", order: 4 },
  { symbol: "Ã‰â„¢ÃŠÅ ", word: "show", type: "diphthong", order: 5 },
  { symbol: "eÃ‰â„¢", word: "hair", type: "diphthong", order: 6 },
  { symbol: "aÃ‰Âª", word: "my", type: "diphthong", order: 7 },
  { symbol: "aÃŠÅ ", word: "cow", type: "diphthong", order: 8 },
  // Consonants
  { symbol: "p", word: "pea", type: "consonant", voiced: false, order: 1 },
  { symbol: "b", word: "boat", type: "consonant", voiced: true, order: 2 },
  { symbol: "t", word: "tea", type: "consonant", voiced: false, order: 3 },
  { symbol: "d", word: "dog", type: "consonant", voiced: true, order: 4 },
  { symbol: "ÃŠÂ§", word: "cheese", type: "consonant", voiced: false, order: 5 },
  { symbol: "ÃŠÂ¤", word: "june", type: "consonant", voiced: true, order: 6 },
  { symbol: "k", word: "car", type: "consonant", voiced: false, order: 7 },
  { symbol: "g", word: "go", type: "consonant", voiced: true, order: 8 },
  { symbol: "f", word: "fly", type: "consonant", voiced: false, order: 9 },
  { symbol: "v", word: "video", type: "consonant", voiced: true, order: 10 },
  { symbol: "ÃŽÂ¸", word: "think", type: "consonant", voiced: false, order: 11 },
  { symbol: "ÃƒÂ°", word: "this", type: "consonant", voiced: true, order: 12 },
  { symbol: "s", word: "see", type: "consonant", voiced: false, order: 13 },
  { symbol: "z", word: "zoo", type: "consonant", voiced: true, order: 14 },
  { symbol: "ÃŠÆ’", word: "shall", type: "consonant", voiced: false, order: 15 },
  { symbol: "ÃŠâ€™", word: "television", type: "consonant", voiced: true, order: 16 },
  { symbol: "m", word: "man", type: "consonant", voiced: true, order: 17 },
  { symbol: "n", word: "now", type: "consonant", voiced: true, order: 18 },
  { symbol: "Ã…â€¹", word: "sing", type: "consonant", voiced: true, order: 19 },
  { symbol: "h", word: "hat", type: "consonant", voiced: false, order: 20 },
  { symbol: "l", word: "love", type: "consonant", voiced: true, order: 21 },
  { symbol: "r", word: "red", type: "consonant", voiced: true, order: 22 },
  { symbol: "w", word: "wet", type: "consonant", voiced: true, order: 23 },
  { symbol: "j", word: "yes", type: "consonant", voiced: true, order: 24 },
];

async function main() {
  console.log('Ã°Å¸Å’Â± Seeding database with comprehensive vocabulary data...');

  // Clear existing data
  console.log('Ã°Å¸â€”â€˜Ã¯Â¸Â  Clearing existing data...');
  await prisma.vocabularyProgress.deleteMany();
  await prisma.pronunciationSound.deleteMany();
  await prisma.grammarExercise.deleteMany();
  await prisma.grammarUnit.deleteMany();
  await prisma.grammarBook.deleteMany();
  await prisma.vocabularyQuestion.deleteMany();
  await prisma.vocabularyExercise.deleteMany();
  await prisma.vocabularyWord.deleteMany();
  await prisma.vocabularyUnit.deleteMany();
  await prisma.vocabularyBook.deleteMany();

  // Seed Vocabulary Books with full content
  console.log('Ã°Å¸â€œÅ¡ Seeding vocabulary books...');
  for (const book of vocabularyBooks) {
    const createdBook = await prisma.vocabularyBook.create({
      data: {
        name: book.name,
        imageUrl: book.imageUrl,
        wordCount: book.wordCount,
        order: book.order,
      },
    });

    // Create units with words, exercises, questions
    for (const unit of book.units) {
      const createdUnit = await prisma.vocabularyUnit.create({
        data: {
          bookId: createdBook.id,
          title: unit.title,
          order: unit.order,
          storyTitle: (unit as any).story?.title || null,
          storyContent: (unit as any).story?.content || null,
          storyImageUrl: (unit as any).story?.imageUrl || null,
        },
      });

      // Add words
      if ((unit as any).words) {
        await prisma.vocabularyWord.createMany({
          data: (unit as any).words.map((w: any) => ({
            unitId: createdUnit.id,
            word: w.word,
            meaning: w.meaning,
            ipa: w.ipa,
            partOfSpeech: w.partOfSpeech,
            example: w.example,
            imageUrl: w.imageUrl || null,
            order: w.order,
          })),
        });
      }

      // Add exercises
      if ((unit as any).exercises) {
        await prisma.vocabularyExercise.createMany({
          data: (unit as any).exercises.map((e: any) => ({
            unitId: createdUnit.id,
            question: e.question,
            answer: e.answer,
            options: e.options,
            order: e.order,
          })),
        });
      }

      // Add questions
      if ((unit as any).questions && (unit as any).questions.length > 0) {
        await prisma.vocabularyQuestion.createMany({
          data: (unit as any).questions.map((q: any) => ({
            unitId: createdUnit.id,
            question: q.question,
            type: q.type,
            options: q.options || null,
            answer: q.answer,
            order: q.order,
          })),
        });
      }
    }

    console.log(`  Ã¢Å“â€œ Created: ${createdBook.name} (${book.units.length} units)`);
  }

  // Seed Grammar Books
  console.log('Ã°Å¸â€œâ€“ Seeding grammar books...');
  for (const book of grammarBooks) {
    const createdBook = await prisma.grammarBook.create({
      data: {
        slug: book.slug,
        name: book.name,
        author: book.author,
        level: book.level,
        imageUrl: book.imageUrl,
        color: book.color,
        unitCount: book.unitCount,
        units: {
          create: book.units.map(unit => ({
            title: unit.title,
            order: unit.order,
          })),
        },
      },
    });
    console.log(`  Ã¢Å“â€œ Created: ${createdBook.name}`);
  }

  // Seed Pronunciation Sounds
  console.log('Ã°Å¸â€Å  Seeding pronunciation sounds...');
  await prisma.pronunciationSound.createMany({
    data: pronunciationSounds,
  });
  console.log(`  Ã¢Å“â€œ Created ${pronunciationSounds.length} sounds`);

  // Seed Cambridge IELTS exams for Intensive Mock Tests
  console.log('Ã°Å¸Â§Âª Seeding Cambridge IELTS exams...');
  const cambridge17Image = "https://res.cloudinary.com/dalaaegob/image/upload/v1773932448/ed06fa88-6d9c-4142-9c7e-3bcd8613f175.png";

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 1",
    type: "LISTENING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 27, // rounded from 26:28 (Exam.duration is integer minutes)
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest1Questions,
    isPublished: true,
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 2",
    type: "LISTENING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 31, 
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest2Questions,
    isPublished: true,
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 3",
    type: "LISTENING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 32, 
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest3Questions,
    isPublished: true,
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Listening Test 4",
    type: "LISTENING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 32, 
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ListeningTest4Questions,
    isPublished: true,
  });

  // Summary
  const vocabCount = await prisma.vocabularyBook.count();
  const unitCount = await prisma.vocabularyUnit.count();
  const wordCount = await prisma.vocabularyWord.count();
  const exerciseCount = await prisma.vocabularyExercise.count();
  const questionCount = await prisma.vocabularyQuestion.count();

  console.log('\nÃ¢Å“â€¦ Database seeding completed!');
  console.log(`   Ã°Å¸â€œÅ¡ ${vocabCount} vocabulary books`);
  console.log(`   Ã°Å¸â€œâ€ž ${unitCount} units`);
  console.log(`   Ã°Å¸â€œÂ ${wordCount} words`);
  console.log(`   Ã¢Ââ€œ ${exerciseCount} exercises`);
  console.log(`   Ã¢Ââ€ ${questionCount} questions`);
}

main()
  .catch((e) => {
    console.error('Ã¢ÂÅ’ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
