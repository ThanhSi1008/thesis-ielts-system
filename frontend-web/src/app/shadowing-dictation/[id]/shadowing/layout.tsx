import { Metadata } from 'next';
import { SHADOWING_LESSONS } from '@/data/shadowing-lessons';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const lesson = SHADOWING_LESSONS.find(l => l.id === params.id);

    if (!lesson) {
        return {
            title: 'Lesson Not Found | TOEIC Master AI'
        };
    }

    return {
        title: `${lesson.title} - Shadowing | TOEIC Master AI`,
        description: `Practice shadowing for ${lesson.title}`,
    };
}

export default function ShadowingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
