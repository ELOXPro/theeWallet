"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { CreateTransaction } from "../transaction/CreateTransaction";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
export default function Overview({ userId }: { userId: string }) {
  ChartJS.register(ArcElement, Tooltip, Legend);
  const utils = api.useUtils();
  const [account, setAccount] = useState<string>("all");
  const { data: accounts } = api.account.list.useQuery(userId);
  const { data: datas } = api.transaction.balances.useQuery({
    userId,
    accountId: account !== "all" ? account : "",
  });
  const { data: balance, isLoading } = api.account.balance.useQuery({
    userId: userId,
    id: account,
  });

  const data = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        label: "Rwandan Francs",
        data: [
          datas ? datas.incomesBalance : 0,
          datas ? datas.expensesBalance : 0,
        ],
        backgroundColor: ["rgba(0, 0, 0, 1)", "rgba(255, 0, 0, 1)"],
        size: 1,
      },
    ],
  };

  const options = {
    responsive: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  useEffect(() => {
    void utils.invalidate();
  }, [account, utils]);

  return (
    <div className="flex w-full h-full col-span-3 flex-col gap-2 rounded-md border border-black p-2 shadow-md">
      <div className="flex w-full justify-between gap-2">
        <Select
          onValueChange={(value) => setAccount(value)}
          defaultValue={account}
        >
          <SelectTrigger className="w-[180px] capitalize">
            <SelectValue placeholder="Select an Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">overall</SelectItem>
            {accounts?.map((account) => (
              <SelectItem
                className="capitalize"
                key={account.id}
                value={account.id}
              >
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <h1 className=" text-2xl font-extrabold">
          RWF {balance ? balance : isLoading ? "..." : 0}
        </h1>
      </div>
      <div className="flex h-full w-full items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
      <div className="flex w-full items-center justify-end gap-1">
        <CreateTransaction userId={userId} />
      </div>
    </div>
  );
}
