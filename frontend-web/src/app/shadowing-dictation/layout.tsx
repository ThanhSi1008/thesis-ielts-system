import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shadowing & Dictation | TOEIC Master AI',
    description: 'Practice English through shadowing and dictation exercises',
};

export default function ShadowingDictationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
