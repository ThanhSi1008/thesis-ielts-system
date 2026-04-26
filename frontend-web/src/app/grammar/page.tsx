"use client";

import React from 'react';
import PageHeader from '@/components/PageHeader';
import GrammarContent from './GrammarContent';

export default function GrammarPage() {
  return (
    <>
      <PageHeader
        title="Grammar"
        backgroundImage="https://res.cloudinary.com/dalaaegob/image/upload/v1772715179/7f460211-0961-4661-92cd-42f613d4afdd.png"
        breadcrumbs={[
          { label: 'Homepage', href: '/' },
          { label: 'Grammar' },
        ]}
      />
      <div className='container mx-auto max-w-screen-xl px-4 py-8'>
        <GrammarContent />
      </div>
    </>
  );
}
