import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// CAMBRIDGE IELTS (Intensive Mock Tests)
// ============================================================


const cambridgeIelts17ReadingTest2Questions = {
  test_title: "Test 2",
  section: "Reading",
  parts: [
    {
      part_number: 1,
      part_type: "Reading Passage",
      topic: "The Dead Sea Scrolls",
      passage_text: `**In late 1946 or early 1947, three Bedouin teenagers were tending their goats and sheep near the ancient settlement of Qumran, located on the northwest shore of the Dead Sea in what is now known as the West Bank.** *(Q6 — NOT GIVEN)* One of these young shepherds tossed a **rock** *(Q1)* into an opening on the side of a cliff and was surprised to hear a shattering sound. He and his companions later entered the **cave** *(Q2)* and stumbled across a collection of large **clay** *(Q3)* jars, seven of which contained scrolls with writing on them. The teenagers took the seven scrolls to a nearby town where they were sold for a small sum to a local antiquities dealer. Word of the find spread, and Bedouins and archaeologists eventually unearthed tens of thousands of additional scroll fragments from 10 nearby caves; together they make up between 800 and 900 manuscripts. It soon became clear that this was one of the greatest archaeological discoveries ever made.

**The origin of the Dead Sea Scrolls, which were written around 2,000 years ago between 150 BCE and 70 CE, is still the subject of scholarly debate even today.** *(Q7 — FALSE: still the subject of scholarly debate)* According to the prevailing theory, they are the work of a population that inhabited the area until Roman troops destroyed the settlement around 70 CE. The area was known as Judea at that time, and the people are thought to have belonged to a group called the **Essenes** *(Q4)*, a devout Jewish sect.

The majority of the texts on the Dead Sea Scrolls are in **Hebrew** *(Q5)*, with some fragments written in an ancient version of its alphabet thought to have fallen out of use in the fifth century BCE. But there are other languages as well. Some scrolls are in Aramaic, the language spoken by many inhabitants of the region from the sixth century BCE to the siege of Jerusalem in 70 CE. In addition, several texts feature translations of the Hebrew Bible into Greek.

The Dead Sea Scrolls include fragments from every book of the Old Testament of the Bible except for the Book of Esther. **The only entire book of the Hebrew Bible preserved among the manuscripts from Qumran is Isaiah;** *(Q8 — TRUE: meaning the rest are incomplete)* this copy, dated to the first century BCE, is considered the earliest biblical manuscript still in existence. Along with biblical texts, the scrolls include documents about sectarian regulations and religious writings that do not appear in the Old Testament.

The writing on the Dead Sea Scrolls is mostly in black or occasionally red ink, and the scrolls themselves are nearly all made of either parchment (animal skin) or an early form of paper called 'papyrus'. The only exception is the scroll numbered 3Q15, which was created out of a combination of copper and tin. Known as the Copper Scroll, this curious document features letters chiselled onto metal – perhaps, as some have theorized, to better withstand the passage of time. One of the most intriguing manuscripts from Qumran, this is a sort of ancient treasure map that lists dozens of gold and silver caches. **Using an unconventional vocabulary and odd spelling, it describes 64 underground hiding places that supposedly contain riches buried for safekeeping.** *(Q9 — TRUE)* None of these hoards have been recovered, possibly because the Romans pillaged Judea during the first century CE. According to various hypotheses, the treasure belonged to local people, or was rescued from the Second Temple before its destruction or never existed to begin with.

Some of the Dead Sea Scrolls have been on interesting journeys. **In 1948, a Syrian Orthodox archbishop known as Mar Samuel acquired four of the original seven scrolls from a Jerusalem shoemaker and part-time antiquity dealer, paying less than $100 for them.** *(Q10 — FALSE: he paid less than $100)* **He then travelled to the United States and unsuccessfully offered them to a number of universities, including Yale.** *(Q11 — FALSE: offered them unsuccessfully)* Finally, in 1954, he placed an advertisement in the business newspaper *The Wall Street Journal* – under the category 'Miscellaneous Items for Sale' – that read: 'Biblical Manuscripts dating back to at least 200 B.C. are for sale. This would be an ideal gift to an educational or religious institution by an individual or group.' Fortunately, Israeli archaeologist and statesman Yigael Yadin negotiated their purchase and brought the scrolls back to Jerusalem, where they remain to this day.

In 2017, researchers from the University of Haifa restored and deciphered one of the last untranslated scrolls. The university's Eshbal Ratson and Jonathan Ben-Dov spent one year reassembling the 60 fragments that make up the scroll. Deciphered from a band of coded text on parchment, the find provides insight into the community of people who wrote it and the 364-day calendar they would have used. **The scroll names celebrations that indicate shifts in seasons and details two yearly religious events known from another Dead Sea Scroll.** *(Q12 — TRUE)* Only one more known scroll remains untranslated.
`,
      questions: "1–13",
      question_groups: [
        {
          questions: "1–5",
          instructions: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          question_type: "Note Completion",
          content: [
            {
              heading: "The Dead Sea Scrolls: Discovery",
              points: [
                { question_number: 1, text: "heard a noise of breaking when one teenager threw a 1 ..............................", answer: "rock" },
                { question_number: 2, text: "teenagers went into the 2 .............................. and found a number of containers", answer: "cave" },
                { question_number: 3, text: "containers made of 3 ..............................", answer: "clay" }
              ]
            },
            {
              heading: "The scrolls",
              points: [
                { question_number: 4, text: "thought to have been written by group of people known as the 4 ..............................", answer: "Essenes" },
                { question_number: 5, text: "written mainly in the 5 .............................. language", answer: "Hebrew" }
              ]
            }
          ]
        },
        {
          questions: "6–13",
          instructions: "Do the following statements agree with the information given in Reading Passage 1?",
          question_type: "True/False/Not Given",
          items: [
            { question_number: 6, question_text: "The Bedouin teenagers who found the scrolls were disappointed by how little money they received for them.", answer: "NOT GIVEN" },
            { question_number: 7, question_text: "There is agreement among academics about the origin of the Dead Sea Scrolls.", answer: "FALSE" },
            { question_number: 8, question_text: "Most of the books of the Bible written on the scrolls are incomplete.", answer: "TRUE" },
            { question_number: 9, question_text: "The information on the Copper Scroll is written in an unusual way.", answer: "TRUE" },
            { question_number: 10, question_text: "Mar Samuel was given some of the scrolls as a gift.", answer: "FALSE" },
            { question_number: 11, question_text: "In the early 1950s, a number of educational establishments in the US were keen to buy scrolls from Mar Samuel.", answer: "FALSE" },
            { question_number: 12, question_text: "The scroll that was pieced together in 2017 contains information about annual occasions in the Qumran area 2,000 years ago.", answer: "TRUE" },
            { question_number: 13, question_text: "Academics at the University of Haifa are currently researching how to decipher the final scroll.", answer: "NOT GIVEN" }
          ]
        }
      ]
    },
    {
      part_number: 2,
      part_type: "Reading Passage",
      topic: "A second attempt at domesticating the tomato",
      passage_text: `**A**
**It took at least 3,000 years for humans to learn how to domesticate the wild tomato and cultivate it for food. Now two separate teams in Brazil and China have done it all over again in less than three years.** *(Q17 — A)* And they have done it better in some ways, as the re-domesticated tomatoes are more nutritious than the ones we eat at present.

This approach relies on the revolutionary CRISPR genome editing technique, in which changes are deliberately made to the DNA of a living cell, allowing genetic material to be added, removed or altered. The technique could not only improve existing crops, but could also be used to turn thousands of wild plants into useful and appealing foods. In fact, a third team in the US has already begun to do this with a relative of the tomato called the groundcherry.

This fast-track domestication could help make the world's food supply healthier and far more resistant to diseases, such as the rust fungus devastating wheat crops.

'This could transform what we eat,' says Jorg Kudla at the University of Munster in Germany, a member of the Brazilian team. **'There are 50,000 edible plants in the world, but 90 percent of our energy comes from just 15 crops.'** *(Q23 — A [Jorg Kudla])*

'We can now mimic the known domestication course of major crops like rice, maize, sorghum or others,' says Caixia Gao of the Chinese Academy of Sciences in Beijing. 'Then we might try to domesticate plants that have never been domesticated.'

**B**
Wild tomatoes, which are native to the Andes region in South America, produce pea-sized fruits. Over many generations, peoples such as the Aztecs and Incas transformed the plant by selecting and breeding plants with mutations in their genetic structure, which resulted in desirable traits such as larger fruit.

**But every time a single plant with a mutation is taken from a larger population for breeding, much genetic diversity is lost. And sometimes the desirable mutations come with less desirable traits.** *(Q15 — B)* For instance, the tomato strains grown for supermarkets have lost much of their **flavour**. *(Q24)*

By comparing the genomes of modern plants to those of their wild relatives, biologists have been working out what genetic changes occurred as plants were domesticated. The teams in Brazil and China have now used this knowledge to reintroduce these changes from scratch while maintaining or even enhancing the desirable traits of wild strains.

**C**
Kudla's team made six changes altogether. For instance, they tripled the **size** *(Q25)* of fruit by editing a gene called FRUIT WEIGHT, and increased the number of tomatoes per truss by editing another called MULTIFLORA.

While the historical domestication of tomatoes reduced levels of the red pigment lycopene – thought to have potential health benefits – the team in Brazil managed to boost it instead. The wild tomato has twice as much lycopene as cultivated ones; the newly domesticated one has five times as much.

**'They are quite tasty,' says Kudla. 'A little bit strong. And very aromatic.'** *(Q18 — C)*

The team in China re-domesticated several strains of wild tomatoes with desirable traits lost in domesticated tomatoes. **In this way they managed to create a strain resistant to a common disease called bacterial spot race, which can devastate yields.** *(Q14 — C)* They also created another strain that is more **salt** *(Q26)* tolerant – and has higher levels of vitamin C.

**D**
Meanwhile, Joyce Van Eck at the Boyce Thompson Institute in New York state decided to use the same approach to domesticate the groundcherry or goldenberry (*Physalis pruinosa*) for the first time. This fruit looks similar to the closely related Cape gooseberry (*Physalis peruviana*).

Groundcherries are already sold to a limited extent in the US but they are hard to produce because the plant has a sprawling growth habit and the small fruits fall off the branches when ripe. Van Eck's team has edited the plants to increase fruit size, make their growth more compact and to stop fruits dropping. 'There's potential for this to be a commercial crop,' says Van Eck. **But she adds that taking the work further would be expensive because of the need to pay for a licence for the CRISPR technology and get regulatory approval.** *(Q22 — C [Joyce Van Eck])*

**E**
This approach could boost the use of many obscure plants, says Jonathan Jones of the Sainsbury Lab in the UK. **But it will be hard for new foods to grow so popular with farmers and consumers that they become new staple crops, he thinks.** *(Q20 — D [Jonathan Jones])*

**The three teams already have their eye on other plants that could be 'catapulted into the mainstream', including foxtail, oat-grass and cowpea.** *(Q16 — E)* **By choosing wild plants that are drought or heat tolerant, says Gao, we could create crops that will thrive even as the planet warms.** *(Q19 — B [Caixia Gao])*

**But Kudla didn't want to reveal which species were in his team's sights, because CRISPR has made the process so easy. 'Any one with the right skills could go to their lab and do this.'** *(Q21 — A [Jorg Kudla])*
`,
      questions: "14–26",
      question_groups: [
        {
          questions: "14–18",
          instructions: "Reading Passage 2 has five sections, A–E. Which section contains the following information?",
          question_type: "Matching Information",
          items: [
            { question_number: 14, question_text: "a reference to a type of tomato that can resist a dangerous infection", answer: "C" },
            { question_number: 15, question_text: "an explanation of how problems can arise from focusing only on a certain type of tomato plant.", answer: "B" },
            { question_number: 16, question_text: "a number of examples of plants that are not cultivated at present but could be useful as food sources", answer: "E" },
            { question_number: 17, question_text: "a comparison between the early domestication of the tomato and more recent research", answer: "A" },
            { question_number: 18, question_text: "a personal reaction to the flavour of a tomato that has been genetically edited", answer: "C" }
          ]
        },
        {
          questions: "19–23",
          instructions: "Match each statement with the correct researcher, A–D.",
          question_type: "Matching Features",
          options_box: {
            title: "List of Researchers",
            options: { A: "Jorg Kudla", B: "Caixia Gao", C: "Joyce Van Eck", D: "Jonathan Jones" }
          },
          items: [
            { question_number: 19, question_text: "Domestication of certain plants could allow them to adapt to future environmental challenges.", answer: "B" },
            { question_number: 20, question_text: "The idea of growing and eating unusual plants may not be accepted on a large scale.", answer: "D" },
            { question_number: 21, question_text: "It is not advisable for the future direction of certain research to be made public.", answer: "A" },
            { question_number: 22, question_text: "Present efforts to domesticate one wild fruit are limited by the costs involved.", answer: "C" },
            { question_number: 23, question_text: "Humans only make use of a small proportion of the plant food available on Earth.", answer: "A" }
          ]
        },
        {
          questions: "24–26",
          instructions: "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
          question_type: "Sentence Completion",
          items: [
            { question_number: 24, question_text: "An undesirable trait such as loss of [blank] may be caused by a mutation in a tomato gene.", answer: "flavour" },
            { question_number: 25, question_text: "By modifying one gene in a tomato plant, researchers made the tomato three times its original [blank].", answer: "size" },
            { question_number: 26, question_text: "A type of tomato which was not badly affected by [blank], and was rich in vitamin C, was produced by a team of researchers in China.", answer: "salt" }
          ]
        }
      ]
    },
    {
      part_number: 3,
      part_type: "Reading Passage",
      topic: "Insight or evolution?",
      passage_text: `*Two scientists consider the origins of discoveries and other innovative behavior*

**Scientific discovery is popularly believed to result from the sheer genius of such intellectual stars as naturalist Charles Darwin and theoretical physicist Albert Einstein. Our view of such unique contributions to science often disregards the person's prior experience and the efforts of their lesser-known predecessors.** *(Q27 — D)* **Conventional wisdom also places great weight on insight in promoting breakthrough scientific achievements, as if ideas spontaneously pop into someone's head – fully formed and functional.** *(Q37 — F)*

**There may be some limited truth to this view. However, we believe that it largely misrepresents the real nature of scientific discovery, as well as that of creativity and innovation in many other realms of human endeavor.** *(Q28 — A)*

**Setting aside such greats as Darwin and Einstein – whose monumental contributions are duly celebrated – we suggest that innovation is more a process of trial and error, where two steps forward may sometimes come with one step back, as well as one or more steps to the right or left.** *(Q29 — A)* This evolutionary view of human innovation undermines the notion of creative genius and recognizes the cumulative nature of scientific progress.

Consider one unheralded scientist: John Nicholson, a mathematical physicist working in the 1910s who postulated the existence of 'proto-elements' in outer space. By combining different numbers of weights of these proto-elements' atoms, Nicholson could recover the weights of all the elements in the then-known periodic table. **These successes are all the more noteworthy given the fact that Nicholson was wrong about the presence of proto-elements: they do not actually exist.** *(Q38 — D)* Yet, amid his often fanciful theories and wild speculations, Nicholson also proposed a novel theory about the structure of atoms. **Niels Bohr, the Nobel prize-winning father of modern atomic theory, jumped off from this interesting idea to conceive his now-famous model of the atom.** *(Q30 — C)*

What are we to make of this story? One might simply conclude that science is a collective and cumulative enterprise. That may be true, but there may be a deeper insight to be gleaned. We propose that science is constantly evolving, much as species of animals do. In biological systems, organisms may display new characteristics that result from random genetic mutations. In the same way, random, arbitrary or accidental mutations of ideas may help pave the way for advances in science. If mutations prove beneficial, then the animal or the scientific theory will continue to thrive and perhaps reproduce.

Support for this evolutionary view of behavioral innovation comes from many domains. Consider one example of an influential innovation in US horseracing. The so-called 'acey-deucy' stirrup placement, in which the rider's foot in his left stirrup is placed as much as 25 centimeters lower than the right, is believed to confer important speed advantages when turning on oval tracks. It was developed by a relatively unknown jockey named Jackie Westrope. Had Westrope conducted methodical investigations or examined extensive film records in a shrewd plan to outrun his rivals? Had he foreseen the speed advantage that would be conferred by riding acey-deucy? No. **He suffered a leg injury, which left him unable to fully bend his left knee. His modification just happened to coincide with enhanced left-hand turning performance.** *(Q31 — A)* This led to the rapid and widespread adoption of riding acey-deucy by many riders, a racing style which continues in today's thoroughbred racing.

**Plenty of other stories show that fresh advances can arise from error, misadventure, and also pure serendipity – a happy accident.** *(Q39 — E)* For example, in the early 1970s, two employees of the company 3M each had a problem: Spencer Silver had a product – a glue which was only slightly sticky – and no use for it, while his colleague Art Fry was trying to figure out how to affix temporary bookmarks in his hymn book without damaging its pages. The solution to both these problems was the invention of the brilliantly simple yet phenomenally successful Post-It note. Such examples give lie to the claim that ingenious, designing minds are responsible for human creativity and invention. Far more banal and mechanical forces may be at work; forces that are fundamentally connected to the laws of science.

The notions of insight, creativity and genius are often invoked, but they remain vague and of doubtful scientific utility, especially when one considers the diverse and enduring contributions of individuals such as Plato, Leonardo da Vinci, Shakespeare, Beethoven, Galileo, Newton, Kepler, Curie, Pasteur and Edison. **These notions merely label rather than explain the evolution of human innovations. We need another approach, and there is a promising candidate.** *(Q32 — NO)*

The Law of Effect was advanced by psychologist Edward Thorndike in 1898, some 40 years after Charles Darwin published his groundbreaking work on biological evolution, *On the Origin of Species*. This simple law holds that organisms tend to repeat successful behaviors and to refrain from performing unsuccessful ones. **Just like Darwin's Law of Natural Selection, the Law of Effect involves an entirely mechanical process of variation and selection, without any end objective in sight.** *(Q34 — YES), (Q40 — B)*

Of course, the origin of human innovation demands much further study. **In particular, the provenance of the raw material on which the Law of Effect operates is not as clearly known as that of the genetic mutations on which the Law of Natural Selection operates.** *(Q35 — NO)* The generation of novel ideas and behaviors may not be entirely random, but constrained by prior successes and failures – of the current individual (such as Bohr) or of predecessors (such as Nicholson).

The time seems right for abandoning the naive notions of intelligent design and genius, and for scientifically exploring the true origins of creative behavior.
`,
      questions: "27–40",
      question_groups: [
        {
          questions: "27–31",
          instructions: "Choose the correct letter, A, B, C or D.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 27,
              question_text: "The purpose of the first paragraph is to",
              options: { A: "defend particular ideas.", B: "compare certain beliefs.", C: "disprove a widely held view.", D: "outline a common assumption." },
              answer: "D"
            },
            {
              question_number: 28,
              question_text: "What are the writers doing in the second paragraph?",
              options: { A: "criticising an opinion", B: "justifying a standpoint", C: "explaining an approach", D: "supporting an argument" },
              answer: "A"
            },
            {
              question_number: 29,
              question_text: "In the third paragraph, what do the writers suggest about Darwin and Einstein?",
              options: { A: "They represent an exception to a general rule.", B: "Their way of working has been misunderstood.", C: "They are an ideal which others should aspire to.", D: "Their achievements deserve greater recognition." },
              answer: "A"
            },
            {
              question_number: 30,
              question_text: "John Nicholson is an example of a person whose idea",
              options: { A: "established his reputation as an influential scientist.", B: "was only fully understood at a later point in history.", C: "laid the foundations for someone else's breakthrough.", D: "initially met with scepticism from the scientific community." },
              answer: "C"
            },
            {
              question_number: 31,
              question_text: "What is the key point of interest about the 'acey-deucy' stirrup placement?",
              options: { A: "the simple reason why it was invented", B: "the enthusiasm with which it was adopted", C: "the research that went into its development", D: "the cleverness of the person who first used it" },
              answer: "A"
            }
          ]
        },
        {
          questions: "32–36",
          instructions: "Do the following statements agree with the claims of the writer in Reading Passage 3?",
          question_type: "Yes/No/Not Given",
          items: [
            { question_number: 32, question_text: "Acknowledging people such as Plato or da Vinci as geniuses will help us understand the process by which great minds create new ideas.", answer: "NO" },
            { question_number: 33, question_text: "The Law of Effect was discovered at a time when psychologists were seeking a scientific reason why creativity occurs.", answer: "NOT GIVEN" },
            { question_number: 34, question_text: "The Law of Effect states that no planning is involved in the behaviour of organisms.", answer: "YES" },
            { question_number: 35, question_text: "The Law of Effect sets out clear explanations about the sources of new ideas and behaviours.", answer: "NO" },
            { question_number: 36, question_text: "Many scientists are now turning away from the notion of intelligent design and genius.", answer: "NOT GIVEN" }
          ]
        },
        {
          questions: "37–40",
          instructions: "Complete the summary using the list of words, A–G, below.",
          topic: "The origins of creative behaviour",
          question_type: "Summary Completion",
          options_box: {
            title: "Options",
            options: { A: "invention", B: "goals", C: "compromise", D: "mistakes", E: "luck", F: "inspiration", G: "experiments" }
          },
          content: [
            {
              text: "The traditional view of scientific discovery is that breakthroughs happen when a single great mind has sudden 37 [blank] . Advances are more likely to be the result of a longer process. In some cases, this process involves 38 [blank] , such as Nicholson's theory about proto-elements. In others, simple necessity may provoke innovation, as with Westrope's decision to modify the position of his riding stirrups. There is also often an element of 39 [blank] , for example, the coincidence of ideas that led to the invention of the Post-It note. With both the Law of Natural Selection and the Law of Effect, there may be no clear 40 [blank] involved, but merely a process of variation and selection.",
              points: [
                { question_number: 37, answer: "F" },
                { question_number: 38, answer: "D" },
                { question_number: 39, answer: "E" },
                { question_number: 40, answer: "B" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const cambridgeIelts17ReadingTest3Questions = {
  test_title: "Test 3",
  section: "Reading",
  parts: [
    {
      part_number: 1,
      part_type: "Reading Passage",
      topic: "The thylacine",
      passage_text: `The extinct thylacine, also known as the Tasmanian tiger, was a marsupial that bore a superficial resemblance to a dog. Its most distinguishing feature was the 13–19 dark brown stripes over its back, beginning at the rear of the body and extending onto the tail. The thylacine's average nose-to-tail length for adult males was 162.6 cm, compared to 153.7 cm for females.

The thylacine appeared to occupy most types of terrain except dense rainforest, with open eucalyptus forest thought to be its prime habitat. In terms of feeding, it was exclusively **carnivorous** *(Q1)*, and its stomach was muscular with an ability to distend so that it could eat large amounts of food at one time, probably an adaptation to compensate for long periods when hunting was unsuccessful and food scarce. The thylacine was not a fast runner and probably caught its prey by exhausting it during a long pursuit. During long-distance chases, thylacines were likely to have relied more on **scent** *(Q2)* than any other sense. They emerged to hunt during the evening, night and early morning and tended to retreat to the hills and forest for shelter during the day. Despite the common name 'tiger', the thylacine had a shy, nervous temperament. Although mainly nocturnal, it was sighted moving during the day and some individuals were even recorded basking in the sun.

The thylacine had an extended breeding season from winter to spring, with indications that some breeding took place throughout the year. The thylacine, like all marsupials, was tiny and hairless when born. Newborns crawled into the **pouch** *(Q3)* on the belly of their mother, and attached themselves to one of the four teats, remaining there for up to three months. When old enough to leave the pouch, the young stayed in a lair such as a deep rocky cave, well-hidden nest or hollow log, whilst the mother hunted.

Approximately 4,000 years ago, the thylacine was widespread throughout New Guinea and most of mainland Australia, as well as the island of Tasmania. The most recent, well-dated occurrence of a thylacine on the mainland is a carbon-dated **fossil** *(Q4)* from Murray Cave in Western Australia, which is around 3,100 years old. Its extinction coincided closely with the arrival of wild dogs called dingoes in Australia and a similar predator in New Guinea. Dingoes never reached Tasmania, and most scientists see this as the main reason for the thylacine's survival there.

**The dramatic decline of the thylacine in Tasmania, which began in the 1830s and continued for a century, is generally attributed to the relentless efforts of sheep farmers and bounty hunters with shotguns.** *(Q6 — TRUE)* While this determined campaign undoubtedly played a large part, it is likely that various other factors also contributed to the decline and eventual extinction of the species. These include competition with wild dogs introduced by European settlers, loss of **habitat** *(Q5)* along with the disappearance of prey species, and a distemper-like disease which may also have affected the thylacine.

**There was only one successful attempt to breed a thylacine in captivity, at Melbourne Zoo in 1899. This was despite the large numbers that went through some zoos, particularly London Zoo and Tasmania's Hobart Zoo.** *(Q7 — FALSE)* The famous naturalist John Gould foresaw the thylacine's demise when he published his *Mammals of Australia* between 1848 and 1863, writing, 'The numbers of this singular animal will speedily diminish, extermination will have its full sway, and it will then, like the wolf of England and Scotland, be recorded as an animal of the past.' *(Q8 — NOT GIVEN)*

However, there seems to have been little public pressure to preserve the thylacine, nor was much concern expressed by scientists at the decline of this species in the decades that followed. **A notable exception was T.T. Flynn, Professor of Biology at the University of Tasmania. In 1914, he was sufficiently concerned about the scarcity of the thylacine to suggest that some should be captured and placed on a small island.** *(Q9 — FALSE: only Flynn, not many scientists)* *(Q10 — NOT GIVEN)* But it was not until 1929, with the species on the very edge of extinction, that Tasmania's Animals and Birds Protection Board passed a motion protecting thylacines only for the month of December, which was thought to be their prime breeding season. **The last known wild thylacine to be killed was shot by a farmer in the north-east of Tasmania in 1930, leaving just captive specimens.** *(Q11 — FALSE)* Official protection of the species by the Tasmanian government was introduced in July 1936, 59 days before the last known individual died in Hobart Zoo on 7th September, 1936. *(Q12 — TRUE)*

There have been numerous expeditions and searches for the thylacine over the years, none of which has produced definitive evidence that thylacines still exist. The species was declared extinct by the Tasmanian government in 1986. *(Q13 — NOT GIVEN)*
`,
      questions: "1–13",
      question_groups: [
        {
          questions: "1–5",
          instructions: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          question_type: "Note Completion",
          topic: "The thylacine",
          content: [
            {
              heading: "Appearance and behaviour",
              points: [
                { text: "looked rather like a dog" },
                { text: "had a series of stripes along its body and tail" },
                { question_number: 1, text: "ate an entirely 1 [blank] diet", answer: "carnivorous" },
                { question_number: 2, text: "probably depended mainly on 2 [blank] when hunting", answer: "scent" },
                { question_number: 3, text: "young spent first months of life inside its mother's 3 [blank]", answer: "pouch" }
              ]
            },
            {
              heading: "Decline and extinction",
              points: [
                { question_number: 4, text: "last evidence in mainland Australia is a 3,100-year-old 4 [blank]", answer: "fossil" },
                { text: "probably went extinct in mainland Australia due to animals known as dingoes" },
                { question_number: 5, text: "reduction in 5 [blank] and available sources of food were partly responsible for decline in Tasmania", answer: "habitat" }
              ]
            }
          ]
        },
        {
          questions: "6–13",
          instructions: "Do the following statements agree with the information given in Reading Passage 1?",
          question_type: "True/False/Not Given",
          items: [
            { question_number: 6, question_text: "Significant numbers of thylacines were killed by humans from the 1830s onwards.", answer: "TRUE" },
            { question_number: 7, question_text: "Several thylacines were born in zoos during the late 1800s.", answer: "FALSE" },
            { question_number: 8, question_text: "John Gould's prediction about the thylacine surprised some biologists.", answer: "NOT GIVEN" },
            { question_number: 9, question_text: "In the early 1900s, many scientists became worried about the possible extinction of the thylacine.", answer: "FALSE" },
            { question_number: 10, question_text: "T. T. Flynn's proposal to rehome captive thylacines on an island proved to be impractical.", answer: "NOT GIVEN" },
            { question_number: 11, question_text: "There were still reasonable numbers of thylacines in existence when a piece of legislation protecting the species during their breeding season was passed.", answer: "FALSE" },
            { question_number: 12, question_text: "From 1930 to 1936, the only known living thylacines were all in captivity.", answer: "TRUE" },
            { question_number: 13, question_text: "Attempts to find living thylacines are now rarely made.", answer: "NOT GIVEN" }
          ]
        }
      ]
    },
    {
      part_number: 2,
      part_type: "Reading Passage",
      topic: "Palm oil",
      passage_text: `**A**
**Palm oil is an edible oil derived from the fruit of the African oil palm tree, and is currently the most consumed vegetable oil in the world.** *(Q16 — A)* It's almost certainly in the soap we wash with in the morning, the sandwich we have for lunch, and the biscuits we snack on during the day. Why is palm oil so attractive for manufacturers? Primarily because its unique properties – such as remaining **solid** *(Q23)* at room temperature – make it an ideal ingredient for long-term preservation, allowing many packaged foods on supermarket shelves to have 'best before' dates of months, even years, into the future.

**B**
**Many farmers have seized the opportunity to maximise the planting of oil palm trees. Between 1990 and 2012, the global land area devoted to growing oil palm trees grew from 6 to 17 million hectares, now accounting for around ten percent of total cropland in the entire world. From a mere two million tonnes of palm oil being produced annually globally 50 years ago, there are now around 60 million tonnes produced every single year, a figure looking likely to double or even triple by the middle of the century.** *(Q18 — B)*

**C**
**However, there are multiple reasons why conservationists cite the rapid spread of oil palm plantations as a major concern. There are countless news stories of deforestation, habitat destruction and dwindling species populations, all as a direct result of land clearing to establish oil palm tree monoculture on an industrial scale, particularly in Malaysia and Indonesia. Endangered species – most famously the Sumatran orangutan** *(Q24)*, **but also rhinos, elephants, tigers, and numerous other fauna – have suffered from the unstoppable spread of oil palm plantations.** *(Q20 — C)*

**D**
'Palm oil is surely one of the greatest threats to global biodiversity,' declares Dr Farnon Ellwood of the University of the West of England, Bristol. 'Palm oil is replacing rainforest, and rainforest is where all the species are. That's a problem.' This has led to some radical questions among environmentalists, such as whether consumers should try to boycott palm oil entirely.

Meanwhile Bhavani Shankar, Professor at London's School of Oriental and African Studies, argues, 'It's easy to say that palm oil is the enemy and we should be against it. It makes for a more dramatic story, and it's very intuitive. But given the complexity of the argument, I think a much more nuanced story is closer to the truth.'

**E**
**One response to the boycott movement has been the argument for the vital role palm oil plays in lifting many millions of people in the developing world out of poverty. Is it desirable to have palm oil boycotted, replaced, eliminated from the global supply chain, given how many low-income people in developing countries depend on it for their livelihoods? How best to strike a utilitarian balance between these competing factors has become a serious bone of contention.** *(Q19 — E)*

**F**
**Even the deforestation argument isn't as straightforward as it seems. Oil palm plantations produce at least four and potentially up to ten times more oil per hectare than soybean, rapeseed, sunflower or other competing oils. That immensely high yield – which is predominantly what makes it so profitable – is potentially also an ecological benefit. If ten times more palm oil can be produced from a patch of land than any competing oil, then ten times more land would need to be cleared in order to produce the same volume of oil from that competitor.** *(Q14 — F)*

As for the question of carbon emissions, the issue really depends on what oil palm trees are replacing. Crops vary in the degree to which they sequester carbon – in other words, the amount of carbon they capture from the atmosphere and store within the plant. The more carbon a plant sequesters, the more it reduces the effect of climate change. As Shankar explains: '[Palm oil production] actually sequesters more carbon in some ways than other alternatives. [...] Of course, if you're cutting down virgin forest it's terrible – that's what's happening in Indonesia and Malaysia, it's been allowed to get out of hand. But if it's replacing rice, for example, it might actually sequester more carbon.'

**G**
**The industry is now regulated by a group called the Roundtable on Sustainable Palm Oil (RSPO), consisting of palm growers, retailers, product manufacturers, and other interested parties. Over the past decade or so, an agreement has gradually been reached regarding standards that producers of palm oil have to meet in order for their product to be regarded as officially 'sustainable'. The RSPO insists upon no virgin forest clearing, transparency and regular assessment of **carbon stocks** *(Q25)*, among other criteria. Only once these requirements are fully satisfied is the oil allowed to be sold as certified sustainable palm oil (CSPO). Recent figures show that the RSPO now certifies around 12 million tonnes of palm oil annually, equivalent to roughly 21 percent of the world's total palm oil production.** *(Q15 — G)*

**H**
**There is even hope that oil palm plantations might not need to be such sterile monocultures, or 'green deserts', as Ellwood describes them. New research at Ellwood's lab hints at one plant which might make all the difference. The bird's nest fern (*Asplenium nidus*) grows on trees in an epiphytic fashion (meaning it's dependent on the tree only for support, not for nutrients), and is native to many tropical regions, where as a keystone species it performs a vital ecological role. Ellwood believes that reintroducing the bird's nest fern into oil palm plantations could potentially allow these areas to recover their **biodiversity** *(Q26)*, providing a home for all manner of species, from fungi and bacteria, to invertebrates such as insects, amphibians, reptiles and even mammals.** *(Q17 — H)*
`,
      questions: "14–26",
      question_groups: [
        {
          questions: "14–20",
          instructions: "Reading Passage 2 has eight sections, A–H. Which section contains the following information?",
          question_type: "Matching Information",
          items: [
            { question_number: 14, question_text: "examples of a range of potential environmental advantages of oil palm tree cultivation", answer: "F" },
            { question_number: 15, question_text: "description of an organisation which controls the environmental impact of palm oil production", answer: "G" },
            { question_number: 16, question_text: "examples of the widespread global use of palm oil", answer: "A" },
            { question_number: 17, question_text: "reference to a particular species which could benefit the ecosystem of oil palm plantations", answer: "H" },
            { question_number: 18, question_text: "figures illustrating the rapid expansion of the palm oil industry", answer: "B" },
            { question_number: 19, question_text: "an economic justification for not opposing the palm oil industry", answer: "E" },
            { question_number: 20, question_text: "examples of creatures badly affected by the establishment of oil palm plantations", answer: "C" }
          ]
        },
        {
          questions: "21–22",
          instructions: "Choose TWO letters, A–E. Which TWO statements are made about the Roundtable on Sustainable Palm Oil (RSPO)?",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [21, 22],
              question_text: "Which TWO statements are made about the Roundtable on Sustainable Palm Oil (RSPO)?",
              options: {
                A: "Its membership has grown steadily over the course of the last decade.",
                B: "It demands that certified producers be open and honest about their practices.",
                C: "It took several years to establish its set of criteria for sustainable palm oil certification.",
                D: "Its regulations regarding sustainability are stricter than those governing other industries.",
                E: "It was formed at the request of environmentalists concerned about the loss of virgin forests."
              },
              answer: ["B", "C"],
              grading_note: "IN EITHER ORDER"
            }
          ]
        },
        {
          questions: "23–26",
          instructions: "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
          question_type: "Sentence Completion",
          items: [
            { question_number: 23, question_text: "One advantage of palm oil for manufacturers is that it stays [blank] even when not refrigerated.", answer: "solid" },
            { question_number: 24, question_text: "The [blank] is the best known of the animals suffering habitat loss as a result of the spread of oil palm plantations.", answer: "(Sumatran) orangutan" },
            { question_number: 25, question_text: "As one of its criteria for the certification of sustainable palm oil, the RSPO insists that growers check [blank] on a routine basis.", answer: "carbon stocks" },
            { question_number: 26, question_text: "Ellwood and his researchers are looking into whether the bird's nest fern could restore [blank] in areas where oil palm trees are grown.", answer: "biodiversity" }
          ]
        }
      ]
    },
    {
      part_number: 3,
      part_type: "Reading Passage",
      topic: "Building the Skyline: The Birth and Growth of Manhattan's Skyscrapers",
      passage_text: `*Katharine L. Shester reviews a book by Jason Barr about the development of New York City*

**In *Building the Skyline*, Jason Barr takes the reader through a detailed history of New York City. The book combines geology, history, economics, and a lot of data to explain why business clusters developed where they did and how the early decisions of workers and firms shaped the skyline we see today. *Building the Skyline* is organized into two distinct parts. The first is primarily historical and addresses New York's settlement and growth from 1609 to 1900; the second deals primarily with the 20th century and is a compilation of chapters commenting on different aspects of New York's urban development. The tone and organization of the book changes somewhat between the first and second parts, as the latter chapters incorporate aspects of Barr's related research papers.** *(Q27 — D)*

Barr begins chapter one by taking the reader on a 'helicopter time-machine' ride – giving a fascinating account of how the New York landscape in 1609 might have looked from the sky. *(Q32 — NO)* He then moves on to a subterranean walking tour of the city, indicating the location of rock and water below the subsoil, before taking the reader back to the surface. His love of the city comes through as he describes various fun facts about the location of the New York residence of early 19th-century vice-president Aaron Burr as well as a number of legends about the city.

**Chapters two and three take the reader up to the Civil War (1861–1865), with chapter two focusing on the early development of land and the implementation of a grid system in 1811. Chapter three focuses on land use before the Civil War. Both chapters are informative and well researched and set the stage for the economic analysis that comes later in the book.** *(Q33 — YES)* **I would have liked Barr to expand upon his claim that existing tenements prevented skyscrapers in certain neighborhoods because 'likely no skyscraper developer was interested in performing the necessary "slum clearance"'.** *(Q28 — B)* Later in the book, Barr makes the claim that the depth of bedrock was not a limiting factor for developers, as foundation costs were a small fraction of the cost of development. At first glance, it is not obvious why slum clearance would be limiting, while more expensive foundations would not.

**Chapter four focuses on immigration and the location of neighborhoods and tenements in the late 19th century. Barr identifies four primary immigrant enclaves and analyzes their locations in terms of the amenities available in the area. Most of these enclaves were located on the least valuable land, between the industries located on the waterfront and the wealthy neighborhoods bordering Central Park.** *(Q34 — NOT GIVEN)* *(Q35 — NO)*

Part two of the book begins with a discussion of the economics of skyscraper height. In chapter five, Barr distinguishes between engineering height, economic height, and developer height — where engineering height is the tallest building that can be safely made at a given time, economic height is the height that is most efficient from society's point of view, and developer height is the actual height chosen by the developer, who is attempting to maximize return on investment.

Chapter five also has an interesting discussion of the technological advances that led to the construction of skyscrapers. For example, the introduction of iron and steel skeletal frames made thick, load-bearing walls unnecessary, expanding the usable square footage of buildings and increasing the use of windows and availability of natural light. **Chapter six then presents data on building height throughout the 20th century and uses regression analysis to 'predict' building construction. While less technical than the research paper on which the chapter is based, it is probably more technical than would be preferred by a general audience.** *(Q29 — C)*

**Chapter seven tackles the 'bedrock myth', the assumption that the absence of bedrock close to the surface between Downtown and Midtown New York is the reason for skyscrapers not being built between the two urban centers. Rather, Barr argues that while deeper bedrock does increase foundation costs, these costs were neither prohibitively high nor were they large compared to the overall cost of building a skyscraper.** *(Q36 — H: specific areas)* *(Q37 — D: excessive expense)* *(Q38 — I: total expenditure)* What I enjoyed the most about this chapter was Barr's discussion of how foundations are actually built. He describes the use of caissons, which enable workers to dig down for considerable distances, often below the water table, until they reach bedrock. **Barr's thorough technological history discusses not only how caissons work** *(Q39 — B: deep excavations)*, **but also the dangers involved** *(Q40 — F: associated risks)*. While this chapter references empirical research papers, it is a relatively easy read.

**Chapters eight and nine focus on the birth of Midtown and the building boom of the 1920s. Chapter eight contains lengthy discussions of urban economic theory that may serve as a distraction to readers primarily interested in New York. However, they would be well-suited for undergraduates learning about the economics of cities. In the next chapter, Barr considers two of the primary explanations for the building boom of the 1920s — the first being exuberance, and the second being financing. He uses data to assess the viability of these two explanations and finds that supply and demand factors explain much of the development of the 1920s; though it enabled the boom, cheap credit was not, he argues, the primary cause.** *(Q30 — D)*

**In the final chapter (chapter 10), Barr discusses another of his empirical papers that estimates Manhattan land values from the mid-19th century to the present day. The data work that went into these estimations is particularly impressive.** *(Q31 — C)* Toward the end of the chapter, Barr assesses 'whether skyscrapers are a cause or an effect of high land values'. He finds that changes in land values predict future building height, but the reverse is not true. The book ends with an epilogue, in which Barr discusses the impact of climate change on the city and makes policy suggestions for New York going forward.
`,
      questions: "27–40",
      question_groups: [
        {
          questions: "27–31",
          instructions: "Choose the correct letter, A, B, C or D.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 27,
              question_text: "What point does Shester make about Barr's book in the first paragraph?",
              options: {
                A: "It gives a highly original explanation for urban development.",
                B: "Elements of Barr's research papers are incorporated throughout the book.",
                C: "Other books that are available on the subject have taken a different approach.",
                D: "It covers a range of factors that affected the development of New York."
              },
              answer: "D"
            },
            {
              question_number: 28,
              question_text: "How does Shester respond to the information in the book about tenements?",
              options: {
                A: "She describes the reasons for Barr's interest.",
                B: "She indicates a potential problem with Barr's analysis.",
                C: "She compares Barr's conclusion with that of other writers.",
                D: "She provides details about the sources Barr used for his research."
              },
              answer: "B"
            },
            {
              question_number: 29,
              question_text: "What does Shester say about chapter six of the book?",
              options: {
                A: "It contains conflicting data.",
                B: "It focuses too much on possible trends.",
                C: "It is too specialised for most readers.",
                D: "It draws on research that is out of date."
              },
              answer: "C"
            },
            {
              question_number: 30,
              question_text: "What does Shester suggest about the chapters focusing on the 1920s building boom?",
              options: {
                A: "The information should have been organised differently.",
                B: "More facts are needed about the way construction was financed.",
                C: "The explanation that is given for the building boom is unlikely.",
                D: "Some parts will have limited appeal to certain people."
              },
              answer: "D"
            },
            {
              question_number: 31,
              question_text: "What impresses Shester the most about the chapter on land values?",
              options: {
                A: "the broad time period that is covered",
                B: "the interesting questions that Barr asks",
                C: "the nature of the research into the topic",
                D: "the recommendations Barr makes for the future"
              },
              answer: "C"
            }
          ]
        },
        {
          questions: "32–35",
          instructions: "Do the following statements agree with the claims of the writer in Reading Passage 3?",
          question_type: "Yes/No/Not Given",
          items: [
            { question_number: 32, question_text: "The description in the first chapter of how New York probably looked from the air in the early 1600s lacks interest.", answer: "NO" },
            { question_number: 33, question_text: "Chapters two and three prepare the reader well for material yet to come.", answer: "YES" },
            { question_number: 34, question_text: "The biggest problem for many nineteenth-century New York immigrant neighbourhoods was a lack of amenities.", answer: "NOT GIVEN" },
            { question_number: 35, question_text: "In the nineteenth century, New York's immigrant neighbourhoods tended to concentrate around the harbour.", answer: "NO" }
          ]
        },
        {
          questions: "36–40",
          instructions: "Complete the summary using the list of phrases, A–J, below.",
          topic: "The bedrock myth",
          question_type: "Summary Completion",
          options_box: {
            title: "Phrases",
            options: {
              A: "development plans",
              B: "deep excavations",
              C: "great distance",
              D: "excessive expense",
              E: "impossible tasks",
              F: "associated risks",
              G: "water level",
              H: "specific areas",
              I: "total expenditure",
              J: "construction guidelines"
            }
          },
          content: [
            {
              text: "In chapter seven, Barr indicates how the lack of bedrock close to the surface does not explain why skyscrapers are absent from 36 [blank]. He points out that although the cost of foundations increases when bedrock is deep below the surface, this cannot be regarded as 37 [blank], especially when compared to 38 [blank]. A particularly enjoyable part of the chapter was Barr's account of how foundations are built. He describes not only how 39 [blank] are made possible by the use of caissons, but he also discusses their 40 [blank]. The chapter is well researched but relatively easy to understand.",
              points: [
                { question_number: 36, answer: "H" },
                { question_number: 37, answer: "D" },
                { question_number: 38, answer: "I" },
                { question_number: 39, answer: "B" },
                { question_number: 40, answer: "F" }
              ]
            }
          ]
        }
      ]
    }
  ]
};


const cambridgeIelts17ReadingTest4Questions = {
  test_title: "Test 4",
  section: "Reading",
  parts: [
    {
      part_number: 1,
      part_type: "Reading Passage",
      topic: "Bats to the rescue",
      passage_text: `There are few places in the world where relations between agriculture and conservation are more strained. Madagascar's forests are being converted to agricultural land at a rate of one percent every year. Much of this destruction is fuelled by the cultivation of the country's main staple crop: rice. And a key reason for this destruction is that insect pests are destroying vast quantities of what is grown by local subsistence farmers, leading them to clear forest to create new paddy fields. The result is devastating habitat and biodiversity loss on the island, but not all species are suffering. In fact, some of the island's insectivorous bats are currently thriving and this has important implications for farmers and conservationists alike. *(Q1 — FALSE)* *(Q2 — FALSE)*

Enter University of Cambridge zoologist Ricardo Rocha. He's passionate about conservation, and bats. More specifically, he's interested in how bats are responding to human activity and deforestation in particular. *(Q3 — NOT GIVEN)* Rocha's new study shows that several species of bats are giving Madagascar's rice farmers a vital pest control service by feasting on plagues of insects. And this, he believes, can ease the financial pressure on farmers to turn forest into fields.

Bats comprise roughly one-fifth of all mammal species in Madagascar and thirty-six recorded bat species are native to the island, making it one of the most important regions for conservation of this animal group anywhere in the world.

**Co-leading an international team of scientists, Rocha found that several species of indigenous bats are taking advantage of habitat modification to hunt insects swarming above the country's rice fields. They include the Malagasy mouse-eared bat, Major's long-fingered bat, the Malagasy white-bellied free-tailed bat and Peters' wrinkle-lipped bat.** *(Q4 — TRUE)* *(Q5 — NOT GIVEN)*

'These winner species are providing a valuable free service to Madagascar as biological pest suppressors,' says Rocha. 'We found that six species of bat are preying on rice pests, including the paddy swarming caterpillar and grass webworm. *(Q6 — TRUE)* The damage which these insects cause puts the island's farmers under huge financial pressure and that encourages deforestation.'

The study, now published in the journal *Agriculture, Ecosystems and Environment*, set out to investigate the feeding activity of insectivorous bats in the farmland bordering the Ranomafana National Park in the southeast of the country.

Rocha and his team used state-of-the-art ultrasonic recorders to record over a thousand bat 'feeding buzzes' (echolocation sequences used by bats to target their prey) at 54 sites, in order to identify the favourite feeding spots of the bats. They next used DNA barcoding techniques to analyse **droppings** *(Q7)* collected from bats at the different sites.

The recordings revealed that bat activity over rice fields was much higher than it was in continuous forest – seven times higher over rice fields which were on flat ground, and sixteen times higher over fields on the sides of hills – leaving no doubt that the animals are preferentially foraging in these man-made ecosystems. The researchers suggest that the bats favour these fields because lack of water and nutrient run-off make these crops more susceptible to insect pest infestations. DNA analysis showed that all six species of bat had fed on economically important insect pests. While the findings indicated that rice farming benefits most from the bats, the scientists also found indications that the bats were consuming pests of other crops, including the black twig borer (which infests **coffee** *(Q8)* plants), the sugarcane cicada, the macadamia nut-borer, and the sober tabby (a pest of citrus fruits).

'The effectiveness of bats as pest controllers has already been proven in the USA and Catalonia,' said co-author James Kemp, from the University of Lisbon. 'But our study is the first to show this happening in Madagascar, where the stakes for both farmers and conservationists are so high.'

Local people may have a further reason to be grateful to their bats. While the animal is often associated with spreading disease, Rocha and his team found evidence that Malagasy bats feed not just on crop pests but also on **mosquitoes** *(Q9)* – carriers of malaria, Rift Valley fever virus and elephantiasis – as well as blackflies, which spread river blindness.

Rocha points out that the relationship is complicated. When food is scarce, bats become a crucial source of **protein** *(Q10)* for local people. Even the children will hunt them. And as well as roosting in trees, the bats sometimes roost in buildings, but are not welcomed there because they make them **unclean** *(Q11)*. At the same time, however, they are associated with sacred caves and the ancestors, so they can be viewed as beings between worlds, which makes them very significant in the **culture** *(Q12)* of the people. And one potential problem is that while these bats are benefiting from farming, at the same time deforestation is reducing the places where they can roost, which could have long-term effects on their numbers. Rocha says, 'With the right help, we hope that farmers can promote this mutually beneficial relationship by installing bat **houses** *(Q13)*.\'

Rocha and his colleagues believe that maximising bat populations can help to boost crop yields and promote sustainable livelihoods. The team is now calling for further research to quantify this contribution. 'I'm very optimistic,' says Rocha. 'If we give nature a hand, we can speed up the process of regeneration.'
`,
      questions: "1–13",
      question_groups: [
        {
          questions: "1–6",
          instructions: "Do the following statements agree with the information given in Reading Passage 1?",
          question_type: "True/False/Not Given",
          items: [
            { question_number: 1, question_text: "Many Madagascan forests are being destroyed by attacks from insects.", answer: "FALSE" },
            { question_number: 2, question_text: "Loss of habitat has badly affected insectivorous bats in Madagascar.", answer: "FALSE" },
            { question_number: 3, question_text: "Ricardo Rocha has carried out studies of bats in different parts of the world.", answer: "NOT GIVEN" },
            { question_number: 4, question_text: "Habitat modification has resulted in indigenous bats in Madagascar becoming useful to farmers.", answer: "TRUE" },
            { question_number: 5, question_text: "The Malagasy mouse-eared bat is more common than other indigenous bat species in Madagascar.", answer: "NOT GIVEN" },
            { question_number: 6, question_text: "Bats may feed on paddy swarming caterpillars and grass webworms.", answer: "TRUE" }
          ]
        },
        {
          questions: "7–13",
          instructions: "Complete the table below. Choose ONE WORD ONLY from the passage for each answer.",
          question_type: "Table Completion",
          topic: "The study carried out by Rocha's team",
          content: [
            {
              heading: "Aim",
              points: [
                { text: "to investigate the feeding habits of bats in farmland near the Ranomafana National Park" }
              ]
            },
            {
              heading: "Method",
              points: [
                { text: "ultrasonic recording to identify favourite feeding spots" },
                { question_number: 7, text: "DNA analysis of bat 7 [blank]", answer: "droppings" }
              ]
            },
            {
              heading: "Findings",
              points: [
                { text: "the bats were most active in rice fields located on hills" },
                { question_number: 8, text: "ate pests of rice, 8 [blank], sugarcane, nuts and fruit", answer: "coffee" },
                { question_number: 9, text: "prevent the spread of disease by eating 9 [blank] and blackflies", answer: "mosquitoes" },
                { text: "local attitudes to bats are mixed:" },
                { question_number: 10, text: "they provide food rich in 10 [blank]", answer: "protein" },
                { question_number: 11, text: "the buildings where they roost become 11 [blank]", answer: "unclean" },
                { question_number: 12, text: "they play an important role in local 12 [blank]", answer: "culture" }
              ]
            },
            {
              heading: "Recommendation",
              points: [
                { question_number: 13, text: "farmers should provide special 13 [blank] to support the bat population", answer: "houses" }
              ]
            }
          ]
        }
      ]
    },
    {
      part_number: 2,
      part_type: "Reading Passage",
      topic: "Does education fuel economic growth?",
      passage_text: `**A**
Over the last decade, a huge database about the lives of southwest German villagers between 1600 and 1900 has been compiled by a team led by Professor Sheilagh Ogilvie at Cambridge University's Faculty of Economics. It includes court records, guild ledgers, parish registers, village censuses, tax lists and – the most recent addition – 9,000 handwritten inventories listing over a million personal possessions belonging to ordinary women and men across three centuries. Ogilvie, who discovered the inventories in the archives of two German communities 30 years ago, believes they may hold the answer to a conundrum that has long puzzled economists: the lack of evidence for a causal link between education and a country's economic growth. *(Q15 — A)*

**B**
As Ogilvie explains, 'Education helps us to work more productively, invent better technology, and earn more … surely it must be critical for economic growth? But, if you look back through history, there's no evidence that having a high literacy rate made a country industrialise earlier.' **Between 1600 and 1900, England had only mediocre literacy rates by European standards, yet its economy grew fast and it was the first country to industrialise. During this period, Germany and Scandinavia had excellent literacy rates, but their economies grew slowly and they industrialised late.** *(Q23&24 — B, E)* 'Modern cross-country analyses have also struggled to find evidence that education causes economic growth, even though there is plenty of evidence that growth increases education,' she adds.

**C**
In the handwritten inventories that Ogilvie is analysing are the belongings of women and men at marriage, remarriage and death. **From badger skins to Bibles, sewing machines to scarlet bodices – the villagers' entire worldly goods are included.** *(Q18 — C)* Inventories of agricultural equipment and craft tools reveal economic activities; ownership of books and education-related objects like pens and slates suggests how people learned. In addition, the tax lists included in the database record the value of farms, workshops, assets and debts; signatures and people's estimates of their age indicate literacy and numeracy levels; and court records reveal obstacles (such as the activities of the guilds) that stifled industry.

Previous studies usually had just one way of linking education with economic growth – the presence of schools and printing presses, perhaps, or school enrolment, or the ability to sign names. According to Ogilvie, the database provides multiple indicators for the same individuals, making it possible to analyse links between literacy, numeracy, wealth, and industriousness, for individual women and men over the long term.

**D**
Ogilvie and her team have been building the vast database of material possessions on top of their full demographic reconstruction of the people who lived in these two German communities. 'We can follow the same people – and their **descendants** *(Q19)* – across 300 years of educational and economic change,' she says. Individual lives have unfolded before their eyes. Stories like that of the 24-year-olds Ana Regina and Magdalena Riethmüllerin, who were chastised in 1707 for reading books in church instead of listening to the **sermon** *(Q20)*. 'This tells us they were continuing to develop their reading skills at least a decade after leaving school,' explains Ogilvie. The database also reveals the case of Juliana Schweickherdt, a 50-year-old spinster living in the small Black Forest community of Wildberg, who was reprimanded in 1752 by the local weavers' guild for 'weaving cloth and combing wool, counter to the guild ordinance'. When Juliana continued taking jobs reserved for male guild members, she was summoned before the guild court and told to pay a **fine** *(Q21)* equivalent to one third of a servant's annual wage. It was a small act of defiance by today's standards, but it reflects a time when laws in Germany and elsewhere regulated people's access to labour markets. The dominance of guilds not only prevented people from using their skills, but also held back even the simplest industrial **innovation** *(Q22)*. *(Q16 — D)*

**E**
**The data-gathering phase of the project has been completed and now, according to Ogilvie, it is time 'to ask the big questions'. One way to look at whether education causes economic growth is to 'hold wealth constant'. This involves following the lives of different people with the same level of wealth over a period of time.** *(Q14 — E)* If wealth is constant, it is possible to discover whether education was, for example, linked to the cultivation of new crops, or to the adoption of industrial innovations like sewing machines. The team will also ask what aspect of education helped people engage more with productive and innovative activities. Was it, for instance, literacy, numeracy, book ownership, years of schooling? Was there a threshold level – a tipping point – that needed to be reached to affect economic performance?

**F**
**Ogilvie hopes to start finding answers to these questions over the next few years. One thing is already clear, she says: the relationship between education and economic growth is far from straightforward. 'German-speaking central Europe is an excellent laboratory for testing theories of economic growth,'** *(Q17 — F)* **she explains. Between 1600 and 1900, literacy rates and book ownership were high and yet the region remained poor. It was also the case that local guilds and merchant associations were extremely powerful and legislated against anything that undermined their monopolies. In villages throughout the region, guilds blocked labour migration** *(Q25&26 — B)* **and resisted changes that might reduce their influence** *(Q25&26 — D)*.

'Early findings suggest that the potential benefits of education for the economy can be held back by other barriers, and this has implications for today,' says Ogilvie. 'Huge amounts are spent improving education in developing countries, but this spending can fail to deliver economic growth if restrictions block people – especially women and the poor – from using their education in economically productive ways. If economic institutions are poorly set up, for instance, education can't lead to growth.'
`,
      questions: "14–26",
      question_groups: [
        {
          questions: "14–18",
          instructions: "Reading Passage 2 has six sections, A–F. Which section contains the following information?",
          question_type: "Matching Information",
          items: [
            { question_number: 14, question_text: "an explanation of the need for research to focus on individuals with a fairly consistent income", answer: "E" },
            { question_number: 15, question_text: "examples of the sources the database has been compiled from", answer: "A" },
            { question_number: 16, question_text: "an account of one individual's refusal to obey an order", answer: "D" },
            { question_number: 17, question_text: "a reference to a region being particularly suited to research into the link between education and economic growth", answer: "F" },
            { question_number: 18, question_text: "examples of the items included in a list of personal possessions", answer: "C" }
          ]
        },
        {
          questions: "19–22",
          instructions: "Complete the summary below. Choose ONE WORD from the passage for each answer.",
          question_type: "Summary Completion",
          topic: "Demographic reconstruction of two German communities",
          content: [
            {
              text: "The database that Ogilvie and her team has compiled sheds light on the lives of a range of individuals, as well as those of their 19 [blank], over a 300-year period. For example, Ana Regina and Magdalena Riethmüllerin were reprimanded for reading while they should have been paying attention to a 20 [blank]. There was also Juliana Schweickherdt, who came to the notice of the weavers' guild in the year 1752 for breaking guild rules. As a punishment, she was later given a 21 [blank]. Cases like this illustrate how the guilds could prevent 22 [blank] and stop skilled people from working.",
              points: [
                { question_number: 19, answer: "descendants" },
                { question_number: 20, answer: "sermon" },
                { question_number: 21, answer: "fine" },
                { question_number: 22, answer: "innovation" }
              ]
            }
          ]
        },
        {
          questions: "23–24",
          instructions: "Choose TWO letters, A–E. Which TWO of the following statements does the writer make about literacy rates in Section B?",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [23, 24],
              question_text: "Which TWO of the following statements does the writer make about literacy rates in Section B?",
              options: {
                A: "Very little research has been done into the link between high literacy rates and improved earnings.",
                B: "Literacy rates in Germany between 1600 and 1900 were very good.",
                C: "There is strong evidence that high literacy rates in the modern world result in economic growth.",
                D: "England is a good example of how high literacy rates helped a country industrialise.",
                E: "Economic growth can help to improve literacy rates."
              },
              answer: ["B", "E"],
              grading_note: "IN EITHER ORDER"
            }
          ]
        },
        {
          questions: "25–26",
          instructions: "Choose TWO letters, A–E. Which TWO of the following statements does the writer make in Section F about guilds in German-speaking Central Europe between 1600 and 1900?",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [25, 26],
              question_text: "Which TWO of the following statements does the writer make in Section F about guilds in German-speaking Central Europe between 1600 and 1900?",
              options: {
                A: "They helped young people to learn a skill.",
                B: "They were opposed to people moving to an area for work.",
                C: "They kept better records than guilds in other parts of the world.",
                D: "They opposed practices that threatened their control over a trade.",
                E: "They predominantly consisted of wealthy merchants."
              },
              answer: ["B", "D"],
              grading_note: "IN EITHER ORDER"
            }
          ]
        }
      ]
    },
    {
      part_number: 3,
      part_type: "Reading Passage",
      topic: "Timur Gareyev – blindfold chess champion",
      passage_text: `**A**
Next month, a chess player named Timur Gareyev will take on nearly 50 opponents at once. But that is not the hard part. While his challengers will play the games as normal, Gareyev himself will be blindfolded. Even by world record standards, it sets a high bar for human performance. *(Q33 — FALSE)* The 28-year-old already stands out in the rarefied world of blindfold chess. He has a fondness for bright clothes and unusual hairstyles, and he gets his kicks from the adventure sport of BASE jumping. *(Q34 — NOT GIVEN)* He has already proved himself a strong chess player, too. In a 10-hour chess marathon in 2013, Gareyev played 33 games in his head simultaneously. He won 29 and lost none. The skill has become his brand: he calls himself the Blindfold King.

**B**
**But Gareyev's prowess has drawn interest from beyond the chess-playing community. In the hope of understanding how he and others like him can perform such mental feats, researchers at the University of California in Los Angeles (UCLA) called him in for tests.** *(Q30 — B)* *(Q35 — NOT GIVEN)* They now have their first results. 'The ability to play a game of chess with your eyes closed is not a far reach for most accomplished players,' said Jesse Rissman, who runs a memory lab at UCLA. 'But the thing that's so remarkable about Timur and a few other individuals is the number of games they can keep active at once. To me it is simply astonishing.'

**C**
Gareyev learned to play chess in his native Uzbekistan when he was six years old. Tutored by his grandfather, he entered his first tournament aged eight and soon became obsessed with competitions. At 16, he was crowned Asia's youngest ever chess grandmaster. He moved to the US soon after, and as a student helped his university win its first national chess championship. In 2013, Gareyev was ranked the third best chess player in the US.

**D**
**To the uninitiated, blindfold chess seems to call for superhuman skill. But displays of the feat go back centuries. The first recorded game in Europe was played in 13th-century Florence. In 1947, the Argentinian grandmaster Miguel Najdorf played 45 simultaneous games in his mind, winning 39 in the 24-hour session.** *(Q27 — D)*

**E**
**Accomplished players can develop the skill of playing blind even without realising it. The nature of the game is to run through possible moves in the mind to see how they play out. From this, regular players develop a memory for the patterns the pieces make, the defences and attacks.** *(Q28 — E)* 'You recreate it in your mind,' said Gareyev. 'A lot of players are capable of doing what I'm doing.' The real mental challenge comes from playing multiple games at once in the head. Not only must the positions of each piece on every board be memorised, they must be recalled faithfully when needed, updated with each player's moves, and then reliably stored again, so the brain can move on to the next board. First moves can be tough to remember because they are fairly uninteresting. **But the ends of games are taxing too, as exhaustion sets in. When Gareyev is tired, his recall can get patchy.** *(Q32 — E)* He sometimes makes moves based on only a fragmented memory of the pieces' positions. *(Q36 — TRUE)*

**F**
**The scientists first had Gareyev perform some standard memory tests. These assessed his ability to hold numbers, pictures and words in mind. One classic test measures how many numbers a person can repeat, both forwards and backwards, soon after hearing them. Most people manage about seven. 'He was not exceptional on any of these standard tests,' said Rissman. 'We didn't find anything other than playing chess that he seems to be supremely gifted at.'** *(Q29 — F)* But next came the brain scans. With Gareyev lying down in the machine, Rissman looked at how well connected the various regions of the chess player's brain were. Though the results are tentative and as yet unpublished, the scans found much greater than average **communication** *(Q39)* between parts of Gareyev's brain that make up what is called the frontoparietal control network. Of 63 people scanned alongside the chess player, only one or two scored more highly on the measure. 'You use this network in almost any complex task. It helps you to allocate attention, keep rules in mind, and work out whether you should be responding or not,' said Rissman.

**G**
It was not the only hint of something special in Gareyev's brain. The scans also suggest that Gareyev's **visual** *(Q40)* network is more highly connected to other brain parts than usual. Initial results suggest that the areas of his brain that process visual images – such as chess boards – may have stronger links to other brain regions, and so be more powerful than normal. While the analyses are not finalised yet, they may hold the first clues to Gareyev's extraordinary ability.

**H**
**For the world record attempt, Gareyev hopes to play 47 blindfold games at once in about 16 hours. He will need to win 80% to claim the title. 'I don't worry too much about the winning percentage, that's never been an issue for me,' he said. 'The most important part of blindfold chess for me is that I have found the one thing that I can fully dedicate myself to. I miss having an obsession.'** *(Q31 — H)*
`,
      questions: "27–40",
      question_groups: [
        {
          questions: "27–32",
          instructions: "Reading Passage 3 has eight paragraphs, A–H. Which paragraph contains the following information? NB You may use any letter more than once.",
          question_type: "Matching Information",
          items: [
            { question_number: 27, question_text: "a reference to earlier examples of blindfold chess", answer: "D" },
            { question_number: 28, question_text: "an outline of what blindfold chess involves", answer: "E" },
            { question_number: 29, question_text: "a claim that Gareyev's skill is limited to chess", answer: "F" },
            { question_number: 30, question_text: "why Gareyev's skill is of interest to scientists", answer: "B" },
            { question_number: 31, question_text: "an outline of Gareyev's priorities", answer: "H" },
            { question_number: 32, question_text: "a reason why the last part of a game may be difficult", answer: "E" }
          ]
        },
        {
          questions: "33–36",
          instructions: "Do the following statements agree with the information given in Reading Passage 3?",
          question_type: "True/False/Not Given",
          items: [
            { question_number: 33, question_text: "In the forthcoming games, all the participants will be blindfolded.", answer: "FALSE" },
            { question_number: 34, question_text: "Gareyev has won competitions in BASE jumping.", answer: "NOT GIVEN" },
            { question_number: 35, question_text: "UCLA is the first university to carry out research into blindfold chess players.", answer: "NOT GIVEN" },
            { question_number: 36, question_text: "Good chess players are likely to be able to play blindfold chess.", answer: "TRUE" }
          ]
        },
        {
          questions: "37–40",
          instructions: "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
          question_type: "Summary Completion",
          topic: "How the research was carried out",
          content: [
            {
              text: "The researchers started by testing Gareyev's 37 [blank]; for example, he was required to recall a string of 38 [blank] in order and also in reverse order. Although his performance was normal, scans showed an unusual amount of 39 [blank] within the areas of Gareyev's brain that are concerned with directing attention. In addition, the scans raised the possibility of unusual strength in the parts of his brain that deal with 40 [blank] input.",
              points: [
                { question_number: 37, answer: "memory" },
                { question_number: 38, answer: "numbers" },
                { question_number: 39, answer: "communication" },
                { question_number: 40, answer: "visual" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const cambridgeIelts17ReadingTest1Questions = {
  test_title: "Test 1",
  section: "Reading",
  parts: [
    {
      part_number: 1,
      part_type: "Reading Passage",
      topic: "The development of the London underground railway",
      passage_text: `**The development of the London underground railway**

In the first half of the 1800s, London's **\`population\`** *(Q1)* grew at an astonishing rate, and the central area became increasingly congested. In addition, the expansion of the overground railway network resulted in more and more passengers arriving in the capital. However, in 1846, a Royal Commission decided that the railways should not be allowed to enter the City, the capital's historic and business centre. The result was that the overground railway stations formed a ring around the City. The area within consisted of poorly built, overcrowded slums and the streets were full of horse-drawn traffic. Crossing the City became a nightmare. It could take an hour and a half to travel 8 km by horse-drawn carriage or bus. Numerous schemes were proposed to resolve these problems, but few succeeded.

Amongst the most vocal advocates for a solution to London's traffic problems was Charles Pearson, who worked as a solicitor for the City of London. He saw both social and economic advantages in building an underground railway that would link the overground railway stations together and clear London slums at the same time. His idea was to relocate the poor workers who lived in the inner-city slums to newly constructed **\`suburbs\`** *(Q2)*, and to provide cheap rail travel for them to get to work. Pearson's ideas gained support amongst some **\`businessmen\`** *(Q3)* and in 1851 he submitted a plan to Parliament. It was rejected, but coincided with a proposal from another group for an underground connecting line, which Parliament passed.

The two groups merged and established the Metropolitan Railway Company in August 1854. The company's plan was to construct an underground railway line from the Great Western Railway's (GWR) station at Paddington to the edge of the City at Farringdon Street – a distance of almost 5 km. The organisation had difficulty in raising the **\`funding\`** *(Q4)* for such a radical and expensive scheme, not least because of the critical articles printed by the **\`press\`** *(Q5)*. Objectors argued that the tunnels would collapse under the weight of traffic overhead, buildings would be shaken and passengers would be poisoned by the emissions from the train engines. However, Pearson and his partners persisted.

The GWR, aware that the new line would finally enable them to run trains into the heart of the City, invested almost £250,000 in the scheme. Eventually, over a five-year period, £1m was raised. The chosen route ran beneath existing main roads to minimise the expense of demolishing buildings. Originally scheduled to be completed in 21 months, the construction of the underground line took three years. It was built just below street level using a technique known as 'cut and cover'. A trench about ten metres wide and six metres deep was dug, and the sides temporarily held up with timber beams. Brick walls were then constructed, and finally a brick arch was added to create a tunnel. A two-metre-deep layer of **\`soil\`** *(Q6)* was laid on top of the tunnel and the road above rebuilt.

**The Metropolitan line, which opened on 10 January 1863, was the world's first underground railway.** *(Q7 — FALSE: no other country is mentioned as having done it first)* On its first day, almost 40,000 passengers were carried between Paddington and Farringdon, the journey taking about 18 minutes. By the end of the Metropolitan's first year of operation, 9.5 million journeys had been made.

Even as the Metropolitan began operation, the first extensions to the line were being authorised; these were built over the next five years, reaching Moorgate in the east of London and Hammersmith in the west. The original plan was to pull the trains with steam locomotives, using firebricks in the boilers to provide steam, but these engines were never introduced. Instead, the line used specially designed locomotives that were fitted with water tanks in which steam could be condensed. However, **smoke and fumes remained a problem, even though ventilation shafts were added to the tunnels.** *(Q9 — TRUE)*

Despite the extension of the underground railway, by the 1880s, congestion on London's streets had become worse. The problem was partly that the existing underground lines formed a circuit around the centre of London and extended to the suburbs, but did not cross the capital's centre. **The 'cut and cover' method of construction was not an option in this part of the capital. The only alternative was to tunnel deep underground.** *(Q10 — TRUE)*

Although the technology to create these tunnels existed, steam locomotives could not be used in such a confined space. It wasn't until the development of a reliable electric motor, and a means of transferring power from the generator to a moving train, that the world's first deep-level electric railway, the City & South London, became possible. The line opened in 1890, and ran from the City to Stockwell, south of the River Thames. The trains were made up of three carriages and driven by electric engines. **The carriages were narrow and had tiny windows just below the roof** *(Q11 — FALSE: windows were tiny and just below the roof, not at eye level)* because it was thought that passengers would not want to look out at the tunnel walls. The line was not without its problems, mainly caused by an unreliable power supply. **Although the City & South London Railway was a great technical achievement, it did not make a profit.** *(Q12 — FALSE)* Then, in 1900, the Central London Railway, known as the 'Tuppenny Tube', began operation using new electric locomotives. It was very popular and soon afterwards new railways and extensions were added to the growing tube network. By 1907, the heart of today's Underground system was in place.`,
      questions: "1–13",
      question_groups: [
        {
          questions: "1–6",
          instructions: "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
          topic: "The London underground railway",
          question_type: "Note Completion",
          content: [
            {
              heading: "The problem",
              points: [
                { question_number: 1, text: "The 1 [blank] of London increased rapidly between 1800 and 1850", answer: "population" },
                { text: "The streets were full of horse-drawn vehicles" }
              ]
            },
            {
              heading: "The proposed solution",
              points: [
                { text: "Charles Pearson, a solicitor, suggested building an underground railway" },
                { question_number: 2, text: "Building the railway would make it possible to move people to better housing in the 2 [blank]", answer: "suburbs" },
                { question_number: 3, text: "A number of 3 [blank] agreed with Pearson's idea", answer: "businessmen" },
                { question_number: 4, text: "The company initially had problems getting the 4 [blank] needed for the project", answer: "funding" },
                { question_number: 5, text: "Negative articles about the project appeared in the 5 [blank]", answer: "press" }
              ]
            },
            {
              heading: "The construction",
              points: [
                { text: "The chosen route did not require many buildings to be pulled down" },
                { text: "The 'cut and cover' method was used to construct the tunnels" },
                { question_number: 6, text: "With the completion of the brick arch, the tunnel was covered with 6 [blank]", answer: "soil" }
              ]
            }
          ]
        },
        {
          questions: "7–13",
          instructions: "Do the following statements agree with the information given in Reading Passage 1? Write TRUE, FALSE, or NOT GIVEN.",
          question_type: "True/False/Not Given",
          items: [
            { question_number: 7, question_text: "Other countries had built underground railways before the Metropolitan line opened.", answer: "FALSE" },
            { question_number: 8, question_text: "More people than predicted travelled on the Metropolitan line on the first day.", answer: "NOT GIVEN" },
            { question_number: 9, question_text: "The use of ventilation shafts failed to prevent pollution in the tunnels.", answer: "TRUE" },
            { question_number: 10, question_text: "A different approach from the 'cut and cover' technique was required in London's central area.", answer: "TRUE" },
            { question_number: 11, question_text: "The windows on City & South London trains were at eye level.", answer: "FALSE" },
            { question_number: 12, question_text: "The City & South London Railway was a financial success.", answer: "FALSE" },
            { question_number: 13, question_text: "Trains on the 'Tuppenny Tube' nearly always ran on time.", answer: "NOT GIVEN" }
          ]
        }
      ]
    },
    {
      part_number: 2,
      part_type: "Reading Passage",
      topic: "Stadiums: past, present and future",
      passage_text: `**Stadiums: past, present and future**

**A**
Stadiums are among the oldest forms of urban architecture: vast stadiums where the public could watch sporting events were at the centre of western city life as far back as the ancient Greek and Roman Empires, well before the construction of the great medieval cathedrals and the grand 19th- and 20th-century railway stations. **Today, however, stadiums are regarded with growing scepticism.** (Q14) Construction costs can soar above £1 billion, and stadiums finished for major events such as the Olympic Games or the FIFA World Cup have notably fallen into disuse and disrepair. But this need not be the case. History shows that stadiums can drive urban development and adapt to the culture of every age. Even today, architects and planners are finding new ways to adapt the mono-functional sports arenas which became emblematic of modernisation during the 20th century.

**B**
The amphitheatre of Arles in southwest France, with a capacity of 25,000 spectators, is perhaps the best example of just how versatile stadiums can be. Built by the Romans in 90 AD, it became a **fortress** (Q18) with four towers after the fifth century, and was then transformed into a village containing more than 200 houses. With the growing interest in conservation during the 19th century, it was converted back into an arena for the staging of **bullfights** (Q19), thereby returning the structure to its original use as a venue for public spectacles. Another example is the imposing arena of Verona in northern Italy, with space for 30,000 spectators, which was built 60 years before the Arles amphitheatre and 40 years before Rome's famous Colosseum. It has endured the centuries and is currently considered one of the world's prime sites for **opera** (Q20), thanks to its outstanding acoustics.

**C**
The area in the centre of the Italian town of Lucca, known as the Piazza dell'Anfiteatro, is yet another impressive example of an amphitheatre becoming absorbed into the fabric of the city. The site evolved in a similar way to Arles and was progressively filled with buildings from the Middle Ages until the 19th century, variously used as houses, a **salt** (Q21) depot and a prison. But rather than reverting to an arena, it became a market square, designed by Romanticist architect Lorenzo Nottolini. Today, the ruins of the amphitheatre remain embedded in the various **shops** (Q22) and residences surrounding the public square.

**D**
There are many similarities between modern stadiums and the ancient amphitheatres intended for games. **But some of the flexibility was lost at the beginning of the 20th century, as stadiums were developed using new products such as steel and reinforced concrete, and made use of bright lights for night-time matches.** (Q17) **Many such stadiums are situated in suburban areas, designed for sporting use only** (Q23, Q24) and surrounded by parking lots. These factors mean that they may not be as accessible to the general public, require more energy to run and contribute to urban heat.

**E**
But many of today's most innovative architects see scope for the stadium to help improve the city. Among the current strategies, two seem to be having particular success: the stadium as an urban hub, and as a power plant. **There's a growing trend for stadiums to be equipped with public spaces and services that serve a function beyond sport, such as hotels, retail outlets, conference centres, restaurants and bars, children's playgrounds and green space.** (Q16) **Creating mixed-use developments such as this reinforces compactness and multi-functionality, making more efficient use of land and helping to regenerate urban spaces.** (Q25, Q26) This opens the space up to families and a wider cross-section of society, instead of catering only to sportspeople and supporters. There have been many examples of this in the UK: the mixed-use facilities at Wembley and Old Trafford have become a blueprint for many other stadiums in the world.

**F**
The phenomenon of stadiums as power stations has arisen from the idea that energy problems can be overcome by integrating interconnected buildings by means of a smart grid, which is an electricity supply network that uses digital communications technology to detect and react to local changes in usage. Stadiums are ideal for these purposes, because their canopies have a large surface area for fitting photovoltaic panels and rise high enough (more than 40 metres) to make use of micro wind turbines. **Freiburg Mage Solar Stadium in Germany is the first of a new wave of stadiums as power plants, which also includes the Amsterdam Arena and the Kaohsiung Stadium. The latter, inaugurated in 2009, has 8,844 photovoltaic panels producing up to 1.14 GWh of electricity annually. This reduces the annual output of carbon dioxide by 660 tons and supplies up to 80 percent of the surrounding area when the stadium is not in use.** (Q15) This is proof that a stadium can serve its city, and have a decidedly positive impact in terms of reduction of CO2 emissions.

**G**
Sporting arenas have always been central to the life and culture of cities. In every era, the stadium has acquired new value and uses: from military fortress to residential village, public space to theatre and most recently a field for experimentation in advanced engineering. The stadium of today now brings together multiple functions, thus helping cities to create a sustainable future.`,
      questions: "14–26",
      question_groups: [
        {
          questions: "14–17",
          instructions: "Reading Passage 2 has seven sections, A–G. Which section contains the following information? Write the correct letter, A-G. You may use any letter more than once.",
          question_type: "Matching Information",
          items: [
            { question_number: 14, question_text: "a mention of negative attitudes towards stadium building projects", answer: "A" },
            { question_number: 15, question_text: "figures demonstrating the environmental benefits of a certain stadium", answer: "F" },
            { question_number: 16, question_text: "examples of the wide range of facilities available at some new stadiums", answer: "E" },
            { question_number: 17, question_text: "reference to the disadvantages of the stadiums built during a certain era", answer: "D" }
          ]
        },
        {
          questions: "18–22",
          instructions: "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
          topic: "Roman amphitheatres",
          question_type: "Summary Completion",
          content: [
            { text: "The Roman stadiums of Europe have proved very versatile. The amphitheatre of Arles, for example, was converted first into a 18 [blank],", answer: "18 fortress", points: [{ question_number: 18, answer: "fortress" }] },
            { text: "then into a residential area and finally into an arena where spectators could watch 19 [blank].", answer: "19 bullfights", points: [{ question_number: 19, answer: "bullfights" }] },
            { text: "Meanwhile, the arena in Verona, one of the oldest Roman amphitheatres, is famous today as a venue where 20 [blank] is performed.", answer: "20 opera", points: [{ question_number: 20, answer: "opera" }] },
            { text: "The site of Lucca's amphitheatre has also been used for many purposes over the centuries, including the storage of 21 [blank].", answer: "21 salt", points: [{ question_number: 21, answer: "salt" }] },
            { text: "It is now a market square with 22 [blank] and homes incorporated into the remains of the Roman amphitheatre.", answer: "22 shops", points: [{ question_number: 22, answer: "shops" }] }
          ]
        },
        {
          questions: "23–24",
          instructions: "Choose TWO letters, A–E. When comparing twentieth-century stadiums to ancient amphitheatres in Section D, which TWO negative features does the writer mention?",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [23, 24],
              question_text: "When comparing twentieth-century stadiums to ancient amphitheatres in Section D, which TWO negative features does the writer mention?",
              options: { A: "They are less imaginatively designed.", B: "They are less spacious.", C: "They are in less convenient locations.", D: "They are less versatile.", E: "They are made of less durable materials." },
              answer: ["C", "D"],
              grading_note: "IN EITHER ORDER"
            }
          ]
        },
        {
          questions: "25–26",
          instructions: "Choose TWO letters, A–E. Which TWO advantages of modern stadium design does the writer mention?",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [25, 26],
              question_text: "Which TWO advantages of modern stadium design does the writer mention?",
              options: { A: "offering improved amenities for the enjoyment of sports events", B: "bringing community life back into the city environment", C: "facilitating research into solar and wind energy solutions", D: "enabling local residents to reduce their consumption of electricity", E: "providing a suitable site for the installation of renewable power generators" },
              answer: ["B", "E"],
              grading_note: "IN EITHER ORDER"
            }
          ]
        }
      ]
    },
    {
      part_number: 3,
      part_type: "Reading Passage",
      topic: "To catch a king",
      passage_text: `**To catch a king**
Anna Keay reviews Charles Spencer's book about the hunt for King Charles II during the English Civil War of the seventeenth century

Charles Spencer's latest book, *To Catch a King*, tells us the story of the hunt for King Charles II in the six weeks after his resounding defeat at the Battle of Worcester in September 1651. And what a story it is. After his father was executed by the Parliamentarians in 1649, **the young Charles II sacrificed one of the very principles his father had died for and did a deal with the Scots, thereby accepting Presbyteranism as the national religion in return for being crowned King of Scots.** *(Q27, Q28 — strategic alliance, religious conviction)* **His arrival in Edinburgh prompted the English Parliamentary army to invade Scotland in a pre-emptive strike.** *(Q36 — B: the first paragraph gives account of circumstances leading to Charles II's escape)* This was followed by a Scottish invasion of England. The two sides finally faced one another at Worcester in the west of England in 1651. **After being comprehensively defeated on the meadows outside the city by the Parliamentarian army,** *(Q29 — decisive victory)* **the 21-year-old king found himself the subject of a national manhunt, with a huge sum offered for his capture.** *(Q30 — large reward [B])* **Over the following six weeks he managed, through a series of heart-poundingly close escapes, to evade the Parliamentarians before seeking refuge in France.** *(Q31 — relative safety)* For the next nine years, the penniless and defeated Charles wandered around Europe with only a small group of loyal supporters.

Years later, after his restoration as king, the 50-year-old Charles II requested a meeting with the writer and diarist Samuel Pepys. His intention when asking Pepys to commit his story to paper was to ensure that this most extraordinary episode was never forgotten. **Over two three-hour sittings, the king related to him in great detail his personal recollections of the six weeks he had spent as a fugitive.** *(Q33 — NO: the passage says Charles gave "great detail" in his personal recollections — contradicting the idea that his account lacked detail)* As the king and secretary settled down (a scene that is surely a gift for a future scriptwriter), Charles commenced his story: **'After the battle was so absolutely lost as to be beyond hope of recovery, I began to think of the best way of saving myself.'** *(Q34 — NO: he started thinking of escape only after the battle was lost, not before)*

One of the joys of Spencer's book, a result not least of its use of Charles II's own narrative as well as those of his supporters, is just how close the reader gets to the action. **The day-by-day retelling of the fugitives' doings provides delicious details: the cutting of the king's long hair with agricultural shears, the use of walnut leaves to dye his pale skin, and the day Charles spent lying on a branch of the great oak tree in Boscobel Wood as the Parliamentary soldiers scoured the forest floor below.** *(Q37 — C: these examples illustrate how vividly the events of the six weeks are brought to life)* **Spencer draws out both the humour – such as the preposterous refusal of Charles's friend Henry Wilmot to adopt disguise on the grounds that it was beneath his dignity – and the emotional tension when the secret of the king's presence was cautiously revealed to his supporters.** *(Q35 — YES: the inclusion of Charles's account is highlighted as one of the joys/positive aspects of the book)*

Charles's adventures after losing the **\`Battle of Worcester\`** hide the uncomfortable truth that whilst almost everyone in England had been appalled by the execution of his father, they had not welcomed the arrival of his son with the Scots army, but had instead firmly bolted their doors. This was partly because he rode at the head of what looked like a foreign invasion force and partly because, after almost a decade of civil war, people were desperate to avoid it beginning again. This makes it all the more interesting that **\`Charles II himself loved the story so much ever after. As well as retelling it to anyone who would listen, causing eye-rolling among courtiers, he set in train a series of initiatives to memorialise it.\`** *(Q38 — A: He chose to celebrate what was essentially a defeat)* There was to be a new order of chivalry, the Knights of the Royal Oak. A series of enormous oil paintings depicting the episode were produced, including a two-metre-wide canvas of Boscobel Wood and a set of six similarly enormous paintings of the king on the run. In 1660, Charles II commissioned the artist John Michael Wright to paint a flying squadron of cherubs carrying an oak tree to the heavens on the ceiling of his bedchamber. It is hard to imagine many other kings marking the lowest point in their life so enthusiastically, or indeed pulling off such an escape in the first place.

Charles Spencer is the perfect person to pass the story on to a new generation. **\`His pacey, readable prose steers deftly clear of modern idioms and elegantly brings to life the details of the great tale. He has even-handed sympathy for both the fugitive king and the fierce republican regime that hunted him, and he succeeds in his desire to explore far more of the background of the story than previous books on the subject have done.\`** *(Q39 — B: he takes an unbiased approach to the subject matter)* Indeed, the opening third of the book is about how Charles II found himself at Worcester in the first place, which for some will be reason alone to read *To Catch a King*.

The tantalising question left, in the end, is that of what it all meant. Would Charles II have been a different king had these six weeks never happened? The days and nights spent in hiding must have affected him in some way. Did the need to assume disguises, to survive on wit and charm alone, to use trickery and subterfuge to escape from tight corners help form him? **\`This is the one area where the book doesn't quite hit the mark. Instead its depiction of Charles II in his final years as an ineffective, pleasure-loving monarch doesn't do justice to the man (neither is it accurate), or to the complexity of his character.\`** *(Q40 — D: the book fails to address whether Charles II's experiences had a lasting influence on him)* But this one niggle aside, *To Catch a King* is an excellent read, and those who come to it knowing little of the famous tale will find they have a treat in store.`,
      questions: "27–40",
      question_groups: [
        {
          questions: "27–31",
          instructions: "Complete the summary using the list of phrases, A–J, below.",
          topic: "The story behind the hunt for Charles II",
          question_type: "Summary Completion",
          options_box: {
            title: "Phrases",
            options: {
              A: "military innovation",
              B: "large reward",
              C: "widespread conspiracy",
              D: "relative safety",
              E: "new government",
              F: "decisive victory",
              G: "political debate",
              H: "strategic alliance",
              I: "popular solution",
              J: "religious conviction"
            }
          },
          content: [
            { text: "Charles II's father was executed by the Parliamentarian forces in 1649. Charles II then formed a 27 [blank] with the Scots, and in order to become King of Scots, he abandoned an important 28 [blank] that was held by his father and had contributed to his father's death. The opposing sides then met outside Worcester in 1651. The battle led to a 29 [blank] for the Parliamentarians and Charles had to flee for his life. A 30 [blank] was offered for Charles's capture, but after six weeks spent in hiding, he eventually managed to reach the 31 [blank] of continental Europe.", points: [{ question_number: 27, answer: "H" }, { question_number: 28, answer: "J" }, { question_number: 29, answer: "F" }, { question_number: 30, answer: "B" }, { question_number: 31, answer: "D" }] }
          ]
        },
        {
          questions: "32–35",
          instructions: "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES, NO, or NOT GIVEN.",
          question_type: "Yes/No/Not Given",
          items: [
            { question_number: 32, question_text: "Charles chose Pepys for the task because he considered him to be trustworthy.", answer: "NOT GIVEN" },
            { question_number: 33, question_text: "Charles's personal recollection of the escape lacked sufficient detail.", answer: "NO" },
            { question_number: 34, question_text: "Charles indicated to Pepys that he had planned his escape before the battle.", answer: "NO" },
            { question_number: 35, question_text: "The inclusion of Charles's account is a positive aspect of the book.", answer: "YES" }
          ]
        },
        {
          questions: "36–40",
          instructions: "Choose the correct letter, A, B, C or D.",
          question_type: "Multiple Choice (one answer)",
          items: [
            { question_number: 36, question_text: "What is the reviewer's main purpose in the first paragraph?", options: { A: "to describe what happened during the Battle of Worcester", B: "to give an account of the circumstances leading to Charles II's escape", C: "to provide details of the Parliamentarians' political views", D: "to compare Charles II's beliefs with those of his father" }, answer: "B" },
            { question_number: 37, question_text: "Why does the reviewer include examples of the fugitives' behaviour in the third paragraph?", options: { A: "to explain how close Charles II came to losing his life", B: "to suggest that Charles II's supporters were badly prepared", C: "to illustrate how the events of the six weeks are brought to life", D: "to argue that certain aspects are not as well known as they should be" }, answer: "C" },
            { question_number: 38, question_text: "What point does the reviewer make about Charles II in the fourth paragraph?", options: { A: "He chose to celebrate what was essentially a defeat.", B: "He misunderstood the motives of his opponents.", C: "He aimed to restore people's faith in the monarchy.", D: "He was driven by a desire to be popular." }, answer: "A" },
            { question_number: 39, question_text: "What does the reviewer say about Charles Spencer in the fifth paragraph?", options: { A: "His decision to write the book comes as a surprise.", B: "He takes an unbiased approach to the subject matter.", C: "His descriptions of events would be better if they included more detail.", D: "He chooses language that is suitable for a twenty-first-century audience." }, answer: "B" },
            { question_number: 40, question_text: "When the reviewer says the book 'doesn't quite hit the mark', she is making the point that", options: { A: "it overlooks the impact of events on ordinary people.", B: "it lacks an analysis of prevalent views on monarchy.", C: "it omits any references to the deceit practised by Charles II during his time in hiding.", D: "it fails to address whether Charles II's experiences had a lasting influence on him." }, answer: "D" }
          ]
        }
      ]
    }
  ]
};

const cambridgeIelts17ListeningTest1Questions = {
  test_title: "Test 1",
  section: "Listening",
  parts: [
    {
      part_number: 1,
      part_type: "Basic Conversation",
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843893/ELT_IELTS17_t1_audio1_yaagme.mp3",
      questions: "1–10",
      topic: "Buckworth Conservation Group",
      transcript: [
        { speaker: "PETER", text: "Hello?" },
        { speaker: "JAN", text: "Oh hello. My name's Jan. Are you the right person to talk to about the Buckworth Conservation Group?" },
        { speaker: "PETER", text: "Yes, I'm Peter. I'm the secretary." },
        { speaker: "JAN", text: "Good. I've just moved to this area, and I'm interested in getting involved. I was in a similar group where I used to live. Could you tell me something about your activities, please?" },
        { speaker: "PETER", text: "Of course. Well, we have a mixture of regular activities and special events. One of the regular ones is trying to keep the beach free of litter. A few of us spend a couple of hours a month on it, and it's awful how much there is to clear. I wish people would be more responsible and take it home with them.", question_number: 1, highlight_text: "litter" },
        { speaker: "JAN", text: "I totally agree. I'd be happy to help with that. Is it OK to take dogs?", question_number: 2, highlight_text: "dogs" },
        { speaker: "PETER", text: "I'm afraid not, as they're banned from the beach itself. You can take them along the cliffs, though. And children are welcome." },
        { speaker: "JAN", text: "Right." },
        { speaker: "PETER", text: "We also manage a nature reserve, and there's a lot to do there all year round. For example, because it's a popular place to visit, we spend a lot of time looking after the paths and making sure they're in good condition for walking." },
        { speaker: "JAN", text: "I could certainly help with that." },
        { speaker: "PETER", text: "Good. And we have a programme of creating new habitats there. We've just finished making and installing nesting boxes for birds to use, and next we're going to work on encouraging insects – they're important for the biodiversity of the reserve.", question_number: 3, highlight_text: "insects" },
        { speaker: "JAN", text: "They certainly are." },
        { speaker: "PETER", text: "Oh, and we're also running a project to identify the different species of butterflies that visit the reserve. You might be interested in taking part in that.", question_number: 4, highlight_text: "butterflies" },
        { speaker: "JAN", text: "Sure. I was involved in something similar where I used to live, counting all the species of moths. I'd enjoy that." },
        { speaker: "PETER", text: "Another job we're doing at the reserve is replacing the wall on the southern side, between the parking area and our woodshed. It was badly damaged in a storm last month.", question_number: 5, highlight_text: "wall" },
        { speaker: "JAN", text: "OK." },
        { speaker: "PETER", text: "Then as I said, we have a programme of events as well, both at the weekend, and during the week." },
        { speaker: "JAN", text: "Right. I presume you have guided walks? I'd like to get to know the local countryside, as I'm new to the area." },
        { speaker: "PETER", text: "Yes, we do. The next walk is to Ruston Island, a week on Saturday. We'll be meeting in the car park at Dunsmore Beach at low tide – that's when the sands are dry enough for us to walk to the island without getting wet.", question_number: 6, highlight_text: "island" },
        { speaker: "JAN", text: "Sounds good." },
        { speaker: "PETER", text: "The island's a great place to explore. It's quite small, and it's got a range of habitats. It's also an ideal location for seeing seals just off the coast, or even on the beach." },
        { speaker: "JAN", text: "OK. And is there anything we should bring, like a picnic, for instance?" },
        { speaker: "PETER", text: "Yes, do bring one, as it's a full-day walk. And of course it'll be wet walking across and back, so make sure your boots are waterproof.", question_number: 7, highlight_text: "boots" },
        { speaker: "JAN", text: "I must buy a new pair – there's a hole in one of my current ones! Well, I'd definitely like to come on the walk." },
        { speaker: "PETER", text: "Great. Then later this month we're having a one-day woodwork session in Hopton Wood." },
        { speaker: "JAN", text: "I've never tried that before. Is it OK for beginners to take part?", question_number: 8, highlight_text: "beginners" },
        { speaker: "PETER", text: "Definitely. There'll be a couple of experts leading the session, and we keep the number of participants down, so you'll get as much help as you need." },
        { speaker: "JAN", text: "Excellent! I'd love to be able to make chairs." },
        { speaker: "PETER", text: "That's probably too ambitious for one day! You'll be starting with wooden spoons, and of course learning how to use the tools. And anything you make is yours to take home with you.", question_number: 9, highlight_text: "spoons" },
        { speaker: "JAN", text: "That sounds like fun. When is it?" },
        { speaker: "PETER", text: "It's on the 17th, from 10 a.m. until 3. There's a charge of £35, including lunch, or £40 if you want to camp in the wood.", question_number: 10, highlight_text: "35" },
        { speaker: "JAN", text: "I should think I'll come home the same day. Well, I'd certainly like to join the group." },
      ],
      question_groups: [
        {
          questions: "1–5",
          instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
          topic: "Buckworth Conservation Group – Regular activities",
          question_type: "Note Completion",
          content: [
            {
              heading: "Beach",
              points: [
                { question_number: 1, text: "keeping the beach free of 1 ..............................", answer: "litter", timestamp_seconds: 123 },
                { question_number: 2, text: "no 2 .............................. allowed", answer: "dogs", timestamp_seconds: 135 },
              ],
            },
            {
              heading: "Nature reserve",
              points: [
                { text: "maintaining paths" },
                { text: "nesting boxes for birds installed" },
                { question_number: 3, text: "next task: encouraging 3 ..............................", answer: "insects", timestamp_seconds: 172 },
                { question_number: 4, text: "identifying types of 4 ..............................", answer: "butterflies", timestamp_seconds: 184 },
                { question_number: 5, text: "building a new 5 ..............................", answer: "wall", timestamp_seconds: 197 },
              ],
            },
          ],
        },
        {
          questions: "6–10",
          instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
          topic: "Buckworth Conservation Group – Forthcoming events",
          question_type: "Note Completion",
          content: [
            {
              heading: "Saturday walk",
              points: [
                { text: "meet at Dunsmore Beach car park" },
                { question_number: 6, text: "walk to the 6 ..............................", answer: "island", timestamp_seconds: 277 },
                { question_number: 7, text: "bring a picnic and waterproof 7 ..............................", answer: "boots", timestamp_seconds: 305 },
              ],
            },
            {
              heading: "Woodwork session",
              points: [
                { question_number: 8, text: "suitable for 8 ..............................", answer: "beginners", timestamp_seconds: 324 },
                { question_number: 9, text: "making 9 .............................. out of wood", answer: "spoons", timestamp_seconds: 344 },
                { text: "17th, from 10 a.m. to 3 p.m." },
                { question_number: 10, text: "cost (no camping): £ 10 ..............................", answer: "35 / thirty five", timestamp_seconds: 356 },
              ],
            },
          ],
        },
      ],
    },
    {
      part_number: 2,
      part_type: "Short Monologue",
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843894/ELT_IELTS17_t1_audio2_fshrgc.mp3",
      questions: "11–20",
      topic: "Boat trip round Tasmania",
      transcript: [
        { speaker: "LOU", text: "So, hello everyone. My name's Lou Miller and I'm going to be your tour guide today as we take this fantastic boat trip around the Tasmanian coast. Before we set off, I just want to tell you a few things about our journey." },
        { speaker: "LOU", text: "Our boats aren't huge as you can see. We already have three staff members on board and on top of that, we can transport a further fifteen people – that's you – around the coastline. But please note if there are more than nine people on either side of the boat, we'll move some of you over, otherwise all eighteen of us will end up in the sea!", question_number: 11, highlight_text: "nine people on either side" },
        { speaker: "LOU", text: "We've recently upgraded all our boats. They used to be jet black, but our new ones now have these comfortable dark red seats and a light-green exterior in order to stand out from others and help promote our company. This gives our boats a rather unique appearance, don't you think?", question_number: 12, highlight_text: "light-green exterior" },
        { speaker: "LOU", text: "We offer you a free lunchbox during the trip and we have three types. Lunchbox 1 contains ham and tomato sandwiches. Lunchbox 2 contains a cheddar cheese roll and Lunchbox 3 is salad-based and also contains eggs and tuna. All three lunchboxes also have a packet of crisps and chocolate bar inside. Please let staff know which lunchbox you prefer.", question_number: 13, highlight_text: "Lunchbox 2 contains a cheddar cheese roll" },
        { speaker: "LOU", text: "I'm sure I don't have to ask you not to throw anything into the sea. We don't have any bins to put litter in, but Jess, myself or Ray, our other guide, will collect it from you after lunch and put it all in a large plastic sack.", question_number: 14, highlight_text: "Jess, myself or Ray, our other guide, will collect it from you" },
        { speaker: "LOU", text: "The engine on the boat makes quite a lot of noise so before we head off, let me tell you a few things about what you're going to see." },
        { speaker: "LOU", text: "This area is famous for its ancient lighthouse, which you'll see from the boat as we turn past the first little island. It was built in 1838 to protect sailors as a number of shipwrecks had led to significant loss of life. The construction itself was complicated as some of the original drawings kept by the local council show. It sits right on top of the cliffs in a very isolated spot. In the nineteenth century there were many jobs there, such as polishing the brass lamps, chopping firewood and cleaning windows, that kept lighthouse keepers busy. These workers were mainly prison convicts until the middle of that century when ordinary families willing to live in such circumstances took over.", question_number: 15, highlight_text: "to protect sailors as a number of shipwrecks had led to significant loss of life", question_markers: [{ question_number: 15, highlight_text: "to protect sailors as a number of shipwrecks had led to significant loss of life" }, { question_number: 16, highlight_text: "These workers were mainly prison convicts until the middle of that century when ordinary families willing to live in such circumstances took over" }] },
        { speaker: "LOU", text: "Some of you have asked me what creatures we can expect to see. I know everyone loves the penguins, but they're very shy and, unfortunately, tend to hide from passing boats, but you might see birds in the distance, such as sea eagles, flying around the cliff edges where they nest. When we get to the rocky area inhabited by fur seals, we'll stop and watch them swimming around the coast. They're inquisitive creatures so don't be surprised if one pops up right in front of you. Their predators, orca whales, hunt along the coastline too, but spotting one of these is rare. Dolphins, on the other hand, can sometimes approach on their own or in groups as they ride the waves beside us.", question_number: 17, highlight_text: "fur seals, we'll stop and watch them swimming around the coast", question_markers: [{ question_number: 17, highlight_text: "fur seals, we'll stop and watch them swimming around the coast" }, { question_number: 18, highlight_text: "Dolphins, on the other hand, can sometimes approach on their own or in groups" }] },
        { speaker: "LOU", text: "Lastly, I want to mention the caves. Tasmania is famous for its caves and the ones we'll pass by are so amazing that people are lost for words when they see them. They can only be approached by sea, but if you feel that you want to see more than we're able to show you, then you can take a kayak into the area on another day and one of our staff will give you more information on that. What we'll do is to go through a narrow channel, past some incredible rock formations and from there we'll be able to see the openings to the caves, and at that point we'll talk to you about what lies beyond.", question_number: 19, highlight_text: "They can only be approached by sea", question_markers: [{ question_number: 19, highlight_text: "They can only be approached by sea" }, { question_number: 20, highlight_text: "we'll be able to see the openings to the caves, and at that point we'll talk to you about what lies beyond" }] },
      ],
      question_groups: [
        {
          questions: "11–14",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 11,
              question_text:
                "What is the maximum number of people who can stand on each side of the boat?",
              options: { A: "9", B: "15", C: "18" },
              answer: "A",
              timestamp_seconds: 86,
            },
            {
              question_number: 12,
              question_text: "What colour are the tour boats?",
              options: { A: "dark red", B: "jet black", C: "light green" },
              answer: "C",
              timestamp_seconds: 105,
            },
            {
              question_number: 13,
              question_text:
                "Which lunchbox is suitable for someone who doesn't eat meat or fish?",
              options: { A: "Lunchbox 1", B: "Lunchbox 2", C: "Lunchbox 3" },
              answer: "B",
              timestamp_seconds: 133,
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
              timestamp_seconds: 162,
            },
          ],
        },
        {
          questions: "15–20",
          instructions: "Choose TWO letters, A–E.",
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
              timestamp_seconds: 230,
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
              timestamp_seconds: 297,
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
              timestamp_seconds: 344,
            },
          ],
        },
      ],
    },
    {
      part_number: 3,
      part_type: "Academic Discussion",
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843896/ELT_IELTS17_t1_audio3_eidh3p.mp3",
      questions: "21–30",
      topic: "Work experience for veterinary science students",
      transcript: [
        { speaker: "DIANA", text: "So, Tim, we have to do a short summary of our work experience on a farm." },
        { speaker: "TIM", text: "Right. My farm was great, but arranging the work experience was hard. One problem was it was miles away and I don't drive. And also, I'd really wanted a placement for a month, but I could only get one for two weeks.", question_number: 21, highlight_text: "arranging the work experience was hard" },
        { speaker: "DIANA", text: "I was lucky, the farmer let me stay on the farm so I didn't have to travel. But finding the right sort of farm to apply to wasn't easy." },
        { speaker: "TIM", text: "No, they don't seem to have websites, do they. I found mine through a friend of my mother's, but it wasn't easy." },
        { speaker: "DIANA", text: "No." },
        { speaker: "TIM", text: "My farm was mostly livestock, especially sheep. I really enjoyed helping out with them. I was up most of one night helping a sheep deliver a lamb.", question_number: 22, highlight_text: "I was up most of one night helping a sheep deliver a lamb" },
        { speaker: "DIANA", text: "On your own?" },
        { speaker: "TIM", text: "No, the farmer was there, and he told me what to do. It wasn't a straightforward birth, but I managed. It was a great feeling to see the lamb stagger to its feet and start feeding almost straightaway, and to know that it was OK." },
        { speaker: "DIANA", text: "Mm." },
        { speaker: "TIM", text: "Then another time a lamb had broken its leg, and they got the vet in to set it, and he talked me through what he was doing. That was really useful." },
        { speaker: "DIANA", text: "Yes, my farm had sheep too. The farm was in a valley and they had a lowland breed called Suffolks, although the farmer said they'd had other breeds in the past." },
        { speaker: "TIM", text: "So were they bred for their meat?", question_number: 23, highlight_text: "So were they bred for their meat?" },
        { speaker: "DIANA", text: "Mostly, yes. They're quite big and solid." },
        { speaker: "TIM", text: "My farm was up in the hills and they had a different breed of sheep, they were Cheviots." },
        { speaker: "DIANA", text: "Oh, I heard their wool's really sought after." },
        { speaker: "TIM", text: "Yes. It's very hardwearing and they use it for carpets." },
        { speaker: "DIANA", text: "Right." },
        { speaker: "TIM", text: "I was interested in the amount of supplements they add to animals' feed nowadays. Like, even the chickens got extra vitamins and electrolytes in their feed." },
        { speaker: "DIANA", text: "Yes, I found that too. And they're not cheap. But my farmer said some are overpriced for what they are. And he didn't give them as a matter of routine, just at times when the chickens seemed to particularly require them.", question_number: 24, highlight_text: "he didn't give them as a matter of routine, just at times when the chickens seemed to particularly require them" },
        { speaker: "TIM", text: "Yes, mine said the same. He said certain breeds of chickens might need more supplements than the others, but the cheap and expensive ones are all basically the same." },
        { speaker: "DIANA", text: "Mm." },
        { speaker: "TIM", text: "So did your farm have any other livestock, Diana?" },
        { speaker: "DIANA", text: "Yes, dairy cows. I made a really embarrassing mistake when I was working in the milk shed. Some cows had been treated with antibiotics, so their milk wasn't suitable for human consumption, and it had to be put in a separate container. But I got mixed up, and I poured some milk from the wrong cow in with the milk for humans, so the whole lot had to be thrown away. The farmer wasn't too happy with me.", question_number: 25, highlight_text: "I got mixed up, and I poured some milk from the wrong cow in with the milk for humans, so the whole lot had to be thrown away" },
        { speaker: "TIM", text: "I asked my farmer how much he depended on the vet to deal with health problems. I'd read reports that the livestock's health is being affected as farmers are under pressure to increase production. Well, he didn't agree with that, but he said that actually some of the stuff the vets do, like minor operations, he'd be quite capable of doing himself.", question_number: 26, highlight_text: "some of the stuff the vets do, like minor operations, he'd be quite capable of doing himself" },
        { speaker: "DIANA", text: "Yeah. My farmer said the same. But he reckons vets' skills are still needed." },
        { speaker: "DIANA", text: "Now we've got to give a bit of feedback about last term's modules – just short comments, apparently. Shall we do that now?" },
        { speaker: "TIM", text: "OK. So medical terminology." },
        { speaker: "DIANA", text: "Well, my heart sank when I saw that, especially right at the beginning of the course. And I did struggle with it." },
        { speaker: "TIM", text: "I'd thought it'd be hard, but actually I found it all quite straightforward.", question_number: 27, highlight_text: "I'd thought it'd be hard, but actually I found it all quite straightforward" },
        { speaker: "TIM", text: "What did you think about diet and nutrition?" },
        { speaker: "DIANA", text: "OK, I suppose." },
        { speaker: "TIM", text: "Do you remember what they told us about pet food and the fact that there's such limited checking into whether or not it's contaminated? I mean in comparison with the checks on food for humans – I thought that was terrible.", question_number: 28, highlight_text: "there's such limited checking into whether or not it's contaminated" },
        { speaker: "DIANA", text: "Mm. I think the module that really impressed me was the animal disease one, when we looked at domesticated animals in different parts of the world, like camels and water buffalo and alpaca. The economies of so many countries depend on these, but scientists don't know much about the diseases that affect them.", question_number: 29, highlight_text: "scientists don't know much about the diseases that affect them" },
        { speaker: "TIM", text: "Yes, I thought they'd know a lot about ways of controlling and eradicating those diseases, but that's not the case at all. I loved the wildlife medication unit. Things like helping birds that have been caught in oil spills. That's something I hadn't thought about before." },
        { speaker: "DIANA", text: "Yeah, I thought I might write my dissertation on something connected with that.", question_number: 30, highlight_text: "I thought I might write my dissertation on something connected with that" },
        { speaker: "TIM", text: "Right. So ...." },
      ],
      question_groups: [
        {
          questions: "21–26",
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
              timestamp_seconds: 74,
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
              timestamp_seconds: 115,
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
              timestamp_seconds: 158,
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
              timestamp_seconds: 195,
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
              timestamp_seconds: 235,
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
              timestamp_seconds: 262,
            },
          ],
        },
        {
          questions: "27–30",
          instructions:
            "What opinion do the students give about each of the following modules on their veterinary science course? Choose FOUR answers from the box and write the correct letter, A–F, next to questions 27–30.",
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
            { question_number: 27, prompt: "Medical terminology", answer: "A", timestamp_seconds: 334 },
            { question_number: 28, prompt: "Diet and nutrition", answer: "E", timestamp_seconds: 344 },
            { question_number: 29, prompt: "Animal disease", answer: "F", timestamp_seconds: 370 },
            { question_number: 30, prompt: "Wildlife medication", answer: "C", timestamp_seconds: 395 },
          ],
        },
      ],
    },
    {
      part_number: 4,
      part_type: "Academic Lecture",
      audio_url:
        "https://res.cloudinary.com/dalaaegob/video/upload/v1773843901/ELT_IELTS17_t1_audio4_yvhjwu.mp3",
      questions: "31–40",
      topic: "Labyrinths",
      instructions:
        "Complete the notes below. Write ONE WORD ONLY for each answer.",
      question_type: "Note Completion",
      transcript: [
        { speaker: "LECTURER", text: "Labyrinths have existed for well over 4,000 years. Labyrinths and labyrinthine symbols have been found in regions as diverse as modern-day Turkey, Ireland, Greece, and India. There are various designs of labyrinth but what they all have in common is a winding spiral path which leads to a central area. There is one starting point at the entrance and the goal is to reach the central area. Finding your way through a labyrinth involves many twists and turns, but it's not possible to get lost as there is only one single path." },
        { speaker: "LECTURER", text: "In modern times, the word labyrinth has taken on a different meaning and is often used as a synonym for a maze. A maze is quite different as it is a kind of puzzle with an intricate network of paths. Mazes became fashionable in the 15th and 16th centuries in Europe, and can still be found in the gardens of great houses and palaces. The paths are usually surrounded by thick, high hedges so that it's not possible to see over them. Entering a maze usually involves getting lost a few times before using logic to work out the pattern and find your way to the centre and then out again. There are lots of dead ends and paths which lead you back to where you started. The word 'maze' is believed to come from a Scandinavian word for a state of confusion. This is where the word 'amazing' comes from.", question_number: 31, highlight_text: "it is a kind of puzzle", question_markers: [{ question_number: 31, highlight_text: "it is a kind of puzzle" }, { question_number: 32, highlight_text: "using logic to work out the pattern" }, { question_number: 33, highlight_text: "a state of confusion" }] },
        { speaker: "LECTURER", text: "Labyrinths, on the other hand, have a very different function. Although people now often refer to things they find complicated as labyrinths, this is not how they were seen in the past. The winding spiral of the labyrinth has been used for centuries as a metaphor for life's journey. It served as a spiritual reminder that there is purpose and meaning to our lives and helped to give people a sense of direction. Labyrinths are thought to encourage a feeling of calm and have been used as a meditation and prayer tool in many cultures over many centuries.", question_number: 34, highlight_text: "meditation and prayer tool" },
        { speaker: "LECTURER", text: "The earliest examples of the labyrinth spiral pattern have been found carved into stone, from Sardinia to Scandinavia, from Arizona to India to Africa. In Europe, these spiral carvings date from the late Bronze Age. The Native American Pima tribe wove baskets with a circular labyrinth design that depicted their own cosmology. In Ancient Greece, the labyrinth spiral was used on coins around four thousand years ago. Labyrinths made of mosaics were commonly found in bathhouses, villas and tombs throughout the Roman Empire.", question_number: 35, highlight_text: "carved into stone", question_markers: [{ question_number: 35, highlight_text: "carved into stone" }, { question_number: 36, highlight_text: "used on coins" }] },
        { speaker: "LECTURER", text: "In Northern Europe, there were actual physical labyrinths designed for walking on. These were cut into the turf or grass, usually in a circular pattern. The origin of these walking labyrinths remains unclear, but they were probably used for fertility rites which may date back thousands of years. Eleven examples of turf labyrinths survive today, including the largest one at Saffron Walden, England, which used to have a large tree in the middle of it.", question_number: 37, highlight_text: "a large tree in the middle of it" },
        { speaker: "LECTURER", text: "More recently labyrinths have experienced something of a revival. Some believe that walking a labyrinth promotes healing and mindfulness, and there are those who believe in its emotional and physical benefits, which include slower breathing and a restored sense of balance and perspective. This idea has become so popular that labyrinths have been laid into the floors of spas, wellness centres and even prisons in recent years.", question_number: 38, highlight_text: "slower breathing" },
        { speaker: "LECTURER", text: "A pamphlet at Colorado Children's Hospital informs patients that 'walking a labyrinth can often calm people in the midst of a crisis'. And apparently, it's not only patients who benefit. Many visitors find walking a labyrinth less stressful than sitting in a corridor or waiting room. Some doctors even walk the labyrinth during their breaks. In some hospitals, patients who can't walk can have a paper 'finger labyrinth' brought to their bed. The science behind the theory is a little sketchy, but there are dozens of small-scale studies which support claims about the benefits of labyrinths. For example, one study found that walking a labyrinth provided 'short-term calming, relaxation, and relief from anxiety' for Alzheimer's patients.", question_number: 39, highlight_text: "a paper 'finger labyrinth'", question_markers: [{ question_number: 39, highlight_text: "a paper 'finger labyrinth'" }, { question_number: 40, highlight_text: "relief from anxiety' for Alzheimer's patients" }] },
        { speaker: "LECTURER", text: "So, what is it about labyrinths that makes their appeal so universal? Well ...." },
      ],
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
              timestamp_seconds: 121,
            },
            {
              question_number: 32,
              text: "32 .............................. is needed to navigate through a maze",
              answer: "logic",
              timestamp_seconds: 144,
            },
            {
              question_number: 33,
              text: "the word 'maze' is derived from a word meaning a feeling of 33 ..............................",
              answer: "confusion",
              timestamp_seconds: 160,
            },
            { text: "Labyrinths represent a journey through life" },
            {
              question_number: 34,
              text: "they have frequently been used in 34 .............................. and prayer",
              answer: "meditation",
              timestamp_seconds: 200,
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
              timestamp_seconds: 210,
            },
            {
              text: "The Pima, a Native American tribe, wove the symbol on baskets",
            },
            {
              question_number: 36,
              text: "Ancient Greeks used the symbol on 36 ..............................",
              answer: "coins",
              timestamp_seconds: 236,
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
              timestamp_seconds: 277,
            },
          ],
        },
        {
          heading: "Labyrinths nowadays",
          points: [
            {
              question_number: 38,
              text: "Believed to have a beneficial impact on mental and physical health, e.g., walking can reduce a person's 38 .............................. rate",
              answer: "breathing",
              timestamp_seconds: 296,
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
              timestamp_seconds: 339,
            },
            {
              question_number: 40,
              text: "research has shown that Alzheimer's sufferers experience less 40 ..............................",
              answer: "anxiety",
              timestamp_seconds: 355,
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
      questions: "1–10",
      transcript: [
        { speaker: "JANE", text: "Hello, Jane Fairbanks speaking." },
        { speaker: "FRANK", text: "Oh, good morning. My name's Frank Pritchard. I've just retired and moved to Southoe. I'd like to become a volunteer, and I gather you co-ordinate voluntary work in the village." },
        { speaker: "JANE", text: "That's right." },
        { speaker: "FRANK", text: "What sort of thing could I do?" },
        { speaker: "JANE", text: "Well, we need help with the village library. We borrow books from the town library, and individuals also donate them. So, one thing you could do is get involved in collecting them – if you've got a car, that is.", question_number: 1, highlight_text: "collecting" },
        { speaker: "FRANK", text: "Yes, that's no problem." },
        { speaker: "JANE", text: "The times are pretty flexible so we can arrange it to suit you. Another thing is the records that we keep of the books we're given, and those we borrow and need to return to the town library. It would be very useful to have another person to help keep them up to date.", question_number: 2, highlight_text: "the records that we keep of the books we're given" },
        { speaker: "FRANK", text: "Right. I'm used to working on a computer – I presume they're computerised?" },
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
        { speaker: "JANE", text: "So next month, on the 19th of October, we're holding a quiz – a couple of residents are great at planning unusual ones, and we always fill the village hall.", question_number: 8, highlight_text: "a quiz" },
        { speaker: "FRANK", text: "That sounds like fun. Can I do anything to help?" },
        { speaker: "JANE", text: "Well, because of the number of people, we need plenty of refreshments for halfway through. So, if you could provide any, we'd be grateful." },
        { speaker: "FRANK", text: "I'm sure I could. I'll think about what to make, and let you know." },
        { speaker: "JANE", text: "Thank you. Then on November the 18th, we're holding a dance, also in the village hall. We've booked a band that specialises in music of the 1930s – they've been before, and we've had a lot of requests to bring them back." },
        { speaker: "FRANK", text: "I'm not really a dancer, but I'd like to do something to help." },
        { speaker: "JANE", text: "Well, we sell tickets in advance, and having an extra person to check them at the door, as people arrive, would be good – it can be quite a bottleneck if everyone arrives at once!", question_number: 9, highlight_text: "tickets" },
        { speaker: "FRANK", text: "OK, I'm happy with that." },
        { speaker: "JANE", text: "We're also arranging a New Year's Eve party. We're expecting that to be a really big event, so instead of the village hall, it'll be held in the Mountfort Hotel." },
        { speaker: "FRANK", text: "The …?" },
        { speaker: "JANE", text: "Mountfort. M-O-U-N-T-F-O-R-T Hotel. It isn't in Southoe itself, but it's only a couple of miles away. The hotel will be providing dinner and we've booked a band. The one thing we haven't got yet is a poster. That isn't something you could do, by any chance, is it?", question_number: 10, highlight_text: "a poster" },
        { speaker: "FRANK", text: "Well actually, yes. Before I retired I was a graphic designer, so that's right up my street." },
        { speaker: "JANE", text: "Oh perfect! I'll give you the details, and then perhaps you could send me a draft …" },
        { speaker: "FRANK", text: "Of course." }
      ],
      question_groups: [
        {
          questions: "1–7",
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
          questions: "8–10",
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
      questions: "11–20",
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
        { speaker: "NICK", text: "OK, well if you'd like to come with me …" }
      ],
      question_groups: [
        {
          questions: "11–14",
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
          questions: "15–20",
          instructions: "Which activity is offered at each of the following locations on the farm? Choose SIX answers from the box and write the correct letter, A–H, next to Questions 15–20.",
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
      questions: "21–30",
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
        { speaker: "GEMMA", text: "Yes. And we should definitely mention how well the director handled important bits of the play – like when Romeo climbs onto Juliet's balcony.", question_number: 22, highlight_text: "how well the director handled important bits of the play" },
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
        { speaker: "ED", text: "Yeah – I think it worked well, but I had assumed it would be more conventional." },
        { speaker: "GEMMA", text: "Me too. I liked the music at the beginning and I thought the musicians were brilliant, but I thought they were wasted because the music didn't have much impact in Acts 2 and 3.", question_number: 26, highlight_text: "they were wasted because the music didn" },
        { speaker: "ED", text: "Yes – that was a shame." },
        { speaker: "GEMMA", text: "One problem with this production was that the actors didn't deliver the lines that well. They were speaking too fast.", question_number: 27, highlight_text: "They were speaking too fast" },
        { speaker: "ED", text: "It was a problem I agree, but I thought it was because they weren't speaking loudly enough – especially at key points in the play." },
        { speaker: "GEMMA", text: "I actually didn't have a problem with that." },
        { speaker: "ED", text: "It's been an interesting experience watching different versions of Romeo and Juliet, hasn't it?" },
        { speaker: "GEMMA", text: "Definitely. It's made me realise how relevant the play still is." },
        { speaker: "ED", text: "Right. I mean a lot's changed since Shakespeare's time, but in many ways nothing's changed. There are always disagreements and tension between teenagers and their parents.", question_number: 28, highlight_text: "disagreements and tension between teenagers and their parents" },
        { speaker: "GEMMA", text: "Yes, that's something all young people can relate to – more than the violence and the extreme emotions in the play." },
        { speaker: "ED", text: "How did you find watching it in translation?" },
        { speaker: "GEMMA", text: "Really interesting. I expected to find it more challenging, but I could follow the story pretty well." },
        { speaker: "ED", text: "I stopped worrying about not being able to understand all the words and focused on the actors' expressions. The ending was pretty powerful.", question_number: 29, highlight_text: "The ending was pretty powerful" },
        { speaker: "GEMMA", text: "Yes. That somehow intensified the emotion for me." },
        { speaker: "ED", text: "Did you know Shakespeare's been translated into more languages than any other writer?" },
        { speaker: "GEMMA", text: "What's the reason for his international appeal, do you think?" },
        { speaker: "ED", text: "I was reading that it's because his plays are about basic themes that people everywhere are familiar with." },
        { speaker: "GEMMA", text: "Yeah, and they can also be understood on different levels. The characters have such depth.", question_number: 30, highlight_text: "they can also be understood on different levels. The characters have such depth" },
        { speaker: "ED", text: "Right – which allows directors to experiment and find new angles." },
        { speaker: "GEMMA", text: "That's really important because …" }
      ],
      question_groups: [
        {
          questions: "21–22",
          instructions: "Choose TWO letters, A–E.",
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
          questions: "23–27",
          instructions: "Which opinion do the speakers give about each of the following aspects of The Emporium's production of Romeo and Juliet? Choose FIVE answers from the box and write the correct letter, A–G, next to Questions 23–27.",
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
          questions: "28–30",
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
      questions: "31–40",
      topic: "The impact of digital technology on the Icelandic language",
      instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
      question_type: "Note Completion",
      transcript: [
        { speaker: "LECTURER", text: "Right, everyone, let's make a start. Over the past few sessions, we've been considering the reasons why some world languages are in decline, and today I'm going to introduce another factor that affects languages, and the speakers of those languages, and that's technology and, in particular, digital technology. In order to illustrate its effect, I'm going to focus on the Icelandic language, which is spoken by around 321,000 people, most of whom live in Iceland – an island in the North Atlantic Ocean.", question_number: 31, highlight_text: "spoken by around 321,000 people" },
        { speaker: "LECTURER", text: "The problem for this language is not the number of speakers – even though this number is small. Nor is it about losing words to other languages, such as English. In fact, the vocabulary of Icelandic is continually increasing because when speakers need a new word for something, they tend to create one, rather than borrowing from another language. All this makes Icelandic quite a special language – it's changed very little in the past millennium, yet it can handle twenty-first-century concepts related to the use of computers and digital technology. Take, for example, the word for web browser … this is vafri in Icelandic, which comes from the verb 'to wander'. I can't think of a more appropriate term because that's exactly what you do mentally when you browse the internet. Then there's an Icelandic word for podcast – which is too hard to pronounce! And so on.", question_number: 32, highlight_text: "the vocabulary of Icelandic is continually increasing", question_markers: [{ question_number: 32, highlight_text: "the vocabulary of Icelandic is continually increasing" }, { question_number: 33, highlight_text: "an Icelandic word for podcast" }] },
        { speaker: "LECTURER", text: "Icelandic, then, is alive and growing, but – and it's a big but – young Icelanders spend a great deal of time in the digital world and this world is predominantly English. Think about smartphones. They didn't even exist until comparatively recently, but today young people use them all the time to read books, watch TV or films, play games, listen to music, and so on.", question_number: 34, highlight_text: "Think about smartphones. They didn" },
        { speaker: "LECTURER", text: "Obviously, this is a good thing in many respects because it promotes their bilingual skills, but the extent of the influence of English in the virtual world is staggering and it's all happening really fast.", question_number: 35, highlight_text: "it promotes their bilingual skills" },
        { speaker: "LECTURER", text: "For their parents and grandparents, the change is less concerning because they already have their native-speaker skills in Icelandic. But for young speakers – well, the outcome is a little troubling. For example, teachers have found that playground conversations in Icelandic secondary schools can be conducted entirely in English, while teachers of much younger children have reported situations where their classes find it easier to say what is in a picture using English, rather than Icelandic. The very real and worrying consequence of all this is that the young generation in Iceland is at risk of losing its mother tongue.", question_number: 36, highlight_text: "playground conversations in Icelandic secondary schools can be conducted entirely in English", question_markers: [{ question_number: 36, highlight_text: "playground conversations in Icelandic secondary schools can be conducted entirely in English" }, { question_number: 37, highlight_text: "find it easier to say what is in a picture using English, rather than Icelandic" }] },
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
  test_title: "Test 3",
  section: "Listening",
  parts: [
    {
      part_number: 1,
      part_type: "Basic Conversation",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio1_cvxzfz.mp3",
      questions: "1–10",
      topic: "Advice on surfing holidays",
      transcript: [
        { speaker: "WOMAN", text: "Jack, I'm thinking of taking the kids to the seaside on a surfing holiday this summer and I wanted to ask your advice – as I know you're such an expert." },
        { speaker: "JACK", text: "Well, I don't know about that, but yes, I've done a bit of surfing over the years. I'd thoroughly recommend it. I think it's the kind of holiday all the family can enjoy together. The thing about surfing is that it's great for all ages and all abilities. My youngest started when he was only three!", question_number: 1, highlight_text: "all the family can enjoy together" },
        { speaker: "WOMAN", text: "Wow! But it's quite physically demanding, isn't it? I've heard you need to be pretty fit.", question_number: 2, highlight_text: "need to be pretty fit" },
        { speaker: "JACK", text: "Yes. You'll certainly learn more quickly and won't tire as easily." },
        { speaker: "WOMAN", text: "Well – that should be OK for us. You've been surfing a few times in Ireland, haven't you?" },
        { speaker: "JACK", text: "Yes. There's some great surfing there, which people don't always realise." },
        { speaker: "WOMAN", text: "And which locations would you recommend? – there seem to be quite a few." },
        { speaker: "JACK", text: "Yes, there are loads. Last year we went to County Donegal. There are several great places to surf there." },
        { speaker: "WOMAN", text: "What about in County Clare? I read that's also really good for surfing." },
        { speaker: "JACK", text: "Yes, it is. I've been there a few times. Most people go to Lahinch. My kids love it there. The waves aren't too challenging and the town is very lively." },
        { speaker: "WOMAN", text: "Are there good hotels there?", question_number: 3, highlight_text: "Are there good hotels there?" },
        { speaker: "JACK", text: "Yes – some very nice ones and there are also a few basic hostels and campsites. It's great if you need lessons as the surf schools are excellent." },
        { speaker: "WOMAN", text: "Sounds good." },
        { speaker: "JACK", text: "Yes and there's lots to see in the area – like those well-known cliffs – … I've forgotten the name of them …" },
        { speaker: "WOMAN", text: "Oh don't worry – I can look them up." },
        { speaker: "JACK", text: "I've also been surfing in County Mayo, which is less well-known for surfing, but we had a really good time. That was a few years ago when the kids were younger. There's a good surf school at Carrowniskey beach.", question_number: 4, highlight_text: "Carrowniskey beach" },
        { speaker: "WOMAN", text: "How do you spell that?" },
        { speaker: "JACK", text: "C-A-double R-O-W-N-I-S-K-E-Y" },
        { speaker: "WOMAN", text: "OK." },
        { speaker: "JACK", text: "I put the kids into the surf camp they run during the summer for 10–16 year olds." },
        { speaker: "WOMAN", text: "Oh right. How long was that for?" },
        { speaker: "JACK", text: "Three hours every day for a week. It was perfect – they were so tired out after that.", question_number: 5, highlight_text: "Three hours every day for a week" },
        { speaker: "WOMAN", text: "I can imagine." },
        { speaker: "JACK", text: "One thing we did while the kids were surfing was to rent some kayaks to have a look around the bay which is nearby. It's really beautiful.", question_number: 6, highlight_text: "bay which is nearby" },
        { speaker: "WOMAN", text: "Oh, I'd love to do that." },
        { speaker: "WOMAN", text: "Now the only time I went to Ireland it rained practically every day." },
        { speaker: "JACK", text: "Mmm yes – that can be a problem – but you can surf in the rain, you know." },
        { speaker: "WOMAN", text: "It doesn't have the same appeal, somehow." },
        { speaker: "JACK", text: "Well, the weather's been fine the last couple of years when I've been there, but actually, it tends to rain more in August than in the spring or autumn. September's my favourite month because the water is warmer then.", question_number: 7, highlight_text: "September's my favourite month" },
        { speaker: "WOMAN", text: "The only problem is that the kids are back to school then." },
        { speaker: "JACK", text: "I know. But one good thing about Irish summers is that it doesn't get too hot. The average temperature is about 19 degrees and it usually doesn't go above 25 degrees.", question_number: 8, highlight_text: "average temperature is about 19 degrees" },
        { speaker: "WOMAN", text: "That sounds alright. Now what about costs?" },
        { speaker: "JACK", text: "Surfing is a pretty cheap holiday really – the only cost is the hire of equipment. You can expect to pay a daily rate of about 30 euros for the hire of a wetsuit and board – but you can save about 40 euros if you hire by the week.", question_number: 9, highlight_text: "30 euros for the hire of a wetsuit and board" },
        { speaker: "WOMAN", text: "That's not too bad." },
        { speaker: "JACK", text: "No. It's important to make sure you get good quality wetsuits – you'll all get too cold if you don't. And make sure you also get boots. They keep your feet warm and it's easier to surf with them on too.", question_number: 10, highlight_text: "get boots" },
        { speaker: "WOMAN", text: "OK. Well, thanks very much …." },
      ],
      question_groups: [
        {
          questions: "1–10",
          instructions: "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
          topic: "Advice on surfing holidays",
          question_type: "Note Completion",
          content: [
            {
              heading: "Jack's advice",
              points: [
                { question_number: 1, text: "Recommends surfing for 1 .............................. holidays in the summer", answer: "family", timestamp_seconds: 103 },
                { question_number: 2, text: "Need to be quite 2 ..............................", answer: "fit", timestamp_seconds: 121 },
              ],
            },
            {
              heading: "Irish surfing locations",
              points: [
                { text: "County Clare" },
                { question_number: 3, text: "Lahinch has some good quality 3 .............................. and surf schools", answer: "hotels", timestamp_seconds: 170 },
                { text: "There are famous cliffs nearby" },
                { text: "County Mayo" },
                { question_number: 4, text: "Good surf school at 4 .............................. beach", answer: "Carrowniskey", timestamp_seconds: 204 },
                { question_number: 5, text: "Surf camp lasts for one 5 ..............................", answer: "week", timestamp_seconds: 234 },
                { question_number: 6, text: "Can also explore the local 6 .............................. by kayak", answer: "bay", timestamp_seconds: 246 },
              ],
            },
            {
              heading: "Weather",
              points: [
                { question_number: 7, text: "Best month to go: 7 ..............................", answer: "September", timestamp_seconds: 311 },
                { question_number: 8, text: "Average temperature in summer: approx. 8 .............................. degrees", answer: "19 / nineteen", timestamp_seconds: 326 },
              ],
            },
            {
              heading: "Costs",
              points: [
                { text: "Equipment" },
                { question_number: 9, text: "Wetsuit and surfboard: 9 .............................. euros per day", answer: "30 / thirty", timestamp_seconds: 344 },
                { question_number: 10, text: "Also advisable to hire 10 .............................. for warmth", answer: "boots", timestamp_seconds: 364 },
              ],
            },
          ],
        },
      ],
    },
    {
      part_number: 2,
      part_type: "Short Monologue",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio2_vedume.mp3",
      questions: "11–20",
      topic: "School extended hours childcare service",
      transcript: [
        { speaker: "MRS CARTER", text: "Good afternoon. My name's Mrs Carter and I run the before and after school extended hours childcare service. I hope you've had a chance to have a good look around the school and talk to staff and pupils. I know that many of you are interested in using our childcare service when your child joins the school, and perhaps you already know something about it, but for those that don't, I'll go through the main details now." },
        { speaker: "MRS CARTER", text: "We offer childcare for children from the ages of four to eleven both before and after school. I know that many parents who work find this service invaluable. You can leave your child with us safe in the knowledge that they will be extremely well cared for." },
        { speaker: "MRS CARTER", text: "We are insured to provide care for up to 70 children, although we rarely have this many attending at any one session. I think we generally expect around 50–60 children for the afternoon sessions and about half that number for the breakfast sessions. Although we currently do have 70 children registered with us, not all of these attend every day. It's ten years since we began offering an extended hours service and we've come a long way during that time. When we first opened, we only had about 20 children attending regularly.", question_number: 11, highlight_text: "up to 70 children", question_markers: [{ question_number: 11, highlight_text: "up to 70 children" }, { question_number: 12, highlight_text: "around 50–60 children for the afternoon sessions and about half that number for the breakfast sessions" }] },
        { speaker: "MRS CARTER", text: "We try to keep our costs as low as we can and we think we provide very good value for money. For the afternoon sessions, which run from 3.30 until 6 p.m., it's £7.20. But if you prefer, you can pay for one hour only, which costs £3.50, or two hours which costs £5.70.", question_number: 13, highlight_text: "it's £7.20" },
        { speaker: "MRS CARTER", text: "The cost of the childcare includes food and snacks. They'll be given breakfast in the morning and in the afternoon, a healthy snack as soon as they finish school. At 5 p.m. children are given something more substantial, such as pasta or a casserole. Please inform us of any allergies that your child might have and we'll make sure they're offered a suitable alternative.", question_number: 14, highlight_text: "At 5 p.m. children are given something more substantial" },
        { speaker: "MRS CARTER", text: "As you may know, the childcare service runs through the school holidays from 8 a.m. to 6 p.m. We offer a really varied and exciting programme to keep the children entertained – we don't want them to feel as if they are still at school! It will also feel different because they'll get the chance to make new friends with children from other schools – spaces are available for them because a lot of our term-time children don't always attend during the holiday. In the past, parents have asked if children over the age of 11 are allowed to come with their younger brothers and sisters – but I'm afraid we're unable to do this because of the type of insurance we have.", question_number: 15, highlight_text: "children from other schools – spaces are available for them" },
        { speaker: "MRS CARTER", text: "So now let me tell you about some of the activities that your child can do during the after-school sessions. As well as being able to use the playground equipment, computers and the library, there is usually at least one 'special' activity that children can do each day. For example, Spanish. We have a specialist teacher coming in every Thursday to give a basic introduction to the language through games and songs. She does two sessions: one for the over 8s and one for the younger children. This is the only activity which we have to make an extra charge for – but it's well worth it.", question_number: 16, highlight_text: "only activity which we have to make an extra charge for" },
        { speaker: "MRS CARTER", text: "Once a week the children have the opportunity to do some music. We're very lucky that one of our staff is a member of a folk band. On Mondays, she teaches singing and percussion to groups of children. We do rely on parental support for this, so if any of you sing or play an instrument and would be prepared to help out at these sessions, we'd be delighted.", question_number: 17, highlight_text: "We do rely on parental support for this" },
        { speaker: "MRS CARTER", text: "Painting continues to be one of the most popular activities. To begin with we weren't keen on offering this because of the extra mess involved, but children kept asking if they could do some art and so we finally gave in. Art is great for helping the children to relax after working hard at school all day.", question_number: 18, highlight_text: "children kept asking if they could do some art" },
        { speaker: "MRS CARTER", text: "Yoga is something that we've been meaning to introduce for some time but haven't been able to find anyone available to teach it – until now that is. So we'll see how this goes. Hopefully, children will benefit in all sorts of ways from this.", question_number: 19, highlight_text: "we've been meaning to introduce for some time but haven't been able to find anyone available" },
        { speaker: "MRS CARTER", text: "Cooking is another popular activity. They make a different sort of cake, or pizza or bread each week. Although the younger children love doing it, we found that the mess was just too much, so we've decided to restrict this to the over 8s, as they are better able to clean up after themselves.", question_number: 20, highlight_text: "restrict this to the over 8s" },
      ],
      question_groups: [
        {
          questions: "11 and 12",
          instructions: "Choose TWO letters, A–E.",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [11, 12],
              question_text: "Which TWO facts are given about the school's extended hours childcare service?",
              options: {
                A: "It started recently.",
                B: "More children attend after school than before school.",
                C: "An average of 50 children attend in the mornings.",
                D: "A child cannot attend both the before and after school sessions.",
                E: "The maximum number of children who can attend is 70.",
              },
              answer: ["B", "E"],
              grading_note: "IN EITHER ORDER",
              timestamp_seconds: 107,
            },
          ],
        },
        {
          questions: "13–15",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            { question_number: 13, question_text: "How much does childcare cost for a complete afternoon session per child?", options: { A: "£3.50", B: "£5.70", C: "£7.20" }, answer: "C", timestamp_seconds: 155 },
            { question_number: 14, question_text: "What does the manager say about food?", options: { A: "Children with allergies should bring their own food.", B: "Children may bring healthy snacks with them.", C: "Children are given a proper meal at 5 p.m." }, answer: "C", timestamp_seconds: 184 },
            { question_number: 15, question_text: "What is different about arrangements in the school holidays?", options: { A: "Children from other schools can attend.", B: "Older children can attend.", C: "A greater number of children can attend." }, answer: "A", timestamp_seconds: 216 },
          ],
        },
        {
          questions: "16–20",
          instructions: "What information is given about each of the following activities on offer?\n\nChoose FIVE answers from the box and write the correct letter, A–G, next to Questions 16–20.",
          question_type: "Matching",
          options_box: {
            title: "Information",
            options: {
              A: "has limited availability",
              B: "is no longer available",
              C: "is for over 8s only",
              D: "requires help from parents",
              E: "involves an additional fee",
              F: "is a new activity",
              G: "was requested by children",
            },
          },
          items: [
            { question_number: 16, prompt: "Spanish", answer: "E", timestamp_seconds: 319 },
            { question_number: 17, prompt: "Music", answer: "D", timestamp_seconds: 340 },
            { question_number: 18, prompt: "Painting", answer: "G", timestamp_seconds: 361 },
            { question_number: 19, prompt: "Yoga", answer: "F", timestamp_seconds: 373 },
            { question_number: 20, prompt: "Cooking", answer: "C", timestamp_seconds: 403 },
          ],
        },
      ],
    },
    {
      part_number: 3,
      part_type: "Academic Discussion",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio3_hvwu9u.mp3",
      questions: "21–30",
      topic: "Holly's Work Placement Tutorial",
      transcript: [
        { speaker: "HOLLY", text: "Hello Dr Green – I'm here to talk to you about my work placement." },
        { speaker: "TUTOR", text: "Oh yes, it's Holly, isn't it?" },
        { speaker: "HOLLY", text: "Yes." },
        { speaker: "TUTOR", text: "So, which work placement have you chosen?" },
        { speaker: "HOLLY", text: "I decided to go for the Orion Stadium placement. The event I'll be managing is one where I'm helping to set up a sports competition for primary school children." },
        { speaker: "TUTOR", text: "Yup. That's always a popular placement – even though it can be tougher than you think working with children." },
        { speaker: "HOLLY", text: "I know, but it's the fresh air that attracts me – organising something indoors doesn't have the same appeal, even though it might be fun.", question_number: 21, highlight_text: "fresh air that attracts me" },
        { speaker: "TUTOR", text: "OK, so obviously safety's going to be one of your key concerns for this event." },
        { speaker: "HOLLY", text: "Yes, I've already thought about that. I'll need to make sure none of the equipment's damaged." },
        { speaker: "TUTOR", text: "Ah well, you'll be working with schools, so the equipment will be their responsibility. However, the grounds and what goes on there will be yours." },
        { speaker: "HOLLY", text: "Oh I see – that'll include keeping everyone within the boundary once they're in their kit and on the field?", question_number: 22, highlight_text: "keeping everyone within the boundary" },
        { speaker: "TUTOR", text: "Exactly – you'll need to inspect areas like changing rooms as well for anything someone can trip over, but your main priority will be not to lose anyone!" },
        { speaker: "HOLLY", text: "Right. I'll need staff to help with that." },
        { speaker: "TUTOR", text: "And don't forget about the spectators." },
        { speaker: "HOLLY", text: "Mmm. I was thinking that many of them will be parents, who could help run the event." },
        { speaker: "TUTOR", text: "I wouldn't rely on that. They'll be more interested in filming their children than volunteering." },
        { speaker: "HOLLY", text: "I'll need to make sure they don't interfere with events doing that!" },
        { speaker: "TUTOR", text: "And that's not always easy, especially when a proud parent's trying to get a snap of their child and you want them to move elsewhere.", question_number: 23, highlight_text: "not always easy, especially when a proud parent's trying to get a snap" },
        { speaker: "HOLLY", text: "OK. What about the scheduling?" },
        { speaker: "TUTOR", text: "With sporting events there are all sorts of things that can alter the timetable – like rain, for instance – though so far, we've always been lucky with that." },
        { speaker: "HOLLY", text: "Yeah, and I was thinking about what to do if someone got hurt as well. I know that last year that caused a terrible delay.", question_number: 24, highlight_text: "if someone got hurt" },
        { speaker: "TUTOR", text: "You have to be prepared for such things." },
        { speaker: "HOLLY", text: "Oh. What if a match ends in a draw – do you let the teams keep going until someone wins?" },
        { speaker: "TUTOR", text: "That'll be up to you – and again, you need to plan for it." },
        { speaker: "HOLLY", text: "Right." },
        { speaker: "TUTOR", text: "Now, the aim of your work placement is to give you the opportunity to develop the skills that an events manager needs. So, let's talk about those a bit." },
        { speaker: "HOLLY", text: "Well, I think my communication skills are pretty good. I can talk on the phone to people and book venues and that kind of thing." },
        { speaker: "TUTOR", text: "Good – just remember it isn't only about what you say. If you meet someone face-to-face and want to persuade them to be a sponsor, for example ...", question_number: 25, highlight_text: "meet someone face-to-face and want to persuade them" },
        { speaker: "HOLLY", text: "Oh, I'll dress up for that! Sure." },
        { speaker: "TUTOR", text: "Good. Let's go on to think about your organisational skills. You're working in a very people-based industry and that means things won't always go to plan." },
        { speaker: "HOLLY", text: "I guess it's being prepared to make changes that matters.", question_number: 26, highlight_text: "being prepared to make changes" },
        { speaker: "TUTOR", text: "That's right. You may have to make an on-the-spot change to a timetable because of a problem you hadn't anticipated ..." },
        { speaker: "HOLLY", text: "... just do it! OK." },
        { speaker: "TUTOR", text: "How's your time management these days?" },
        { speaker: "HOLLY", text: "I'm working on it – I'm certainly better when I have a deadline, which is why this work suits me." },
        { speaker: "TUTOR", text: "Yes, but it's how you respond as that deadline approaches!", question_number: 27, highlight_text: "how you respond as that deadline approaches" },
        { speaker: "HOLLY", text: "I know I've got to look calm even if I'm in a panic." },
        { speaker: "TUTOR", text: "Just think to yourself – no one must know I'm under pressure." },
        { speaker: "HOLLY", text: "Yeah – even though I'm multi-tasking like crazy!" },
        { speaker: "TUTOR", text: "Another skill that events managers need is creativity. Often your client has what we call the 'big picture' idea, but it's up to the events manager to think of all the fine points that go to making it work.", question_number: 28, highlight_text: "think of all the fine points" },
        { speaker: "HOLLY", text: "Right, so I need to listen carefully to that idea and then fill in all the gaps." },
        { speaker: "TUTOR", text: "That's right. And you'll have a team working under you, so another key skill is leadership. Your team may have lots of ideas too, but you've got to make the ultimate choices. Do we have refreshments inside or out, for example?" },
        { speaker: "HOLLY", text: "Isn't it better to be democratic?" },
        { speaker: "TUTOR", text: "It's a nice idea, but you have the ultimate responsibility. So, believe in what you think best. Be prepared to say 'yes', that's a good idea but it won't work here.", question_number: 29, highlight_text: "believe in what you think best" },
        { speaker: "HOLLY", text: "I see what you mean. What about the networking side of things? I know it's an area that a lot of students worry about because we don't have much experience to offer others." },
        { speaker: "TUTOR", text: "But even without it – you can still be an interesting person with useful ideas. And the more people you impress, the better." },
        { speaker: "HOLLY", text: "I guess that will help me when I apply for a real job.", question_number: 30, highlight_text: "help me when I apply for a real job" },
        { speaker: "TUTOR", text: "Exactly – think ahead – remember what your ambitions are and keep them in mind." },
        { speaker: "HOLLY", text: "Definitely." },
      ],
      question_groups: [
        {
          questions: "21–24",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            { question_number: 21, question_text: "Holly has chosen the Orion Stadium placement because", options: { A: "it involves children.", B: "it is outdoors.", C: "it sounds like fun." }, answer: "B", timestamp_seconds: 81 },
            { question_number: 22, question_text: "Which aspect of safety does Dr Green emphasise most?", options: { A: "ensuring children stay in the stadium", B: "checking the equipment children will use", C: "removing obstacles in changing rooms" }, answer: "A", timestamp_seconds: 112 },
            { question_number: 23, question_text: "What does Dr Green say about the spectators?", options: { A: "They can be hard to manage.", B: "They make useful volunteers.", C: "They shouldn't take photographs." }, answer: "A", timestamp_seconds: 152 },
            { question_number: 24, question_text: "What has affected the schedule in the past?", options: { A: "bad weather", B: "an injury", C: "extra time" }, answer: "B", timestamp_seconds: 175 },
          ],
        },
        {
          questions: "25–30",
          instructions: "What do Holly and her tutor agree is an important aspect of each of the following events management skills?\n\nChoose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
          question_type: "Matching",
          options_box: {
            title: "Important aspects",
            options: {
              A: "being flexible",
              B: "focusing on details",
              C: "having a smart appearance",
              D: "hiding your emotions",
              E: "relying on experts",
              F: "trusting your own views",
              G: "doing one thing at a time",
              H: "thinking of the future",
            },
          },
          items: [
            { question_number: 25, prompt: "Communication", answer: "C", timestamp_seconds: 266 },
            { question_number: 26, prompt: "Organisation", answer: "A", timestamp_seconds: 289 },
            { question_number: 27, prompt: "Time management", answer: "D", timestamp_seconds: 312 },
            { question_number: 28, prompt: "Creativity", answer: "B", timestamp_seconds: 332 },
            { question_number: 29, prompt: "Leadership", answer: "F", timestamp_seconds: 368 },
            { question_number: 30, prompt: "Networking", answer: "H", timestamp_seconds: 402 },
          ],
        },
      ],
    },
    {
      part_number: 4,
      part_type: "Academic Lecture",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773922790/ELT_IELTS17_t3_audio4_n7sbsh.mp3",
      questions: "31–40",
      topic: "Bird Migration Theory",
      instructions: "Complete the notes below. Write ONE WORD ONLY for each answer.",
      question_type: "Note Completion",
      transcript: [
        { speaker: "LECTURER", text: "Scientists believe that a majority of the earth's bird population migrate in some fashion or other. Some travel seasonally for relatively short distances, such as birds that move from their winter habitats in lowlands to mountain tops for the summers. Others, like the Arctic Tern, travel more than 25,000 miles seasonally between the northern and southern poles. Bird migration has been studied over many centuries through a variety of observations." },
        { speaker: "LECTURER", text: "But until relatively recently, where birds went to in the winter was considered something of a mystery. The lack of modern science and technology led to many theories that we now recognize as error-filled and even somewhat amusing. Take hibernation theory for example – two thousand years ago, it was commonly believed that when birds left an area, they went underwater to hibernate in the seas and oceans. Another theory for the regular appearance and disappearance of birds was that they spent winter hidden in mud till the weather changed and food became abundant again. The theory that some birds hibernate persisted until experiments were done on caged birds in the 1940s which demonstrated that birds have no hibernation instinct.", question_number: 31, highlight_text: "spent winter hidden in mud" },
        { speaker: "LECTURER", text: "One of the earliest naturalists and philosophers from ancient Greece was Aristotle who was the first writer to discuss the disappearance and reappearance of some bird species at certain times of year. He developed the theory of transmutation, the seasonal change of one species into another, by observing redstarts and robins. He observed that in the autumn, small birds called 'redstarts' began to lose their feathers, which convinced Aristotle that they changed into robins for the winter, and back into redstarts in the summer. These assumptions are understandable given that this pair of species are similar in shape, but are a classic example of an incorrect interpretation based on correct observations.", question_number: 32, highlight_text: "began to lose their feathers", question_markers: [{ question_number: 32, highlight_text: "began to lose their feathers" }, { question_number: 33, highlight_text: "similar in shape" }] },
        { speaker: "LECTURER", text: "The most bizarre theory was put forward by an English amateur scientist, Charles Morton, in the seventeenth century. He wrote a surprisingly well-regarded paper claiming that birds migrate to the moon and back every year. He came to this conclusion as the only logical explanation for the total disappearance of some species.", question_number: 34, highlight_text: "birds migrate to the moon" },
        { speaker: "LECTURER", text: "One of the key moments in the development of migration theory came in 1822 when a white stork was shot in Germany. This particular stork made history because of the long spear in its neck which incredibly had not killed it – everyone immediately realised this spear was definitely not European. It turned out to be a spear from a tribe in Central Africa. This was a truly defining moment in the history of ornithology because it was the first evidence that storks spend their winters in sub-Saharan Africa. You can still see the 'arrow stork' in the Zoological Collection of the University of Rostock in Germany.", question_number: 35, highlight_text: "long spear in its neck", question_markers: [{ question_number: 35, highlight_text: "long spear in its neck" }, { question_number: 36, highlight_text: "first evidence that storks spend their winters in sub-Saharan Africa" }] },
        { speaker: "LECTURER", text: "People gradually became aware that European birds moved south in autumn and north in summer but didn't know much about it until the practice of catching birds and putting rings on their legs became established. Before this, very little information was available about the actual destinations of particular species and how they travelled there. People speculated that larger birds provided a kind of taxi service for smaller birds by carrying them on their backs. This idea came about because it seemed impossible that small birds weighing only a few grams could fly over vast oceans. This idea was supported by observations of bird behaviour such as the harassment of larger birds by smaller birds.", question_number: 37, highlight_text: "actual destinations of particular species", question_markers: [{ question_number: 37, highlight_text: "actual destinations of particular species" }, { question_number: 38, highlight_text: "small birds weighing only a few grams could fly over vast oceans" }] },
        { speaker: "LECTURER", text: "The development of bird ringing, by a Danish schoolteacher, Hans Christian Cornelius Mortensen, made many discoveries possible. This is still common practice today and relies upon what is known as 'recovery' – this is when ringed birds are found dead in the place they have migrated to, and identified. Huge amounts of data were gathered in the early part of the twentieth century and for the first time in history people understood where birds actually went to in winter. In 1931, an atlas was published showing where the most common species of European birds migrated to. More recent theories about bird migration ....", question_number: 39, highlight_text: "what is known as 'recovery'", question_markers: [{ question_number: 39, highlight_text: "what is known as 'recovery'" }, { question_number: 40, highlight_text: "an atlas was published" }] },
      ],
      content: [
        {
          heading: "",
          points: [
            { text: "Most birds are believed to migrate seasonally." },
          ],
        },
        {
          heading: "Hibernation theory",
          points: [
            { question_number: 31, text: "It was believed that birds hibernated underwater or buried themselves in 31 ..............................", answer: "mud", timestamp_seconds: 137 },
            { text: "This theory was later disproved by experiments on caged birds." },
          ],
        },
        {
          heading: "Transmutation theory",
          points: [
            { text: "Aristotle believed birds changed from one species into another in summer and winter." },
            { question_number: 32, text: "In autumn he observed that redstarts experience the loss of 32 .............................. and thought they then turned into robins.", answer: "feathers", timestamp_seconds: 187 },
            { question_number: 33, text: "Aristotle's assumptions were logical because the two species of birds had a similar 33 ..............................", answer: "shape", timestamp_seconds: 205 },
          ],
        },
        {
          heading: "17th century",
          points: [
            { question_number: 34, text: "Charles Morton popularised the idea that birds fly to the 34 .............................. in winter.", answer: "moon", timestamp_seconds: 228 },
          ],
        },
        {
          heading: "Scientific developments",
          points: [
            { question_number: 35, text: "In 1822, a stork was killed in Germany which had an African spear in its 35 ..............................", answer: "neck", timestamp_seconds: 259 },
            { question_number: 36, text: "previously there had been no 36 .............................. that storks migrate to Africa", answer: "evidence", timestamp_seconds: 279 },
            { question_number: 37, text: "Little was known about the 37 .............................. and journeys of migrating birds until the practice of ringing was established.", answer: "destinations", timestamp_seconds: 316 },
            { question_number: 38, text: "It was thought large birds carried small birds on some journeys because they were considered incapable of travelling across huge 38 ..............................", answer: "oceans", timestamp_seconds: 335 },
            { question_number: 39, text: "Ringing depended on what is called the 39 '..............................' of dead birds.", answer: "recovery", timestamp_seconds: 365 },
            { question_number: 40, text: "In 1931, the first 40 .............................. to show the migration of European birds was printed.", answer: "atlas", timestamp_seconds: 390 },
          ],
        },
      ],
    },
  ],
};

const cambridgeIelts17ListeningTest4Questions = {
  test_title: "Test 4",
  section: "Listening",
  parts: [
    {
      part_number: 1,
      part_type: "Basic Conversation",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773923257/IELTS17_t4_audio1_cbp8q6.mp3",
      questions: "1–10",
      topic: "Easy Life Cleaning Services",
      transcript: [
        { speaker: "JACINTA", text: "Hello, Easy Life Cleaning Services, Jacinta speaking." },
        { speaker: "CLIENT", text: "Oh hello. I'm looking for a cleaning service for my apartment – do you do domestic cleaning?" },
        { speaker: "JACINTA", text: "Sure." },
        { speaker: "CLIENT", text: "Well, it's just a one-bedroom flat. Do you have a basic cleaning package?" },
        { speaker: "JACINTA", text: "Yes. For a one-bedroom flat we're probably looking at about two hours for a clean. So we'd do a thorough clean of all surfaces in each room, and polish them where necessary. Does your apartment have carpets?" },
        { speaker: "CLIENT", text: "No, I don't have any, but the floor would need cleaning.", question_number: 1, highlight_text: "floor" },
        { speaker: "JACINTA", text: "Of course – we'd do that in every room. And we'd do a thorough clean of the kitchen and bathroom." },
        { speaker: "CLIENT", text: "OK." },
        { speaker: "JACINTA", text: "Then we have some additional services which you can request if you want – so for example, we can clean your oven for you every week." },
        { speaker: "CLIENT", text: "Actually, I hardly ever use that, but can you do the fridge?", question_number: 2, highlight_text: "fridge" },
        { speaker: "JACINTA", text: "Sure. Would you like that done every week?" },
        { speaker: "CLIENT", text: "Yes, definitely. And would ironing clothes be an additional service you can do?" },
        { speaker: "JACINTA", text: "Yes, of course." },
        { speaker: "CLIENT", text: "Just my shirts for work that week.", question_number: 3, highlight_text: "shirts" },
        { speaker: "JACINTA", text: "That's fine. And we could also clean your microwave if you want." },
        { speaker: "CLIENT", text: "No, I wipe that out pretty regularly so there's no need for that." },
        { speaker: "JACINTA", text: "We also offer additional services that you might want a bit less often, say every month. So for example, if the inside of your windows need cleaning, we could do that.", question_number: 4, highlight_text: "windows" },
        { speaker: "CLIENT", text: "Yes, that'd be good. I'm on the fifteenth floor, so the outside gets done regularly by specialists, but the inside does get a bit grubby." },
        { speaker: "JACINTA", text: "And we could arrange for your curtains to get cleaned if necessary." },
        { speaker: "CLIENT", text: "No, they're OK. But would you be able to do something about the balcony?", question_number: 5, highlight_text: "balcony" },
        { speaker: "JACINTA", text: "Yes, we can get the pressure washer onto that." },
        { speaker: "JACINTA", text: "Now if you're interested, we do offer some other possibilities to do with general maintenance. For example, if you have a problem with water and you need a plumber in a hurry, we can put you in touch with a reliable one who can come out straightaway. And the same if you need an electrician.", question_number: 6, highlight_text: "electrician" },
        { speaker: "CLIENT", text: "Right. That's good to know. I've only just moved here so I don't have any of those sorts of contacts." },
        { speaker: "JACINTA", text: "And I don't know if this is of interest to you, but we also offer a special vacuum cleaning system which can improve the indoor air quality of your home by capturing up to 99% of all the dust in the air.", question_number: 7, highlight_text: "dust" },
        { speaker: "CLIENT", text: "Right. In fact, I don't have that sort of problem, but I'll bear it in mind. Now can you tell me a bit about your cleaning staff?" },
        { speaker: "JACINTA", text: "Of course. So all our cleaners are very carefully selected. When they apply to us, they have to undergo a security check with the police to make sure they don't have any sort of criminal background, and, of course, they have to provide references as well.", question_number: 8, highlight_text: "police" },
        { speaker: "JACINTA", text: "Then if we think they might be suitable for the job, we give them training for it.", question_number: 9, highlight_text: "training" },
        { speaker: "JACINTA", text: "That lasts for two weeks so it's very thorough, and at the end of it, they have a test. If they pass that, we take them on, but we monitor them very carefully – we ask all our clients to complete a review of their performance after every visit and to email it to us. So we can pick up any problems straightaway and deal with them.", question_number: 10, highlight_text: "review" },
        { speaker: "CLIENT", text: "OK, well that all sounds good. And will I always have the same cleaner?" },
        { speaker: "JACINTA", text: "Yes, we do our best to organise it that way, and we usually manage it." },
        { speaker: "CLIENT", text: "Good. That's fine. Right, so I'd like to go ahead and …" },
      ],
      question_groups: [
        {
          questions: "1–10",
          instructions: "Complete the notes below. Write ONE WORD for each answer.",
          topic: "Easy Life Cleaning Services",
          question_type: "Note Completion",
          content: [
            {
              heading: "Basic cleaning package offered",
              points: [
                { text: "Cleaning all surfaces" },
                { question_number: 1, text: "Cleaning the 1 .............................. throughout the apartment", answer: "floor(s)", timestamp_seconds: 111 },
                { text: "Cleaning shower, sinks, toilet etc." },
              ],
            },
            {
              heading: "Additional services agreed",
              points: [
                { text: "Every week" },
                { question_number: 2, text: "Cleaning the 2 ..............................", answer: "fridge", timestamp_seconds: 130 },
                { question_number: 3, text: "Ironing clothes – 3 .............................. only", answer: "shirts", timestamp_seconds: 144 },
                { text: "Every month" },
                { question_number: 4, text: "Cleaning all the 4 .............................. from the inside", answer: "windows", timestamp_seconds: 162 },
                { question_number: 5, text: "Washing down the 5 ..............................", answer: "balcony", timestamp_seconds: 180 },
              ],
            },
            {
              heading: "Other possibilities",
              points: [
                { question_number: 6, text: "They can organise a plumber or an 6 .............................. if necessary.", answer: "electrician", timestamp_seconds: 250 },
                { question_number: 7, text: "A special cleaning service is available for customers who are allergic to 7 .............................. .", answer: "dust", timestamp_seconds: 267 },
              ],
            },
            {
              heading: "Information on the cleaners",
              points: [
                { question_number: 8, text: "Before being hired, all cleaners have a background check carried out by the 8 .............................. .", answer: "police", timestamp_seconds: 291 },
                { text: "References are required." },
                { question_number: 9, text: "All cleaners are given 9 .............................. for two weeks.", answer: "training", timestamp_seconds: 302 },
                { question_number: 10, text: "Customers send a 10 .............................. after each visit.", answer: "review", timestamp_seconds: 317 },
                { text: "Usually, each customer has one regular cleaner." },
              ],
            },
          ],
        },
      ],
    },
    {
      part_number: 2,
      part_type: "Short Monologue",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773923262/ELT_IELTS17_t4_audio2_yt1v8e.mp3",
      questions: "11–20",
      topic: "Reducing Staff Turnover in Hotels",
      transcript: [
        { speaker: "TRAINER", text: "As many of you here today have worked in the hotel industry for some time, I'm sure you have experienced the problem of high staff turnover in your hotels. Every hotel relies on having loyal and experienced members of staff who make sure that everything runs smoothly. If staff are constantly changing, it can make life difficult for everyone. But why do staff leave frequently in many hotels? Of course, many hotel jobs, such as cleaning, are low-skilled and are not well-paid. A lot of managers think it's this and the long hours that are the main causes of high staff turnover – but what they don't realise is that it's the lack of training in many hotel jobs which is a huge factor.", question_number: 11, highlight_text: "lack of training" },
        { speaker: "TRAINER", text: "So, what kind of problems does a high turnover of staff cause? Well, having to recruit new staff all the time can be very time-consuming, and managers may have to cover some duties while waiting for new staff to arrive.", question_number: 12, highlight_text: "cover some duties" },
        { speaker: "TRAINER", text: "This means they don't have time to think about less immediate problems such as how to improve their service. When staff leave, it can also severely affect the colleagues they leave behind. It has a negative effect on remaining staff, who may start to feel that they too should be thinking about leaving." },
        { speaker: "TRAINER", text: "So, what can be done to change this situation? Firstly, managers should stop making basic errors which leave their staff feeling upset and resentful. When organising shifts, for example, make sure you never give certain staff preferential treatment. All staff should be given some choice about when they work, and everyone should have to work some evening and weekend shifts.", question_number: 13, highlight_text: "give certain staff preferential treatment" },
        { speaker: "TRAINER", text: "Keeping staff happy has other tangible benefits for the business. Take the Dunwich Hotel as an example. It had been experiencing a problem with staff complaints and in order to deal with this, invested in staff training and improved staff conditions. Not only did the level of complaints fall, but they also noticed a significant increase in the amount each customer spent during their stay.", question_number: 14, highlight_text: "increase in the amount each customer spent" },
        { speaker: "TRAINER", text: "They have now introduced a customer loyalty scheme which is going really well." },
        { speaker: "TRAINER", text: "Now I'd like to look at some ways you can reduce staff turnover in your hotels, and I'll do this by giving some examples of hotels where I've done some training recently." },
        { speaker: "TRAINER", text: "The Sun Club received feedback which showed that staff thought managers didn't value their opinions. They weren't made to feel they were partners who were contributing to the success of the business as a whole. This situation has changed. Junior staff at all levels are regularly invited to meetings where their ideas are welcomed.", question_number: 15, highlight_text: "invited to meetings" },
        { speaker: "TRAINER", text: "A year ago, The Portland recognised the need to invest in staff retention. Their first step was to introduce a scheme for recognising talent amongst their employees. The hope is that organising training for individuals with management potential will encourage them to stay with the business.", question_number: 16, highlight_text: "training for individuals with management potential" },
        { speaker: "TRAINER", text: "At Bluewater, managers decided to recognise 50 high achievers from across the company's huge hotel chain. As a reward, they're sent on an all-expenses-paid trip abroad every year.", question_number: 17, highlight_text: "all-expenses-paid trip abroad" },
        { speaker: "TRAINER", text: "Pentlow Hotels identified that retention of junior reception staff was an issue. In order to encourage them to see that working in a hotel could be worthwhile and rewarding, with good prospects, they introduced a management programme.", question_number: 18, highlight_text: "management programme" },
        { speaker: "TRAINER", text: "Green Planet wanted to be seen as a caring employer. To make life easier for staff, many of whom had childcare responsibilities, the hotel began issuing vouchers to help cover the cost of childcare.", question_number: 19, highlight_text: "vouchers to help cover the cost of childcare" },
        { speaker: "TRAINER", text: "Louise Marsh at The Amesbury has one of the best staff retention rates in the business. Since she joined the company, she has made a huge effort to achieve this by creating a co-operative and supportive environment. For her, the staff are part of a large family where everyone is valued.", question_number: 20, highlight_text: "co-operative and supportive environment" },
        { speaker: "TRAINER", text: "OK, now I'd like to …" },
      ],
      question_groups: [
        {

          questions: "11–14",
          instructions: "Choose the correct letter, A, B or C.",
          question_type: "Multiple Choice (one answer)",
          items: [
            {
              question_number: 11,
              question_text: "Many hotel managers are unaware that their staff often leave because of",
              options: { A: "a lack of training.", B: "long hours.", C: "low pay." },
              answer: "A",
              timestamp_seconds: 102,

            },
            {
              question_number: 12,
              question_text: "What is the impact of high staff turnover on managers?",
              options: { A: "an increased workload", B: "low morale", C: "an inability to meet targets" },
              answer: "A",
              timestamp_seconds: 116,
            },
            {
              question_number: 13,
              question_text: "What mistake should managers always avoid?",
              options: { A: "failing to treat staff equally", B: "reorganising shifts without warning", C: "neglecting to have enough staff during busy periods" },
              answer: "A",
              timestamp_seconds: 163,
            },
            {
              question_number: 14,
              question_text: "What unexpected benefit did Dunwich Hotel notice after improving staff retention rates?",
              options: { A: "a fall in customer complaints", B: "an increase in loyalty club membership", C: "a rise in spending per customer" },
              answer: "C",
              timestamp_seconds: 210,
            },
          ],
        },
        {
          questions: "15–20",
          instructions: "Which way of reducing staff turnover was used in each of the following hotels?\n\nWrite the correct letter, A, B or C, next to Questions 15–20.",
          question_type: "Matching",
          options_box: {
            title: "Ways of reducing staff turnover",
            options: {
              A: "improving relationships and teamwork",
              B: "offering incentives and financial benefits",
              C: "providing career opportunities",
            },
          },
          items: [
            { question_number: 15, prompt: "The Sun Club", answer: "A", timestamp_seconds: 284 },
            { question_number: 16, prompt: "The Portland", answer: "C", timestamp_seconds: 310 },
            { question_number: 17, prompt: "Bluewater Hotels", answer: "B", timestamp_seconds: 342 },
            { question_number: 18, prompt: "Pentlow Hotels", answer: "C", timestamp_seconds: 373 },
            { question_number: 19, prompt: "Green Planet", answer: "B", timestamp_seconds: 396 },
            { question_number: 20, prompt: "The Amesbury", answer: "A", timestamp_seconds: 415 },
          ],
        },
      ],
    },
    {
      part_number: 3,
      part_type: "Academic Discussion",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773923258/ELT_IELTS17_t4_audio3_mggdln.mp3",
      questions: "21–30",
      topic: "Sports Science Discussion – Sporting History and Equipment",
      transcript: [
        { speaker: "JEANNE", text: "Hi Thomas, how are you enjoying the course so far?" },
        { speaker: "THOMAS", text: "Yeah, I think it's good." },
        { speaker: "JEANNE", text: "Remind me – why did you decide to study sports science? Didn't you want to be a professional athlete when you were at school?" },
        { speaker: "THOMAS", text: "Yeah – that was my goal, and all my classmates assumed I would achieve it; they thought I was brilliant.", question_number: 21, highlight_text: "classmates assumed I would achieve it" },
        { speaker: "JEANNE", text: "That must have been a nice feeling." },
        { speaker: "THOMAS", text: "Mm, I thought I could win anything. There was no one who could run faster than me." },
        { speaker: "JEANNE", text: "Exactly – so what happened? Did your mum and dad want you to be more 'academic'?" },
        { speaker: "THOMAS", text: "Not at all. Perhaps they should have pushed me harder, though.", question_number: 22, highlight_text: "should have pushed me harder" },
        { speaker: "JEANNE", text: "What do you mean?" },
        { speaker: "THOMAS", text: "I think I should have practised more." },
        { speaker: "JEANNE", text: "What makes you say that?" },
        { speaker: "THOMAS", text: "Well, I went out to Kenya for a couple of weeks to train …" },
        { speaker: "JEANNE", text: "Really! I didn't know that." },
        { speaker: "THOMAS", text: "I was chosen to go there out of loads of kids and run with some of the top teenage athletes in the world. And … I was so calm about it. I just kept thinking how fortunate I was. What a great chance this was!", question_number: 23, highlight_text: "how fortunate I was" },
        { speaker: "JEANNE", text: "That must have been a huge shock." },
        { speaker: "THOMAS", text: "I thought 'this can't be happening'! I was used to winning.", question_number: 24, highlight_text: "this can't be happening" },
        { speaker: "THOMAS", text: "So Jeanne – have you thought of any ideas for the discussion session next week on technology and sport?" },
        { speaker: "JEANNE", text: "We have to cover more than one sport, don't we?" },
        { speaker: "THOMAS", text: "Yeah." },
        { speaker: "JEANNE", text: "You know – we always think technology is about the future, but we could gather some ideas about past developments in sport." },
        { speaker: "THOMAS", text: "Look at early types of equipment perhaps? Uh, I remember reading something about table tennis bats once – how they ended up being covered with pimpled rubber." },
        { speaker: "JEANNE", text: "Cos they were just wooden at first, I'd imagine." },
        { speaker: "THOMAS", text: "Yeah. In about the 1920s, a factory was making rolls of the rubber in bulk for something like horse harnesses.", question_number: 25, highlight_text: "factory was making rolls of the rubber in bulk" },
        { speaker: "JEANNE", text: "Really!" },
        { speaker: "THOMAS", text: "Yeah – and someone realised that it'd make a perfect covering for the wooden bats." },
        { speaker: "JEANNE", text: "So what about cricket – that's had a few innovative changes. Maybe the pads they wear on their legs?" },
        { speaker: "THOMAS", text: "I don't think they've changed much but, I'm just looking on the internet … and it says that when the first cricket helmet came in, in 1978, the Australian batsman who first wore it was booed and jeered by people watching because it was so ugly!", question_number: 26, highlight_text: "booed and jeered by people watching" },
        { speaker: "JEANNE", text: "Wow, players have to protect themselves from getting hurt! I mean everyone wears one now." },
        { speaker: "THOMAS", text: "Mm, unlike the cycle helmet." },
        { speaker: "JEANNE", text: "Well, unless you're a professional, but you're right, many ordinary bikers don't wear a helmet." },
        { speaker: "THOMAS", text: "Hey, look at these pictures of original helmet designs. This one looks like an upside-down bowl!" },
        { speaker: "JEANNE", text: "Yet, the woman's laughing – she's so proud to be wearing it!" },
        { speaker: "THOMAS", text: "It says serious cyclists ended up with wet hair from all the hard exercise.", question_number: 27, highlight_text: "serious cyclists ended up with wet hair" },
        { speaker: "JEANNE", text: "I guess that's why they have large air vents in them now so that the skin can breathe more easily." },
        { speaker: "JEANNE", text: "Yeah – I remember my great grandfather telling me that because a club was made entirely of wood, it would easily break and players had to get another.", question_number: 28, highlight_text: "easily break and players had to get another" },
        { speaker: "THOMAS", text: "There's no wood at all in them now, is there?" },
        { speaker: "JEANNE", text: "No – they're much more powerful." },
        { speaker: "THOMAS", text: "The same must be true of hockey sticks." },
        { speaker: "JEANNE", text: "I don't think so because players still use wooden sticks today. What it does say here, though, is that when the game started you had to produce a stick yourself.", question_number: 29, highlight_text: "had to produce a stick yourself" },
        { speaker: "THOMAS", text: "I guess they just weren't being manufactured. So, one more perhaps. What about football?" },
        { speaker: "JEANNE", text: "Well, I know the first balls were made of animal skin." },
        { speaker: "THOMAS", text: "Yeah, they covered them with pieces of leather that were stitched together, but … the balls let in water when it rained." },
        { speaker: "JEANNE", text: "Oh, that would have made them much heavier." },
        { speaker: "THOMAS", text: "That's right. You can imagine the damage to players' necks when the ball was headed.", question_number: 30, highlight_text: "damage to players' necks when the ball was headed" },
        { speaker: "JEANNE", text: "How painful that must have been!" },
        { speaker: "THOMAS", text: "Yeah, well, I think we can put together some useful ideas …" },
      ],
      question_groups: [
        {
          questions: "21 and 22",
          instructions: "Choose TWO letters, A–E.",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [21, 22],
              question_text: "Which TWO points do Thomas and Jeanne make about Thomas's sporting activities at school?",
              options: {
                A: "He should have felt more positive about them.",
                B: "The training was too challenging for him.",
                C: "He could have worked harder at them.",
                D: "His parents were disappointed in him.",
                E: "His fellow students admired him.",
              },
              answer: ["C", "E"],
              grading_note: "IN EITHER ORDER",
              timestamp_seconds: 54,
            },
          ],
        },
        {
          questions: "23 and 24",
          instructions: "Choose TWO letters, A–E.",
          question_type: "Multiple Choice (more than one answer)",
          items: [
            {
              question_numbers: [23, 24],
              question_text: "Which TWO feelings did Thomas experience when he was in Kenya?",
              options: {
                A: "disbelief",
                B: "relief",
                C: "stress",
                D: "gratitude",
                E: "homesickness",
              },
              answer: ["A", "D"],
              grading_note: "IN EITHER ORDER",
              timestamp_seconds: 100,
            },
          ],
        },
        {
          questions: "25–30",
          instructions: "What comment do the students make about the development of each of the following items of sporting equipment?\n\nChoose SIX answers from the box and write the correct letter, A–H, next to Questions 25–30.",
          question_type: "Matching",
          options_box: {
            title: "Comments about the development of the equipment",
            options: {
              A: "It could cause excessive sweating.",
              B: "The material was being mass produced for another purpose.",
              C: "People often needed to make their own.",
              D: "It often had to be replaced.",
              E: "The material was expensive.",
              F: "It was unpopular among spectators.",
              G: "It caused injuries.",
              H: "No one using it liked it at first.",
            },
          },
          items: [
            { question_number: 25, prompt: "the table tennis bat", answer: "B", timestamp_seconds: 216 },
            { question_number: 26, prompt: "the cricket helmet", answer: "F", timestamp_seconds: 242 },
            { question_number: 27, prompt: "the cycle helmet", answer: "A", timestamp_seconds: 284 },
            { question_number: 28, prompt: "the golf club", answer: "D", timestamp_seconds: 305 },
            { question_number: 29, prompt: "the hockey stick", answer: "C", timestamp_seconds: 323 },
            { question_number: 30, prompt: "the football", answer: "G", timestamp_seconds: 359 },
          ],
        },
      ],
    },
    {
      part_number: 4,
      part_type: "Extended Monologue",
      audio_url: "https://res.cloudinary.com/dalaaegob/video/upload/v1773923264/ELT_IELTS17_t4_audio4_kyhuxj.mp3",
      questions: "31–40",
      topic: "Maple Syrup",
      transcript: [
        { speaker: "PRESENTER", text: "Hello everyone. Today we're going to look at another natural food product and that's maple syrup. What is this exactly? Well, maple syrup looks rather like clear honey, but it's not made by bees; it's produced from the plant fluid – or sap – inside the maple tree and that makes maple syrup a very natural product. Maple syrup is a thick, golden, sweet-tasting liquid that can be bought in bottles or jars and poured onto food such as waffles and ice cream or used in the baking of cakes and pastries.", question_number: 31, highlight_text: "thick, golden" },
        { speaker: "PRESENTER", text: "It contains no preservatives or added ingredients, and it provides a healthy alternative to refined sugar.", question_number: 32, highlight_text: "healthy alternative to refined sugar" },
        { speaker: "PRESENTER", text: "Let's just talk a bit about the maple tree itself, which is where maple syrup comes from. So, there are many species of maple tree, and they'll grow without fertilizer in areas where there's plenty of moisture in the soil. However, they'll only do this if another important criterion is fulfilled, which is that they must have full or partial sun exposure during the day and very cool nights." },
        { speaker: "PRESENTER", text: "There are only certain parts of the world that provide all these conditions: one is Canada, and by that, I mean all parts of Canada, and the other is the north-eastern states of North America. In these areas, the climate suits the trees perfectly. In fact, Canada produces over two-thirds of the world's maple syrup, which is why the five-pointed maple leaf is a Canadian symbol and has featured on the flag since 1964.", question_number: 33, highlight_text: "climate suits the trees perfectly" },
        { speaker: "PRESENTER", text: "So how did maple syrup production begin? Well, long before Europeans settled in these parts of the world, the indigenous communities had started producing maple sugar. They bored holes in the trunks of maple trees and used containers made of tree bark to collect the liquid sap as it poured out. As they were unable to keep the liquid for any length of time – they didn't have storage facilities in those days – they boiled the liquid by placing pieces of rock that had become scorching hot from the sun into the sap.", question_number: 34, highlight_text: "scorching hot from the sun into the sap" },
        { speaker: "PRESENTER", text: "They did this until it turned into sugar, and they were then able to use this to sweeten their food and drinks. Since that time, improvements have been made to the process, but it has changed very little overall." },
        { speaker: "PRESENTER", text: "So let's look at the production of maple syrup today. Clearly, the maple forests are a valuable resource in many Canadian and North American communities. The trees have to be well looked after and they cannot be used to make syrup until the trunks reach a diameter of around 25 centimetres. This can take anything up to 40 years.", question_number: 35, highlight_text: "diameter of around 25 centimetres" },
        { speaker: "PRESENTER", text: "As I've already mentioned, maple trees need the right conditions to grow and also to produce sap. What happens is that during a cold night, the tree absorbs water from the soil, and that rises through the tree's vascular system. But then in the warmer daytime, the change in temperature causes the water to be pushed back down to the bottom of the tree. This continual movement – up and down – leads to the formation of the sap needed for maple syrup production." },
        { speaker: "PRESENTER", text: "When the tree is ready, it can be tapped and this involves drilling a small hole into the trunk and inserting a tube into it that ends in a bucket.", question_number: 36, highlight_text: "drilling a small hole into the trunk and inserting a tube" },
        { speaker: "PRESENTER", text: "The trees can often take several taps, though the workers take care not to cause any damage to the healthy growth of the tree itself. The sap that comes out of the trees consists of 98 percent water and 2 percent sugar and other nutrients. It has to be boiled so that much of that water evaporates, and this process has to take place immediately, using what are called evaporators. These are basically extremely large pans – the sap is poured into these, a fire is built and the pans are then heated until the sap boils.", question_number: 37, highlight_text: "a fire is built" },
        { speaker: "PRESENTER", text: "As it does this, the water evaporates, and the syrup begins to form. The evaporation process creates large quantities of steam, and the sap becomes thicker and denser.", question_number: 38, highlight_text: "large quantities of steam" },
        { speaker: "PRESENTER", text: "At just the right moment, when the sap is thick enough to be called maple syrup, the worker removes it from the heat. After this process, something called 'sugar sand' has to be filtered out as this builds up during the boiling and gives the syrup a cloudy appearance and a slightly gritty taste.", question_number: 39, highlight_text: "cloudy appearance" },
        { speaker: "PRESENTER", text: "Once this has been done, the syrup is ready to be packaged so that it can be used for a whole variety of products. It takes 40 litres of sap to produce one litre of maple syrup so you can get an idea of how much is needed!", question_number: 40, highlight_text: "40 litres of sap to produce one litre" },
        { speaker: "PRESENTER", text: "So that's the basic process. In places like Quebec where …" },
      ],
      question_groups: [
        {
          questions: "31–40",
          instructions: "Complete the notes below. Write ONE WORD ONLY for each answer.",
          topic: "Maple syrup",
          question_type: "Note Completion",
          content: [
            {
              heading: "What is maple syrup?",
              points: [
                { text: "made from the sap of the maple tree" },
                { text: "added to food or used in cooking" },
                { question_number: 31, text: "colour described as 31 ..............................", answer: "golden", timestamp_seconds: 99 },
                { question_number: 32, text: "very 32 .............................. compared to refined sugar", answer: "healthy", timestamp_seconds: 114 },
              ],
            },
            {
              heading: "The maple tree",
              points: [
                { text: "has many species" },
                { text: "needs sunny days and cool nights" },
                { text: "maple leaf has been on the Canadian flag since 1964" },
                { text: "needs moist soil but does not need fertiliser" },
                { question_number: 33, text: "best growing conditions and 33 .............................. are in Canada and North America", answer: "climate", timestamp_seconds: 173 },
              ],
            },
            {
              heading: "Early maple sugar producers",
              points: [
                { text: "made holes in the tree trunks" },
                { question_number: 34, text: "used hot 34 .............................. to heat the sap", answer: "rock(s)", timestamp_seconds: 224 },
                { text: "used tree bark to make containers for collection" },
                { text: "sweetened food and drink with sugar" },
              ],
            },
            {
              heading: "Today's maple syrup",
              subsections: [
                {
                  subheading: "The trees",
                  points: [
                    { question_number: 35, text: "Tree trunks may not have the correct 35 .............................. until they have been growing for 40 years.", answer: "diameter", timestamp_seconds: 266 },
                    { text: "The changing temperature and movement of water within the tree produces the sap." },
                  ],
                },
                {
                  subheading: "The production",
                  points: [
                    { question_number: 36, text: "A tap is drilled into the trunk and a 36 .............................. carries the sap into a bucket.", answer: "tube", timestamp_seconds: 320 },
                    { question_number: 37, text: "Large pans of sap called evaporators are heated by means of a 37 .............................. .", answer: "fire", timestamp_seconds: 362 },
                    { question_number: 38, text: "A lot of 38 .............................. is produced during the evaporation process.", answer: "steam", timestamp_seconds: 381 },
                    { question_number: 39, text: "'Sugar sand' is removed because it makes the syrup look 39 .............................. and affects the taste.", answer: "cloudy", timestamp_seconds: 398 },
                    { text: "The syrup is ready for use." },
                    { question_number: 40, text: "A huge quantity of sap is needed to make a 40 .............................. of maple syrup.", answer: "litre / liter", timestamp_seconds: 419 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
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
    console.log(`  ✓ Updated exam: ${params.title}`);
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
  console.log(`  ✓ Created exam: ${params.title}`);
}

// ============================================================
// VOCABULARY DATA - 4000 Essential English Words
// ============================================================

const unit1Words = [
  { word: 'afraid', meaning: 'feeling fear', ipa: '/əˈfreɪd/', partOfSpeech: 'adj', example: 'The woman was afraid of what she saw.', imageUrl: 'https://img.freepik.com/free-photo/portrait-young-scared-asian-woman-looking-camera_171337-1496.jpg', order: 1 },
  { word: 'agree', meaning: 'to say yes or to think the same way', ipa: '/əˈɡriː/', partOfSpeech: 'v', example: 'I agree with you.', order: 2 },
  { word: 'angry', meaning: 'feeling upset or mad', ipa: '/ˈæŋɡri/', partOfSpeech: 'adj', example: 'The lion was angry when the rabbit arrived late.', order: 3 },
  { word: 'arrive', meaning: 'to reach a place', ipa: '/əˈraɪv/', partOfSpeech: 'v', example: 'The bus will arrive soon.', order: 4 },
  { word: 'attack', meaning: 'to try to fight or hurt', ipa: '/əˈtæk/', partOfSpeech: 'v', example: 'The lion jumped into the well to attack.', order: 5 },
  { word: 'bottom', meaning: 'the lowest part', ipa: '/ˈbɒtəm/', partOfSpeech: 'n', example: 'The lion lives at the bottom of the well.', order: 6 },
  { word: 'clever', meaning: 'smart or intelligent', ipa: '/ˈklevər/', partOfSpeech: 'adj', example: 'The rabbit was very clever.', order: 7 },
  { word: 'cruel', meaning: 'bad or hurting others', ipa: '/ˈkruːəl/', partOfSpeech: 'adj', example: 'A cruel lion lived in the forest.', order: 8 },
  { word: 'finally', meaning: 'at last or at the end', ipa: '/ˈfaɪnəli/', partOfSpeech: 'adv', example: 'Finally, it was the rabbit\'s turn.', order: 9 },
  { word: 'hide', meaning: 'to not let others see', ipa: '/haɪd/', partOfSpeech: 'v', example: 'I was hiding from another lion.', order: 10 },
  { word: 'hunt', meaning: 'to look for animals to kill', ipa: '/hʌnt/', partOfSpeech: 'v', example: 'You don\'t have to hunt and kill us.', order: 11 },
  { word: 'lot', meaning: 'a large amount', ipa: '/lɒt/', partOfSpeech: 'n', example: 'He killed a lot of animals.', order: 12 },
  { word: 'middle', meaning: 'the center of something', ipa: '/ˈmɪdl/', partOfSpeech: 'n', example: 'The well was in the middle of the forest.', order: 13 },
  { word: 'moment', meaning: 'a very short time', ipa: '/ˈmoʊmənt/', partOfSpeech: 'n', example: 'Without waiting another moment, the lion jumped.', order: 14 },
  { word: 'pleased', meaning: 'feeling happy', ipa: '/pliːzd/', partOfSpeech: 'adj', example: 'All animals were pleased with the rabbit.', order: 15 },
  { word: 'promise', meaning: 'to say you will do something', ipa: '/ˈprɒmɪs/', partOfSpeech: 'v', example: 'If you promise to eat only one animal each day.', order: 16 },
  { word: 'reply', meaning: 'to answer', ipa: '/rɪˈplaɪ/', partOfSpeech: 'v', example: 'The rabbit replied, "I will show you."', order: 17 },
  { word: 'safe', meaning: 'not in danger', ipa: '/seɪf/', partOfSpeech: 'adj', example: 'All the other animals were safe.', order: 18 },
  { word: 'trick', meaning: 'a clever idea to fool someone', ipa: '/trɪk/', partOfSpeech: 'n', example: 'They were pleased with the rabbit\'s clever trick.', order: 19 },
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
  { word: 'allow', meaning: 'to let someone do something', ipa: '/əˈlaʊ/', partOfSpeech: 'v', example: 'Allow me to help you.', order: 1 },
  { word: 'apart', meaning: 'separated by distance or time', ipa: '/əˈpÃ‰â€˜ːrt/', partOfSpeech: 'adv', example: 'The two cities are far apart.', order: 2 },
  { word: 'beside', meaning: 'next to', ipa: '/bɪˈsaɪd/', partOfSpeech: 'prep', example: 'He sat beside his friend.', order: 3 },
  { word: 'cabinet', meaning: 'a piece of furniture with shelves', ipa: '/ˈkæbɪnət/', partOfSpeech: 'n', example: 'The plates are in the cabinet.', order: 4 },
  { word: 'charge', meaning: 'to ask for money for something', ipa: '/tʃÃ‰â€˜ːrdʒ/', partOfSpeech: 'v', example: 'They charge $10 for parking.', order: 5 },
  { word: 'cloth', meaning: 'material used for making clothes', ipa: '/klɒθ/', partOfSpeech: 'n', example: 'The cloth is soft.', order: 6 },
  { word: 'compare', meaning: 'to examine for differences', ipa: '/kəmˈpeər/', partOfSpeech: 'v', example: 'Compare the two answers.', order: 7 },
  { word: 'contain', meaning: 'to have something inside', ipa: '/kənˈteɪn/', partOfSpeech: 'v', example: 'The box contains books.', order: 8 },
  { word: 'create', meaning: 'to make something new', ipa: '/kriˈeɪt/', partOfSpeech: 'v', example: 'Scientists create new medicines.', order: 9 },
  { word: 'electric', meaning: 'powered by electricity', ipa: '/ɪˈlektrɪk/', partOfSpeech: 'adj', example: 'The car is electric.', order: 10 },
  { word: 'experiment', meaning: 'a test to find out something', ipa: '/ɪkˈsperɪmənt/', partOfSpeech: 'n', example: 'The experiment was successful.', order: 11 },
  { word: 'include', meaning: 'to have as part of a group', ipa: '/ɪnˈkluːd/', partOfSpeech: 'v', example: 'The price includes breakfast.', order: 12 },
  { word: 'knife', meaning: 'a tool for cutting', ipa: '/naɪf/', partOfSpeech: 'n', example: 'Use a sharp knife.', order: 13 },
  { word: 'laboratory', meaning: 'a room for scientific work', ipa: '/ləˈbɒrətri/', partOfSpeech: 'n', example: 'They work in a laboratory.', order: 14 },
  { word: 'liquid', meaning: 'something that flows like water', ipa: '/ˈlɪkwɪd/', partOfSpeech: 'n', example: 'Water is a liquid.', order: 15 },
  { word: 'measure', meaning: 'to find the size or amount', ipa: '/ˈmeʒər/', partOfSpeech: 'v', example: 'Measure the length.', order: 16 },
  { word: 'medicine', meaning: 'something to treat illness', ipa: '/ˈmedɪsn/', partOfSpeech: 'n', example: 'Take the medicine three times a day.', order: 17 },
  { word: 'pour', meaning: 'to make liquid flow', ipa: '/pɔːr/', partOfSpeech: 'v', example: 'Pour the water into the glass.', order: 18 },
  { word: 'prove', meaning: 'to show something is true', ipa: '/pruːv/', partOfSpeech: 'v', example: 'Can you prove it?', order: 19 },
  { word: 'smooth', meaning: 'having an even surface', ipa: '/smuːð/', partOfSpeech: 'adj', example: 'The table is smooth.', order: 20 },
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
  { symbol: "ɪ", word: "slip", type: "monophthong", order: 2 },
  { symbol: "ʊ", word: "good", type: "monophthong", order: 3 },
  { symbol: "u:", word: "food", type: "monophthong", order: 4 },
  { symbol: "e", word: "bed", type: "monophthong", order: 5 },
  { symbol: "ə", word: "teacher", type: "monophthong", order: 6 },
  { symbol: "ɜː", word: "bird", type: "monophthong", order: 7 },
  { symbol: "ɔː", word: "door", type: "monophthong", order: 8 },
  { symbol: "æ", word: "cat", type: "monophthong", order: 9 },
  { symbol: "ʌ", word: "up", type: "monophthong", order: 10 },
  { symbol: "ɑː", word: "far", type: "monophthong", order: 11 },
  { symbol: "ɒ", word: "on", type: "monophthong", order: 12 },
  // Diphthongs
  { symbol: "ɪə", word: "here", type: "diphthong", order: 1 },
  { symbol: "eɪ", word: "wait", type: "diphthong", order: 2 },
  { symbol: "ʊə", word: "tourist", type: "diphthong", order: 3 },
  { symbol: "ɔɪ", word: "boy", type: "diphthong", order: 4 },
  { symbol: "əʊ", word: "show", type: "diphthong", order: 5 },
  { symbol: "eə", word: "hair", type: "diphthong", order: 6 },
  { symbol: "aɪ", word: "my", type: "diphthong", order: 7 },
  { symbol: "aʊ", word: "cow", type: "diphthong", order: 8 },
  // Consonants
  { symbol: "p", word: "pea", type: "consonant", voiced: false, order: 1 },
  { symbol: "b", word: "boat", type: "consonant", voiced: true, order: 2 },
  { symbol: "t", word: "tea", type: "consonant", voiced: false, order: 3 },
  { symbol: "d", word: "dog", type: "consonant", voiced: true, order: 4 },
  { symbol: "tʃ", word: "cheese", type: "consonant", voiced: false, order: 5 },
  { symbol: "dʒ", word: "june", type: "consonant", voiced: true, order: 6 },
  { symbol: "k", word: "car", type: "consonant", voiced: false, order: 7 },
  { symbol: "g", word: "go", type: "consonant", voiced: true, order: 8 },
  { symbol: "f", word: "fly", type: "consonant", voiced: false, order: 9 },
  { symbol: "v", word: "video", type: "consonant", voiced: true, order: 10 },
  { symbol: "θ", word: "think", type: "consonant", voiced: false, order: 11 },
  { symbol: "ð", word: "this", type: "consonant", voiced: true, order: 12 },
  { symbol: "s", word: "see", type: "consonant", voiced: false, order: 13 },
  { symbol: "z", word: "zoo", type: "consonant", voiced: true, order: 14 },
  { symbol: "ʃ", word: "shall", type: "consonant", voiced: false, order: 15 },
  { symbol: "ʒ", word: "television", type: "consonant", voiced: true, order: 16 },
  { symbol: "m", word: "man", type: "consonant", voiced: true, order: 17 },
  { symbol: "n", word: "now", type: "consonant", voiced: true, order: 18 },
  { symbol: "ŋ", word: "sing", type: "consonant", voiced: true, order: 19 },
  { symbol: "h", word: "hat", type: "consonant", voiced: false, order: 20 },
  { symbol: "l", word: "love", type: "consonant", voiced: true, order: 21 },
  { symbol: "r", word: "red", type: "consonant", voiced: true, order: 22 },
  { symbol: "w", word: "wet", type: "consonant", voiced: true, order: 23 },
  { symbol: "j", word: "yes", type: "consonant", voiced: true, order: 24 },
];

async function main() {
  console.log('🌱 Seeding database with comprehensive vocabulary data...');

  // Clear existing data
  console.log('🗑️Â  Clearing existing data...');
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
  console.log('📚 Seeding vocabulary books...');
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

    console.log(`  ✓ Created: ${createdBook.name} (${book.units.length} units)`);
  }

  // Seed Grammar Books
  console.log('📖 Seeding grammar books...');
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
    console.log(`  ✓ Created: ${createdBook.name}`);
  }

  // Seed Pronunciation Sounds
  console.log('🔊 Seeding pronunciation sounds...');
  await prisma.pronunciationSound.createMany({
    data: pronunciationSounds,
  });
  console.log(`  ✓ Created ${pronunciationSounds.length} sounds`);

  // Seed Cambridge IELTS exams for Intensive Mock Tests
  console.log('🧪 Seeding Cambridge IELTS exams...');
  const cambridge17Image = "https://res.cloudinary.com/dalaaegob/image/upload/v1773932448/ed06fa88-6d9c-4142-9c7e-3bcd8613f175.png";

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 1",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest1Questions,
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 2",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest2Questions,
  });


  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 3",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest3Questions,
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Reading Test 4",
    difficulty: "ADVANCED",
    durationMinutes: 60,
    type: "READING",
    isPublished: true,
    imageUrl: cambridge17Image,
    questions: cambridgeIelts17ReadingTest4Questions,
  });


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

  // ─── Writing Tests ───────────────────────────────────────────
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 1",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_map",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The maps below show an industrial area in the town of Norbiton, and planned future development of the site.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774400584/cam17-test1_ifztbi.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          prompt:
            "It is important for people to take risks, both in their professional lives and their personal lives.\n\nDo you think the advantages of taking risks outweigh the disadvantages?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          instruction:
            "Write about the following topic:",
          min_words: 250,
        },
      ],
    },
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 2",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_chart",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The table and charts below give information on the police budget for 2017 and 2018 in one area of Britain. The table shows where the money came from and the charts show how it was distributed.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774485815/cam17-test2_caxdco.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          instruction: "Write about the following topic:",
          prompt:
            "Some children spend hours every day on their smartphones.\n\nWhy is this the case? Do you think this is a positive or a negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          min_words: 250,
        },
      ],
    },
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 3",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_chart",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The chart below gives information about how families in one country spent their weekly income in 1968 and in 2018.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774485815/cam17-test3_ji67c1.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          instruction: "Write about the following topic:",
          prompt:
            "Some people believe that professionals, such as doctors and engineers, should be required to work in the country where they did their training. Others believe they should be free to work in another country if they wish.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          min_words: 250,
        },
      ],
    },
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Writing Test 4",
    type: "WRITING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 60,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "writing",
      tasks: [
        {
          task_number: 1,
          task_type: "academic_chart",
          time_advice: "You should spend about 20 minutes on this task.",
          prompt:
            "The graph below shows the number of shops that closed and the number of new shops that opened in one country between 2011 and 2018.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
          image_url:
            "https://res.cloudinary.com/dalaaegob/image/upload/v1774485816/cam17-test4_fauyvk.png",
          min_words: 150,
        },
        {
          task_number: 2,
          task_type: "essay",
          time_advice: "You should spend about 40 minutes on this task.",
          instruction: "Write about the following topic:",
          prompt:
            "Nowadays, a growing number of people with health problems are trying alternative medicines and treatments instead of visiting their usual doctor.\n\nDo you think this is a positive or a negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
          min_words: 250,
        },
      ],
    },
  });
  // ─── Speaking Tests ───────────────────────────────────────────
  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Speaking Test 1",
    type: "SPEAKING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 15,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "speaking",
      examiner: {
        name: "Jim Hopper",
        role: "IELTS Examiner",
        avatarUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1774672658/jim-hopper_mawpyh.png"
      },
      parts: [
        {
          part_number: 1,
          part_type: "Part 1: History",
          topic: "History",
          questions: [
            {
              text: "What did you study in history lessons when you were at school?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651103/1-1_cas2xq.mp4"
            },
            {
              text: "Did you enjoy studying history at school? Why, or why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651101/1-2_waawji.mp4"
            },
            {
              text: "How often do you watch TV programmes about history now? Why, or why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651100/1-3_cw4cz4.mp4"
            },
            {
              text: "What period in history would you like to learn more about? Why?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651099/1-4_vfoyzx.mp4"
            }
          ]
        },
        {
          part_number: 2,
          part_type: "Part 2: Long Turn (Cue Card)",
          topic: "Describe the neighbourhood you lived in when you were a child.",
          cue_card: "Describe the neighbourhood you lived in when you were a child.\nYou should say:\n- where in your town/city the neighbourhood was\n- what kind of people lived there\n- what it was like to live in this neighbourhood\n- and explain whether you would like to live in this neighbourhood in the future.",
          video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774667596/2-1_daeni9.mp4",
          video2: "https://res.cloudinary.com/dalaaegob/video/upload/v1774667596/2-2_caanop.mp4"
        },
        {
          part_number: 3,
          part_type: "Part 3: Discussion Topics",
          topic: "Discussion Topics",
          questions: [
            {
              text: "What sort of things can neighbours do to help each other?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651107/3-1_gjoj8d.mp4"
            },
            {
              text: "How well do people generally know their neighbours in your country?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651099/3-2_khqn7w.mp4"
            },
            {
              text: "How important do you think it is to have good neighbours?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651099/3-3_sambxo.mp4"
            },
            {
              text: "Which facilities are most important to people living in cities?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651105/3-4_jzlys0.mp4"
            },
            {
              text: "How does shopping in small local shops differ from shopping in large city centre shops?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651100/3-5_h7ckie.mp4"
            },
            {
              text: "Do you think that children should always go to the school nearest to where they live?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774651100/3-6_j9dj5u.mp4"
            }
          ]
        }
      ]
    }
  });

  await upsertCambridgeExam({
    title: "Cambridge IELTS 17 - Speaking Test 2",
    type: "SPEAKING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 15,
    imageUrl: cambridge17Image,
    isPublished: true,
    questions: {
      type: "speaking",
      examiner: {
        name: "Amber Bennett",
        role: "IELTS Examiner",
        avatarUrl: "https://res.cloudinary.com/dalaaegob/image/upload/v1774672202/amber-bennett_yhupu4.png"
      },
      parts: [
        {
          part_number: 1,
          part_type: "Part 1: Reading",
          topic: "Reading",
          questions: [
            {
              text: "Did you have a favourite book when you were a child? Why/Why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669864/1.1_zsrotd.mp4"
            },
            {
              text: "How much reading do you do for your work/studies? Why/Why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669860/1.2_ejqmb1.mp4"
            },
            {
              text: "What kinds of books do you read for pleasure? Why/Why not?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669860/1.3_gs36fs.mp4"
            },
            {
              text: "Do you prefer to read a newspaper or a magazine online, or to buy a copy? Why?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669862/1.4_xq5p4k.mp4"
            }
          ]
        },
        {
          part_number: 2,
          part_type: "Part 2: Long Turn (Cue Card)",
          topic: "Describe a big city you would like to visit.",
          cue_card: "Describe a big city you would like to visit.\nYou should say:\n- which big city you would like to visit\n- how you would travel there\n- what you would do there\n- and explain why you would like to visit this big city.",
          video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669864/2.1_ckz0y8.mp4",
          video2: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669863/2.2_cy5jf7.mp4"
        },
        {
          part_number: 3,
          part_type: "Part 3: Discussion Topics",
          topic: "Discussion Topics",
          questions: [
            {
              text: "What are the most interesting things to do while visiting cities on holiday?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669868/3.1_hhezku.mp4"
            },
            {
              text: "Why can it be expensive to visit cities on holiday?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.2_ywkn6r.mp4"
            },
            {
              text: "Do you think it is better to visit cities alone or in a group with friends?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.3_agpays.mp4"
            },
            {
              text: "Why have cities increased in size in recent years?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669863/3.4_chcirv.mp4"
            },
            {
              text: "What are the challenges created by ever-growing cities?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.5_bakekj.mp4"
            },
            {
              text: "In what ways do you think cities of the future will be different to cities today?",
              video: "https://res.cloudinary.com/dalaaegob/video/upload/v1774669861/3.6_soujli.mp4"
            }
          ]
        }
      ]
    }
  });


  const vocabCount = await prisma.vocabularyBook.count();
  const unitCount = await prisma.vocabularyUnit.count();
  const wordCount = await prisma.vocabularyWord.count();
  const exerciseCount = await prisma.vocabularyExercise.count();
  const questionCount = await prisma.vocabularyQuestion.count();

  console.log('\n✅ Database seeding completed!');
  console.log(`   📚 ${vocabCount} vocabulary books`);
  console.log(`   📄 ${unitCount} units`);
  console.log(`   📝 ${wordCount} words`);
  console.log(`   ❓ ${exerciseCount} exercises`);
  console.log(`   ❔ ${questionCount} questions`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
