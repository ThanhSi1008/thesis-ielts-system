export const writingClozeData = {
  instructions:
    'Complete the paragraph by selecting the correct word for each blank. This tests your foundationVocabWord, collocations, and grammar in an academic context.',
  paragraph: [
    { type: 'text', content: 'The bar chart ' },
    { type: 'blank', id: 1, options: ['illustrates', 'tells', 'says', 'writes'], correct: 0 },
    {
      type: 'text',
      content:
        ' the number of students enrolled in three different courses between 2015 and 2020. ',
    },
    { type: 'blank', id: 2, options: ['Overall', 'But', 'And', 'Because'], correct: 0 },
    { type: 'text', content: ', the number of students in Science courses ' },
    {
      type: 'blank',
      id: 3,
      options: ['rose significantly', 'went slow', 'was bad', 'never changed'],
      correct: 0,
    },
    { type: 'text', content: ' while rural areas experienced a ' },
    { type: 'blank', id: 4, options: ['gradual', 'fast', 'big', 'more'], correct: 0 },
    { type: 'text', content: ' decline. It is ' },
    { type: 'blank', id: 5, options: ['evident', 'good', 'nice', 'ok'], correct: 0 },
    { type: 'text', content: ' that Arts and Humanities saw a ' },
    { type: 'blank', id: 6, options: ['fluctuation', 'change', 'difference', 'move'], correct: 0 },
    { type: 'text', content: ' over the five-year period.' },
  ],
  totalBlanks: 6,
};
