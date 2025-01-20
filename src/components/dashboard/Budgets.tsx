"use client";

import { api } from "@/trpc/react";
import { CreateBudget } from "../budget/CreateBudget";
import { EditBudget } from "../budget/EditBudget";
import { DeleteBudget } from "../budget/DeleteBudget";
export default function Budgets({ userId }: { userId: string }) {
  const { data: budgets } = api.account.listBudget.useQuery(userId);

  return (
    <div className="col-span-5 flex h-full w-full flex-col gap-2 rounded-md border border-black p-2 shadow-md">
      <div className="flex w-full justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Budgets</h1>
        <div className="flex w-auto items-center gap-1">
          <CreateBudget userId={userId} />
        </div>
      </div>
      <div className="flex h-52 w-full flex-col items-center justify-start overflow-y-auto rounded-sm border border-black pb-1">
        <div className="flex text-sm w-full border-b border-black font-bold">
          <div className="flex w-[30%] lg:w-[20%] border-r border-black px-1">Name</div>
          <div className="hidden lg:flex w-[20%] border-r border-black px-1">Category</div>
          <div className="flex w-[25%] lg:w-[20%] border-r border-black px-1">Amount</div>
          <div className="hidden lg:flex w-[10%] border-r border-black px-1">Left</div>
          <div className="flex w-[15%] lg:w-[10%] border-r border-black px-1"> % </div>
          <div className="flex w-[30%] lg:w-[20%] px-1">Options</div>
        </div>
        {budgets && budgets.length > 0 ? (
          budgets.map((budget) => {
            if (!budget.data) {
              return (
                <div
                  key={"budget?.data.id"}
                  className="flex w-full items-center justify-center gap-2"
                >
                  <h1 className="text-sm font-bold capitalize">
                    No Budget Data Found
                  </h1>
                </div>
              );
            }
            return (
              <div
                key={budget.data.id}
                className="flex w-full items-center justify-start gap-2 border-b border-black"
              >
                <div
                  className={`${budget.used > budget.data.amount ? "animate-pulse text-red-600" : ""} flex w-full items-center text-xs font-bold capitalize`}
                >
                  <div className="flex w-[30%] lg:w-[20%] border-r border-black px-1 text-inherit overflow-hidden">
                    {budget.data.name}
                  </div>
                  <div className="hidden lg:flex w-[20%] border-r border-black px-1 overflow-hidden">
                    {budget.data.category}
                  </div>
                  <div className="flex w-[25%] lg:w-[20%] border-r border-black px-1 overflow-hidden">
                    <span className="hidden md:inline">{budget.used}/</span>{budget.data.amount}
                  </div>
                  <div className="hidden lg:flex w-[10%] border-r border-black px-1 overflow-hidden">
                    {budget.data.amount - budget.used}
                  </div>
                  <div className="flex w-[15%] lg:w-[10%] border-r border-black px-1 overflow-hidden">
                    {Math.round((budget.used * 100) / budget.data.amount) / 1} %
                  </div>
                  <div className="flex w-[30%] lg:w-[20%] gap-0 overflow-auto">
                    <EditBudget id={budget.data.id} userId={userId} />
                    <DeleteBudget id={budget.data.id} />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <h1 className="text-2xl font-extrabold">No Budgets Found</h1>
        )}
      </div>
    </div>
  );
}
