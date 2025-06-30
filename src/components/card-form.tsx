'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { PlusCircle, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CreditCard } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCustomLists } from '@/hooks/use-custom-lists';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';

const cardFormSchema = z.object({
  provider: z.string().min(1, 'Provider is required.'),
  network: z.string().min(1, 'Network is required.'),
  cardName: z.string().min(2, 'Card name is required.'),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  limit: z.coerce.number().min(0, 'Limit must be a positive number.'),
  currency: z.string().min(2, 'Currency is required.'),
  annualFee: z.coerce.number().min(0, 'Fee must be a positive number.').default(0),
  apr: z.coerce.number().min(0, 'APR must be a positive number.').max(100, 'APR seems too high.').default(0),
  dueDate: z.coerce.number().min(1, 'Day is required.').max(31, 'Invalid day.'),
  statementDate: z.coerce.number().min(1, 'Day is required.').max(31, 'Invalid day.'),
  enableAlerts: z.boolean().default(true),
  perks: z.array(z.string()).default([]),
  benefits: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(2, 'Benefit name is required.'),
      value: z.coerce.number().min(0, 'Value must be positive.'),
      type: z.enum(['cashback', 'points']),
    })
  ),
});

type CardFormValues = z.infer<typeof cardFormSchema>;

interface CardFormProps {
  card?: CreditCard;
  onSave: (data: Omit<CreditCard, 'id'>) => Promise<void> | void;
  onDone: () => void;
}

export function CardForm({ card, onSave, onDone }: CardFormProps) {
  const { toast } = useToast();
  const { providers, networks, perks } = useCustomLists();

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      provider: card?.provider || '',
      network: card?.network || '',
      cardName: card?.cardName || '',
      imageUrl: card?.imageUrl || '',
      limit: card?.limit || 0,
      currency: card?.currency || 'USD',
      annualFee: card?.annualFee || 0,
      apr: card?.apr || 0,
      dueDate: card?.dueDate,
      statementDate: card?.statementDate,
      enableAlerts: card?.enableAlerts ?? true,
      perks: card?.perks || [],
      benefits: card?.benefits || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'benefits',
  });

  const provider = form.watch('provider');
  const cardName = form.watch('cardName');

  const handleFindImage = () => {
    const query = encodeURIComponent(`${provider} ${cardName} credit card`);
    const url = `https://www.google.com/search?tbm=isch&q=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  async function onSubmit(data: CardFormValues) {
    const saveData = {
        ...data,
        imageUrl: data.imageUrl || undefined,
    }
    await onSave(saveData);
    toast({
      title: `Card ${card ? 'updated' : 'added'}`,
      description: `Your card "${data.cardName}" has been saved.`,
    })
    onDone();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Sapphire Preferred" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provider</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Network</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a network" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {networks.map((n) => (
                      <SelectItem key={n.id} value={n.name}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Limit</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 10000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="annualFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Fee</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 95" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="apr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>APR (%)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 21.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Image URL</FormLabel>
                   <div className="flex items-center gap-2">
                    <FormControl>
                        <Input placeholder="https://example.com/image.png" {...field} />
                    </FormControl>
                    <Button type="button" variant="secondary" onClick={handleFindImage} disabled={!provider && !cardName}>
                        <Search className="h-4 w-4 md:mr-2"/>
                        <span className="hidden md:inline">Find</span>
                    </Button>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Day of Month</FormLabel>
                 <Select onValueChange={(v) => field.onChange(parseInt(v, 10))} defaultValue={field.value ? String(field.value) : undefined}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="statementDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statement Day of Month</FormLabel>
                 <Select onValueChange={(v) => field.onChange(parseInt(v, 10))} defaultValue={field.value ? String(field.value) : undefined}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator/>

        <FormField
            control={form.control}
            name="perks"
            render={({ field }) => (
                <FormItem>
                     <h3 className="text-lg font-medium mb-2">Perks</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {perks.map((perk) => (
                            <FormField
                                key={perk.id}
                                control={form.control}
                                name="perks"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={perk.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(perk.name)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...field.value, perk.name])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== perk.name
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal text-sm">
                                            {perk.name}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                            />
                        ))}
                     </div>
                     <FormMessage/>
                </FormItem>
            )}
        />

        <Separator/>

        <div>
            <h3 className="text-lg font-medium mb-4">Quantitative Rewards (Cashback/Points)</h3>
            <div className="space-y-4">
                 {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-end p-4 border rounded-md relative">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                             <FormField
                                control={form.control}
                                name={`benefits.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Reward Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Dining" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={form.control}
                                name={`benefits.${index}.value`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Value</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={form.control}
                                name={`benefits.${index}.type`}
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="cashback">Cashback (%)</SelectItem>
                                        <SelectItem value="points">Points (x)</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4"/>
                            <span className="sr-only">Remove benefit</span>
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: crypto.randomUUID(), name: '', value: 0, type: 'cashback' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Reward
                </Button>
            </div>
        </div>
        
        <Separator/>

        <FormField
          control={form.control}
          name="enableAlerts"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Due Date Alerts</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
            <Button type="submit">{card ? 'Update' : 'Add'} Card</Button>
        </div>
      </form>
    </Form>
  );
}
