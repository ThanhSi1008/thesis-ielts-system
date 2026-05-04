"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminShadowingForm } from "../_hooks/useAdminShadowingForm";
import { ShadowingLessonForm } from "../_components/ShadowingLessonForm";

export default function NewShadowingLessonPage() {
  const router = useRouter();
  const {
    formData, errors, isSubmitting,
    setField, addSentence, removeSentence, updateSentence, moveSentence,
    submitCreate,
  } = useAdminShadowingForm();

  const handleSubmit = async () => {
    const result = await submitCreate();
    if (result) {
      router.push("/admin/shadowing");
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/shadowing"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Add Shadowing Lesson</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a new system-wide shadowing lesson</p>
        </div>
      </div>

      <ShadowingLessonForm
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        submitLabel="Create Lesson"
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
