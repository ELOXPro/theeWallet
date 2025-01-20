"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { CalendarIcon, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";

interface SignUpFormProps {
  userId: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  id: string;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  amount: z.coerce.number(),
});

export function EditBudget({ id, userId }: { userId: string; id: string }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  if (width >= 768) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-auto m-1 h-full py-1">
            <Edit size={6} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Budget </DialogTitle>
          </DialogHeader>
          <ProfileForm userId={userId} id={id} setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full m-1 h-full py-1">
          <Edit size={6} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Update Budget</DrawerTitle>
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
  const { data: budget } = api.account.loadBudget.useQuery(id);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: budget && budget.budget ? budget.budget.name : "",
      amount: budget && budget.budget ? budget.budget.amount : 0,
    },
  });
  const { data: categories } = api.user.listCategories.useQuery({
    userId,
    type: "expense",
  });
  const updateBudget = api.account.updateBudget.useMutation({
    onSuccess: (data) => {
      if (data.result.includes("Updated")) {
        toast.success(data.result, { duration: 1000 });
        setLoading(false);
        setOpen(false);
        utils.invalidate();
      } else {
        toast.error(data.result, { duration: 1000 });
        setLoading(false);
      }
    },
  });
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(budget && budget.budget ? budget.budget.category : "");
  const [date, setDate] = useState<Date | undefined>(budget && budget.budget ? budget.budget.startDate : undefined);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const fields = {
      name: values.name,
      amount: values.amount,
      category: value,
      userId: userId as string,
      date: date ? date : new Date(),
      id,
    };
    updateBudget.mutate(fields);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-4 overflow-auto p-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Budget Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Budget Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter Amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Select onValueChange={(value) => setValue(value)} defaultValue={value}>
          <SelectTrigger className="w-full capitalize">
            <SelectValue placeholder="Select Budget Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="food & drinks">Food & Drinks</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="loan">Debts</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a Starting Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(e) => setDate(e)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Button disabled={loading ? true : false} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
