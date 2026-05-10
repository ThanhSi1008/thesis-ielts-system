"use client";

import React from 'react';
import PageHeader from '@/components/PageHeader';
import VocabularyContent from './VocabularyContent';

export default function VocabularyPage() {
  return (
    <>
      <PageHeader
        title="Vocabulary"
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772802169/8a8ef998-37c5-4f7a-ba32-06af3d4e35b2.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Vocabulary' },
        ]}
      />
      <div className='container mx-auto max-w-screen-xl px-4 py-8'>
        <VocabularyContent />
      </div>
    </>
  );
}
