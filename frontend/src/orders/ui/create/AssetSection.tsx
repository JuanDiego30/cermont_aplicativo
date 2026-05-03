"use client";

import { useFormContext } from "react-hook-form";
import { FormField, Select, TextField } from "@/core";
import { FieldGrid, getError, SectionPanel } from "./form-helpers";
import { type NewOrderFormData, toIsoDateTimeValue, toOptionalNumber } from "./types";

export function AssetSection() {
	const {
		register,
		formState: { errors },
	} = useFormContext<NewOrderFormData>();

	return (
		<SectionPanel title="Activo / ubicación">
			<FieldGrid>
				<FormField
					name="assetId"
					htmlFor="order-assetId"
					label="ID del activo"
					error={getError(errors, "assetId")}
					required
				>
					<TextField
						id="order-assetId"
						placeholder="Código del activo o equipo"
						{...register("assetId")}
					/>
				</FormField>
				<FormField
					name="assetName"
					htmlFor="order-assetName"
					label="Nombre del activo"
					error={getError(errors, "assetName")}
					required
				>
					<TextField
						id="order-assetName"
						placeholder="Nombre descriptivo del activo"
						{...register("assetName")}
					/>
				</FormField>
				<FormField
					name="assetDetails.serialTag"
					htmlFor="order-serialTag"
					label="Número de serie / TAG"
					error={getError(errors, "assetDetails.serialTag")}
				>
					<TextField id="order-serialTag" {...register("assetDetails.serialTag")} />
				</FormField>
				<FormField
					name="assetDetails.model"
					htmlFor="order-model"
					label="Modelo"
					error={getError(errors, "assetDetails.model")}
				>
					<TextField id="order-model" {...register("assetDetails.model")} />
				</FormField>
				<FormField
					name="assetDetails.manufacturer"
					htmlFor="order-manufacturer"
					label="Fabricante"
					error={getError(errors, "assetDetails.manufacturer")}
				>
					<TextField id="order-manufacturer" {...register("assetDetails.manufacturer")} />
				</FormField>
				<FormField
					name="assetDetails.warrantyStatus"
					htmlFor="order-warranty"
					label="Estado de garantía"
					error={getError(errors, "assetDetails.warrantyStatus")}
				>
					<Select id="order-warranty" {...register("assetDetails.warrantyStatus")}>
						<option value="na">N/A</option>
						<option value="active">Activa</option>
						<option value="expired">Vencida</option>
					</Select>
				</FormField>
				<FormField
					name="assetDetails.conditionForWork"
					htmlFor="order-conditionForWork"
					label="Condición para trabajar"
					error={getError(errors, "assetDetails.conditionForWork")}
				>
					<Select id="order-conditionForWork" {...register("assetDetails.conditionForWork")}>
						<option value="">Seleccionar...</option>
						<option value="operational">Operativo</option>
						<option value="out_of_service">Fuera de servicio</option>
						<option value="isolated">Aislado</option>
					</Select>
				</FormField>
				<FormField
					name="assetDetails.lastInterventionAt"
					htmlFor="order-lastInterventionAt"
					label="Fecha última intervención"
					error={getError(errors, "assetDetails.lastInterventionAt")}
				>
					<TextField
						id="order-lastInterventionAt"
						type="datetime-local"
						{...register("assetDetails.lastInterventionAt", { setValueAs: toIsoDateTimeValue })}
					/>
				</FormField>
				<FormField
					name="location"
					htmlFor="order-location"
					label="Ubicación textual"
					error={getError(errors, "location")}
				>
					<TextField
						id="order-location"
						placeholder="Ubicación del trabajo"
						{...register("location")}
					/>
				</FormField>
				<FormField
					name="gpsLocation.lat"
					htmlFor="order-gps-lat"
					label="Latitud GPS"
					error={getError(errors, "gpsLocation.lat")}
				>
					<TextField
						id="order-gps-lat"
						type="number"
						step="any"
						{...register("gpsLocation.lat" as never, { setValueAs: toOptionalNumber })}
					/>
				</FormField>
				<FormField
					name="gpsLocation.lng"
					htmlFor="order-gps-lng"
					label="Longitud GPS"
					error={getError(errors, "gpsLocation.lng")}
				>
					<TextField
						id="order-gps-lng"
						type="number"
						step="any"
						{...register("gpsLocation.lng" as never, { setValueAs: toOptionalNumber })}
					/>
				</FormField>
				<FormField
					name="gpsLocation.accuracy"
					htmlFor="order-gps-accuracy"
					label="Precisión GPS (m)"
					error={getError(errors, "gpsLocation.accuracy")}
				>
					<TextField
						id="order-gps-accuracy"
						type="number"
						step="any"
						{...register("gpsLocation.accuracy" as never, { setValueAs: toOptionalNumber })}
					/>
				</FormField>
			</FieldGrid>
		</SectionPanel>
	);
}
