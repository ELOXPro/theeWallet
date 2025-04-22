"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CalendarIcon, Edit } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { AddCategory } from "../category/addCategory";

interface SignUpFormProps {
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
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

export function EditTransaction({
  id,
  userId,
}: {
  userId: string;
  id: string;
}) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  if (width >= 768) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="m-1 h-full w-auto py-1">
            <Edit size={6} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Transaction </DialogTitle>
          </DialogHeader>
          <ProfileForm userId={userId} id={id} setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="m-1 h-full w-full py-1">
          <Edit size={6} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Update Transaction</DrawerTitle>
        </DrawerHeader>
        <ProfileForm userId={userId} id={id} setOpen={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ userId, setOpen, id }: SignUpFormProps) {
  const utils = api.useUtils();
  const { data: transaction } = api.transaction.load.useQuery(id);
  const [value, setValue] = useState<Transaction>({
    id: transaction ? transaction.accountId : "",
    description: transaction ? transaction.description : "",
    type: transaction ? transaction.type : "",
    amount: transaction ? transaction.amount : 0,
    category: transaction ? transaction.category : "",
    date: transaction ? transaction.date : new Date(),
    transfer: "",
  });
  const [loading, setLoading] = useState(false);
  const { data: accounts } = api.account.list.useQuery(userId);
  const { data: categories } = api.user.listCategories.useQuery({
    userId,
    type: value.type,
  });
  const updateTransaction = api.transaction.edit.useMutation({
    onSuccess: (data) => {
      if (data.result.includes("Updated")) {
        toast.success(data.result, { duration: 1000 });
        setOpen(false);
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
      id: id,
      accountId: value.id,
      type: value.type,
      description: value.description,
      date: value.date,
      category: value.category,
      amount: value.amount,
      transfer: value.transfer,
    };
    setLoading(true);
    void updateTransaction.mutate(fields);
  }

  useEffect(() => {
    if (transaction) {
      setValue({
        id: transaction.accountId,
        description: transaction.description,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        transfer: "",
      });
    }
  }, [transaction, id]);

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
                <SelectItem
                  className="capitalize"
                  key={category.id}
                  value={category.name}
                >
                  {category.name}
                </SelectItem>
              ),
          )}
        </SelectContent>
      </Select>
      <AddCategory userId={userId} />
      <Button disabled={loading ? true : false} onClick={handleSubmit}>
        Update
      </Button>
    </div>
  );
}
