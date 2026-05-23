import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Grammar | IELTS Master AI',
    description: 'Learn English grammar rules and patterns',
};

export default function GrammarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
