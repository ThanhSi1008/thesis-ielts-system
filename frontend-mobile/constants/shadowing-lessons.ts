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
    youtubeVideoId?: string;
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
,
    {
        "id": "6",
        "title": "Christian Nationalists Have Betrayed Jesus - Rhett McLaughlin",
        "audioUrl": "",
        "youtubeVideoId": "9_4VyZSxL04",
        "image": "https://img.youtube.com/vi/9_4VyZSxL04/maxresdefault.jpg",
        "tags": ["YOUTUBE","Religion"],
        "duration": "17:38",
        "sentences": [
            {
                "id": 1,
                "english": "Hey, I'm going on a tour of the United Kingdom. If you've ever been interested in that big question of God's existence or try to make sense of religion in the 21st century or consciousness or anything philosophical, then join me on",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Hey,","I'm","going","on","a","tour","of","the","United","Kingdom.","If","you've","ever","been","interested","in","that","big","question","of","God's","existence","or","try","to","make","sense","of","religion","in","the","21st","century","or","consciousness","or","anything","philosophical,","then","join","me","on"],
                "audioStart": 0.24,
                "audioEnd": 14.32
            },
            {
                "id": 2,
                "english": "stage as I try to work out some of these topics with you. I'll be in conversation with a good friend, but also bring questions because there will be an extensive Q&A and maybe even an opportunity to hear and rate some of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["stage","as","I","try","to","work","out","some","of","these","topics","with","you.","I'll","be","in","conversation","with","a","good","friend,","but","also","bring","questions","because","there","will","be","an","extensive","Q&A","and","maybe","even","an","opportunity","to","hear","and","rate","some","of"],
                "audioStart": 14.32,
                "audioEnd": 26
            },
            {
                "id": 3,
                "english": "your philosophical hot takes. The tour dates are on screen. The link to buy tickets is in the description and I hope to see you there. I think that the sort of dogged pursuit of political power and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["your","philosophical","hot","takes.","The","tour","dates","are","on","screen.","The","link","to","buy","tickets","is","in","the","description","and","I","hope","to","see","you","there.","I","think","that","the","sort","of","dogged","pursuit","of","political","power","and"],
                "audioStart": 26,
                "audioEnd": 41.04
            },
            {
                "id": 4,
                "english": "the consolidation of political power especially in the United States by Christians is one of the biggest betrayals of the teachings of Jesus.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","consolidation","of","political","power","especially","in","the","United","States","by","Christians","is","one","of","the","biggest","betrayals","of","the","teachings","of","Jesus."],
                "audioStart": 41.04,
                "audioEnd": 52.16
            },
            {
                "id": 5,
                "english": "And I think that it has been disillusioning to a lot of Christians.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","I","think","that","it","has","been","disillusioning","to","a","lot","of","Christians."],
                "audioStart": 52.16,
                "audioEnd": 58.559
            },
            {
                "id": 6,
                "english": "Interestingly, my entire deconstruction happened outside of that and kind of now I was a conservative Christian. I voted Republican because of abortion probably alone. Um, but the political landscape has changed",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Interestingly,","my","entire","deconstruction","happened","outside","of","that","and","kind","of","now","I","was","a","conservative","Christian.","I","voted","Republican","because","of","abortion","probably","alone.","Um,","but","the","political","landscape","has","changed"],
                "audioStart": 58.559,
                "audioEnd": 75.439
            },
            {
                "id": 7,
                "english": "a lot and at this point the kind of the the embrace of the pursuit of political power and talking about it and how it's spreading to more and more Christians.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["a","lot","and","at","this","point","the","kind","of","the","the","embrace","of","the","pursuit","of","political","power","and","talking","about","it","and","how","it's","spreading","to","more","and","more","Christians."],
                "audioStart": 75.439,
                "audioEnd": 91.28
            },
            {
                "id": 8,
                "english": "I feel like this is a new level. I don't think this is something that I experienced, you know, 15 years ago when I was deconstructing.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["I","feel","like","this","is","a","new","level.","I","don't","think","this","is","something","that","I","experienced,","you","know,","15","years","ago","when","I","was","deconstructing."],
                "audioStart": 91.28,
                "audioEnd": 98.24
            },
            {
                "id": 9,
                "english": "Um, so I want to talk a little bit about what Jesus has to say about this or, you know, what the Bible has to say about this and then we can kind of talk about why why I think this is such a problem.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Um,","so","I","want","to","talk","a","little","bit","about","what","Jesus","has","to","say","about","this","or,","you","know,","what","the","Bible","has","to","say","about","this","and","then","we","can","kind","of","talk","about","why","why","I","think","this","is","such","a","problem."],
                "audioStart": 98.24,
                "audioEnd": 109.84
            },
            {
                "id": 10,
                "english": "Um, let's start in when Jesus is before Pilate, right?",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Um,","let's","start","in","when","Jesus","is","before","Pilate,","right?"],
                "audioStart": 109.84,
                "audioEnd": 117.68
            },
            {
                "id": 11,
                "english": "So, this is just kind of setting the stage. You've got Jesus before Pilate in John 18.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["So,","this","is","just","kind","of","setting","the","stage.","You've","got","Jesus","before","Pilate","in","John","18."],
                "audioStart": 117.68,
                "audioEnd": 121.36
            },
            {
                "id": 12,
                "english": "Mhm.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Mhm."],
                "audioStart": 121.36,
                "audioEnd": 122.32
            },
            {
                "id": 13,
                "english": "And um he essentially says, you know, P well Pilate is basically asking him like, you know, well, let me just say it. Let me just read it. So Pilate entered his headquarters again and called Jesus and said to him, \"Are you",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","um","he","essentially","says,","you","know,","P","well","Pilate","is","basically","asking","him","like,","you","know,","well,","let","me","just","say","it.","Let","me","just","read","it.","So","Pilate","entered","his","headquarters","again","and","called","Jesus","and","said","to","him,","\"Are","you"],
                "audioStart": 122.32,
                "audioEnd": 135.44
            },
            {
                "id": 14,
                "english": "the king of the Jews?\" Jesus answered, \"Do you say this of your own accord or did others say it to you about me?\"",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","king","of","the","Jews?\"","Jesus","answered,","\"Do","you","say","this","of","your","own","accord","or","did","others","say","it","to","you","about","me?\""],
                "audioStart": 135.44,
                "audioEnd": 141.52
            },
            {
                "id": 15,
                "english": "Pilate answered, \"Am I a Jew? Your own nation and the chief priests have delivered you over to me. What have you done?\" And Jesus answered, \"My kingdom is not of this world. If my kingdom were of this world, my servants would have",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Pilate","answered,","\"Am","I","a","Jew?","Your","own","nation","and","the","chief","priests","have","delivered","you","over","to","me.","What","have","you","done?\"","And","Jesus","answered,","\"My","kingdom","is","not","of","this","world.","If","my","kingdom","were","of","this","world,","my","servants","would","have"],
                "audioStart": 141.52,
                "audioEnd": 152.64
            },
            {
                "id": 16,
                "english": "been fighting that I might not be delivered over to the Jews. But my kingdom is not from this world.\"",
                "phonetic": "",
                "vietnamese": "",
                "words": ["been","fighting","that","I","might","not","be","delivered","over","to","the","Jews.","But","my","kingdom","is","not","from","this","world.\""],
                "audioStart": 152.64,
                "audioEnd": 157.84
            },
            {
                "id": 17,
                "english": "So again, here we are. Jesus is having this this moment where he is been taken in and he's being taken in by the political forces that existed at that time where they were kind of executing the will of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["So","again,","here","we","are.","Jesus","is","having","this","this","moment","where","he","is","been","taken","in","and","he's","being","taken","in","by","the","political","forces","that","existed","at","that","time","where","they","were","kind","of","executing","the","will","of"],
                "audioStart": 157.84,
                "audioEnd": 173.2
            },
            {
                "id": 18,
                "english": "God to literally execute him. And what did he do? He said, he took that opportunity to say, \"My kingdom, this is not about th this worldly kingdom that you're talking about. My kingdom is not of this world.\"",
                "phonetic": "",
                "vietnamese": "",
                "words": ["God","to","literally","execute","him.","And","what","did","he","do?","He","said,","he","took","that","opportunity","to","say,","\"My","kingdom,","this","is","not","about","th","this","worldly","kingdom","that","you're","talking","about.","My","kingdom","is","not","of","this","world.\""],
                "audioStart": 173.2,
                "audioEnd": 185.12
            },
            {
                "id": 19,
                "english": "And if it were, my servants would be fighting.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","if","it","were,","my","servants","would","be","fighting."],
                "audioStart": 185.12,
                "audioEnd": 187.84
            },
            {
                "id": 20,
                "english": "They'd be doing something about it right now. They would be in here doing something about it. The reason that they are not resistant, in fact, earlier when Peter cuts off the ear, he's like, \"No.\" He puts it back on, you",
                "phonetic": "",
                "vietnamese": "",
                "words": ["They'd","be","doing","something","about","it","right","now.","They","would","be","in","here","doing","something","about","it.","The","reason","that","they","are","not","resistant,","in","fact,","earlier","when","Peter","cuts","off","the","ear,","he's","like,","\"No.\"","He","puts","it","back","on,","you"],
                "audioStart": 187.84,
                "audioEnd": 197.44
            },
            {
                "id": 21,
                "english": "know? He's like, \"No, no, that's not what we're doing. We're not fighting.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["know?","He's","like,","\"No,","no,","that's","not","what","we're","doing.","We're","not","fighting."],
                "audioStart": 197.44,
                "audioEnd": 200.08
            },
            {
                "id": 22,
                "english": "We're not here to fight.\"",
                "phonetic": "",
                "vietnamese": "",
                "words": ["We're","not","here","to","fight.\""],
                "audioStart": 200.08,
                "audioEnd": 202.56
            },
            {
                "id": 23,
                "english": "You don't get that anywhere from Jesus, right? Well, you get that a little bit from Israel, which I think is one of the reasons that that I think Christian nationalism is a little bit confused about trying to be basically be the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["You","don't","get","that","anywhere","from","Jesus,","right?","Well,","you","get","that","a","little","bit","from","Israel,","which","I","think","is","one","of","the","reasons","that","that","I","think","Christian","nationalism","is","a","little","bit","confused","about","trying","to","be","basically","be","the"],
                "audioStart": 202.56,
                "audioEnd": 214
            },
            {
                "id": 24,
                "english": "nation of Israel today. It's like it's a little complicated, but let's just talk about Jesus and the imagery there of Trump with literally a a broken ear shouting fight.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["nation","of","Israel","today.","It's","like","it's","a","little","complicated,","but","let's","just","talk","about","Jesus","and","the","imagery","there","of","Trump","with","literally","a","a","broken","ear","shouting","fight."],
                "audioStart": 214,
                "audioEnd": 222.72
            },
            {
                "id": 25,
                "english": "Yeah, exactly. Exactly. [laughter] Quite stark contrast, right? But it gets I think it gets even more explicit. So this is the famous passage where the Pharisees try to trap Jesus in the question about taxes.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Yeah,","exactly.","Exactly.","[laughter]","Quite","stark","contrast,","right?","But","it","gets","I","think","it","gets","even","more","explicit.","So","this","is","the","famous","passage","where","the","Pharisees","try","to","trap","Jesus","in","the","question","about","taxes."],
                "audioStart": 222.72,
                "audioEnd": 238.08
            },
            {
                "id": 26,
                "english": "Um so uh they had been giving him a number of different challenges to to catch him, right? And so uh we we'll just kind of cover this because I can remember the details. So you know they had this the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Um","so","uh","they","had","been","giving","him","a","number","of","different","challenges","to","to","catch","him,","right?","And","so","uh","we","we'll","just","kind","of","cover","this","because","I","can","remember","the","details.","So","you","know","they","had","this","the"],
                "audioStart": 238.08,
                "audioEnd": 253.04
            },
            {
                "id": 27,
                "english": "Pharisees have this idea to come and ask Jesus if they should pay taxes to Caesar. And the reason that they thought that this was a trap is because if he's supposed to be the Messiah, at least as they understand it, he's supposed to be",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Pharisees","have","this","idea","to","come","and","ask","Jesus","if","they","should","pay","taxes","to","Caesar.","And","the","reason","that","they","thought","that","this","was","a","trap","is","because","if","he's","supposed","to","be","the","Messiah,","at","least","as","they","understand","it,","he's","supposed","to","be"],
                "audioStart": 253.04,
                "audioEnd": 263.6
            },
            {
                "id": 28,
                "english": "the one delivering them from this Roman rule. So if he's like saying, \"Yeah, we should give money to our oppressors,\" not a very good Messiah according to their perspective. And if he says, \"Yeah, no, we shouldn't pay taxes.\" Then",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","one","delivering","them","from","this","Roman","rule.","So","if","he's","like","saying,","\"Yeah,","we","should","give","money","to","our","oppressors,\"","not","a","very","good","Messiah","according","to","their","perspective.","And","if","he","says,","\"Yeah,","no,","we","shouldn't","pay","taxes.\"","Then"],
                "audioStart": 263.6,
                "audioEnd": 276.8
            },
            {
                "id": 29,
                "english": "then they report him and get him delivered to the Romans.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["then","they","report","him","and","get","him","delivered","to","the","Romans."],
                "audioStart": 276.8,
                "audioEnd": 279.6
            },
            {
                "id": 30,
                "english": "Right? So this was like a nice setup.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Right?","So","this","was","like","a","nice","setup."],
                "audioStart": 279.6,
                "audioEnd": 281.84
            },
            {
                "id": 31,
                "english": "And when they do this, they say, \"Should we pay taxes?\" to Caesar. He's like, \"Grab me a daenerius. Grab me a coin.\"",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","when","they","do","this,","they","say,","\"Should","we","pay","taxes?\"","to","Caesar.","He's","like,","\"Grab","me","a","daenerius.","Grab","me","a","coin.\""],
                "audioStart": 281.84,
                "audioEnd": 290.639
            },
            {
                "id": 32,
                "english": "And then he takes it and he says, \"Who is this on the coin?\" And they say, \"Caesar.\" And he says, \"Render to Caesar what is Caesars's and to God what is God's.\" Why is this so important? And why is this so relevant to the current",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","then","he","takes","it","and","he","says,","\"Who","is","this","on","the","coin?\"","And","they","say,","\"Caesar.\"","And","he","says,","\"Render","to","Caesar","what","is","Caesars's","and","to","God","what","is","God's.\"","Why","is","this","so","important?","And","why","is","this","so","relevant","to","the","current"],
                "audioStart": 290.639,
                "audioEnd": 302.479
            },
            {
                "id": 33,
                "english": "situation? Notice he didn't say anything like, \"See this coin?",
                "phonetic": "",
                "vietnamese": "",
                "words": ["situation?","Notice","he","didn't","say","anything","like,","\"See","this","coin?"],
                "audioStart": 302.479,
                "audioEnd": 308.96
            },
            {
                "id": 34,
                "english": "It should say in Yahweh we trust on it.\"",
                "phonetic": "",
                "vietnamese": "",
                "words": ["It","should","say","in","Yahweh","we","trust","on","it.\""],
                "audioStart": 308.96,
                "audioEnd": 311.36
            },
            {
                "id": 35,
                "english": "M that's the battle that we should be fighting. We should be fighting to get the kingdom that is oppressing us or the kingdom of this world to represent God. He's basically saying this is",
                "phonetic": "",
                "vietnamese": "",
                "words": ["M","that's","the","battle","that","we","should","be","fighting.","We","should","be","fighting","to","get","the","kingdom","that","is","oppressing","us","or","the","kingdom","of","this","world","to","represent","God.","He's","basically","saying","this","is"],
                "audioStart": 311.36,
                "audioEnd": 324.08
            },
            {
                "id": 36,
                "english": "irrelevant to my mission. Yeah. Pay taxes to Caesar. That's a completely different thing. This embrace of political power and thinking that that is the answer. That's how we bring about the kingdom of God. It is a complete",
                "phonetic": "",
                "vietnamese": "",
                "words": ["irrelevant","to","my","mission.","Yeah.","Pay","taxes","to","Caesar.","That's","a","completely","different","thing.","This","embrace","of","political","power","and","thinking","that","that","is","the","answer.","That's","how","we","bring","about","the","kingdom","of","God.","It","is","a","complete"],
                "audioStart": 324.08,
                "audioEnd": 340.16
            },
            {
                "id": 37,
                "english": "misunderstanding of what Jesus was talking about.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["misunderstanding","of","what","Jesus","was","talking","about."],
                "audioStart": 340.16,
                "audioEnd": 343.44
            },
            {
                "id": 38,
                "english": "Um, and I do think it's wild because you the whole in you know you know the in God we trust on the American money like I that was it's a pretty recent innovation. I can't remember cold war thing.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Um,","and","I","do","think","it's","wild","because","you","the","whole","in","you","know","you","know","the","in","God","we","trust","on","the","American","money","like","I","that","was","it's","a","pretty","recent","innovation.","I","can't","remember","cold","war","thing."],
                "audioStart": 343.44,
                "audioEnd": 352.32
            },
            {
                "id": 39,
                "english": "Yeah. Yeah. I I I think I I can't remember exactly when it Oh, [laughter] look. That's water. [laughter] Yeah. All right. All right.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Yeah.","Yeah.","I","I","I","think","I","I","can't","remember","exactly","when","it","Oh,","[laughter]","look.","That's","water.","[laughter]","Yeah.","All","right.","All","right."],
                "audioStart": 352.32,
                "audioEnd": 362.639
            },
            {
                "id": 40,
                "english": "Right on to the Bible. You know, I only did that to make you feel welcome.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Right","on","to","the","Bible.","You","know,","I","only","did","that","to","make","you","feel","welcome."],
                "audioStart": 362.639,
                "audioEnd": 365.494
            },
            {
                "id": 41,
                "english": "[laughter] Okay, where were we?",
                "phonetic": "",
                "vietnamese": "",
                "words": ["[laughter]","Okay,","where","were","we?"],
                "audioStart": 365.494,
                "audioEnd": 369.44
            },
            {
                "id": 42,
                "english": "Everything's cleaned up. You know, my Bible's a little bit wet. No worse.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Everything's","cleaned","up.","You","know,","my","Bible's","a","little","bit","wet.","No","worse."],
                "audioStart": 369.44,
                "audioEnd": 374.96
            },
            {
                "id": 43,
                "english": "Okay.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Okay."],
                "audioStart": 374.96,
                "audioEnd": 375.52
            },
            {
                "id": 44,
                "english": "Holy holy water now on the table.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Holy","holy","water","now","on","the","table."],
                "audioStart": 375.52,
                "audioEnd": 377.6
            },
            {
                "id": 45,
                "english": "So, I think that this this last passage is the one that is the most um informative about this and you've talked about it a moment ago, the temptation of Jesus. And of course, he's out there in the the wilderness for",
                "phonetic": "",
                "vietnamese": "",
                "words": ["So,","I","think","that","this","this","last","passage","is","the","one","that","is","the","most","um","informative","about","this","and","you've","talked","about","it","a","moment","ago,","the","temptation","of","Jesus.","And","of","course,","he's","out","there","in","the","the","wilderness","for"],
                "audioStart": 377.6,
                "audioEnd": 391.919
            },
            {
                "id": 46,
                "english": "40 days.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["40","days."],
                "audioStart": 391.919,
                "audioEnd": 393.199
            },
            {
                "id": 47,
                "english": "And so, there's the three temptations from the devil. The first being, you know, eat some turns these stones into bread. Uh the next one being throw yourself off of this and the angels will save you. And then the third one being",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","so,","there's","the","three","temptations","from","the","devil.","The","first","being,","you","know,","eat","some","turns","these","stones","into","bread.","Uh","the","next","one","being","throw","yourself","off","of","this","and","the","angels","will","save","you.","And","then","the","third","one","being"],
                "audioStart": 393.199,
                "audioEnd": 405.199
            },
            {
                "id": 48,
                "english": "going up to the top of the mountain saying look at all the kingdoms of the world. I will give you all of this if you will just bow down and worship me.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["going","up","to","the","top","of","the","mountain","saying","look","at","all","the","kingdoms","of","the","world.","I","will","give","you","all","of","this","if","you","will","just","bow","down","and","worship","me."],
                "audioStart": 405.199,
                "audioEnd": 412.4
            },
            {
                "id": 49,
                "english": "And of course Jesus says be gone Satan.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","of","course","Jesus","says","be","gone","Satan."],
                "audioStart": 412.4,
                "audioEnd": 416.16
            },
            {
                "id": 50,
                "english": "You know listen what does it say exactly in the ESV? He says worship God and serve him alone.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["You","know","listen","what","does","it","say","exactly","in","the","ESV?","He","says","worship","God","and","serve","him","alone."],
                "audioStart": 416.16,
                "audioEnd": 422.16
            },
            {
                "id": 51,
                "english": "Yeah. Be gone, Satan, for it is written, you shall worship the Lord your God and serve, and only him so shall you serve.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Yeah.","Be","gone,","Satan,","for","it","is","written,","you","shall","worship","the","Lord","your","God","and","serve,","and","only","him","so","shall","you","serve."],
                "audioStart": 422.16,
                "audioEnd": 429.44
            },
            {
                "id": 52,
                "english": "Again, it's the And interestingly, it's not that's not actually written. There's no there Jesus is like slightly rewarding the passage he's trying the in in the Old Testament, the passage is something like um it's",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Again,","it's","the","And","interestingly,","it's","not","that's","not","actually","written.","There's","no","there","Jesus","is","like","slightly","rewarding","the","passage","he's","trying","the","in","in","the","Old","Testament,","the","passage","is","something","like","um","it's"],
                "audioStart": 429.44,
                "audioEnd": 440.88
            },
            {
                "id": 53,
                "english": "something like fear. I think it's fear God and serve him only or something like that. It doesn't use the word worship, which is obviously it's, you know, Greek and Hebrew, but he's not actually quoting it",
                "phonetic": "",
                "vietnamese": "",
                "words": ["something","like","fear.","I","think","it's","fear","God","and","serve","him","only","or","something","like","that.","It","doesn't","use","the","word","worship,","which","is","obviously","it's,","you","know,","Greek","and","Hebrew,","but","he's","not","actually","quoting","it"],
                "audioStart": 440.88,
                "audioEnd": 451.12
            },
            {
                "id": 54,
                "english": "quite correctly there, which is interesting. Um, yeah, it is.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["quite","correctly","there,","which","is","interesting.","Um,","yeah,","it","is."],
                "audioStart": 451.12,
                "audioEnd": 453.44
            },
            {
                "id": 55,
                "english": "Side note, footnote.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Side","note,","footnote."],
                "audioStart": 453.44,
                "audioEnd": 454.319
            },
            {
                "id": 56,
                "english": "Yeah, footnote.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Yeah,","footnote."],
                "audioStart": 454.319,
                "audioEnd": 454.88
            },
            {
                "id": 57,
                "english": "Continue.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Continue."],
                "audioStart": 454.88,
                "audioEnd": 455.599
            },
            {
                "id": 58,
                "english": "So, this to me, this is pretty wild considering the state of the current American church. M um because there's a lot going on here",
                "phonetic": "",
                "vietnamese": "",
                "words": ["So,","this","to","me,","this","is","pretty","wild","considering","the","state","of","the","current","American","church.","M","um","because","there's","a","lot","going","on","here"],
                "audioStart": 455.599,
                "audioEnd": 467.28
            },
            {
                "id": 59,
                "english": "theologically of course, but the one opportunity that Jesus has to make a commentary about embracing political power over the kingdom or the kingdoms of this world",
                "phonetic": "",
                "vietnamese": "",
                "words": ["theologically","of","course,","but","the","one","opportunity","that","Jesus","has","to","make","a","commentary","about","embracing","political","power","over","the","kingdom","or","the","kingdoms","of","this","world"],
                "audioStart": 467.28,
                "audioEnd": 483.919
            },
            {
                "id": 60,
                "english": "is presented as a temptation of Satan.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["is","presented","as","a","temptation","of","Satan."],
                "audioStart": 483.919,
                "audioEnd": 487.325
            },
            {
                "id": 61,
                "english": "[laughter] This is presented as a temptation of Satan to fall for this. We've got to be we've got to be in control of the the the kingdoms of the world. Does Jesus say, \"Well, okay, maybe you're in charge",
                "phonetic": "",
                "vietnamese": "",
                "words": ["[laughter]","This","is","presented","as","a","temptation","of","Satan","to","fall","for","this.","We've","got","to","be","we've","got","to","be","in","control","of","the","the","the","kingdoms","of","the","world.","Does","Jesus","say,","\"Well,","okay,","maybe","you're","in","charge"],
                "audioStart": 487.325,
                "audioEnd": 499.68
            },
            {
                "id": 62,
                "english": "right now, but you just wait until a few of my followers are are are in government, or you you wait until we're in charge.\" Again, he says, \"It's not about that. We are operating on a different plane.\" And it just blows my",
                "phonetic": "",
                "vietnamese": "",
                "words": ["right","now,","but","you","just","wait","until","a","few","of","my","followers","are","are","are","in","government,","or","you","you","wait","until","we're","in","charge.\"","Again,","he","says,","\"It's","not","about","that.","We","are","operating","on","a","different","plane.\"","And","it","just","blows","my"],
                "audioStart": 499.68,
                "audioEnd": 514.479
            },
            {
                "id": 63,
                "english": "mind that we've gotten to this place where this seems to be the way that the kingdom of God is going to be established is by infiltrating and taking over the government. And I'm not just saying that it's not a good idea",
                "phonetic": "",
                "vietnamese": "",
                "words": ["mind","that","we've","gotten","to","this","place","where","this","seems","to","be","the","way","that","the","kingdom","of","God","is","going","to","be","established","is","by","infiltrating","and","taking","over","the","government.","And","I'm","not","just","saying","that","it's","not","a","good","idea"],
                "audioStart": 514.479,
                "audioEnd": 526.959
            },
            {
                "id": 64,
                "english": "from a Christian perspective. I'm saying it is forbidden.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["from","a","Christian","perspective.","I'm","saying","it","is","forbidden."],
                "audioStart": 526.959,
                "audioEnd": 531.279
            },
            {
                "id": 65,
                "english": "I'm saying that it is explicitly called out as something that will take you away from actually doing the work of God.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["I'm","saying","that","it","is","explicitly","called","out","as","something","that","will","take","you","away","from","actually","doing","the","work","of","God."],
                "audioStart": 531.279,
                "audioEnd": 539.76
            },
            {
                "id": 66,
                "english": "And I think it's interesting. I think it's worth noting that the more that Christians have embraced this pursuit of political power, the more they have embraced political leadership that looks a lot less like Jesus and a lot more",
                "phonetic": "",
                "vietnamese": "",
                "words": ["And","I","think","it's","interesting.","I","think","it's","worth","noting","that","the","more","that","Christians","have","embraced","this","pursuit","of","political","power,","the","more","they","have","embraced","political","leadership","that","looks","a","lot","less","like","Jesus","and","a","lot","more"],
                "audioStart": 539.76,
                "audioEnd": 552.56
            },
            {
                "id": 67,
                "english": "like the devil himself.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["like","the","devil","himself."],
                "audioStart": 552.56,
                "audioEnd": 555.446
            },
            {
                "id": 68,
                "english": "[laughter] Is that not crazy?",
                "phonetic": "",
                "vietnamese": "",
                "words": ["[laughter]","Is","that","not","crazy?"],
                "audioStart": 555.446,
                "audioEnd": 557.279
            },
            {
                "id": 69,
                "english": "Yeah, I think it's I think it's true, but it's also it's also maybe it's a bit easy to say like you know that if you pursue political power, you begin sort of betray principles. And some people will listen to this and I think there",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Yeah,","I","think","it's","I","think","it's","true,","but","it's","also","it's","also","maybe","it's","a","bit","easy","to","say","like","you","know","that","if","you","pursue","political","power,","you","begin","sort","of","betray","principles.","And","some","people","will","listen","to","this","and","I","think","there"],
                "audioStart": 557.279,
                "audioEnd": 569.6
            },
            {
                "id": 70,
                "english": "are two things which people will say in response to this. One thing is they'll say okay but if you look at the Old Testament you know God is constantly installing literal political kings.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["are","two","things","which","people","will","say","in","response","to","this.","One","thing","is","they'll","say","okay","but","if","you","look","at","the","Old","Testament","you","know","God","is","constantly","installing","literal","political","kings."],
                "audioStart": 569.6,
                "audioEnd": 578.32
            },
            {
                "id": 71,
                "english": "There are at least some contexts in which God thought that it was necessary to have you know his his rulers on earth. I think I know what I would say in response to that. I wonder what you would say. And the second thing is then",
                "phonetic": "",
                "vietnamese": "",
                "words": ["There","are","at","least","some","contexts","in","which","God","thought","that","it","was","necessary","to","have","you","know","his","his","rulers","on","earth.","I","think","I","know","what","I","would","say","in","response","to","that.","I","wonder","what","you","would","say.","And","the","second","thing","is","then"],
                "audioStart": 578.32,
                "audioEnd": 590.32
            },
            {
                "id": 72,
                "english": "okay I'm a I'm a Christian. I'm sat at home. I'm listening to this. Don't clip that either. Um, and I would like to know what to do then because I care about what's happening in my country and I I want to vote for somebody who shares",
                "phonetic": "",
                "vietnamese": "",
                "words": ["okay","I'm","a","I'm","a","Christian.","I'm","sat","at","home.","I'm","listening","to","this.","Don't","clip","that","either.","Um,","and","I","would","like","to","know","what","to","do","then","because","I","care","about","what's","happening","in","my","country","and","I","I","want","to","vote","for","somebody","who","shares"],
                "audioStart": 590.32,
                "audioEnd": 604.16
            },
            {
                "id": 73,
                "english": "my values, but am I supposed to am I supposed to look at anybody who says I'm a Christian and I'm running on Christian motivations and say no no no I'm not going to vote for you because you know that can't be true. Whereas I feel like",
                "phonetic": "",
                "vietnamese": "",
                "words": ["my","values,","but","am","I","supposed","to","am","I","supposed","to","look","at","anybody","who","says","I'm","a","Christian","and","I'm","running","on","Christian","motivations","and","say","no","no","no","I'm","not","going","to","vote","for","you","because","you","know","that","can't","be","true.","Whereas","I","feel","like"],
                "audioStart": 604.16,
                "audioEnd": 615.36
            },
            {
                "id": 74,
                "english": "I want someone who's Christian to you know run my like what can they actually do?",
                "phonetic": "",
                "vietnamese": "",
                "words": ["I","want","someone","who's","Christian","to","you","know","run","my","like","what","can","they","actually","do?"],
                "audioStart": 615.36,
                "audioEnd": 620.72
            },
            {
                "id": 75,
                "english": "Those are good questions to to answer the first. I think that the kingdom of Israel of which was, you know, sort of preparing the way for the Messiah that he comes out of, that's a different thing. That's not America.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Those","are","good","questions","to","to","answer","the","first.","I","think","that","the","kingdom","of","Israel","of","which","was,","you","know,","sort","of","preparing","the","way","for","the","Messiah","that","he","comes","out","of,","that's","a","different","thing.","That's","not","America."],
                "audioStart": 620.72,
                "audioEnd": 632.32
            },
            {
                "id": 76,
                "english": "That's, you know, that that doesn't apply to these kingdoms. That's a that's a different thing. I I don't think there's a theological justification for applying principles of the way that God was establishing and upholding his",
                "phonetic": "",
                "vietnamese": "",
                "words": ["That's,","you","know,","that","that","doesn't","apply","to","these","kingdoms.","That's","a","that's","a","different","thing.","I","I","don't","think","there's","a","theological","justification","for","applying","principles","of","the","way","that","God","was","establishing","and","upholding","his"],
                "audioStart": 632.32,
                "audioEnd": 644.32
            },
            {
                "id": 77,
                "english": "nation for his people and then trying to apply that even to modern day Israel or definitely to any other kingdom. That just feels like that you can't you that dog won't hunt as they say.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["nation","for","his","people","and","then","trying","to","apply","that","even","to","modern","day","Israel","or","definitely","to","any","other","kingdom.","That","just","feels","like","that","you","can't","you","that","dog","won't","hunt","as","they","say."],
                "audioStart": 644.32,
                "audioEnd": 654.959
            },
            {
                "id": 78,
                "english": "To the extent that we can make sense of God having like a chosen people and a chosen nation, it seems like America despite what they think um might not be that. But even so, there is this please don't revoke my visa. The problem that",
                "phonetic": "",
                "vietnamese": "",
                "words": ["To","the","extent","that","we","can","make","sense","of","God","having","like","a","chosen","people","and","a","chosen","nation,","it","seems","like","America","despite","what","they","think","um","might","not","be","that.","But","even","so,","there","is","this","please","don't","revoke","my","visa.","The","problem","that"],
                "audioStart": 654.959,
                "audioEnd": 668.959
            },
            {
                "id": 79,
                "english": "the other thing is that like Jesus is presented as this fulfillment and sort of fulfillment of but also like in many ways like he sort of um removes the the need for certain kinds of Jewish practices. So like there's this idea",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","other","thing","is","that","like","Jesus","is","presented","as","this","fulfillment","and","sort","of","fulfillment","of","but","also","like","in","many","ways","like","he","sort","of","um","removes","the","the","need","for","certain","kinds","of","Jewish","practices.","So","like","there's","this","idea"],
                "audioStart": 668.959,
                "audioEnd": 685.36
            },
            {
                "id": 80,
                "english": "that Jesus is kind of like the new Jewish temple. You know it used to be that you worship in this particular place and this is where you meet God and now it's Jesus and Jesus is everywhere and anywhere. And a similar kind of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["that","Jesus","is","kind","of","like","the","new","Jewish","temple.","You","know","it","used","to","be","that","you","worship","in","this","particular","place","and","this","is","where","you","meet","God","and","now","it's","Jesus","and","Jesus","is","everywhere","and","anywhere.","And","a","similar","kind","of"],
                "audioStart": 685.36,
                "audioEnd": 695.76
            },
            {
                "id": 81,
                "english": "thing is happening here with like authority. I mean the the Jewish kingdom was waiting for the Messiah who would be you know their ultimate king and when the ultimate king comes he's not a political leader. He is the opposite of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["thing","is","happening","here","with","like","authority.","I","mean","the","the","Jewish","kingdom","was","waiting","for","the","Messiah","who","would","be","you","know","their","ultimate","king","and","when","the","ultimate","king","comes","he's","not","a","political","leader.","He","is","the","opposite","of"],
                "audioStart": 695.76,
                "audioEnd": 706.64
            },
            {
                "id": 82,
                "english": "political leader. So I think that the extent to which this is specifically a problem like if somebody's listening in other words and says okay yeah but you know Rhett doesn't understand that you know that in the Old Testament political",
                "phonetic": "",
                "vietnamese": "",
                "words": ["political","leader.","So","I","think","that","the","extent","to","which","this","is","specifically","a","problem","like","if","somebody's","listening","in","other","words","and","says","okay","yeah","but","you","know","Rhett","doesn't","understand","that","you","know","that","in","the","Old","Testament","political"],
                "audioStart": 706.64,
                "audioEnd": 716.64
            },
            {
                "id": 83,
                "english": "power was really important. This is just the problem of the relationship of the Old Testament to the New Testament.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["power","was","really","important.","This","is","just","the","problem","of","the","relationship","of","the","Old","Testament","to","the","New","Testament."],
                "audioStart": 716.64,
                "audioEnd": 721.44
            },
            {
                "id": 84,
                "english": "Yeah. Because I could say the same thing to a Christian like, well, if your Jesus is doing this or that or that or that, then what about in the Old Testament where God's commanding this that that or that or this thing you're supposed to do",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Yeah.","Because","I","could","say","the","same","thing","to","a","Christian","like,","well,","if","your","Jesus","is","doing","this","or","that","or","that","or","that,","then","what","about","in","the","Old","Testament","where","God's","commanding","this","that","that","or","that","or","this","thing","you're","supposed","to","do"],
                "audioStart": 721.44,
                "audioEnd": 730.24
            },
            {
                "id": 85,
                "english": "that you're no longer supposed to do or whatever. It's just the same problem um revisited. As long as a Christian is willing to say that, yeah, Jesus changed changed the nature of God's relationship with Earth.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["that","you're","no","longer","supposed","to","do","or","whatever.","It's","just","the","same","problem","um","revisited.","As","long","as","a","Christian","is","willing","to","say","that,","yeah,","Jesus","changed","changed","the","nature","of","God's","relationship","with","Earth."],
                "audioStart": 730.24,
                "audioEnd": 739.12
            },
            {
                "id": 86,
                "english": "Exactly.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Exactly."],
                "audioStart": 739.12,
                "audioEnd": 739.6
            },
            {
                "id": 87,
                "english": "The same things here. But okay, that's sort of out of the way.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["The","same","things","here.","But","okay,","that's","sort","of","out","of","the","way."],
                "audioStart": 739.6,
                "audioEnd": 742.24
            },
            {
                "id": 88,
                "english": "So, what does a Christian do?",
                "phonetic": "",
                "vietnamese": "",
                "words": ["So,","what","does","a","Christian","do?"],
                "audioStart": 742.24,
                "audioEnd": 743.2
            },
            {
                "id": 89,
                "english": "What does a Christian do?",
                "phonetic": "",
                "vietnamese": "",
                "words": ["What","does","a","Christian","do?"],
                "audioStart": 743.2,
                "audioEnd": 744.56
            },
            {
                "id": 90,
                "english": "So, I think this is a I think it's a great question. uh because I would say the extreme application of this perspective is abstaining from political involvement at all and there are denominations that do that.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["So,","I","think","this","is","a","I","think","it's","a","great","question.","uh","because","I","would","say","the","extreme","application","of","this","perspective","is","abstaining","from","political","involvement","at","all","and","there","are","denominations","that","do","that."],
                "audioStart": 744.56,
                "audioEnd": 760.8
            },
            {
                "id": 91,
                "english": "Um and you have to respect that. Um this is a bit of again there's so many layers of this. There's a bit of a conundrum considering that I don't think that any of the people who were reading this at the time thought that in the year 2025",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Um","and","you","have","to","respect","that.","Um","this","is","a","bit","of","again","there's","so","many","layers","of","this.","There's","a","bit","of","a","conundrum","considering","that","I","don't","think","that","any","of","the","people","who","were","reading","this","at","the","time","thought","that","in","the","year","2025"],
                "audioStart": 760.8,
                "audioEnd": 775.839
            },
            {
                "id": 92,
                "english": "the world would still be around.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","world","would","still","be","around."],
                "audioStart": 775.839,
                "audioEnd": 777.839
            },
            {
                "id": 93,
                "english": "That's right. Uh, so I don't think that they envision 2,000 years of more kingdoms in in in what we have here. So we find ourselves in a situation that maybe some of this philosophy doesn't specifically apply because, you know,",
                "phonetic": "",
                "vietnamese": "",
                "words": ["That's","right.","Uh,","so","I","don't","think","that","they","envision","2,000","years","of","more","kingdoms","in","in","in","what","we","have","here.","So","we","find","ourselves","in","a","situation","that","maybe","some","of","this","philosophy","doesn't","specifically","apply","because,","you","know,"],
                "audioStart": 777.839,
                "audioEnd": 790.079
            },
            {
                "id": 94,
                "english": "they were selling all their stuff not because they were communist but because they thought Yeah. Right.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["they","were","selling","all","their","stuff","not","because","they","were","communist","but","because","they","thought","Yeah.","Right."],
                "audioStart": 790.079,
                "audioEnd": 794.8
            },
            {
                "id": 95,
                "english": "Yeah.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Yeah."],
                "audioStart": 794.8,
                "audioEnd": 795.76
            },
            {
                "id": 96,
                "english": "um it becomes a bit easier to say like who cares about the government whatever that the world is about to end which makes it a bit complicated because for a Christian they kind of have to interpret this not them not believing the world is",
                "phonetic": "",
                "vietnamese": "",
                "words": ["um","it","becomes","a","bit","easier","to","say","like","who","cares","about","the","government","whatever","that","the","world","is","about","to","end","which","makes","it","a","bit","complicated","because","for","a","Christian","they","kind","of","have","to","interpret","this","not","them","not","believing","the","world","is"],
                "audioStart": 795.76,
                "audioEnd": 809.92
            },
            {
                "id": 97,
                "english": "about to end because again so that so I'm going with that I'm trying I'm just saying be I believe that they thought that Jesus was coming back yeah and he didn't but as a Christian you do you believe",
                "phonetic": "",
                "vietnamese": "",
                "words": ["about","to","end","because","again","so","that","so","I'm","going","with","that","I'm","trying","I'm","just","saying","be","I","believe","that","they","thought","that","Jesus","was","coming","back","yeah","and","he","didn't","but","as","a","Christian","you","do","you","believe"],
                "audioStart": 809.92,
                "audioEnd": 821.519
            },
            {
                "id": 98,
                "english": "that he that he wasn't intending that and that he knew that the world will still still be around in 2025. What I'm saying is that it is a temptation because you start believing that the only way to get what God wants is for",
                "phonetic": "",
                "vietnamese": "",
                "words": ["that","he","that","he","wasn't","intending","that","and","that","he","knew","that","the","world","will","still","still","be","around","in","2025.","What","I'm","saying","is","that","it","is","a","temptation","because","you","start","believing","that","the","only","way","to","get","what","God","wants","is","for"],
                "audioStart": 821.519,
                "audioEnd": 837.04
            },
            {
                "id": 99,
                "english": "you to do it for him through human means. And I think that ultimately when you feel like the people in power politically have to represent your worldview, it indicates that you're fearful that if that wasn't the case",
                "phonetic": "",
                "vietnamese": "",
                "words": ["you","to","do","it","for","him","through","human","means.","And","I","think","that","ultimately","when","you","feel","like","the","people","in","power","politically","have","to","represent","your","worldview,","it","indicates","that","you're","fearful","that","if","that","wasn't","the","case"],
                "audioStart": 837.04,
                "audioEnd": 850.639
            },
            {
                "id": 100,
                "english": "that God couldn't do what he needed to do. And so I think this is this is a higher calling to a level of spirit sp spirituality and commitment to the kingdom that does I think that if you follow this",
                "phonetic": "",
                "vietnamese": "",
                "words": ["that","God","couldn't","do","what","he","needed","to","do.","And","so","I","think","this","is","this","is","a","higher","calling","to","a","level","of","spirit","sp","spirituality","and","commitment","to","the","kingdom","that","does","I","think","that","if","you","follow","this"],
                "audioStart": 850.639,
                "audioEnd": 864.8
            },
            {
                "id": 101,
                "english": "wholeheartedly I think it means that I'm not saying you don't vote but I think that the idea that the answer is to install Christians into political office and that's where your hope lies and to work very",
                "phonetic": "",
                "vietnamese": "",
                "words": ["wholeheartedly","I","think","it","means","that","I'm","not","saying","you","don't","vote","but","I","think","that","the","idea","that","the","answer","is","to","install","Christians","into","political","office","and","that's","where","your","hope","lies","and","to","work","very"],
                "audioStart": 864.8,
                "audioEnd": 877.279
            },
            {
                "id": 102,
                "english": "tirelessly for that that's just it's not biblical and I think ultimately I don't think you can hold on to political power and Jesus at the same time. I think that if you're gonna hold on to Jesus and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["tirelessly","for","that","that's","just","it's","not","biblical","and","I","think","ultimately","I","don't","think","you","can","hold","on","to","political","power","and","Jesus","at","the","same","time.","I","think","that","if","you're","gonna","hold","on","to","Jesus","and"],
                "audioStart": 877.279,
                "audioEnd": 890.639
            },
            {
                "id": 103,
                "english": "you're holding on to to this world, you've kind of got to drop that pursuit in the same way. And the crazy thing that happens as a result of this is you end up align like I said, you end up aligning yourselves with people who do",
                "phonetic": "",
                "vietnamese": "",
                "words": ["you're","holding","on","to","to","this","world,","you've","kind","of","got","to","drop","that","pursuit","in","the","same","way.","And","the","crazy","thing","that","happens","as","a","result","of","this","is","you","end","up","align","like","I","said,","you","end","up","aligning","yourselves","with","people","who","do"],
                "audioStart": 890.639,
                "audioEnd": 901.44
            },
            {
                "id": 104,
                "english": "not represent um you know this the the the fruit of the spirit that you've got people who are living in fear. I think this is another aspect of this is that so much of the current political pursuit",
                "phonetic": "",
                "vietnamese": "",
                "words": ["not","represent","um","you","know","this","the","the","the","fruit","of","the","spirit","that","you've","got","people","who","are","living","in","fear.","I","think","this","is","another","aspect","of","this","is","that","so","much","of","the","current","political","pursuit"],
                "audioStart": 901.44,
                "audioEnd": 915.199
            },
            {
                "id": 105,
                "english": "pursuit of political power is based in fear. You've got people all across the United States mainlining Fox News and the like every single night. Like, give it to me. Give me that stuff that makes me fearful every single night. I got to",
                "phonetic": "",
                "vietnamese": "",
                "words": ["pursuit","of","political","power","is","based","in","fear.","You've","got","people","all","across","the","United","States","mainlining","Fox","News","and","the","like","every","single","night.","Like,","give","it","to","me.","Give","me","that","stuff","that","makes","me","fearful","every","single","night.","I","got","to"],
                "audioStart": 915.199,
                "audioEnd": 928.399
            },
            {
                "id": 106,
                "english": "be afraid of the brown people who are going to take my jobs. Or, you know, I got to be afraid of the people who are going to come take my guns. I got to be afraid of the trans woman who might come into my daughter's restroom. Right? And",
                "phonetic": "",
                "vietnamese": "",
                "words": ["be","afraid","of","the","brown","people","who","are","going","to","take","my","jobs.","Or,","you","know,","I","got","to","be","afraid","of","the","people","who","are","going","to","come","take","my","guns.","I","got","to","be","afraid","of","the","trans","woman","who","might","come","into","my","daughter's","restroom.","Right?","And"],
                "audioStart": 928.399,
                "audioEnd": 940
            },
            {
                "id": 107,
                "english": "and so frankly, that whole thing pisses me off because I feel like an entire generation has been stolen from us because you have what could be older, wiser people who have perspective, but yet they have been completely captivated",
                "phonetic": "",
                "vietnamese": "",
                "words": ["and","so","frankly,","that","whole","thing","pisses","me","off","because","I","feel","like","an","entire","generation","has","been","stolen","from","us","because","you","have","what","could","be","older,","wiser","people","who","have","perspective,","but","yet","they","have","been","completely","captivated"],
                "audioStart": 940,
                "audioEnd": 954.72
            },
            {
                "id": 108,
                "english": "by fear and they tap into it every single night. Like that pisses me off that a generation has been stolen from us. But what if I I just this is a hypothetical. What if Christians in America were not mostly known for",
                "phonetic": "",
                "vietnamese": "",
                "words": ["by","fear","and","they","tap","into","it","every","single","night.","Like","that","pisses","me","off","that","a","generation","has","been","stolen","from","us.","But","what","if","I","I","just","this","is","a","hypothetical.","What","if","Christians","in","America","were","not","mostly","known","for"],
                "audioStart": 954.72,
                "audioEnd": 969.199
            },
            {
                "id": 109,
                "english": "wanting to have political power and all of the things that come along with that and all the fear that that is based in and instead they had they were cool, calm, and collected because they trusted that God was accomplishing his purpose",
                "phonetic": "",
                "vietnamese": "",
                "words": ["wanting","to","have","political","power","and","all","of","the","things","that","come","along","with","that","and","all","the","fear","that","that","is","based","in","and","instead","they","had","they","were","cool,","calm,","and","collected","because","they","trusted","that","God","was","accomplishing","his","purpose"],
                "audioStart": 969.199,
                "audioEnd": 981.12
            },
            {
                "id": 110,
                "english": "and they were busying themselves with the work of Jesus being the hands and feet of Jesus. Feeding the poor, caring for the orphan, caring for the elderly, caring for the widow.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["and","they","were","busying","themselves","with","the","work","of","Jesus","being","the","hands","and","feet","of","Jesus.","Feeding","the","poor,","caring","for","the","orphan,","caring","for","the","elderly,","caring","for","the","widow."],
                "audioStart": 981.12,
                "audioEnd": 992.24
            },
            {
                "id": 111,
                "english": "It seems to me that they don't believe that that would actually do anything.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["It","seems","to","me","that","they","don't","believe","that","that","would","actually","do","anything."],
                "audioStart": 992.24,
                "audioEnd": 997.36
            },
            {
                "id": 112,
                "english": "That that that level of spiritual commitment to being like, I'm going to be about the kingdom and I'm going to trust that God will accomplish his accomplish his will through me in that.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["That","that","that","level","of","spiritual","commitment","to","being","like,","I'm","going","to","be","about","the","kingdom","and","I'm","going","to","trust","that","God","will","accomplish","his","accomplish","his","will","through","me","in","that."],
                "audioStart": 997.36,
                "audioEnd": 1007.759
            },
            {
                "id": 113,
                "english": "I just think it's a lack of faith. I think it kind of goes back, we come full circle is that there's not a real faith that God can accomplish his purpose apart from you putting the Ten Commandments up in every courthouse.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["I","just","think","it's","a","lack","of","faith.","I","think","it","kind","of","goes","back,","we","come","full","circle","is","that","there's","not","a","real","faith","that","God","can","accomplish","his","purpose","apart","from","you","putting","the","Ten","Commandments","up","in","every","courthouse."],
                "audioStart": 1007.759,
                "audioEnd": 1019.04
            },
            {
                "id": 114,
                "english": "Really? Like you really think that that's what's going to do it? Yeah. If you're anything like me, then getting the right kind of food in your diet can be a bit of a challenge. And in times that I've been struggling to get all of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Really?","Like","you","really","think","that","that's","what's","going","to","do","it?","Yeah.","If","you're","anything","like","me,","then","getting","the","right","kind","of","food","in","your","diet","can","be","a","bit","of","a","challenge.","And","in","times","that","I've","been","struggling","to","get","all","of"],
                "audioStart": 1019.04,
                "audioEnd": 1029.839
            },
            {
                "id": 115,
                "english": "the vitamins and minerals that I need, it's these guys, huh that have come to the rescue. This black edition is a complete meal. 400 calories, 35 g of vegan protein, 26 vitamins and minerals.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","vitamins","and","minerals","that","I","need,","it's","these","guys,","huh","that","have","come","to","the","rescue.","This","black","edition","is","a","complete","meal.","400","calories,","35","g","of","vegan","protein,","26","vitamins","and","minerals."],
                "audioStart": 1029.839,
                "audioEnd": 1042.24
            },
            {
                "id": 116,
                "english": "It's high protein, low sugar, and low cost, all while saving your time as well. I like this prepackaged edition.",
                "phonetic": "",
                "vietnamese": "",
                "words": ["It's","high","protein,","low","sugar,","and","low","cost,","all","while","saving","your","time","as","well.","I","like","this","prepackaged","edition."],
                "audioStart": 1042.24,
                "audioEnd": 1048.64
            },
            {
                "id": 117,
                "english": "This is the chocolate flavor, but it also comes in chocolate, peanut butter, salted caramel, iced latte, all kinds of different flavors. So, just go to hule.com/alexoc okconor. And if you use the code Alex",
                "phonetic": "",
                "vietnamese": "",
                "words": ["This","is","the","chocolate","flavor,","but","it","also","comes","in","chocolate,","peanut","butter,","salted","caramel,","iced","latte,","all","kinds","of","different","flavors.","So,","just","go","to","hule.com/alexoc","okconor.","And","if","you","use","the","code","Alex"],
                "audioStart": 1048.64,
                "audioEnd": 1060.88
            },
            {
                "id": 118,
                "english": "Okconor at checkout as a new customer, you'll also get 15% off complete nutrition while saving your time and your",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Okconor","at","checkout","as","a","new","customer,","you'll","also","get","15%","off","complete","nutrition","while","saving","your","time","and","your"],
                "audioStart": 1060.88,
                "audioEnd": 1069.919
            }
        ]
    },
    {
        "id": "7",
        "title": "The Problem With Adam and Eve | Response to Ken Ham",
        "audioUrl": "",
        "youtubeVideoId": "j3EIx_ZQlc4",
        "image": "https://img.youtube.com/vi/j3EIx_ZQlc4/maxresdefault.jpg",
        "tags": ["YOUTUBE","Religion"],
        "duration": "16:38",
        "sentences": [
            {
                "id": 1,
                "english": "Ken Ham CEO of Answers in Genesis and creator of the world's only life-sized biblical Arc except for the real one of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Ken","Ham","CEO","of","Answers","in","Genesis","and","creator","of","the","world's","only","life-sized","biblical","Arc","except","for","the","real","one","of"],
                "audioStart": 0,
                "audioEnd": 7.68
            },
            {
                "id": 2,
                "english": "course apparently watched my recent YouTube video detailing some of the reasons why I don't believe in god let's",
                "phonetic": "",
                "vietnamese": "",
                "words": ["course","apparently","watched","my","recent","YouTube","video","detailing","some","of","the","reasons","why","I","don't","believe","in","god","let's"],
                "audioStart": 7.68,
                "audioEnd": 13.32
            },
            {
                "id": 3,
                "english": "take a look now we go into a different clip and this one by a person called Alex O'Connor",
                "phonetic": "",
                "vietnamese": "",
                "words": ["take","a","look","now","we","go","into","a","different","clip","and","this","one","by","a","person","called","Alex","O'Connor"],
                "audioStart": 13.32,
                "audioEnd": 18.6
            },
            {
                "id": 4,
                "english": "we're sometimes told that God has morally sufficient reason to allow suffering to exist indeed if God is good",
                "phonetic": "",
                "vietnamese": "",
                "words": ["we're","sometimes","told","that","God","has","morally","sufficient","reason","to","allow","suffering","to","exist","indeed","if","God","is","good"],
                "audioStart": 18.6,
                "audioEnd": 26.1
            },
            {
                "id": 5,
                "english": "then he must have such sufficient reason perhaps suffering is necessitated by human Free Will perhaps suffering helps",
                "phonetic": "",
                "vietnamese": "",
                "words": ["then","he","must","have","such","sufficient","reason","perhaps","suffering","is","necessitated","by","human","Free","Will","perhaps","suffering","helps"],
                "audioStart": 26.1,
                "audioEnd": 34.079
            },
            {
                "id": 6,
                "english": "to develop a person's moral character or maybe it's necessary to achieve some other end that God wishes to bring about",
                "phonetic": "",
                "vietnamese": "",
                "words": ["to","develop","a","person's","moral","character","or","maybe","it's","necessary","to","achieve","some","other","end","that","God","wishes","to","bring","about"],
                "audioStart": 34.079,
                "audioEnd": 39.719
            },
            {
                "id": 7,
                "english": "but intuitively there appear to be instances of suffering that cannot serve any such end I clip after clip after",
                "phonetic": "",
                "vietnamese": "",
                "words": ["but","intuitively","there","appear","to","be","instances","of","suffering","that","cannot","serve","any","such","end","I","clip","after","clip","after"],
                "audioStart": 39.719,
                "audioEnd": 47.82
            },
            {
                "id": 8,
                "english": "clip of people like this that I see talking about the deaf and suffering issue just don't get it that this is not",
                "phonetic": "",
                "vietnamese": "",
                "words": ["clip","of","people","like","this","that","I","see","talking","about","the","deaf","and","suffering","issue","just","don't","get","it","that","this","is","not"],
                "audioStart": 47.82,
                "audioEnd": 55.62
            },
            {
                "id": 9,
                "english": "the world as God made it this world is suffering from our sin and God judged this he's a holy God and he judges with",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","world","as","God","made","it","this","world","is","suffering","from","our","sin","and","God","judged","this","he's","a","holy","God","and","he","judges","with"],
                "audioStart": 55.62,
                "audioEnd": 63.899
            },
            {
                "id": 10,
                "english": "death in fact we don't even deserve to exist I mean we deserve nothing because we and Adam sinned against a holy God is",
                "phonetic": "",
                "vietnamese": "",
                "words": ["death","in","fact","we","don't","even","deserve","to","exist","I","mean","we","deserve","nothing","because","we","and","Adam","sinned","against","a","holy","God","is"],
                "audioStart": 63.899,
                "audioEnd": 71.76
            },
            {
                "id": 11,
                "english": "this not the world as God made it remember Ken Ham believes that the story of Genesis is a literal account of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["this","not","the","world","as","God","made","it","remember","Ken","Ham","believes","that","the","story","of","Genesis","is","a","literal","account","of"],
                "audioStart": 71.76,
                "audioEnd": 78
            },
            {
                "id": 12,
                "english": "actual his historical events is God not responsible for creating the serpent that tempted Eve causing sin to",
                "phonetic": "",
                "vietnamese": "",
                "words": ["actual","his","historical","events","is","God","not","responsible","for","creating","the","serpent","that","tempted","Eve","causing","sin","to"],
                "audioStart": 78,
                "audioEnd": 84.84
            },
            {
                "id": 13,
                "english": "supposedly enter the world that's not to absolve her of moral responsibility for violating God's commandment not to eat",
                "phonetic": "",
                "vietnamese": "",
                "words": ["supposedly","enter","the","world","that's","not","to","absolve","her","of","moral","responsibility","for","violating","God's","commandment","not","to","eat"],
                "audioStart": 84.84,
                "audioEnd": 91.14
            },
            {
                "id": 14,
                "english": "of the tree but think about it Ken is responding here to the problem of evil and suffering by saying that the world",
                "phonetic": "",
                "vietnamese": "",
                "words": ["of","the","tree","but","think","about","it","Ken","is","responding","here","to","the","problem","of","evil","and","suffering","by","saying","that","the","world"],
                "audioStart": 91.14,
                "audioEnd": 97.979
            },
            {
                "id": 15,
                "english": "is not as God made it so surely he means one of two things he might mean that the world as God created it contained no",
                "phonetic": "",
                "vietnamese": "",
                "words": ["is","not","as","God","made","it","so","surely","he","means","one","of","two","things","he","might","mean","that","the","world","as","God","created","it","contained","no"],
                "audioStart": 97.979,
                "audioEnd": 105.18
            },
            {
                "id": 16,
                "english": "evil or he may mean that it contained no suffering that these things only pervade the world because of Adam and Eve's sin",
                "phonetic": "",
                "vietnamese": "",
                "words": ["evil","or","he","may","mean","that","it","contained","no","suffering","that","these","things","only","pervade","the","world","because","of","Adam","and","Eve's","sin"],
                "audioStart": 105.18,
                "audioEnd": 112.14
            },
            {
                "id": 17,
                "english": "well if the world as God made it contained no evil then how did it contain within it an evil deceptive",
                "phonetic": "",
                "vietnamese": "",
                "words": ["well","if","the","world","as","God","made","it","contained","no","evil","then","how","did","it","contain","within","it","an","evil","deceptive"],
                "audioStart": 112.14,
                "audioEnd": 118.799
            },
            {
                "id": 18,
                "english": "serpent it seems to me like evil did exist in the Garden of Eden before any man ever sinned indeed it must have",
                "phonetic": "",
                "vietnamese": "",
                "words": ["serpent","it","seems","to","me","like","evil","did","exist","in","the","Garden","of","Eden","before","any","man","ever","sinned","indeed","it","must","have"],
                "audioStart": 118.799,
                "audioEnd": 126
            },
            {
                "id": 19,
                "english": "because otherwise there would have been no evil to tempt Eve and thus no fool perhaps then Ken means that before the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["because","otherwise","there","would","have","been","no","evil","to","tempt","Eve","and","thus","no","fool","perhaps","then","Ken","means","that","before","the"],
                "audioStart": 126,
                "audioEnd": 132.599
            },
            {
                "id": 20,
                "english": "fool there was no suffering but this doesn't seem right either we have an indication in Genesis that suffering did",
                "phonetic": "",
                "vietnamese": "",
                "words": ["fool","there","was","no","suffering","but","this","doesn't","seem","right","either","we","have","an","indication","in","Genesis","that","suffering","did"],
                "audioStart": 132.599,
                "audioEnd": 139.44
            },
            {
                "id": 21,
                "english": "exist before the fall since when Eve does sin God punishes her saying I will greatly multiply your pain in",
                "phonetic": "",
                "vietnamese": "",
                "words": ["exist","before","the","fall","since","when","Eve","does","sin","God","punishes","her","saying","I","will","greatly","multiply","your","pain","in"],
                "audioStart": 139.44,
                "audioEnd": 147.42
            },
            {
                "id": 22,
                "english": "childbearing the Hebrew word here is usually translated as multiply meaning to increase implying that childbirth was",
                "phonetic": "",
                "vietnamese": "",
                "words": ["childbearing","the","Hebrew","word","here","is","usually","translated","as","multiply","meaning","to","increase","implying","that","childbirth","was"],
                "audioStart": 147.42,
                "audioEnd": 155.28
            },
            {
                "id": 23,
                "english": "already a somewhat painful experience even before Eve sinned so we can't explain the existence of suffering on",
                "phonetic": "",
                "vietnamese": "",
                "words": ["already","a","somewhat","painful","experience","even","before","Eve","sinned","so","we","can't","explain","the","existence","of","suffering","on"],
                "audioStart": 155.28,
                "audioEnd": 161.94
            },
            {
                "id": 24,
                "english": "account of man's sin either thus in responding to the problem of evil and suffering by saying remember this is not",
                "phonetic": "",
                "vietnamese": "",
                "words": ["account","of","man's","sin","either","thus","in","responding","to","the","problem","of","evil","and","suffering","by","saying","remember","this","is","not"],
                "audioStart": 161.94,
                "audioEnd": 168.599
            },
            {
                "id": 25,
                "english": "the world as God made it what can Ken Ham mean it appears that the world as God did make it contained both evil and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","world","as","God","made","it","what","can","Ken","Ham","mean","it","appears","that","the","world","as","God","did","make","it","contained","both","evil","and"],
                "audioStart": 168.599,
                "audioEnd": 176.16
            },
            {
                "id": 26,
                "english": "suffering before the fall of Man however Ken has subtly changed the language here I was talking in my speech about",
                "phonetic": "",
                "vietnamese": "",
                "words": ["suffering","before","the","fall","of","Man","however","Ken","has","subtly","changed","the","language","here","I","was","talking","in","my","speech","about"],
                "audioStart": 176.16,
                "audioEnd": 182.76
            },
            {
                "id": 27,
                "english": "suffering he's introduced the concept of death and God judged this he's a holy God and he judges with death now he may",
                "phonetic": "",
                "vietnamese": "",
                "words": ["suffering","he's","introduced","the","concept","of","death","and","God","judged","this","he's","a","holy","God","and","he","judges","with","death","now","he","may"],
                "audioStart": 182.76,
                "audioEnd": 190.98
            },
            {
                "id": 28,
                "english": "wish to say that it was death which entered the world through Adam's sin and that's fine but if that's what he means",
                "phonetic": "",
                "vietnamese": "",
                "words": ["wish","to","say","that","it","was","death","which","entered","the","world","through","Adam's","sin","and","that's","fine","but","if","that's","what","he","means"],
                "audioStart": 190.98,
                "audioEnd": 196.739
            },
            {
                "id": 29,
                "english": "then he's simply not responding to my arguments since I never mentioned death at best this would allow him to explain",
                "phonetic": "",
                "vietnamese": "",
                "words": ["then","he's","simply","not","responding","to","my","arguments","since","I","never","mentioned","death","at","best","this","would","allow","him","to","explain"],
                "audioStart": 196.739,
                "audioEnd": 202.92
            },
            {
                "id": 30,
                "english": "why humans are mortal but not why they suffer during their lives that's not to mention of course the suffering of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["why","humans","are","mortal","but","not","why","they","suffer","during","their","lives","that's","not","to","mention","of","course","the","suffering","of"],
                "audioStart": 202.92,
                "audioEnd": 209.58
            },
            {
                "id": 31,
                "english": "non-human animals plus God warns Adam in Genesis by saying but off the tree of the knowledge of Good and Evil you shall",
                "phonetic": "",
                "vietnamese": "",
                "words": ["non-human","animals","plus","God","warns","Adam","in","Genesis","by","saying","but","off","the","tree","of","the","knowledge","of","Good","and","Evil","you","shall"],
                "audioStart": 209.58,
                "audioEnd": 216.54
            },
            {
                "id": 32,
                "english": "not eat for in the day that you eat of it you shall die in the day that you eat of it",
                "phonetic": "",
                "vietnamese": "",
                "words": ["not","eat","for","in","the","day","that","you","eat","of","it","you","shall","die","in","the","day","that","you","eat","of","it"],
                "audioStart": 216.54,
                "audioEnd": 222.2
            },
            {
                "id": 33,
                "english": "interesting given that Adam is said in Genesis 5 to have lived for 930 years surely then death here can't mean",
                "phonetic": "",
                "vietnamese": "",
                "words": ["interesting","given","that","Adam","is","said","in","Genesis","5","to","have","lived","for","930","years","surely","then","death","here","can't","mean"],
                "audioStart": 222.2,
                "audioEnd": 231.36
            },
            {
                "id": 34,
                "english": "literal death or the same day can't mean literally the same day otherwise Adam would have literally died the same day",
                "phonetic": "",
                "vietnamese": "",
                "words": ["literal","death","or","the","same","day","can't","mean","literally","the","same","day","otherwise","Adam","would","have","literally","died","the","same","day"],
                "audioStart": 231.36,
                "audioEnd": 238.62
            },
            {
                "id": 35,
                "english": "that he sinned well that's easy maybe death here just means something like becoming mortal or spiritual death or",
                "phonetic": "",
                "vietnamese": "",
                "words": ["that","he","sinned","well","that's","easy","maybe","death","here","just","means","something","like","becoming","mortal","or","spiritual","death","or"],
                "audioStart": 238.62,
                "audioEnd": 244.92
            },
            {
                "id": 36,
                "english": "something like that strange though for kenham if a talking snake just has to be literal but death",
                "phonetic": "",
                "vietnamese": "",
                "words": ["something","like","that","strange","though","for","kenham","if","a","talking","snake","just","has","to","be","literal","but","death"],
                "audioStart": 244.92,
                "audioEnd": 252
            },
            {
                "id": 37,
                "english": "or the same day are not we don't even deserve to exist I mean we deserve nothing because we and Adam sinned",
                "phonetic": "",
                "vietnamese": "",
                "words": ["or","the","same","day","are","not","we","don't","even","deserve","to","exist","I","mean","we","deserve","nothing","because","we","and","Adam","sinned"],
                "audioStart": 252,
                "audioEnd": 259.38
            },
            {
                "id": 38,
                "english": "against a holy God but he allows us to exist and really when you look at this world that we live in this Fallen World",
                "phonetic": "",
                "vietnamese": "",
                "words": ["against","a","holy","God","but","he","allows","us","to","exist","and","really","when","you","look","at","this","world","that","we","live","in","this","Fallen","World"],
                "audioStart": 259.38,
                "audioEnd": 268.86
            },
            {
                "id": 39,
                "english": "it it's a reminder of how bad our sin is how how much we have rejected our creator he brought us into existence and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["it","it's","a","reminder","of","how","bad","our","sin","is","how","how","much","we","have","rejected","our","creator","he","brought","us","into","existence","and"],
                "audioStart": 268.86,
                "audioEnd": 276.96
            },
            {
                "id": 40,
                "english": "we rebelled against him so kenham is implying here that the reason for death and suffering in the world remember he's",
                "phonetic": "",
                "vietnamese": "",
                "words": ["we","rebelled","against","him","so","kenham","is","implying","here","that","the","reason","for","death","and","suffering","in","the","world","remember","he's"],
                "audioStart": 276.96,
                "audioEnd": 283.259
            },
            {
                "id": 41,
                "english": "responding to the problem of evil is because of man's sin principally through Adam and Eve the doctrine of original",
                "phonetic": "",
                "vietnamese": "",
                "words": ["responding","to","the","problem","of","evil","is","because","of","man's","sin","principally","through","Adam","and","Eve","the","doctrine","of","original"],
                "audioStart": 283.259,
                "audioEnd": 289.259
            },
            {
                "id": 42,
                "english": "sin usually contains some idea that human beings today inherit a sinful State something like a propensity",
                "phonetic": "",
                "vietnamese": "",
                "words": ["sin","usually","contains","some","idea","that","human","beings","today","inherit","a","sinful","State","something","like","a","propensity"],
                "audioStart": 289.259,
                "audioEnd": 296.04
            },
            {
                "id": 43,
                "english": "towards sinning from Adam and Eve because they committed a first original sin but how can sin have entered the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["towards","sinning","from","Adam","and","Eve","because","they","committed","a","first","original","sin","but","how","can","sin","have","entered","the"],
                "audioStart": 296.04,
                "audioEnd": 303.18
            },
            {
                "id": 44,
                "english": "world through sin if before the fool humans didn't have a proneness to sin then how can Eve before the Fall have",
                "phonetic": "",
                "vietnamese": "",
                "words": ["world","through","sin","if","before","the","fool","humans","didn't","have","a","proneness","to","sin","then","how","can","Eve","before","the","Fall","have"],
                "audioStart": 303.18,
                "audioEnd": 312.6
            },
            {
                "id": 45,
                "english": "been so prone to sinning that she did so after a single conversation with the serpent it seems like it wasn't Adam and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["been","so","prone","to","sinning","that","she","did","so","after","a","single","conversation","with","the","serpent","it","seems","like","it","wasn't","Adam","and"],
                "audioStart": 312.6,
                "audioEnd": 319.74
            },
            {
                "id": 46,
                "english": "Eve who bestowed upon humans a tendency to sin but God himself since that tendency was already there before the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Eve","who","bestowed","upon","humans","a","tendency","to","sin","but","God","himself","since","that","tendency","was","already","there","before","the"],
                "audioStart": 319.74,
                "audioEnd": 327.18
            },
            {
                "id": 47,
                "english": "fool and indeed was responsible for the fool and so if not sin or a proneness towards sinning what exactly was",
                "phonetic": "",
                "vietnamese": "",
                "words": ["fool","and","indeed","was","responsible","for","the","fool","and","so","if","not","sin","or","a","proneness","towards","sinning","what","exactly","was"],
                "audioStart": 327.18,
                "audioEnd": 334.74
            },
            {
                "id": 48,
                "english": "inaugurated by Adam and Eve's eating of the fruit what is it that entered the world and was transmitted from them to",
                "phonetic": "",
                "vietnamese": "",
                "words": ["inaugurated","by","Adam","and","Eve's","eating","of","the","fruit","what","is","it","that","entered","the","world","and","was","transmitted","from","them","to"],
                "audioStart": 334.74,
                "audioEnd": 342
            },
            {
                "id": 49,
                "english": "us through this original sin suffering but it's implied that that was already there evil that was definitely",
                "phonetic": "",
                "vietnamese": "",
                "words": ["us","through","this","original","sin","suffering","but","it's","implied","that","that","was","already","there","evil","that","was","definitely"],
                "audioStart": 342,
                "audioEnd": 349.62
            },
            {
                "id": 50,
                "english": "already there in the serpent death or perhaps but then what has this got to do with the problem of suffering Augustine",
                "phonetic": "",
                "vietnamese": "",
                "words": ["already","there","in","the","serpent","death","or","perhaps","but","then","what","has","this","got","to","do","with","the","problem","of","suffering","Augustine"],
                "audioStart": 349.62,
                "audioEnd": 356.4
            },
            {
                "id": 51,
                "english": "thought that before the fool Adam and Eve had the choice to sin or not to sin but that after the fall humans no longer",
                "phonetic": "",
                "vietnamese": "",
                "words": ["thought","that","before","the","fool","Adam","and","Eve","had","the","choice","to","sin","or","not","to","sin","but","that","after","the","fall","humans","no","longer"],
                "audioStart": 356.4,
                "audioEnd": 364.08
            },
            {
                "id": 52,
                "english": "have the option not to sin and that it's this that was transmitted to us but this suggestion makes it seem even more",
                "phonetic": "",
                "vietnamese": "",
                "words": ["have","the","option","not","to","sin","and","that","it's","this","that","was","transmitted","to","us","but","this","suggestion","makes","it","seem","even","more"],
                "audioStart": 364.08,
                "audioEnd": 370.74
            },
            {
                "id": 53,
                "english": "grotesque to me to be punished on account of sin since we now have no choice but to do so and there are",
                "phonetic": "",
                "vietnamese": "",
                "words": ["grotesque","to","me","to","be","punished","on","account","of","sin","since","we","now","have","no","choice","but","to","do","so","and","there","are"],
                "audioStart": 370.74,
                "audioEnd": 376.139
            },
            {
                "id": 54,
                "english": "further problems let's look again at the full narrative Genesis tells us that God commands Adam not to eat of the tree of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["further","problems","let's","look","again","at","the","full","narrative","Genesis","tells","us","that","God","commands","Adam","not","to","eat","of","the","tree","of"],
                "audioStart": 376.139,
                "audioEnd": 383.759
            },
            {
                "id": 55,
                "english": "the knowledge of Good and Evil for if he does so then he will die the serpent then comes to Eve and says look he will",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","knowledge","of","Good","and","Evil","for","if","he","does","so","then","he","will","die","the","serpent","then","comes","to","Eve","and","says","look","he","will"],
                "audioStart": 383.759,
                "audioEnd": 390.66
            },
            {
                "id": 56,
                "english": "not die God just knows that if you eat it you'll be like him knowing good and evil then Eve sees that the fruit of the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["not","die","God","just","knows","that","if","you","eat","it","you'll","be","like","him","knowing","good","and","evil","then","Eve","sees","that","the","fruit","of","the"],
                "audioStart": 390.66,
                "audioEnd": 397.68
            },
            {
                "id": 57,
                "english": "tree looks nice and perfectly edible and so she takes a bite and then she gives some to Adam thus sin enters the world",
                "phonetic": "",
                "vietnamese": "",
                "words": ["tree","looks","nice","and","perfectly","edible","and","so","she","takes","a","bite","and","then","she","gives","some","to","Adam","thus","sin","enters","the","world"],
                "audioStart": 397.68,
                "audioEnd": 404.16
            },
            {
                "id": 58,
                "english": "or something oftentimes critics point out that it's unfair for us to be punished today for the sin of somebody",
                "phonetic": "",
                "vietnamese": "",
                "words": ["or","something","oftentimes","critics","point","out","that","it's","unfair","for","us","to","be","punished","today","for","the","sin","of","somebody"],
                "audioStart": 404.16,
                "audioEnd": 411.479
            },
            {
                "id": 59,
                "english": "else a long time ago the response is usually something like we're not guilty of Adam's specific sin but guilty of our",
                "phonetic": "",
                "vietnamese": "",
                "words": ["else","a","long","time","ago","the","response","is","usually","something","like","we're","not","guilty","of","Adam's","specific","sin","but","guilty","of","our"],
                "audioStart": 411.479,
                "audioEnd": 419.819
            },
            {
                "id": 60,
                "english": "own sins only we're judged for the sins that we commit it's just that we inherited a sinful nature from Adam and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["own","sins","only","we're","judged","for","the","sins","that","we","commit","it's","just","that","we","inherited","a","sinful","nature","from","Adam","and"],
                "audioStart": 419.819,
                "audioEnd": 426.36
            },
            {
                "id": 61,
                "english": "Eve this seems perfectly plausible indeed in Ezekiel 18 we find the words the one who sins is the one who will die",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Eve","this","seems","perfectly","plausible","indeed","in","Ezekiel","18","we","find","the","words","the","one","who","sins","is","the","one","who","will","die"],
                "audioStart": 426.36,
                "audioEnd": 433.44
            },
            {
                "id": 62,
                "english": "the child will not share the guilt of the parent nor will the parent share the guilt of the child but now consider what",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","child","will","not","share","the","guilt","of","the","parent","nor","will","the","parent","share","the","guilt","of","the","child","but","now","consider","what"],
                "audioStart": 433.44,
                "audioEnd": 440.22
            },
            {
                "id": 63,
                "english": "happens next in the Genesis narrative after the fruit is eaten what is God's response well he punishes the snake by",
                "phonetic": "",
                "vietnamese": "",
                "words": ["happens","next","in","the","Genesis","narrative","after","the","fruit","is","eaten","what","is","God's","response","well","he","punishes","the","snake","by"],
                "audioStart": 440.22,
                "audioEnd": 448.5
            },
            {
                "id": 64,
                "english": "forcing him and his descendants to crawl upon their belly and eat dust for all of their lives he punishes Eve by making",
                "phonetic": "",
                "vietnamese": "",
                "words": ["forcing","him","and","his","descendants","to","crawl","upon","their","belly","and","eat","dust","for","all","of","their","lives","he","punishes","Eve","by","making"],
                "audioStart": 448.5,
                "audioEnd": 456.24
            },
            {
                "id": 65,
                "english": "childbirth an extremely painful ordeal for her and her descendants and subjugates her to her husband he",
                "phonetic": "",
                "vietnamese": "",
                "words": ["childbirth","an","extremely","painful","ordeal","for","her","and","her","descendants","and","subjugates","her","to","her","husband","he"],
                "audioStart": 456.24,
                "audioEnd": 463.56
            },
            {
                "id": 66,
                "english": "punishes Adam by forcing him and his descendants to gloriously toil for the rest of their existence in order to eat",
                "phonetic": "",
                "vietnamese": "",
                "words": ["punishes","Adam","by","forcing","him","and","his","descendants","to","gloriously","toil","for","the","rest","of","their","existence","in","order","to","eat"],
                "audioStart": 463.56,
                "audioEnd": 471.06
            },
            {
                "id": 67,
                "english": "and live okay so the reason why childbirth is painful for women today is because Eve",
                "phonetic": "",
                "vietnamese": "",
                "words": ["and","live","okay","so","the","reason","why","childbirth","is","painful","for","women","today","is","because","Eve"],
                "audioStart": 471.06,
                "audioEnd": 477.36
            },
            {
                "id": 68,
                "english": "committed a sin thousands of years ago what does this mean it means that we are being punished now for a sin that we did",
                "phonetic": "",
                "vietnamese": "",
                "words": ["committed","a","sin","thousands","of","years","ago","what","does","this","mean","it","means","that","we","are","being","punished","now","for","a","sin","that","we","did"],
                "audioStart": 477.36,
                "audioEnd": 484.5
            },
            {
                "id": 69,
                "english": "not commit in other words even if we don't inherit the guilt of our parents we do seem to inherit the punishment for",
                "phonetic": "",
                "vietnamese": "",
                "words": ["not","commit","in","other","words","even","if","we","don't","inherit","the","guilt","of","our","parents","we","do","seem","to","inherit","the","punishment","for"],
                "audioStart": 484.5,
                "audioEnd": 491.46
            },
            {
                "id": 70,
                "english": "their crime a final problem is this Adam and Eve were told not to eat of the tree of the knowledge of Good and Evil",
                "phonetic": "",
                "vietnamese": "",
                "words": ["their","crime","a","final","problem","is","this","Adam","and","Eve","were","told","not","to","eat","of","the","tree","of","the","knowledge","of","Good","and","Evil"],
                "audioStart": 491.46,
                "audioEnd": 498.06
            },
            {
                "id": 71,
                "english": "presumably this means that before doing so they didn't have a knowledge of Good and Evil they were in a state of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["presumably","this","means","that","before","doing","so","they","didn't","have","a","knowledge","of","Good","and","Evil","they","were","in","a","state","of"],
                "audioStart": 498.06,
                "audioEnd": 504.78
            },
            {
                "id": 72,
                "english": "Innocence therefore when the serpent came to tempt Eve how could she have even possibly realized that any evil was",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Innocence","therefore","when","the","serpent","came","to","tempt","Eve","how","could","she","have","even","possibly","realized","that","any","evil","was"],
                "audioStart": 504.78,
                "audioEnd": 513.18
            },
            {
                "id": 73,
                "english": "at work if she hadn't eaten of the tree yet then her actions can't have been knowingly evil since she didn't have a",
                "phonetic": "",
                "vietnamese": "",
                "words": ["at","work","if","she","hadn't","eaten","of","the","tree","yet","then","her","actions","can't","have","been","knowingly","evil","since","she","didn't","have","a"],
                "audioStart": 513.18,
                "audioEnd": 519.959
            },
            {
                "id": 74,
                "english": "knowledge of Good and Evil yet thus we're not only being punished for a sin that we didn't commit we're being",
                "phonetic": "",
                "vietnamese": "",
                "words": ["knowledge","of","Good","and","Evil","yet","thus","we're","not","only","being","punished","for","a","sin","that","we","didn't","commit","we're","being"],
                "audioStart": 519.959,
                "audioEnd": 526.38
            },
            {
                "id": 75,
                "english": "punished for one which the person who did commit it didn't do so knowing it was wrong and was deceived into",
                "phonetic": "",
                "vietnamese": "",
                "words": ["punished","for","one","which","the","person","who","did","commit","it","didn't","do","so","knowing","it","was","wrong","and","was","deceived","into"],
                "audioStart": 526.38,
                "audioEnd": 532.8
            },
            {
                "id": 76,
                "english": "committing imagine you were renting a flat from a landlord and the landlord decides to shut off your water supply",
                "phonetic": "",
                "vietnamese": "",
                "words": ["committing","imagine","you","were","renting","a","flat","from","a","landlord","and","the","landlord","decides","to","shut","off","your","water","supply"],
                "audioStart": 532.8,
                "audioEnd": 538.5
            },
            {
                "id": 77,
                "english": "and your heating and installs a thousand locks making it a torturous task just to open the front door you ask him why are",
                "phonetic": "",
                "vietnamese": "",
                "words": ["and","your","heating","and","installs","a","thousand","locks","making","it","a","torturous","task","just","to","open","the","front","door","you","ask","him","why","are"],
                "audioStart": 538.5,
                "audioEnd": 546.48
            },
            {
                "id": 78,
                "english": "you making me suffer like this and he responds well don't you know that your great grandfather used to rent this very",
                "phonetic": "",
                "vietnamese": "",
                "words": ["you","making","me","suffer","like","this","and","he","responds","well","don't","you","know","that","your","great","grandfather","used","to","rent","this","very"],
                "audioStart": 546.48,
                "audioEnd": 552.48
            },
            {
                "id": 79,
                "english": "flat and he once committed an abominable evil against me I'm just administering the punishment but it's worse still",
                "phonetic": "",
                "vietnamese": "",
                "words": ["flat","and","he","once","committed","an","abominable","evil","against","me","I'm","just","administering","the","punishment","but","it's","worse","still"],
                "audioStart": 552.48,
                "audioEnd": 558.72
            },
            {
                "id": 80,
                "english": "imagine if this so-called abominable crime was something like this the landlord had told your grandfather Once",
                "phonetic": "",
                "vietnamese": "",
                "words": ["imagine","if","this","so-called","abominable","crime","was","something","like","this","the","landlord","had","told","your","grandfather","Once"],
                "audioStart": 558.72,
                "audioEnd": 565.56
            },
            {
                "id": 81,
                "english": "Upon a Time don't flick that one switch over there on the wall if you flick it it's going to electrocute you and you'll",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Upon","a","Time","don't","flick","that","one","switch","over","there","on","the","wall","if","you","flick","it","it's","going","to","electrocute","you","and","you'll"],
                "audioStart": 565.56,
                "audioEnd": 571.62
            },
            {
                "id": 82,
                "english": "die and then your grandfather's electrician friend comes over and says look your",
                "phonetic": "",
                "vietnamese": "",
                "words": ["die","and","then","your","grandfather's","electrician","friend","comes","over","and","says","look","your"],
                "audioStart": 571.62,
                "audioEnd": 576.6
            },
            {
                "id": 83,
                "english": "landlord doesn't know what he's talking about it's clearly not going to electrocute and kill you I mean the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["landlord","doesn't","know","what","he's","talking","about","it's","clearly","not","going","to","electrocute","and","kill","you","I","mean","the"],
                "audioStart": 576.6,
                "audioEnd": 580.86
            },
            {
                "id": 84,
                "english": "thing's made of plastic and so your grandfather looks at the switch and decides to flick it and guess what his",
                "phonetic": "",
                "vietnamese": "",
                "words": ["thing's","made","of","plastic","and","so","your","grandfather","looks","at","the","switch","and","decides","to","flick","it","and","guess","what","his"],
                "audioStart": 580.86,
                "audioEnd": 587.1
            },
            {
                "id": 85,
                "english": "electrician friend is right he didn't die still the landlord was so outraged that your grandfather flicked this",
                "phonetic": "",
                "vietnamese": "",
                "words": ["electrician","friend","is","right","he","didn't","die","still","the","landlord","was","so","outraged","that","your","grandfather","flicked","this"],
                "audioStart": 587.1,
                "audioEnd": 592.92
            },
            {
                "id": 86,
                "english": "switch that he's now punishing you a descendant for that crime and saying that it's your own fault because hey",
                "phonetic": "",
                "vietnamese": "",
                "words": ["switch","that","he's","now","punishing","you","a","descendant","for","that","crime","and","saying","that","it's","your","own","fault","because","hey"],
                "audioStart": 592.92,
                "audioEnd": 599.64
            },
            {
                "id": 87,
                "english": "it's your family that broke the rules and the worst part is that the electrician friend is right the landlord",
                "phonetic": "",
                "vietnamese": "",
                "words": ["it's","your","family","that","broke","the","rules","and","the","worst","part","is","that","the","electrician","friend","is","right","the","landlord"],
                "audioStart": 599.64,
                "audioEnd": 605.1
            },
            {
                "id": 88,
                "english": "was actually lying to you and you're still being punished I mean think about it God says to Adam that if he eats the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["was","actually","lying","to","you","and","you're","still","being","punished","I","mean","think","about","it","God","says","to","Adam","that","if","he","eats","the"],
                "audioStart": 605.1,
                "audioEnd": 611.94
            },
            {
                "id": 89,
                "english": "fruit of the tree of the knowledge of Good and Evil he will die that same day the serpent says to Eve you're not gonna",
                "phonetic": "",
                "vietnamese": "",
                "words": ["fruit","of","the","tree","of","the","knowledge","of","Good","and","Evil","he","will","die","that","same","day","the","serpent","says","to","Eve","you're","not","gonna"],
                "audioStart": 611.94,
                "audioEnd": 618.36
            },
            {
                "id": 90,
                "english": "die you're just going to become like God and they both eat of the fruit do they die",
                "phonetic": "",
                "vietnamese": "",
                "words": ["die","you're","just","going","to","become","like","God","and","they","both","eat","of","the","fruit","do","they","die"],
                "audioStart": 618.36,
                "audioEnd": 624.06
            },
            {
                "id": 91,
                "english": "no do they become like God as the serpent said that they will well let's ask God God himself says at the end of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["no","do","they","become","like","God","as","the","serpent","said","that","they","will","well","let's","ask","God","God","himself","says","at","the","end","of"],
                "audioStart": 624.06,
                "audioEnd": 631.74
            },
            {
                "id": 92,
                "english": "the Genesis narrative after they've eaten the fruit the man has now become like one of us knowing good and evil so",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","Genesis","narrative","after","they've","eaten","the","fruit","the","man","has","now","become","like","one","of","us","knowing","good","and","evil","so"],
                "audioStart": 631.74,
                "audioEnd": 638.519
            },
            {
                "id": 93,
                "english": "what God was lying and the serpent was telling the truth and we're now being punished because Adam and Eve took the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["what","God","was","lying","and","the","serpent","was","telling","the","truth","and","we're","now","being","punished","because","Adam","and","Eve","took","the"],
                "audioStart": 638.519,
                "audioEnd": 644.399
            },
            {
                "id": 94,
                "english": "right advice and that's to say nothing of the snake even the snakes of today non-rational animals crawling around are",
                "phonetic": "",
                "vietnamese": "",
                "words": ["right","advice","and","that's","to","say","nothing","of","the","snake","even","the","snakes","of","today","non-rational","animals","crawling","around","are"],
                "audioStart": 644.399,
                "audioEnd": 652.079
            },
            {
                "id": 95,
                "english": "crueling as what a punishment for the sin of some ancestral snake are we supposed to also think that the problem",
                "phonetic": "",
                "vietnamese": "",
                "words": ["crueling","as","what","a","punishment","for","the","sin","of","some","ancestral","snake","are","we","supposed","to","also","think","that","the","problem"],
                "audioStart": 652.079,
                "audioEnd": 658.86
            },
            {
                "id": 96,
                "english": "of animal suffering something that I cover in the speech that Ken is responding to but gets no mention from",
                "phonetic": "",
                "vietnamese": "",
                "words": ["of","animal","suffering","something","that","I","cover","in","the","speech","that","Ken","is","responding","to","but","gets","no","mention","from"],
                "audioStart": 658.86,
                "audioEnd": 664.26
            },
            {
                "id": 97,
                "english": "him here is somehow a result of even animals inheriting the punishments for the behaviors of their forebears now of",
                "phonetic": "",
                "vietnamese": "",
                "words": ["him","here","is","somehow","a","result","of","even","animals","inheriting","the","punishments","for","the","behaviors","of","their","forebears","now","of"],
                "audioStart": 664.26,
                "audioEnd": 670.92
            },
            {
                "id": 98,
                "english": "course a great deal almost all perhaps of the problems that I'm raising here can be solved by oh I don't know perhaps",
                "phonetic": "",
                "vietnamese": "",
                "words": ["course","a","great","deal","almost","all","perhaps","of","the","problems","that","I'm","raising","here","can","be","solved","by","oh","I","don't","know","perhaps"],
                "audioStart": 670.92,
                "audioEnd": 678.06
            },
            {
                "id": 99,
                "english": "reading Genesis as an allegorical story rather than a literal account of world history in which Toil and childbirth are",
                "phonetic": "",
                "vietnamese": "",
                "words": ["reading","Genesis","as","an","allegorical","story","rather","than","a","literal","account","of","world","history","in","which","Toil","and","childbirth","are"],
                "audioStart": 678.06,
                "audioEnd": 685.26
            },
            {
                "id": 100,
                "english": "literal punishments administered due to a literal person eating a literal fruit after a literal talking snake literally",
                "phonetic": "",
                "vietnamese": "",
                "words": ["literal","punishments","administered","due","to","a","literal","person","eating","a","literal","fruit","after","a","literal","talking","snake","literally"],
                "audioStart": 685.26,
                "audioEnd": 692.76
            },
            {
                "id": 101,
                "english": "convinced her to but that's not a live option for Answers in Genesis god holds everything together and he placed upon",
                "phonetic": "",
                "vietnamese": "",
                "words": ["convinced","her","to","but","that's","not","a","live","option","for","Answers","in","Genesis","god","holds","everything","together","and","he","placed","upon"],
                "audioStart": 692.76,
                "audioEnd": 699
            },
            {
                "id": 102,
                "english": "us the curse of death and actually it was a loving act it was an act of judgment but also a loving it because",
                "phonetic": "",
                "vietnamese": "",
                "words": ["us","the","curse","of","death","and","actually","it","was","a","loving","act","it","was","an","act","of","judgment","but","also","a","loving","it","because"],
                "audioStart": 699,
                "audioEnd": 705.3
            },
            {
                "id": 103,
                "english": "it's through death that he's able to bring us back to him by paying the penalty for our sins oh now we're really",
                "phonetic": "",
                "vietnamese": "",
                "words": ["it's","through","death","that","he's","able","to","bring","us","back","to","him","by","paying","the","penalty","for","our","sins","oh","now","we're","really"],
                "audioStart": 705.3,
                "audioEnd": 711.42
            },
            {
                "id": 104,
                "english": "talking God cursing us with death was actually a loving act because it allowed him to save us from that death via the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["talking","God","cursing","us","with","death","was","actually","a","loving","act","because","it","allowed","him","to","save","us","from","that","death","via","the"],
                "audioStart": 711.42,
                "audioEnd": 718.38
            },
            {
                "id": 105,
                "english": "sacrifice of Jesus I think even most Christians would cringe at this interpretation for God so loved the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["sacrifice","of","Jesus","I","think","even","most","Christians","would","cringe","at","this","interpretation","for","God","so","loved","the"],
                "audioStart": 718.38,
                "audioEnd": 725.04
            },
            {
                "id": 106,
                "english": "world that he created a problem in order that he might solve it this would be like me tying up a damsel to a train",
                "phonetic": "",
                "vietnamese": "",
                "words": ["world","that","he","created","a","problem","in","order","that","he","might","solve","it","this","would","be","like","me","tying","up","a","damsel","to","a","train"],
                "audioStart": 725.04,
                "audioEnd": 731.1
            },
            {
                "id": 107,
                "english": "track just so that I can then come and save her from the approaching train oh and I'm also the one driving the train",
                "phonetic": "",
                "vietnamese": "",
                "words": ["track","just","so","that","I","can","then","come","and","save","her","from","the","approaching","train","oh","and","I'm","also","the","one","driving","the","train"],
                "audioStart": 731.1,
                "audioEnd": 737.16
            },
            {
                "id": 108,
                "english": "well maybe the punishment was needed because without it there would be nothing that Jesus could do to pay for",
                "phonetic": "",
                "vietnamese": "",
                "words": ["well","maybe","the","punishment","was","needed","because","without","it","there","would","be","nothing","that","Jesus","could","do","to","pay","for"],
                "audioStart": 737.16,
                "audioEnd": 742.98
            },
            {
                "id": 109,
                "english": "our sins without some punishment for him to take on we'd be trapped in our sin unable to inherit eternal life",
                "phonetic": "",
                "vietnamese": "",
                "words": ["our","sins","without","some","punishment","for","him","to","take","on","we'd","be","trapped","in","our","sin","unable","to","inherit","eternal","life"],
                "audioStart": 742.98,
                "audioEnd": 749.7
            },
            {
                "id": 110,
                "english": "well maybe but then at the end of Genesis 3 God says the man has now become like one of us knowing good and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["well","maybe","but","then","at","the","end","of","Genesis","3","God","says","the","man","has","now","become","like","one","of","us","knowing","good","and"],
                "audioStart": 749.7,
                "audioEnd": 756.899
            },
            {
                "id": 111,
                "english": "evil he must not be allowed to reach out his hand and take also from the Tree of Life and eat and live forever so the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["evil","he","must","not","be","allowed","to","reach","out","his","hand","and","take","also","from","the","Tree","of","Life","and","eat","and","live","forever","so","the"],
                "audioStart": 756.899,
                "audioEnd": 764.16
            },
            {
                "id": 112,
                "english": "Lord God banished him from the Garden of Eden so it seems like eternal life could have been achieved by simply eating from",
                "phonetic": "",
                "vietnamese": "",
                "words": ["Lord","God","banished","him","from","the","Garden","of","Eden","so","it","seems","like","eternal","life","could","have","been","achieved","by","simply","eating","from"],
                "audioStart": 764.16,
                "audioEnd": 770.399
            },
            {
                "id": 113,
                "english": "another tree but God didn't want this so he employs cherubim and a flaming sword to guard its fruits again as a metaphor",
                "phonetic": "",
                "vietnamese": "",
                "words": ["another","tree","but","God","didn't","want","this","so","he","employs","cherubim","and","a","flaming","sword","to","guard","its","fruits","again","as","a","metaphor"],
                "audioStart": 770.399,
                "audioEnd": 778.139
            },
            {
                "id": 114,
                "english": "this is a fascinating and thought-provoking narrative as a literal account why on Earth would it be a",
                "phonetic": "",
                "vietnamese": "",
                "words": ["this","is","a","fascinating","and","thought-provoking","narrative","as","a","literal","account","why","on","Earth","would","it","be","a"],
                "audioStart": 778.139,
                "audioEnd": 784.74
            },
            {
                "id": 115,
                "english": "better option to produce a human sun to brutally sacrifice when eternal life could have been gained by simply eating",
                "phonetic": "",
                "vietnamese": "",
                "words": ["better","option","to","produce","a","human","sun","to","brutally","sacrifice","when","eternal","life","could","have","been","gained","by","simply","eating"],
                "audioStart": 784.74,
                "audioEnd": 791.459
            },
            {
                "id": 116,
                "english": "another piece of fruit so they don't understand the gospel they don't understand our sin what it's done to",
                "phonetic": "",
                "vietnamese": "",
                "words": ["another","piece","of","fruit","so","they","don't","understand","the","gospel","they","don't","understand","our","sin","what","it's","done","to"],
                "audioStart": 791.459,
                "audioEnd": 797.459
            },
            {
                "id": 117,
                "english": "this world and so they really don't understand what's going on here and they again look at God and blame God for",
                "phonetic": "",
                "vietnamese": "",
                "words": ["this","world","and","so","they","really","don't","understand","what's","going","on","here","and","they","again","look","at","God","and","blame","God","for"],
                "audioStart": 797.459,
                "audioEnd": 804.48
            },
            {
                "id": 118,
                "english": "everything the biggest problem for theism here is not famously the the Great sense sufferings of the world like",
                "phonetic": "",
                "vietnamese": "",
                "words": ["everything","the","biggest","problem","for","theism","here","is","not","famously","the","the","Great","sense","sufferings","of","the","world","like"],
                "audioStart": 804.48,
                "audioEnd": 811.56
            },
            {
                "id": 119,
                "english": "holocausts or earthquakes but rather meaning menial less significant suffering like being caught out in the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["holocausts","or","earthquakes","but","rather","meaning","menial","less","significant","suffering","like","being","caught","out","in","the"],
                "audioStart": 811.56,
                "audioEnd": 818.94
            },
            {
                "id": 120,
                "english": "rain or stubbing your toe or tripping over a curve on the street so alexo kind of goes on and says you",
                "phonetic": "",
                "vietnamese": "",
                "words": ["rain","or","stubbing","your","toe","or","tripping","over","a","curve","on","the","street","so","alexo","kind","of","goes","on","and","says","you"],
                "audioStart": 818.94,
                "audioEnd": 826.2
            },
            {
                "id": 121,
                "english": "know that there's something that's even more in in his opinion uh more difficult to explain and that is why we would stub",
                "phonetic": "",
                "vietnamese": "",
                "words": ["know","that","there's","something","that's","even","more","in","in","his","opinion","uh","more","difficult","to","explain","and","that","is","why","we","would","stub"],
                "audioStart": 826.2,
                "audioEnd": 837.42
            },
            {
                "id": 122,
                "english": "our toe and and hurt our toe and so in other words all the little things that happen day to day but again he doesn't",
                "phonetic": "",
                "vietnamese": "",
                "words": ["our","toe","and","and","hurt","our","toe","and","so","in","other","words","all","the","little","things","that","happen","day","to","day","but","again","he","doesn't"],
                "audioStart": 837.42,
                "audioEnd": 844.32
            },
            {
                "id": 123,
                "english": "understand we're living in a fallen world this is not the world as God made it you know god holds everything",
                "phonetic": "",
                "vietnamese": "",
                "words": ["understand","we're","living","in","a","fallen","world","this","is","not","the","world","as","God","made","it","you","know","god","holds","everything"],
                "audioStart": 844.32,
                "audioEnd": 849.12
            },
            {
                "id": 124,
                "english": "together but he's not holding everything together perfectly and so now everything is falling apart and where to blame",
                "phonetic": "",
                "vietnamese": "",
                "words": ["together","but","he's","not","holding","everything","together","perfectly","and","so","now","everything","is","falling","apart","and","where","to","blame"],
                "audioStart": 849.12,
                "audioEnd": 857.04
            },
            {
                "id": 125,
                "english": "where to blame for the fact that God isn't holding everything together perfectly how do you figure that it's",
                "phonetic": "",
                "vietnamese": "",
                "words": ["where","to","blame","for","the","fact","that","God","isn't","holding","everything","together","perfectly","how","do","you","figure","that","it's"],
                "audioStart": 857.04,
                "audioEnd": 862.86
            },
            {
                "id": 126,
                "english": "our sin see people don't want to take responsibility for their sin they don't want to acknowledge they're a sinner",
                "phonetic": "",
                "vietnamese": "",
                "words": ["our","sin","see","people","don't","want","to","take","responsibility","for","their","sin","they","don't","want","to","acknowledge","they're","a","sinner"],
                "audioStart": 862.86,
                "audioEnd": 868.26
            },
            {
                "id": 127,
                "english": "they don't want to acknowledge they need a savior and and again the interesting thing is they look at this world and",
                "phonetic": "",
                "vietnamese": "",
                "words": ["they","don't","want","to","acknowledge","they","need","a","savior","and","and","again","the","interesting","thing","is","they","look","at","this","world","and"],
                "audioStart": 868.26,
                "audioEnd": 876.42
            },
            {
                "id": 128,
                "english": "they see all the death and suffering and disease and so on and yet they attribute this world to evolutionary process cases",
                "phonetic": "",
                "vietnamese": "",
                "words": ["they","see","all","the","death","and","suffering","and","disease","and","so","on","and","yet","they","attribute","this","world","to","evolutionary","process","cases"],
                "audioStart": 876.42,
                "audioEnd": 883.68
            },
            {
                "id": 129,
                "english": "and so what they're really saying is it's great that Evolution did this uh and then they turn around and say but if",
                "phonetic": "",
                "vietnamese": "",
                "words": ["and","so","what","they're","really","saying","is","it's","great","that","Evolution","did","this","uh","and","then","they","turn","around","and","say","but","if"],
                "audioStart": 883.68,
                "audioEnd": 890.639
            },
            {
                "id": 130,
                "english": "if God's responsible for this how horrible God is think of the inconsistency even there",
                "phonetic": "",
                "vietnamese": "",
                "words": ["if","God's","responsible","for","this","how","horrible","God","is","think","of","the","inconsistency","even","there"],
                "audioStart": 890.639,
                "audioEnd": 897.74
            },
            {
                "id": 131,
                "english": "um Ken the difference is that naturalists don't believe that the evolutionary process is a conscious",
                "phonetic": "",
                "vietnamese": "",
                "words": ["um","Ken","the","difference","is","that","naturalists","don't","believe","that","the","evolutionary","process","is","a","conscious"],
                "audioStart": 898.56,
                "audioEnd": 905.22
            },
            {
                "id": 132,
                "english": "agent that cares about the creatures it produces you believe that God created the world inserted within it an evil",
                "phonetic": "",
                "vietnamese": "",
                "words": ["agent","that","cares","about","the","creatures","it","produces","you","believe","that","God","created","the","world","inserted","within","it","an","evil"],
                "audioStart": 905.22,
                "audioEnd": 912.72
            },
            {
                "id": 133,
                "english": "snake knowing that he would be able to seduce Adam and Eve and now punishes their Descendants on account of their",
                "phonetic": "",
                "vietnamese": "",
                "words": ["snake","knowing","that","he","would","be","able","to","seduce","Adam","and","Eve","and","now","punishes","their","Descendants","on","account","of","their"],
                "audioStart": 912.72,
                "audioEnd": 919.32
            },
            {
                "id": 134,
                "english": "original sin this must be reconciled with his supposed loving nature naturalists do not believe that",
                "phonetic": "",
                "vietnamese": "",
                "words": ["original","sin","this","must","be","reconciled","with","his","supposed","loving","nature","naturalists","do","not","believe","that"],
                "audioStart": 919.32,
                "audioEnd": 926.22
            },
            {
                "id": 135,
                "english": "evolution is inflicting a punishment upon animals they don't believe that the suffering of the world must be",
                "phonetic": "",
                "vietnamese": "",
                "words": ["evolution","is","inflicting","a","punishment","upon","animals","they","don't","believe","that","the","suffering","of","the","world","must","be"],
                "audioStart": 926.22,
                "audioEnd": 931.86
            },
            {
                "id": 136,
                "english": "reconciled with some kind of loving Essence at the basis of The evolutionary process and also nobody says it's great",
                "phonetic": "",
                "vietnamese": "",
                "words": ["reconciled","with","some","kind","of","loving","Essence","at","the","basis","of","The","evolutionary","process","and","also","nobody","says","it's","great"],
                "audioStart": 931.86,
                "audioEnd": 939.779
            },
            {
                "id": 137,
                "english": "that Evolution did this in fact one of the strongest Arguments for atheism is the fact that the very mechanism by",
                "phonetic": "",
                "vietnamese": "",
                "words": ["that","Evolution","did","this","in","fact","one","of","the","strongest","Arguments","for","atheism","is","the","fact","that","the","very","mechanism","by"],
                "audioStart": 939.779,
                "audioEnd": 947.22
            },
            {
                "id": 138,
                "english": "which species evolved on planet Earth is one brimming with torturous suffering the violent and brutal survival of the",
                "phonetic": "",
                "vietnamese": "",
                "words": ["which","species","evolved","on","planet","Earth","is","one","brimming","with","torturous","suffering","the","violent","and","brutal","survival","of","the"],
                "audioStart": 947.22,
                "audioEnd": 954.36
            },
            {
                "id": 139,
                "english": "fittest we're not the ones claiming that this world is being supervised Eyes by a benevolent and all-powerful invigilator",
                "phonetic": "",
                "vietnamese": "",
                "words": ["fittest","we're","not","the","ones","claiming","that","this","world","is","being","supervised","Eyes","by","a","benevolent","and","all-powerful","invigilator"],
                "audioStart": 954.36,
                "audioEnd": 960.5
            },
            {
                "id": 140,
                "english": "you are we all agree that suffering exists in the world but an evolutionary worldview does not require that there's",
                "phonetic": "",
                "vietnamese": "",
                "words": ["you","are","we","all","agree","that","suffering","exists","in","the","world","but","an","evolutionary","worldview","does","not","require","that","there's"],
                "audioStart": 960.5,
                "audioEnd": 967.5
            },
            {
                "id": 141,
                "english": "some kind of moral justification for it theism conversely does now an important clarification is that I of course don't",
                "phonetic": "",
                "vietnamese": "",
                "words": ["some","kind","of","moral","justification","for","it","theism","conversely","does","now","an","important","clarification","is","that","I","of","course","don't"],
                "audioStart": 967.5,
                "audioEnd": 975.72
            },
            {
                "id": 142,
                "english": "think that Ken Ham's views here are representative of Christianity as a whole I guess what I'm mainly trying to",
                "phonetic": "",
                "vietnamese": "",
                "words": ["think","that","Ken","Ham's","views","here","are","representative","of","Christianity","as","a","whole","I","guess","what","I'm","mainly","trying","to"],
                "audioStart": 975.72,
                "audioEnd": 982.079
            },
            {
                "id": 143,
                "english": "do here is demonstrate some of the reasons why it seems ludicrous to me to take Genesis to be a literal historical",
                "phonetic": "",
                "vietnamese": "",
                "words": ["do","here","is","demonstrate","some","of","the","reasons","why","it","seems","ludicrous","to","me","to","take","Genesis","to","be","a","literal","historical"],
                "audioStart": 982.079,
                "audioEnd": 988.92
            },
            {
                "id": 144,
                "english": "account Ken Ham I would love to see you respond to some of the questions that I've raised in this video If you find",
                "phonetic": "",
                "vietnamese": "",
                "words": ["account","Ken","Ham","I","would","love","to","see","you","respond","to","some","of","the","questions","that","I've","raised","in","this","video","If","you","find"],
                "audioStart": 988.92,
                "audioEnd": 994.98
            },
            {
                "id": 145,
                "english": "the time to the rest of you thanks for watching and I'll see you in the next one",
                "phonetic": "",
                "vietnamese": "",
                "words": ["the","time","to","the","rest","of","you","thanks","for","watching","and","I'll","see","you","in","the","next","one"],
                "audioStart": 994.98,
                "audioEnd": 1000.639
            }
        ]
    }
];
