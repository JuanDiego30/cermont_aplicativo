/**
 * ARCHIVO: StatisticsChart.tsx
 * FUNCION: Gráfico de área con estadísticas de órdenes completadas y eficiencia
 * IMPLEMENTACION: Client Component con ApexCharts area chart (dynamic import SSR:false)
 * DEPENDENCIAS: react-apexcharts, ChartTab
 * EXPORTS: StatisticsChart (default)
 */
"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import ChartTab from "@/components/ui/ChartTab";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

export default function StatisticsChart() {
    const options: ApexOptions = {
        legend: {
            show: false,
            position: "top",
            horizontalAlign: "left",
        },
        colors: ["#465FFF", "#9CB9FF"],
        chart: {
            fontFamily: "Inter, sans-serif",
            height: 310,
            type: "area",
            toolbar: {
                show: false,
            },
        },
        stroke: {
            curve: "smooth",
            width: [2, 2],
        },
        fill: {
            type: "gradient",
            gradient: {
                opacityFrom: 0.55,
                opacityTo: 0,
            },
        },
        markers: {
            size: 0,
            strokeColors: "#fff",
            strokeWidth: 2,
            hover: {
                size: 6,
            },
        },
        grid: {
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            enabled: true,
            x: {
                format: "dd MMM yyyy",
            },
        },
        xaxis: {
            type: "category",
            categories: [
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic",
            ],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: "12px",
                    colors: ["#6B7280"],
                },
            },
            title: {
                text: "",
                style: {
                    fontSize: "0px",
                },
            },
        },
    };

    // TODO: Replace with real data from API
    const series = [
        {
            name: "Órdenes Completadas",
            data: [18, 19, 17, 16, 17, 16, 17, 20, 23, 21, 24, 23],
        },
        {
            name: "Tasa de Eficiencia",
            data: [4, 3, 5, 4, 5, 4, 7, 10, 11, 12, 15, 14],
        },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
            <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Estadísticas
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Rendimiento mensual de órdenes
                    </p>
                </div>
                <div className="flex items-start w-full gap-3 sm:justify-end">
                    <ChartTab />
                </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Órdenes Completadas</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-300"></span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de Eficiencia</span>
                </div>
            </div>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="min-w-250 xl:min-w-full">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="area"
                        height={310}
                    />
                </div>
            </div>
        </div>
    );
}
