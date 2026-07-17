"use client";

import { CreateVehicleSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	type CreateVehicleFormValues,
	createInitialVehicleValues,
	toIsoDateTime,
	type VehicleDateField,
} from "../model/vehicle-form";

export function useVehicleForm() {
	const form = useForm<CreateVehicleFormValues>({
		resolver: zodResolver(CreateVehicleSchema),
		defaultValues: createInitialVehicleValues(),
	});
	const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
	const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
	const previewUrlsRef = useRef(new Set<string>());

	useEffect(() => {
		const previewUrls = previewUrlsRef.current;
		return () => {
			for (const previewUrl of previewUrls) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, []);

	function handleOptionalDateChange(field: VehicleDateField, event: ChangeEvent<HTMLInputElement>) {
		const value = event.currentTarget.value;
		if (value === "") {
			form.unregister(field);
			return;
		}

		form.setValue(field, toIsoDateTime(value), { shouldDirty: true, shouldValidate: true });
	}

	function handleOptionalNumberChange(event: ChangeEvent<HTMLInputElement>) {
		if (event.currentTarget.value === "") {
			form.unregister("nextMaintenanceKm");
			return;
		}

		form.setValue("nextMaintenanceKm", event.currentTarget.valueAsNumber, {
			shouldDirty: true,
			shouldValidate: true,
		});
	}

	function handleAddPhoto(event: ChangeEvent<HTMLInputElement>) {
		const selectedFiles = event.currentTarget.files;
		if (!selectedFiles) {
			return;
		}

		const validFiles = Array.from(selectedFiles).filter((file) => {
			if (file.size > 10 * 1024 * 1024) {
				toast.error(`${file.name} supera 10MB`);
				return false;
			}
			if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
				toast.error(`${file.name} no es JPG/PNG/WebP`);
				return false;
			}
			return true;
		});
		const previews = validFiles.map((file) => URL.createObjectURL(file));
		for (const preview of previews) {
			previewUrlsRef.current.add(preview);
		}
		setPendingPhotos((current) => [...current, ...validFiles]);
		setPhotoPreviews((current) => [...current, ...previews]);
		event.currentTarget.value = "";
	}

	function removePendingPhoto(index: number) {
		const preview = photoPreviews[index];
		if (preview) {
			URL.revokeObjectURL(preview);
			previewUrlsRef.current.delete(preview);
		}
		setPendingPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
		setPhotoPreviews((current) => current.filter((_, currentIndex) => currentIndex !== index));
	}

	function clearPhotos() {
		for (const preview of previewUrlsRef.current) {
			URL.revokeObjectURL(preview);
		}
		previewUrlsRef.current.clear();
		setPendingPhotos([]);
		setPhotoPreviews([]);
	}

	return {
		clearPhotos,
		form,
		handleAddPhoto,
		handleOptionalDateChange,
		handleOptionalNumberChange,
		pendingPhotos,
		photoPreviews,
		removePendingPhoto,
	};
}
