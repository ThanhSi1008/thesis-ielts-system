"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminShadowingApi } from "@/services/admin.api";
import type { ShadowingVideo } from "@/services/shadowing.api";
import { useAdminShadowingForm } from "../../_hooks/useAdminShadowingForm";
import { ShadowingLessonForm } from "../../_components/ShadowingLessonForm";

export default function EditShadowingLessonPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [foundationVocabLesson, setLesson] = useState<ShadowingVideo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    adminShadowingApi.getById(id)
      .then(setLesson)
      .catch(() => setFetchError("FoundationVocabLesson not found or could not be loaded."));
  }, [id]);

  if (fetchError) {
    return (
      <div className="p-6">
        <p className="text-red-500 text-sm">{fetchError}</p>
        <Link href="/admin/shadowing" className="mt-3 inline-block text-sm text-primary hover:underline">← Back to lessons</Link>
      </div>
    );
  }

  if (!foundationVocabLesson) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <EditForm foundationVocabLesson={foundationVocabLesson} lessonId={id} />;
}

function EditForm({ foundationVocabLesson, lessonId }: { foundationVocabLesson: ShadowingVideo; lessonId: string }) {
  const router = useRouter();
  const {
    formData, errors, isSubmitting,
    setField, addSentence, removeSentence, updateSentence, moveSentence,
    submitUpdate,
  } = useAdminShadowingForm(foundationVocabLesson);

  const handleSubmit = async () => {
    const result = await submitUpdate(lessonId);
    if (result) {
      router.push("/admin/shadowing");
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/shadowing"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit FoundationVocabLesson</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{foundationVocabLesson.title}</p>
        </div>
      </div>

      <ShadowingLessonForm
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
        onSetField={setField}
        onAddSentence={addSentence}
        onRemoveSentence={removeSentence}
        onUpdateSentence={updateSentence}
        onMoveSentence={moveSentence}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/shadowing")}
      />
    </div>
  );
}
