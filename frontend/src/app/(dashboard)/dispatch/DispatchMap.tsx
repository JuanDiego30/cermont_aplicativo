"use client";

import type { DispatchStop } from "@cermont/shared-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";

export interface DispatchMapHandle {
	updateMarkers: (stops: DispatchStop[]) => void;
}

export function DispatchMap({ ref }: { ref?: React.Ref<DispatchMapHandle> }) {
	const mapRef = useRef<HTMLDivElement>(null);
	const mapInstance = useRef<L.Map | null>(null);
	const markersLayer = useRef<L.LayerGroup | null>(null);
	const polylineLayer = useRef<L.Polyline | null>(null);

	// Init map once — empty deps, runs only on mount
	useEffect(() => {
		if (!mapRef.current || mapInstance.current) {
			return;
		}

		const map = L.map(mapRef.current, {
			center: [7.0845, -70.7592],
			zoom: 12,
			zoomControl: true,
			attributionControl: true,
		});

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>",
			maxZoom: 19,
		}).addTo(map);

		mapInstance.current = map;
		markersLayer.current = L.layerGroup().addTo(map);

		return () => {
			map.remove();
		};
	}, []);

	const updateMarkers = useCallback((newStops: DispatchStop[]) => {
		const map = mapInstance.current;
		const markers = markersLayer.current;
		if (!map || !markers) {
			return;
		}

		markers.clearLayers();

		if (polylineLayer.current) {
			polylineLayer.current.remove();
		}

		if (newStops.length === 0) {
			return;
		}

		const bounds = L.latLngBounds([]);

		newStops.forEach((stop, i) => {
			const icon = L.divIcon({
				className: "custom-marker",
				html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#2154A6;color:white;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${i + 1}</div>`,
				iconSize: [28, 28],
				iconAnchor: [14, 14],
			});

			const popup = document.createElement("div");
			const title = document.createElement("strong");
			const address = document.createElement("p");
			title.textContent = stop.label;
			address.textContent = stop.address;
			popup.append(title, address);
			const marker = L.marker([stop.coord.lat, stop.coord.lng], { icon }).bindPopup(popup);
			markers.addLayer(marker);
			bounds.extend([stop.coord.lat, stop.coord.lng]);
		});

		// Draw polyline connecting stops in order
		if (newStops.length >= 2) {
			const latlngs = newStops.map((s) => [s.coord.lat, s.coord.lng] as [number, number]);
			polylineLayer.current = L.polyline(latlngs, {
				color: "#2154A6",
				weight: 3,
				opacity: 0.7,
				dashArray: "8, 8",
			}).addTo(map);
		}

		map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
	}, []);

	useImperativeHandle(ref, () => ({ updateMarkers }), [updateMarkers]);

	return (
		<div
			ref={mapRef}
			className="h-[400px] w-full rounded-lg"
			role="application"
			aria-label="Mapa de rutas"
		/>
	);
}
