"use client";

import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface ChartProps {
    categories: string[];
    series: number[];
    type: "bar" | "donut";
    height?: number;
}

const ChartClient: React.FC<ChartProps> = ({
    categories,
    series,
    type,
    height = 250,
}) => {
    const data =
        type === "donut"
            ? {
                labels: categories,
                datasets: [
                    {
                        data: series,
                        backgroundColor: [
                            "#3b82f6",
                            "#f97316",
                            "#22c55e",
                            "#ef4444",
                            "#facc15",
                            "#94a3b8",
                        ],
                    },
                ],
            }
            : {
                labels: categories,
                datasets: [
                    {
                        label: "Cases",
                        data: series,
                        backgroundColor: "#3b82f6",
                    },
                ],
            };

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                position: type === "donut" ? "bottom" : "top",
            },
            title: {
                display: false,
            },
        },
    };

    return type === "donut" ? (
        <Doughnut data={data} options={options} height={height} />
    ) : (
        <Bar data={data} options={options} height={height} />
    );
};

export default ChartClient;
