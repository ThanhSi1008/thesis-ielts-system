import { Metadata } from 'next';
import { ShadowingSidebar, ShadowingSidebarOverlay } from './_components/ShadowingSidebar';

export const metadata: Metadata = {
    title: 'Shadowing & Dictation | TOEIC Master AI',
    description: 'Practice English through shadowing and dictation exercises',
};

export default function ShadowingDictationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-white dark:bg-slate-950">
            <ShadowingSidebarOverlay />
            <ShadowingSidebar />
            <main className="flex-1 h-full overflow-y-auto min-w-0">
                {children}
            </main>
        </div>
    );
}
