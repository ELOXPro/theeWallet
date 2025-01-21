"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { AddCategory } from "../category/addCategory";

export function CreateTransaction({ userId }: { userId: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full">
          <Plus size={24} />
          <h1>New Transaction</h1>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full">
        <SheetHeader>
          <SheetTitle>Create A New Transaction</SheetTitle>
        </SheetHeader>
        <ProfileForm userId={userId} />
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="destructive" className="w-full">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
type Transaction = {
  id: string;
  description: string;
  type: string;
  amount: number;
  category: string;
  date: Date;
  transfer: string;
};

function ProfileForm({ userId }: { userId: string }) {
  const utils = api.useUtils();
  const [value, setValue] = useState<Transaction>({
    id: "",
    description: "",
    type: "",
    amount: 0,
    category: "",
    date: new Date(),
    transfer: "",
  });
  const [loading, setLoading] = useState(false);
  const { data: accounts } = api.account.list.useQuery(userId);
  const { data: categories } = api.user.listCategories.useQuery({
    userId,
    type: value.type,
  });
  const createTransaction = api.transaction.create.useMutation({
    onSuccess: (data) => {
      if (data.result.includes("Created")) {
        toast.success(data.result, { duration: 1000 });
        setLoading(false);
        void utils.invalidate();
      } else {
        toast.error(data.result, { duration: 1000 });
        setLoading(false);
      }
    },
  });

  function handleChange(e: string | Date | undefined, name: string) {
    setValue({ ...value, [name]: e });
  }

  function handleSubmit() {
    if (
      !value.id ||
      !value.description ||
      !value.type ||
      !value.amount ||
      !value.category ||
      !value.date
    ) {
      toast.error("Select all inputs", {
        duration: 1000,
        className: "!text-red-600",
      });
      return;
    }
    if (value.amount <= 0) {
      toast.error("Amount must Be above 0", {
        duration: 1000,
        className: "!text-red-600",
      });
      return;
    }

    const fields = {
      accountId: value.id,
      type: value.type,
      description: value.description,
      date: value.date,
      category: value.category,
      amount: value.amount,
      transfer: value.transfer,
    };
    setLoading(true);
    void createTransaction.mutate(fields);
  }
  return (
    <div className={"grid items-start gap-2 py-4"}>
      <Select onValueChange={(value) => handleChange(value, "type")}>
        <SelectTrigger>
          <SelectValue placeholder="Transaction Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>
      <Select
        onValueChange={(value) => handleChange(value, "id")}
        defaultValue={value.id}
      >
        <SelectTrigger className="w-full capitalize">
          <SelectValue placeholder="Associated Account" />
        </SelectTrigger>
        <SelectContent>
          {accounts?.map((account) => (
            <SelectItem
              className="capitalize"
              key={account.id}
              value={account.id}
            >
              {account.name} <span className="ml-4">{account.balance}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.type === "transfer" && (
        <div className="flex w-full flex-col items-center justify-center gap-1">
          <Label>Transfer To</Label>
          <Select
            onValueChange={(value) => handleChange(value, "transfer")}
            defaultValue={value.transfer}
          >
            <SelectTrigger className="w-full capitalize">
              <SelectValue placeholder="Transfer to Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((account) => (
                <SelectItem
                  className={`${account.id === value.id && "hidden"} capitalize`}
                  key={account.id}
                  value={account.id}
                >
                  {account.name} <span className="ml-4">{account.balance}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Label>Description</Label>
      <Input
        value={value.description}
        onChange={(e) =>
          setValue((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
        placeholder="Enter a Description"
      />
      <Label>Amount</Label>
      <Input
        value={value.amount}
        onChange={(e) =>
          setValue((prev) => ({
            ...prev,
            amount: +e.target.value,
          }))
        }
        type="number"
        placeholder="10"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value.date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value.date ? format(value.date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value.date}
            onSelect={(e) => handleChange(e, "date")}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Select
        onValueChange={(value) => handleChange(value, "category")}
        defaultValue={value.category}
      >
        <SelectTrigger className="w-full capitalize">
          <SelectValue placeholder="Select a Category" />
        </SelectTrigger>
        <SelectContent>
          {value.type === "income" && (
            <>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="profits">Profits</SelectItem>
              <SelectItem value="loan">Loans</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
            </>
          )}
          {value.type === "expense" && (
            <>
              <SelectItem value="food & drinks">Food & Drinks</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="loan">Debts</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
            </>
          )}
          {categories?.map(
            (category) =>
              category && (
                <SelectItem className="capitalize" key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ),
          )}
        </SelectContent>
      </Select>
      <AddCategory userId={userId} />
      <Button disabled={loading ? true : false} onClick={handleSubmit}>
        Create
      </Button>
    </div>
  );
}
