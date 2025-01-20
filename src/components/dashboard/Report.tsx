"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { Transaction } from "./History";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";

export default function Report({
  transactions,
}: {
  transactions: Transaction;
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const labels =
    transactions? transactions.transactions.map((transaction) => transaction.date) : [];

  const incomeData =
    transactions? transactions.transactions.map((transaction) =>
      transaction.type === "income" ? transaction.amount : 0
    ) : [];

  const expenseData =
    transactions? transactions.transactions.map((transaction) =>
      transaction.type === "expense" ? transaction.amount : 0
    ) : [];

  const data = {
    labels: labels.map((label) => format(label, "P")),
    datasets: [
      {
        label: `Total Income: ` + transactions?.incomesBalance + " Rwf",
        data: incomeData,
        backgroundColor: "rgba(0, 0, 0, 1)",
        borderColor: "rgba(0, 0, 0, 1)",
        fill: true,
      },
      {
        label: `Total Expenses: ` + transactions?.expensesBalance + " Rwf",
        data: expenseData,
        backgroundColor: "rgba(255, 0, 0, 1)",
        borderColor: "rgba(255, 0, 0, 1)",
        fill: true, 
      },
    ],
  };

  return (
    <div className="col-span-4 hidden sm:flex h-full w-full flex-col gap-2 rounded-md border border-black p-2 shadow-md">
      <div className="flex w-full justify-between gap-2">
        <h1 className="text-2xl font-extrabold">History Report</h1>
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <Line options={options} data={data} />
      </div>
    </div>
  );
}
