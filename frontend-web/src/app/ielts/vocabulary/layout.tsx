import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Vocabulary | TOEIC Master AI',
    description: 'Learn and master English foundationVocabWord',
};

export default function VocabularyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
