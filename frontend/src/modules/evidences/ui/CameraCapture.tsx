"use client";

import { RotateCw, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
	onCapture: (file: File) => void;
	onClose: () => void;
}

type FacingMode = "environment" | "user";

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const [facingMode, setFacingMode] = useState<FacingMode>("environment");
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	// Stable ref for facingMode — effect reads current value without depending on it
	const facingModeRef = useRef(facingMode);
	useEffect(() => {
		facingModeRef.current = facingMode;
	}, [facingMode]);

	const startCamera = useCallback(async (mode: FacingMode) => {
		try {
			if (streamRef.current) {
				streamRef.current.getTracks().forEach((t) => {
					t.stop();
				});
			}
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
			setError(null);
		} catch (err) {
			setError(
				err instanceof DOMException && err.name === "NotAllowedError"
					? "Permiso de cámara denegado. Concede acceso en la configuración del navegador."
					: "No se pudo acceder a la cámara. Verifica que ningún otra app la esté usando.",
			);
		}
	}, []);

	useEffect(() => {
		startCamera(facingModeRef.current);
		// Capture the stream instance so cleanup uses a closure variable, not streamRef.current
		const streamInstance = streamRef.current;
		return () => {
			if (streamInstance) {
				streamInstance.getTracks().forEach((t) => {
					t.stop();
				});
			}
		};
	}, [startCamera]);

	const handleCapture = () => {
		const video = videoRef.current;
		if (!video) {
			return;
		}
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return;
		}
		ctx.drawImage(video, 0, 0);
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					return;
				}
				const previewUrl = URL.createObjectURL(blob);
				setPreview(previewUrl);
			},
			"image/jpeg",
			0.85,
		);
	};

	const handleAccept = async () => {
		if (!preview) {
			return;
		}
		const response = await fetch(preview);
		const blob = await response.blob();
		onCapture(new File([blob], `evidence-${Date.now()}.jpg`, { type: "image/jpeg" }));
		URL.revokeObjectURL(preview);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-col bg-black">
			<div className="flex items-center justify-between p-4">
				<button type="button" onClick={onClose} className="text-white" aria-label="Cerrar cámara">
					<X className="size-6" />
				</button>
				<button
					type="button"
					onClick={() => setFacingMode((p) => (p === "environment" ? "user" : "environment"))}
					className="text-white"
					aria-label="Cambiar cámara"
				>
					<RotateCw className="size-6" />
				</button>
			</div>
			<div className="flex flex-1 items-center justify-center">
				{error ? (
					<div className="text-center text-white p-8">
						<p className="text-brand-error mb-4">{error}</p>
						<button
							type="button"
							onClick={() => startCamera(facingMode)}
							className="text-[var(--color-brand)] underline"
						>
							Reintentar
						</button>
					</div>
				) : preview ? (
					<Image
						src={preview}
						alt="Preview"
						width={480}
						height={360}
						className="max-h-full w-auto object-contain"
						unoptimized
					/>
				) : (
					<video
						ref={videoRef}
						autoPlay
						playsInline
						className="max-h-full"
						aria-label="Vista previa de la cámara"
					>
						<track kind="captions" />
					</video>
				)}
			</div>
			<div className="flex items-center justify-center p-8">
				{preview ? (
					<div className="flex gap-4">
						<button
							type="button"
							onClick={() => {
								URL.revokeObjectURL(preview);
								setPreview(null);
							}}
							className="rounded-full bg-zinc-700 px-8 py-3 text-white"
						>
							Re-tomar
						</button>
						<button
							type="button"
							onClick={handleAccept}
							className="rounded-full bg-[var(--color-brand)] px-8 py-3 text-white"
						>
							Aceptar
						</button>
					</div>
				) : (
					<button
						type="button"
						onClick={handleCapture}
						className="size-16 rounded-full border-4 border-white bg-transparent"
						aria-label="Capturar foto"
					>
						<div className="mx-auto size-14 rounded-full bg-canvas" />
					</button>
				)}
			</div>
		</div>
	);
}
