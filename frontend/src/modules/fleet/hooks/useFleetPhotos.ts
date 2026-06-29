"use client";

import type { VehiclePhoto } from "@cermont/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import {
	deleteVehiclePhoto,
	getVehiclePhotos,
	setVehiclePrimaryPhoto,
	uploadVehiclePhoto,
} from "../api/fleet-api";

const FLEET_PHOTOS_KEY = "fleet-photos";

export function useFleetPhotos(vehicleId: string) {
	const queryClient = useQueryClient();

	const {
		data: photos = [],
		isLoading,
		error,
		refetch,
	} = useQuery<VehiclePhoto[]>({
		queryKey: [FLEET_PHOTOS_KEY, vehicleId],
		queryFn: () => getVehiclePhotos(vehicleId),
		enabled: !!vehicleId,
	});

	const uploadMutation = useMutation({
		mutationFn: ({ file, title }: { file: File; title?: string }) =>
			uploadVehiclePhoto(vehicleId, file, title),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [FLEET_PHOTOS_KEY, vehicleId] });
			toast.success("Foto subida correctamente");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Error al subir la foto");
		},
	});

	const setPrimaryMutation = useMutation({
		mutationFn: (photoId: string) => setVehiclePrimaryPhoto(vehicleId, photoId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [FLEET_PHOTOS_KEY, vehicleId] });
			toast.success("Foto principal actualizada");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Error al actualizar foto principal");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (photoId: string) => deleteVehiclePhoto(vehicleId, photoId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [FLEET_PHOTOS_KEY, vehicleId] });
			toast.success("Foto eliminada");
		},
		onError: (err: Error) => {
			toast.error(err.message || "Error al eliminar la foto");
		},
	});

	const handleUpload = useCallback(
		(file: File, title?: string) => {
			uploadMutation.mutate({ file, title });
		},
		[uploadMutation],
	);

	const handleSetPrimary = useCallback(
		(photoId: string) => {
			setPrimaryMutation.mutate(photoId);
		},
		[setPrimaryMutation],
	);

	const handleDelete = useCallback(
		(photoId: string) => {
			deleteMutation.mutate(photoId);
		},
		[deleteMutation],
	);

	return {
		photos,
		isLoading,
		error,
		refetch,
		handleUpload,
		handleSetPrimary,
		handleDelete,
		isUploading: uploadMutation.isPending,
	};
}
