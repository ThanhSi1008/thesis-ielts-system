"use client";
import React from 'react';
import PageHeader from '@/components/PageHeader';
import PronunciationContent from './PronunciationContent';

export default function PronunciationPage() {
  return (
    <>
      <PageHeader
        title="Pronunciation"
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715265/788c018d-403b-4260-8b8d-710d0a3db342.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Pronunciation' },
        ]}
      />
      <div className='container mx-auto max-w-screen-xl px-4 py-8'>
        <PronunciationContent />
      </div>
    </>
  );
}