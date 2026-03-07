export interface ShadowingSentence {
    id: number;
    english: string;
    phonetic: string;
    vietnamese: string;
    words: string[];
    audioStart: number;
    audioEnd: number;
}

export interface ShadowingLesson {
    id: string;
    title: string;
    audioUrl: string;
    image: string;
    tags: string[];
    duration: string;
    sentences: ShadowingSentence[];
}

export const SHADOWING_LESSONS: ShadowingLesson[] = [
    {
        "id": "1",
        "title": "Sarah's Sales Success: MVP Debate",
        "audioUrl": "https://res.cloudinary.com/dalaaegob/video/upload/v1772874242/lesson-K5C-Rt6PJHdZNt0vkUpTp_1_lkoskg.mp3",
        "image": "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        "tags": [
            "TOEIC",
            "Business"
        ],
        "duration": "1:24",
        "sentences": [
            {
                id: 1,
                english: 'So, the last thing in the agenda before we wrap up our end of the year meeting is choosing the MVP of the year.',
                phonetic: 'soʊ, ðə læst θɪŋ ɪn ðə əˈdʒɛndə bɪˈfɔːr wi ræp ʌp aʊər ɛnd ʌv ðə jɪr ˈmiːtɪŋ ɪz ˈtʃuːzɪŋ ðə ɛm viː piː ʌv ðə jɪr',
                vietnamese: 'Vậy, điều cuối cùng trong chương trình nghị sự trước khi chúng ta kết thúc cuộc họp cuối năm là chọn ra MVP của năm.',
                words: ['So', 'the', 'last', 'thing', 'in', 'the', 'agenda', 'before', 'we', 'wrap', 'up', 'our', 'end', 'of', 'the', 'year', 'meeting', 'is', 'choosing', 'the', 'MVP', 'of', 'the', 'year'],
                audioStart: 0, audioEnd: 10.6,
            },
            {
                id: 2,
                english: "I know we don't typically give the most valuable person award to someone who didn't work a complete year with us, but maybe we should make an exception.",
                phonetic: "aɪ noʊ wi doʊnt ˈtɪpɪkli ɡɪv ðə moʊst ˈvæljəbl ˈpɜːrsən əˈwɔːrd tuː ˈsʌmwʌn huː ˈdɪdnt wɜːrk ə kəmˈpliːt jɪr wɪð ʌs bʌt ˈmeɪbi wi ʃʊd meɪk ən ɪkˈsɛpʃən",
                vietnamese: 'Tôi biết chúng ta thường không trao giải thưởng nhân viên xuất sắc nhất cho người chưa làm việc trọn năm với chúng ta, nhưng có lẽ chúng ta nên tạo một ngoại lệ.',
                words: ['I', 'know', 'we', "don't", 'typically', 'give', 'the', 'most', 'valuable', 'person', 'award', 'to', 'someone', 'who', "didn't", 'work', 'a', 'complete', 'year', 'with', 'us', 'but', 'maybe', 'we', 'should', 'make', 'an', 'exception'],
                audioStart: 10.6, audioEnd: 21.28,
            },
            {
                id: 3,
                english: 'Sarah Glassman has been phenomenal since she started with us.',
                phonetic: 'ˈsɛrə ˈɡlæsmən hæz biːn fəˈnɒmɪnəl sɪns ʃiː ˈstɑːrtɪd wɪð ʌs',
                vietnamese: 'Sarah Glassman đã rất xuất sắc kể từ khi cô ấy bắt đầu làm việc với chúng tôi.',
                words: ['Sarah', 'Glassman', 'has', 'been', 'phenomenal', 'since', 'she', 'started', 'with', 'us'],
                audioStart: 21.28, audioEnd: 25.56,
            },
            {
                id: 4,
                english: 'Yes, she has done great.',
                phonetic: 'jɛs ʃiː hæz dʌn ɡreɪt',
                vietnamese: 'Vâng, cô ấy đã làm rất tốt.',
                words: ['Yes', 'she', 'has', 'done', 'great'],
                audioStart: 25.56, audioEnd: 29.2,
            },
            {
                id: 5,
                english: 'Despite not having experience in sales, she helped us reach our goal of over 350 sales in a month.',
                phonetic: 'dɪˈspaɪt nɒt ˈhævɪŋ ɪkˈspɪriəns ɪn seɪlz ʃiː hɛlpt ʌs riːtʃ aʊər ɡoʊl ʌv ˈoʊvər θriː ˈhʌndrəd ˈfɪfti seɪlz ɪn ə mʌnθ',
                vietnamese: 'Mặc dù không có kinh nghiệm bán hàng, cô ấy đã giúp chúng tôi đạt mục tiêu hơn 350 đơn hàng trong một tháng.',
                words: ['Despite', 'not', 'having', 'experience', 'in', 'sales', 'she', 'helped', 'us', 'reach', 'our', 'goal', 'of', 'over', '350', 'sales', 'in', 'a', 'month'],
                audioStart: 29.2, audioEnd: 38.72,
            },
            {
                id: 6,
                english: "This has been something we've strived for since we opened eight years ago.",
                phonetic: "ðɪs hæz biːn ˈsʌmθɪŋ wiːv straɪvd fɔːr sɪns wi ˈoʊpənd eɪt jɪrz əˈɡoʊ",
                vietnamese: 'Đây là điều mà chúng tôi đã nỗ lực đạt được kể từ khi mở cửa 8 năm trước.',
                words: ['This', 'has', 'been', 'something', "we've", 'strived', 'for', 'since', 'we', 'opened', 'eight', 'years', 'ago'],
                audioStart: 38.72, audioEnd: 43.76,
            },
            {
                id: 7,
                english: 'Yes, and by looking at this graph, it is clear she was a great hire.',
                phonetic: 'jɛs ænd baɪ ˈlʊkɪŋ æt ðɪs ɡræf ɪt ɪz klɪr ʃiː wɒz ə ɡreɪt haɪər',
                vietnamese: 'Vâng, và nhìn vào biểu đồ này, rõ ràng cô ấy là một tuyển dụng tuyệt vời.',
                words: ['Yes', 'and', 'by', 'looking', 'at', 'this', 'graph', 'it', 'is', 'clear', 'she', 'was', 'a', 'great', 'hire'],
                audioStart: 43.76, audioEnd: 50.08,
            },
            {
                id: 8,
                english: 'Our sales have only continued to rise since she began.',
                phonetic: 'aʊər seɪlz hæv ˈoʊnli kənˈtɪnjuːd tuː raɪz sɪns ʃiː bɪˈɡæn',
                vietnamese: 'Doanh số bán hàng của chúng tôi chỉ tiếp tục tăng kể từ khi cô ấy bắt đầu.',
                words: ['Our', 'sales', 'have', 'only', 'continued', 'to', 'rise', 'since', 'she', 'began'],
                audioStart: 50.08, audioEnd: 54.08,
            },
            {
                id: 9,
                english: 'I just wonder if the rest of the team will be disappointed.',
                phonetic: 'aɪ dʒʌst ˈwʌndər ɪf ðə rɛst ʌv ðə tiːm wɪl biː ˌdɪsəˈpɔɪntɪd',
                vietnamese: 'Tôi chỉ tự hỏi liệu phần còn lại của đội có thất vọng không.',
                words: ['I', 'just', 'wonder', 'if', 'the', 'rest', 'of', 'the', 'team', 'will', 'be', 'disappointed'],
                audioStart: 54.08, audioEnd: 58.44,
            },
            {
                id: 10,
                english: "They are longtime employees and may feel like she doesn't have the seniority that typically comes with this reward.",
                phonetic: "ðeɪ ɑːr ˈlɒŋtaɪm ɪmˈplɔɪiːz ænd meɪ fiːl laɪk ʃiː ˈdʌznt hæv ðə ˌsiːniˈɒrɪti ðæt ˈtɪpɪkli kʌmz wɪð ðɪs rɪˈwɔːrd",
                vietnamese: 'Họ là những nhân viên lâu năm và có thể cảm thấy cô ấy không có thâm niên thường đi kèm với phần thưởng này.',
                words: ['They', 'are', 'longtime', 'employees', 'and', 'may', 'feel', 'like', 'she', "doesn't", 'have', 'the', 'seniority', 'that', 'typically', 'comes', 'with', 'this', 'reward'],
                audioStart: 58.44, audioEnd: 66.84,
            },
            {
                id: 11,
                english: "Hmm, you may be right, but she gets along with everyone, and I believe everyone should recognize her value and hard work.",
                phonetic: "hm juː meɪ biː raɪt bʌt ʃiː ɡɛts əˈlɒŋ wɪð ˈɛvriːwʌn ænd aɪ bɪˈliːv ˈɛvriːwʌn ʃʊd ˈrɛkəɡnaɪz hɜːr ˈvæljuː ænd hɑːrd wɜːrk",
                vietnamese: 'Hmm, bạn có thể đúng, nhưng cô ấy hòa đồng với mọi người, và tôi tin rằng mọi người nên công nhận giá trị và sự chăm chỉ của cô ấy.',
                words: ['Hmm', 'you', 'may', 'be', 'right', 'but', 'she', 'gets', 'along', 'with', 'everyone', 'and', 'I', 'believe', 'everyone', 'should', 'recognize', 'her', 'value', 'and', 'hard', 'work'],
                audioStart: 66.84, audioEnd: 76.44,
            },
            {
                id: 12,
                english: 'If anything, it may inspire the rest of the team.',
                phonetic: 'ɪf ˈɛniθɪŋ ɪt meɪ ɪnˈspaɪər ðə rɛst ʌv ðə tiːm',
                vietnamese: 'Nếu có gì, điều đó có thể truyền cảm hứng cho phần còn lại của đội.',
                words: ['If', 'anything', 'it', 'may', 'inspire', 'the', 'rest', 'of', 'the', 'team'],
                audioStart: 76.44, audioEnd: 80.16,
            },
            {
                id: 13,
                english: 'Good point. OK, that is decided.',
                phonetic: 'ɡʊd pɔɪnt oʊˈkeɪ ðæt ɪz dɪˈsaɪdɪd',
                vietnamese: 'Ý kiến hay. Được rồi, vậy là quyết định xong.',
                words: ['Good', 'point', 'OK', 'that', 'is', 'decided'],
                audioStart: 80.16, audioEnd: 83.76,
            }
        ]
    },
    {
        "id": "2",
        "title": "Landing the Copywriter Job",
        "audioUrl": "https://res.cloudinary.com/dalaaegob/video/upload/v1772889407/Landing_the_Copywriter_Job_wfbylw.mp3",
        "image": "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        "tags": [
            "TOEIC",
            "Interview"
        ],
        "duration": "1:03",
        "sentences": [
            {
                "id": 1,
                "english": "Hi, Phil. It's nice to meet you.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Hi,",
                    "Phil.",
                    "It's",
                    "nice",
                    "to",
                    "meet",
                    "you."
                ],
                "audioStart": 0,
                "audioEnd": 3
            },
            {
                "id": 2,
                "english": "I'm Holly Bell, the project manager for the Technology Department at Kids Lit.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I'm",
                    "Holly",
                    "Bell,",
                    "the",
                    "project",
                    "manager",
                    "for",
                    "the",
                    "Technology",
                    "Department",
                    "at",
                    "Kids",
                    "Lit."
                ],
                "audioStart": 3,
                "audioEnd": 8
            },
            {
                "id": 3,
                "english": "I'm Becky Alders, the designer for the new program. Pleasure to meet you.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I'm",
                    "Becky",
                    "Alders,",
                    "the",
                    "designer",
                    "for",
                    "the",
                    "new",
                    "program.",
                    "Pleasure",
                    "to",
                    "meet",
                    "you."
                ],
                "audioStart": 8,
                "audioEnd": 13
            },
            {
                "id": 4,
                "english": "It's great to meet both of you. I'm excited to be here.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "It's",
                    "great",
                    "to",
                    "meet",
                    "both",
                    "of",
                    "you.",
                    "I'm",
                    "excited",
                    "to",
                    "be",
                    "here."
                ],
                "audioStart": 13,
                "audioEnd": 17
            },
            {
                "id": 5,
                "english": "So, we've had a look at your past experiences,",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "So,",
                    "we've",
                    "had",
                    "a",
                    "look",
                    "at",
                    "your",
                    "past",
                    "experiences,"
                ],
                "audioStart": 17,
                "audioEnd": 21
            },
            {
                "id": 6,
                "english": "and we think you could be a great fit as the copywriter for the new product we are developing.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "and",
                    "we",
                    "think",
                    "you",
                    "could",
                    "be",
                    "a",
                    "great",
                    "fit",
                    "as",
                    "the",
                    "copywriter",
                    "for",
                    "the",
                    "new",
                    "product",
                    "we",
                    "are",
                    "developing."
                ],
                "audioStart": 21,
                "audioEnd": 27
            },
            {
                "id": 7,
                "english": "It looks like you are still at your current job, so we are just wondering about your notice period.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "It",
                    "looks",
                    "like",
                    "you",
                    "are",
                    "still",
                    "at",
                    "your",
                    "current",
                    "job,",
                    "so",
                    "we",
                    "are",
                    "just",
                    "wondering",
                    "about",
                    "your",
                    "notice",
                    "period."
                ],
                "audioStart": 27,
                "audioEnd": 33
            },
            {
                "id": 8,
                "english": "We need someone to start as soon as possible.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "We",
                    "need",
                    "someone",
                    "to",
                    "start",
                    "as",
                    "soon",
                    "as",
                    "possible."
                ],
                "audioStart": 33,
                "audioEnd": 36
            },
            {
                "id": 9,
                "english": "Yes, I'm currently still working at kid content, but I handed in my notice last month,",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Yes,",
                    "I'm",
                    "currently",
                    "still",
                    "working",
                    "at",
                    "kid",
                    "content,",
                    "but",
                    "I",
                    "handed",
                    "in",
                    "my",
                    "notice",
                    "last",
                    "month,"
                ],
                "audioStart": 36,
                "audioEnd": 42
            },
            {
                "id": 10,
                "english": "so my final day is tomorrow. I will be available anytime.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "so",
                    "my",
                    "final",
                    "day",
                    "is",
                    "tomorrow.",
                    "I",
                    "will",
                    "be",
                    "available",
                    "anytime."
                ],
                "audioStart": 42,
                "audioEnd": 46
            },
            {
                "id": 11,
                "english": "Oh, that is great news. We enjoyed looking through your portfolio, and we're hoping to discuss this article.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Oh,",
                    "that",
                    "is",
                    "great",
                    "news.",
                    "We",
                    "enjoyed",
                    "looking",
                    "through",
                    "your",
                    "portfolio,",
                    "and",
                    "we're",
                    "hoping",
                    "to",
                    "discuss",
                    "this",
                    "article."
                ],
                "audioStart": 46,
                "audioEnd": 53
            },
            {
                "id": 12,
                "english": "Can you tell us about the writing process for the piece and decisions you made along the way?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Can",
                    "you",
                    "tell",
                    "us",
                    "about",
                    "the",
                    "writing",
                    "process",
                    "for",
                    "the",
                    "piece",
                    "and",
                    "decisions",
                    "you",
                    "made",
                    "along",
                    "the",
                    "way?"
                ],
                "audioStart": 53,
                "audioEnd": 58
            },
            {
                "id": 13,
                "english": "Of course. Let me grab my copy of the article so we can look through it together.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Of",
                    "course.",
                    "Let",
                    "me",
                    "grab",
                    "my",
                    "copy",
                    "of",
                    "the",
                    "article",
                    "so",
                    "we",
                    "can",
                    "look",
                    "through",
                    "it",
                    "together."
                ],
                "audioStart": 58,
                "audioEnd": 63
            }
        ]
    },
    {
        "id": "3",
        "title": "Menu Photo Prep for Social Media",
        "audioUrl": "https://res.cloudinary.com/dalaaegob/video/upload/v1772889404/Menu_Photo_Prep_for_Social_Media_ygdo4i.mp3",
        "image": "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        "tags": [
            "TOEIC",
            "Social Media"
        ],
        "duration": "1:09",
        "sentences": [
            {
                "id": 1,
                "english": "Ralph, I just wanted to compliment you on the photographs you took for our new menu items.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Ralph,",
                    "I",
                    "just",
                    "wanted",
                    "to",
                    "compliment",
                    "you",
                    "on",
                    "the",
                    "photographs",
                    "you",
                    "took",
                    "for",
                    "our",
                    "new",
                    "menu",
                    "items."
                ],
                "audioStart": 0,
                "audioEnd": 6.24
            },
            {
                "id": 2,
                "english": "Would you be able to email those to my secretary so our social media team can use them?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Would",
                    "you",
                    "be",
                    "able",
                    "to",
                    "email",
                    "those",
                    "to",
                    "my",
                    "secretary",
                    "so",
                    "our",
                    "social",
                    "media",
                    "team",
                    "can",
                    "use",
                    "them?"
                ],
                "audioStart": 6.24,
                "audioEnd": 12.64
            },
            {
                "id": 3,
                "english": "No problem, Elsa.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "No",
                    "problem,",
                    "Elsa."
                ],
                "audioStart": 12.64,
                "audioEnd": 14.4
            },
            {
                "id": 4,
                "english": "Which ones did you want me to send over?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Which",
                    "ones",
                    "did",
                    "you",
                    "want",
                    "me",
                    "to",
                    "send",
                    "over?"
                ],
                "audioStart": 14.4,
                "audioEnd": 17.96
            },
            {
                "id": 5,
                "english": "I would really like all of them.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "would",
                    "really",
                    "like",
                    "all",
                    "of",
                    "them."
                ],
                "audioStart": 17.96,
                "audioEnd": 20.12
            },
            {
                "id": 6,
                "english": "Can you also make note of which restaurant location you were at and the name and price",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Can",
                    "you",
                    "also",
                    "make",
                    "note",
                    "of",
                    "which",
                    "restaurant",
                    "location",
                    "you",
                    "were",
                    "at",
                    "and",
                    "the",
                    "name",
                    "and",
                    "price"
                ],
                "audioStart": 20.12,
                "audioEnd": 24.48
            },
            {
                "id": 7,
                "english": "of the menu item?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "of",
                    "the",
                    "menu",
                    "item?"
                ],
                "audioStart": 24.48,
                "audioEnd": 26.2
            },
            {
                "id": 8,
                "english": "Well, I'm a little concerned that the photos that are taken in the kitchen won't look",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Well,",
                    "I'm",
                    "a",
                    "little",
                    "concerned",
                    "that",
                    "the",
                    "photos",
                    "that",
                    "are",
                    "taken",
                    "in",
                    "the",
                    "kitchen",
                    "won't",
                    "look"
                ],
                "audioStart": 26.2,
                "audioEnd": 31.72
            },
            {
                "id": 9,
                "english": "great on social media.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "great",
                    "on",
                    "social",
                    "media."
                ],
                "audioStart": 31.72,
                "audioEnd": 33.52
            },
            {
                "id": 10,
                "english": "I also am not sure of the price of the items, as they are different at each location.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "also",
                    "am",
                    "not",
                    "sure",
                    "of",
                    "the",
                    "price",
                    "of",
                    "the",
                    "items,",
                    "as",
                    "they",
                    "are",
                    "different",
                    "at",
                    "each",
                    "location."
                ],
                "audioStart": 33.52,
                "audioEnd": 40.12
            },
            {
                "id": 11,
                "english": "Hmm, okay.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Hmm,",
                    "okay."
                ],
                "audioStart": 40.12,
                "audioEnd": 42.88
            },
            {
                "id": 12,
                "english": "I didn't think about the photos taken in the kitchen.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "didn't",
                    "think",
                    "about",
                    "the",
                    "photos",
                    "taken",
                    "in",
                    "the",
                    "kitchen."
                ],
                "audioStart": 42.88,
                "audioEnd": 46.8
            },
            {
                "id": 13,
                "english": "Maybe we shouldn't use those.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Maybe",
                    "we",
                    "shouldn't",
                    "use",
                    "those."
                ],
                "audioStart": 46.8,
                "audioEnd": 48.48
            },
            {
                "id": 14,
                "english": "I will take care of finding the correct prices.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "will",
                    "take",
                    "care",
                    "of",
                    "finding",
                    "the",
                    "correct",
                    "prices."
                ],
                "audioStart": 48.48,
                "audioEnd": 51.36
            },
            {
                "id": 15,
                "english": "How does that sound?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "How",
                    "does",
                    "that",
                    "sound?"
                ],
                "audioStart": 51.36,
                "audioEnd": 53.4
            },
            {
                "id": 16,
                "english": "That should solve all of my problems for now.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "That",
                    "should",
                    "solve",
                    "all",
                    "of",
                    "my",
                    "problems",
                    "for",
                    "now."
                ],
                "audioStart": 53.4,
                "audioEnd": 56.12
            },
            {
                "id": 17,
                "english": "I will send all the photos and information over as soon as possible.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "will",
                    "send",
                    "all",
                    "the",
                    "photos",
                    "and",
                    "information",
                    "over",
                    "as",
                    "soon",
                    "as",
                    "possible."
                ],
                "audioStart": 56.12,
                "audioEnd": 61.48
            },
            {
                "id": 18,
                "english": "I appreciate it.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "appreciate",
                    "it."
                ],
                "audioStart": 61.48,
                "audioEnd": 62.96
            },
            {
                "id": 19,
                "english": "All the new menu items are dropping on Friday, right?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "All",
                    "the",
                    "new",
                    "menu",
                    "items",
                    "are",
                    "dropping",
                    "on",
                    "Friday,",
                    "right?"
                ],
                "audioStart": 62.96,
                "audioEnd": 66.56
            },
            {
                "id": 20,
                "english": "Maybe we should wait to post the pictures until then.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Maybe",
                    "we",
                    "should",
                    "wait",
                    "to",
                    "post",
                    "the",
                    "pictures",
                    "until",
                    "then."
                ],
                "audioStart": 66.56,
                "audioEnd": 69.2
            }
        ]
    },
    {
        "id": "4",
        "title": "Sourcing Suppliers & Travel Expenses",
        "audioUrl": "https://res.cloudinary.com/dalaaegob/video/upload/v1772889407/Sourcing_Suppliers_Travel_Expenses_axr8ea.mp3",
        "image": "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        "tags": [
            "TOEIC",
            "Business Trip"
        ],
        "duration": "1:06",
        "sentences": [
            {
                "id": 1,
                "english": "Hello, Davis. How was your business trip?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Hello,",
                    "Davis.",
                    "How",
                    "was",
                    "your",
                    "business",
                    "trip?"
                ],
                "audioStart": 0,
                "audioEnd": 4.68
            },
            {
                "id": 2,
                "english": "It was great. I managed to find a couple of suitable suppliers for us. I think they will",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "It",
                    "was",
                    "great.",
                    "I",
                    "managed",
                    "to",
                    "find",
                    "a",
                    "couple",
                    "of",
                    "suitable",
                    "suppliers",
                    "for",
                    "us.",
                    "I",
                    "think",
                    "they",
                    "will"
                ],
                "audioStart": 4.68,
                "audioEnd": 10.56
            },
            {
                "id": 3,
                "english": "be extremely helpful for our overseas market.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "be",
                    "extremely",
                    "helpful",
                    "for",
                    "our",
                    "overseas",
                    "market."
                ],
                "audioStart": 10.56,
                "audioEnd": 14.32
            },
            {
                "id": 4,
                "english": "Good news! Tell me more about it.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Good",
                    "news!",
                    "Tell",
                    "me",
                    "more",
                    "about",
                    "it."
                ],
                "audioStart": 14.32,
                "audioEnd": 18.2
            },
            {
                "id": 5,
                "english": "There are five candidates in total. Location-wise, I think this firm in South East Asia is a",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "There",
                    "are",
                    "five",
                    "candidates",
                    "in",
                    "total.",
                    "Location-wise,",
                    "I",
                    "think",
                    "this",
                    "firm",
                    "in",
                    "South",
                    "East",
                    "Asia",
                    "is",
                    "a"
                ],
                "audioStart": 18.2,
                "audioEnd": 25.64
            },
            {
                "id": 6,
                "english": "perfect fit for our company, since it is very close to the harbour. I will do a thorough",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "perfect",
                    "fit",
                    "for",
                    "our",
                    "company,",
                    "since",
                    "it",
                    "is",
                    "very",
                    "close",
                    "to",
                    "the",
                    "harbour.",
                    "I",
                    "will",
                    "do",
                    "a",
                    "thorough"
                ],
                "audioStart": 25.64,
                "audioEnd": 31.96
            },
            {
                "id": 7,
                "english": "analysis later this week.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "analysis",
                    "later",
                    "this",
                    "week."
                ],
                "audioStart": 31.96,
                "audioEnd": 35
            },
            {
                "id": 8,
                "english": "I see. I can imagine how much money we can save on transportation costs if we choose",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "see.",
                    "I",
                    "can",
                    "imagine",
                    "how",
                    "much",
                    "money",
                    "we",
                    "can",
                    "save",
                    "on",
                    "transportation",
                    "costs",
                    "if",
                    "we",
                    "choose"
                ],
                "audioStart": 35,
                "audioEnd": 41.84
            },
            {
                "id": 9,
                "english": "this company as our supplier. Let's evaluate all the options before making a decision.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "this",
                    "company",
                    "as",
                    "our",
                    "supplier.",
                    "Let's",
                    "evaluate",
                    "all",
                    "the",
                    "options",
                    "before",
                    "making",
                    "a",
                    "decision."
                ],
                "audioStart": 41.84,
                "audioEnd": 48.52
            },
            {
                "id": 10,
                "english": "Can you finish the report by the end of this month?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Can",
                    "you",
                    "finish",
                    "the",
                    "report",
                    "by",
                    "the",
                    "end",
                    "of",
                    "this",
                    "month?"
                ],
                "audioStart": 48.52,
                "audioEnd": 51.88
            },
            {
                "id": 11,
                "english": "No problem.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "No",
                    "problem."
                ],
                "audioStart": 51.88,
                "audioEnd": 52.88
            },
            {
                "id": 12,
                "english": "Good. Oh, by the way, this Friday is your last chance to submit your travel reimbursement",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Good.",
                    "Oh,",
                    "by",
                    "the",
                    "way,",
                    "this",
                    "Friday",
                    "is",
                    "your",
                    "last",
                    "chance",
                    "to",
                    "submit",
                    "your",
                    "travel",
                    "reimbursement"
                ],
                "audioStart": 52.88,
                "audioEnd": 60.08
            },
            {
                "id": 13,
                "english": "form. Make sure all of the receipts are sent to the accounting department on time.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "form.",
                    "Make",
                    "sure",
                    "all",
                    "of",
                    "the",
                    "receipts",
                    "are",
                    "sent",
                    "to",
                    "the",
                    "accounting",
                    "department",
                    "on",
                    "time."
                ],
                "audioStart": 60.08,
                "audioEnd": 66
            }
        ]
    },
    {
        "id": "5",
        "title": "Investing in Stocks A Long Term Strategy",
        "audioUrl": "https://res.cloudinary.com/dalaaegob/video/upload/v1772889404/Investing_in_Stocks_A_Long_Term_Strategy_rbzrhx.mp3",
        "image": "https://res.cloudinary.com/dalaaegob/image/upload/v1772718104/1abfac7a-360e-4374-bbfa-b501cc9f96ad.png",
        "tags": [
            "TOEIC",
            "Finance"
        ],
        "duration": "1:07",
        "sentences": [
            {
                "id": 1,
                "english": "I am conflicted on where I should invest my money.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "am",
                    "conflicted",
                    "on",
                    "where",
                    "I",
                    "should",
                    "invest",
                    "my",
                    "money."
                ],
                "audioStart": 0,
                "audioEnd": 3
            },
            {
                "id": 2,
                "english": "I want to purchase some stocks, but I know it can be pretty risky.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "want",
                    "to",
                    "purchase",
                    "some",
                    "stocks,",
                    "but",
                    "I",
                    "know",
                    "it",
                    "can",
                    "be",
                    "pretty",
                    "risky."
                ],
                "audioStart": 3,
                "audioEnd": 7
            },
            {
                "id": 3,
                "english": "I am not educated at all in this area.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "am",
                    "not",
                    "educated",
                    "at",
                    "all",
                    "in",
                    "this",
                    "area."
                ],
                "audioStart": 7,
                "audioEnd": 10
            },
            {
                "id": 4,
                "english": "Are you able to help?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Are",
                    "you",
                    "able",
                    "to",
                    "help?"
                ],
                "audioStart": 10,
                "audioEnd": 11
            },
            {
                "id": 5,
                "english": "Of course.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Of",
                    "course."
                ],
                "audioStart": 11,
                "audioEnd": 12
            },
            {
                "id": 6,
                "english": "Stocks can actually be a stable source of investment",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Stocks",
                    "can",
                    "actually",
                    "be",
                    "a",
                    "stable",
                    "source",
                    "of",
                    "investment"
                ],
                "audioStart": 12,
                "audioEnd": 15
            },
            {
                "id": 7,
                "english": "if you make the right decisions.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "if",
                    "you",
                    "make",
                    "the",
                    "right",
                    "decisions."
                ],
                "audioStart": 15,
                "audioEnd": 17
            },
            {
                "id": 8,
                "english": "It would be my job to look after your money",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "It",
                    "would",
                    "be",
                    "my",
                    "job",
                    "to",
                    "look",
                    "after",
                    "your",
                    "money"
                ],
                "audioStart": 17,
                "audioEnd": 19
            },
            {
                "id": 9,
                "english": "and make decisions on your behalf based on current rates.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "and",
                    "make",
                    "decisions",
                    "on",
                    "your",
                    "behalf",
                    "based",
                    "on",
                    "current",
                    "rates."
                ],
                "audioStart": 19,
                "audioEnd": 22
            },
            {
                "id": 10,
                "english": "So what type of stocks would you start off buying?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "So",
                    "what",
                    "type",
                    "of",
                    "stocks",
                    "would",
                    "you",
                    "start",
                    "off",
                    "buying?"
                ],
                "audioStart": 22,
                "audioEnd": 26
            },
            {
                "id": 11,
                "english": "Based on your investment,",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Based",
                    "on",
                    "your",
                    "investment,"
                ],
                "audioStart": 26,
                "audioEnd": 27
            },
            {
                "id": 12,
                "english": "I think the travel industry is your best bet right now.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "think",
                    "the",
                    "travel",
                    "industry",
                    "is",
                    "your",
                    "best",
                    "bet",
                    "right",
                    "now."
                ],
                "audioStart": 27,
                "audioEnd": 30
            },
            {
                "id": 13,
                "english": "Prices are low, but expected to rise after lockdown's ease.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Prices",
                    "are",
                    "low,",
                    "but",
                    "expected",
                    "to",
                    "rise",
                    "after",
                    "lockdown's",
                    "ease."
                ],
                "audioStart": 30,
                "audioEnd": 35
            },
            {
                "id": 14,
                "english": "I did read about Air London's low stock point.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "did",
                    "read",
                    "about",
                    "Air",
                    "London's",
                    "low",
                    "stock",
                    "point."
                ],
                "audioStart": 35,
                "audioEnd": 38
            },
            {
                "id": 15,
                "english": "I also read they may not raise for years.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "also",
                    "read",
                    "they",
                    "may",
                    "not",
                    "raise",
                    "for",
                    "years."
                ],
                "audioStart": 38,
                "audioEnd": 41
            },
            {
                "id": 16,
                "english": "That might be true,",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "That",
                    "might",
                    "be",
                    "true,"
                ],
                "audioStart": 41,
                "audioEnd": 43
            },
            {
                "id": 17,
                "english": "but because you are doing a long-term investment,",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "but",
                    "because",
                    "you",
                    "are",
                    "doing",
                    "a",
                    "long-term",
                    "investment,"
                ],
                "audioStart": 43,
                "audioEnd": 45
            },
            {
                "id": 18,
                "english": "we don't really care what happens in the next couple of years.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "we",
                    "don't",
                    "really",
                    "care",
                    "what",
                    "happens",
                    "in",
                    "the",
                    "next",
                    "couple",
                    "of",
                    "years."
                ],
                "audioStart": 45,
                "audioEnd": 49
            },
            {
                "id": 19,
                "english": "We are more interested in 10 to 15 years down the line.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "We",
                    "are",
                    "more",
                    "interested",
                    "in",
                    "10",
                    "to",
                    "15",
                    "years",
                    "down",
                    "the",
                    "line."
                ],
                "audioStart": 49,
                "audioEnd": 53
            },
            {
                "id": 20,
                "english": "Hmm, I don't know. That makes me a little uneasy.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Hmm,",
                    "I",
                    "don't",
                    "know.",
                    "That",
                    "makes",
                    "me",
                    "a",
                    "little",
                    "uneasy."
                ],
                "audioStart": 53,
                "audioEnd": 57
            },
            {
                "id": 21,
                "english": "Whatever you feel comfortable with,",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Whatever",
                    "you",
                    "feel",
                    "comfortable",
                    "with,"
                ],
                "audioStart": 57,
                "audioEnd": 59
            },
            {
                "id": 22,
                "english": "I will compile a projection portfolio and send it to you this week.",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "I",
                    "will",
                    "compile",
                    "a",
                    "projection",
                    "portfolio",
                    "and",
                    "send",
                    "it",
                    "to",
                    "you",
                    "this",
                    "week."
                ],
                "audioStart": 59,
                "audioEnd": 63
            },
            {
                "id": 23,
                "english": "Why don't you have a look at it and give me a call",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "Why",
                    "don't",
                    "you",
                    "have",
                    "a",
                    "look",
                    "at",
                    "it",
                    "and",
                    "give",
                    "me",
                    "a",
                    "call"
                ],
                "audioStart": 63,
                "audioEnd": 65
            },
            {
                "id": 24,
                "english": "if you have any questions?",
                "phonetic": "",
                "vietnamese": "",
                "words": [
                    "if",
                    "you",
                    "have",
                    "any",
                    "questions?"
                ],
                "audioStart": 65,
                "audioEnd": 67
            }
        ]
    }
];
