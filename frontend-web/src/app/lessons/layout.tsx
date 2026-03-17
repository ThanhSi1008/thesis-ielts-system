import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lessons | TOEIC Master AI',
    description: 'TOEIC reading and listening lessons',
};

export default function LessonsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
