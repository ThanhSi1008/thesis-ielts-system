"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dictationApi, DictationVideo } from "@/services/dictation.api";
import { useUserDictationForm } from "../../_hooks/useUserDictationForm";
import { DictationLessonForm } from "@/app/admin/dictation/_components/DictationLessonForm";

export default function EditUserDictationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [video, setVideo] = useState<DictationVideo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    dictationApi.getVideoById(id)
      .then(setVideo)
      .catch(() => setFetchError("Video not found or could not be loaded."));
  }, [id]);

  if (fetchError) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-red-500 text-sm">{fetchError}</p>
        <Link href="/shadowing-dictation/dictation/my-videos" className="mt-3 inline-block text-sm text-primary hover:underline">
          ← Back to my videos
        </Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <EditForm video={video} videoId={id} />;
}

function EditForm({ video, videoId }: { video: DictationVideo; videoId: string }) {
  const router = useRouter();
  const {
    formData, errors, isSubmitting,
    setField, addSentence, removeSentence, updateSentence, moveSentence,
    submitUpdate,
  } = useUserDictationForm(video);

  const handleSubmit = async () => {
    const result = await submitUpdate(videoId);
    if (result) {
      router.push("/shadowing-dictation/dictation/my-videos");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/shadowing-dictation/dictation/my-videos"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit My Dictation Video</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{video.title}</p>
        </div>
      </div>

      <DictationLessonForm
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
        onCancel={() => router.push("/shadowing-dictation/dictation/my-videos")}
      />
    </div>
  );
}
