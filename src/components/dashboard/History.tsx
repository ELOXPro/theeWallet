"use client";

import { api } from "@/trpc/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import Report from "./Report";
import { EditTransaction } from "../transaction/EditTransaction";
import { DeleteTransaction } from "../transaction/DeleteTransaction";

export type Transaction = {
  transactions: {
      type: string;
      id: string;
      userId: string;
      category: string;
      accountId: string;
      amount: number;
      date: Date;
      description: string;
  }[];
  expensesBalance: number;
  incomesBalance: number;
} | undefined

export default function History({ userId }: { userId: string }) {
  const [from, setFrom] = useState<Date>();
  const [to, setTo] = useState<Date>();
  const { data: transactions } = api.transaction.list.useQuery({
    userId,
    from: from,
    to: to,
  });

  return (
    <div className="grid h-auto w-full grid-cols-1 lg:grid-cols-10 items-center justify-center gap-2 py-2">
      <div className="col-span-6 h-full w-full flex flex-col rounded-md border border-black shadow-md p-2 gap-2">
        <div className="flex flex-col sm:flex-row w-full justify-between">
          <h1 className="text-2xl font-extrabold">History</h1>
          <div className="flex w-auto items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {from ? format(from, "PPP") : <span>From</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={from}
                  onSelect={(e) => setFrom(e)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            -
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !to && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {to ? format(to, "PPP") : <span>To</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={from}
                  onSelect={(e) => setTo(e)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex h-52 w-full flex-col items-center justify-start overflow-y-auto rounded-sm border border-black pb-1">
          <div className="flex w-full border-b border-black text-sm font-bold">
            <div className="hidden lg:flex w-[25%] border-r border-black px-1">Date</div>
            <div className="flex w-[20%] lg:w-[10%] border-r border-black px-1">Type</div>
            <div className="hidden lg:flex w-[20%] border-r border-black px-1">
              Description
            </div>
            <div className="hidden lg:flex w-[20%] border-r border-black px-1">
              Category
            </div>
            <div className="flex w-[30%] lg:w-[15%] border-r border-black px-1">
              Amount
            </div>
            <div className="flex w-[50%] lg:w-[20%] px-1">Options</div>
          </div>
          {transactions && transactions.transactions.length > 0 ? (
            transactions.transactions.map((transaction) => {
              if (!transaction) {
                return (
                  <div
                    key={"budget?.data.id"}
                    className="flex w-full items-center justify-center"
                  >
                    <h1 className="text-sm font-bold capitalize">
                      No Transaction Data Found
                    </h1>
                  </div>
                );
              }
              return (
                <div
                  key={transaction.id}
                  className="flex w-full items-center justify-start gap-2 border-b border-black"
                >
                  <div
                    className={`flex w-full items-center text-xs font-bold capitalize`}
                  >
                    <div className="hidden lg:flex w-[25%] overflow-hidden border-r border-black px-1 text-inherit">
                      {format(transaction.date, "PPP")}
                    </div>
                    <div className="w-[20%] lg:w-[10%] overflow-hidden border-r border-black px-1">
                      {transaction.type}
                    </div>
                    <div className="hidden lg:flex w-[20%] overflow-hidden border-r border-black px-1">
                      {transaction.description}
                    </div>
                    <div className="hidden lg:flex w-[20%] overflow-hidden border-r border-black px-1">
                      {transaction.category}
                    </div>
                    <div className="w-[30%] lg:w-[15%] overflow-hidden border-r border-black px-1">
                      {transaction.amount}
                    </div>
                    <div className="flex w-[50%] lg:w-[20%] gap-1 overflow-auto">
                      <EditTransaction id={transaction.id} userId={userId} />
                      <DeleteTransaction id={transaction.id} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <h1 className="flex items-center justify-center w-full h-full text-2xl font-extrabold">No Transactions Found</h1>
          )}
        </div>
      </div>
      <Report transactions={transactions} />
    </div>
  );
}
