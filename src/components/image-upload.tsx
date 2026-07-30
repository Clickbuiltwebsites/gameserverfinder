"use client";

import { useRef, useState } from "react";

type Status = "idle" | "uploading" | "error" | "done";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

export function ImageUpload({ name = "imageUrl" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  function upload(file: File) {
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setMessage("That picture is over 4 MB. Resize it and try again.");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setStatus("error");
      setMessage("Upload a PNG, JPEG, or WebP image.");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    // XHR rather than fetch, because fetch has no upload progress event.
    const request = new XMLHttpRequest();
    request.open("POST", "/api/upload");

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      try {
        const data = JSON.parse(request.responseText) as { url?: string; error?: string };
        if (request.status >= 200 && request.status < 300 && data.url) {
          setUrl(data.url);
          setStatus("done");
          setMessage("");
        } else {
          setStatus("error");
          setMessage(data.error ?? "The upload was rejected. Try a different file.");
        }
      } catch {
        setStatus("error");
        setMessage("The upload failed partway through. Try again.");
      }
    });

    request.addEventListener("error", () => {
      setStatus("error");
      setMessage("The upload could not reach the server. Check your connection and retry.");
    });

    setStatus("uploading");
    setProgress(0);
    setMessage("");
    request.send(form);
  }

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="upload">
      <input type="hidden" name={name} value={url} />

      {url ? (
        <>
          <figure className="upload__preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Preview of the picture you uploaded" />
            <button
              type="button"
              className="btn upload__replace"
              onClick={() => {
                setUrl("");
                setStatus("idle");
                setProgress(0);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Replace picture
            </button>
          </figure>
          <div className="field">
            <label className="field__label" htmlFor="imageAlt">
              Describe the picture
            </label>
            <input
              className="input"
              id="imageAlt"
              name="imageAlt"
              maxLength={160}
              placeholder="Night shot of the main plaza with players gathered"
            />
            <p className="field__help">
              Read aloud to players using a screen reader, and shown if the image fails to load.
            </p>
          </div>
        </>
      ) : (
        <label
          className="upload__drop"
          data-dragging={dragging}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
        >
          <input
            ref={inputRef}
            className="visually-hidden"
            type="file"
            accept={ACCEPT}
            onChange={onPick}
            disabled={status === "uploading"}
          />
          <span className="switch__title">
            {status === "uploading" ? "Uploading…" : "Drop a picture, or choose a file"}
          </span>
          <span className="upload__hint">PNG, JPEG or WebP · up to 4 MB · 16:10 looks best</span>
        </label>
      )}

      {status === "uploading" ? (
        <div
          className="upload__bar"
          role="progressbar"
          aria-label="Upload progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <p className="field__help field__help--error" aria-live="polite">
        {status === "error" ? (
          <>
            <span aria-hidden="true">⚠</span>
            {message}
          </>
        ) : null}
      </p>
    </div>
  );
}
