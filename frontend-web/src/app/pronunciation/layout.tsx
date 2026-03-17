import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pronunciation | TOEIC Master AI',
    description: 'Improve your English pronunciation',
};

export default function PronunciationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
