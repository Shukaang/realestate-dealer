"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Loader2 } from "lucide-react";

interface SalesChartProps {
  simplified?: boolean;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const SalesChart = ({ simplified }: SalesChartProps) => {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    values: [] as number[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setIsLoading(true);

        // Get current date and calculate last 6 months
        const now = new Date();
        const monthRanges = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          return {
            start: date,
            end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
            label: date.toLocaleString("default", { month: "short" }),
          };
        }).reverse();

        // Fetch sales count for each month
        const salesData = await Promise.all(
          monthRanges.map(async (month) => {
            const q = query(
              collection(db, "listings"),
              where("status", "==", "sold"),
              where("soldDate", ">=", Timestamp.fromDate(month.start)),
              where("soldDate", "<=", Timestamp.fromDate(month.end))
            );
            const snapshot = await getDocs(q);
            return snapshot.size;
          })
        );

        setChartData({
          labels: monthRanges.map((m) => m.label),
          values: salesData,
        });
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (isLoading)
    return <Loader2 className="h-8 w-8 animate-spin text-blue-700" />;

  return (
    <div className="h-64 w-full">
      <Bar
        data={{
          labels: chartData.labels,
          datasets: [
            {
              label: "Properties Sold",
              data: chartData.values,
              backgroundColor: "#3b82f6",
              borderColor: "#1d4ed8",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.parsed.y} ${
                    ctx.parsed.y !== 1 ? "properties" : "property"
                  } sold`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0,
              },
            },
          },
        }}
      />
    </div>
  );
};
