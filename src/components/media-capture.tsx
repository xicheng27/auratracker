"use client";

import { useEffect, useRef, useState } from "react";
import { CameraIcon, GalleryIcon, TextIcon, VideoIcon } from "@/components/icons";
import {
  IMAGE_MIME,
  VIDEO_MIME,
  mediaTypeForFile,
  validateMediaFile,
  type SelectedMedia,
} from "@/lib/media";

type CameraMode = "photo" | "record";

const RECORD_MIME_CANDIDATES = [
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm",
];

function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return RECORD_MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m));
}

export function MediaCapture({
  media,
  onChange,
}: {
  media: SelectedMedia | null;
  onChange: (media: SelectedMedia | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [cameraMode, setCameraMode] = useState<CameraMode | null>(null);
  const [denied, setDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [textOnly, setTextOnly] = useState(false);

  // Stop and release the camera stream.
  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  // Always release the camera when the overlay closes or the component unmounts.
  useEffect(() => {
    return () => stopStream();
  }, []);

  // Recording timer (seconds is reset in startRecording).
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  function select(next: SelectedMedia) {
    // Drop any previously held preview before replacing it.
    if (media) URL.revokeObjectURL(media.previewUrl);
    setTextOnly(false);
    onChange(next);
  }

  function clearMedia() {
    if (media) URL.revokeObjectURL(media.previewUrl);
    onChange(null);
  }

  async function openCamera(mode: CameraMode) {
    setError(null);
    setDenied(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setDenied(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: mode === "record",
      });
      streamRef.current = stream;
      setCameraMode(mode);
      // Attach after the overlay's <video> mounts.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      // Permission denied or no device — fall back to gallery.
      setDenied(true);
    }
  }

  function closeCamera() {
    if (recording) stopRecording();
    stopStream();
    setCameraMode(null);
    setRecording(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `aura-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        select({
          file,
          previewUrl: URL.createObjectURL(file),
          type: "photo",
          source: "camera",
        });
        closeCamera();
      },
      "image/jpeg",
      0.9,
    );
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = pickRecorderMime();
    const recorder = new MediaRecorder(
      stream,
      mimeType ? { mimeType } : undefined,
    );
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || "video/webm";
      const ext = type.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(chunksRef.current, { type });
      const file = new File([blob], `aura-${Date.now()}.${ext}`, { type });
      const problem = validateMediaFile(file);
      if (problem) {
        setError(problem);
      } else {
        select({
          file,
          previewUrl: URL.createObjectURL(file),
          type: "video",
          source: "record",
        });
      }
      closeCamera();
    };
    recorder.start();
    recorderRef.current = recorder;
    setSeconds(0);
    setRecording(true);
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // Allow re-selecting the same file.
    if (!file) return;
    const problem = validateMediaFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    const type = mediaTypeForFile(file)!;
    select({
      file,
      previewUrl: URL.createObjectURL(file),
      type,
      source: "gallery",
    });
  }

  // ---- Camera overlay ----
  if (cameraMode) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={closeCamera}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white"
          >
            Cancel
          </button>
          {recording ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              {String(Math.floor(seconds / 60)).padStart(2, "0")}:
              {String(seconds % 60).padStart(2, "0")}
            </span>
          ) : (
            <span className="text-sm font-medium text-white/70">
              {cameraMode === "photo" ? "Take photo" : "Record video"}
            </span>
          )}
          <span className="w-[68px]" />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex items-center justify-center py-8">
          {cameraMode === "photo" ? (
            <button
              type="button"
              onClick={capturePhoto}
              aria-label="Capture photo"
              className="h-[72px] w-[72px] rounded-full border-4 border-white p-1.5"
            >
              <span className="block h-full w-full rounded-full bg-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              aria-label={recording ? "Stop recording" : "Start recording"}
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white"
            >
              <span
                className={
                  recording
                    ? "h-7 w-7 rounded-md bg-red-500"
                    : "h-14 w-14 rounded-full bg-red-500"
                }
              />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---- Selected media preview ----
  if (media) {
    return (
      <div className="rounded-2xl border border-edge bg-card p-5">
        <p className="text-sm font-medium">
          {media.type === "photo" ? "Photo" : "Video"} attached
        </p>
        <div className="relative mt-2.5 overflow-hidden rounded-xl border border-edge bg-background">
          {media.type === "photo" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.previewUrl}
              alt="Media preview"
              className="max-h-80 w-full object-contain"
            />
          ) : (
            <video
              src={media.previewUrl}
              controls
              playsInline
              className="max-h-80 w-full"
            />
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() =>
              media.source === "gallery"
                ? fileInputRef.current?.click()
                : openCamera(media.type === "video" ? "record" : "photo")
            }
            className="flex-1 rounded-xl border border-edge py-2.5 text-sm font-medium transition-colors hover:bg-card-hover"
          >
            Retake
          </button>
          <button
            type="button"
            onClick={clearMedia}
            className="flex-1 rounded-xl border border-edge py-2.5 text-sm font-medium text-muted transition-colors hover:text-negative"
          >
            Remove
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={[...IMAGE_MIME, ...VIDEO_MIME].join(",")}
          onChange={handleFile}
          className="hidden"
        />
      </div>
    );
  }

  // ---- Option picker (idle) ----
  const options = [
    { label: "Take Photo", icon: CameraIcon, onClick: () => openCamera("photo") },
    { label: "Record Video", icon: VideoIcon, onClick: () => openCamera("record") },
    {
      label: "Upload from Gallery",
      icon: GalleryIcon,
      onClick: () => fileInputRef.current?.click(),
    },
    {
      label: "Text-only post",
      icon: TextIcon,
      onClick: () => {
        setDenied(false);
        setError(null);
        setTextOnly(true);
      },
    },
  ];

  return (
    <div className="rounded-2xl border border-edge bg-card p-5">
      <p className="text-sm font-medium">
        Add media{" "}
        <span className="font-normal text-muted">(optional)</span>
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Capture the moment. Let the people judge it.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {options.map(({ label, icon: OptionIcon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-edge bg-background py-6 text-sm font-medium transition-colors hover:border-accent/50 hover:bg-card-hover"
          >
            <OptionIcon className="h-7 w-7" />
            {label}
          </button>
        ))}
      </div>

      {textOnly && (
        <p className="mt-3 rounded-xl border border-edge bg-background px-4 py-2.5 text-xs text-muted">
          No media — your words carry the aura. Just write your moment above.
        </p>
      )}

      {denied && (
        <div className="mt-3 rounded-xl border border-negative/40 bg-background px-4 py-3 text-xs text-muted">
          <p className="font-medium text-foreground">
            Camera unavailable
          </p>
          <p className="mt-0.5">
            We couldn’t access your camera (permission denied or no device). You
            can still upload from your gallery instead.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-background transition-colors hover:bg-accent-soft"
          >
            Upload from gallery
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-negative">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={[...IMAGE_MIME, ...VIDEO_MIME].join(",")}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
