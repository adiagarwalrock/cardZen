'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useSpendingHabits } from '@/hooks/use-spending-habits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCustomLists } from '@/hooks/use-custom-lists';
import { Badge } from '@/components/ui/badge';
import { useSafeSpend } from '@/hooks/use-safe-spend';
import { Slider } from '@/components/ui/slider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useAlertSettings } from '@/hooks/use-alert-settings';

const settingsSchema = z.object({
  habits: z.array(
    z.object({
      id: z.string(),
      category: z.string().min(2, 'Category name is required.'),
      amount: z.coerce.number().min(0, 'Amount must be positive.'),
    })
  ),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const defaultCategories = ['Groceries', 'Dining', 'Travel', 'Shopping', 'Gas', 'Entertainment'];

export default function SettingsPage() {
  const { habits, saveHabits, isLoaded: habitsLoaded } = useSpendingHabits();
  const { 
    safeSpendPercentage, 
    saveSafeSpendPercentage, 
    isLoaded: safeSpendLoaded 
  } = useSafeSpend();
  
  const { 
    providers, addProvider, deleteProvider, 
    networks, addNetwork, deleteNetwork,
    perks, addPerk, deletePerk
  } = useCustomLists();
  
  const { userName, saveUserName, isLoaded: userLoaded } = useUserProfile();
  const { alertDays, saveAlertDays, isLoaded: alertsLoaded } = useAlertSettings();

  const { toast } = useToast();
  const [newProvider, setNewProvider] = useState('');
  const [newNetwork, setNewNetwork] = useState('');
  const [newPerk, setNewPerk] = useState('');
  const [spendLimit, setSpendLimit] = useState(safeSpendPercentage);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentAlertDays, setCurrentAlertDays] = useState(alertDays);
  const [greeting, setGreeting] = useState('');

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      habits: [],
    },
  });

  useEffect(() => {
    if (habitsLoaded) {
      if(habits.length > 0) {
        form.reset({ habits });
      } else {
        form.reset({
            habits: defaultCategories.map(category => ({
                id: crypto.randomUUID(),
                category,
                amount: 0
            }))
        })
      }
    }
  }, [habitsLoaded, form, habits]);

   useEffect(() => {
    if (safeSpendLoaded) {
      setSpendLimit(safeSpendPercentage);
    }
  }, [safeSpendLoaded, safeSpendPercentage]);

   useEffect(() => {
    if (userLoaded) {
      setCurrentUserName(userName);
    }
  }, [userLoaded, userName]);

  useEffect(() => {
    if (alertsLoaded) {
      setCurrentAlertDays(alertDays);
    }
  }, [alertsLoaded, alertDays]);

  useEffect(() => {
    const hour = new Date().getHours();
    let timeOfDay = '';
    if (hour < 12) {
      timeOfDay = 'Good morning';
    } else if (hour < 18) {
      timeOfDay = 'Good afternoon';
    } else {
      timeOfDay = 'Good evening';
    }
    const namePart = userName ? `, ${userName}` : '';
    setGreeting(`${timeOfDay}${namePart}!`);
  }, [userName]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'habits',
  });

  const onSubmit = (data: SettingsFormValues) => {
    saveHabits(data.habits);
    toast({
      title: 'Settings Saved',
      description: 'Your spending habits have been updated.',
    });
  };

  const handleAddProvider = () => {
    addProvider(newProvider);
    setNewProvider('');
  };

  const handleAddNetwork = () => {
    addNetwork(newNetwork);
    setNewNetwork('');
  };

  const handleAddPerk = () => {
    addPerk(newPerk);
    setNewPerk('');
  };

  const handleSaveSpendLimit = () => {
    saveSafeSpendPercentage(spendLimit);
    toast({
        title: 'Settings Saved',
        description: 'Your safe spend limit has been updated.',
    })
  }

  const handleSaveProfile = () => {
    saveUserName(currentUserName);
    toast({
      title: 'Profile Saved',
      description: 'Your name has been updated.',
    });
  };

  const handleSaveAlerts = () => {
    saveAlertDays(currentAlertDays);
    toast({
      title: 'Settings Saved',
      description: 'Your alert preferences have been updated.',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground">Manage your settings and preferences.</p>
      </div>

       <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Personalize your experience.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel htmlFor="username">Your Name</FormLabel>
                      <Input 
                        id="username"
                        placeholder="Enter your name"
                        value={currentUserName}
                        onChange={(e) => setCurrentUserName(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveProfile}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Name
                    </Button>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>Set your due date alert preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <FormLabel>Alert me {currentAlertDays} {currentAlertDays === 1 ? 'day' : 'days'} before due date</FormLabel>
                        <Slider
                            value={[currentAlertDays]}
                            onValueChange={(value) => setCurrentAlertDays(value[0])}
                            max={30}
                            step={1}
                        />
                    </div>
                    <Button onClick={handleSaveAlerts}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Alert Settings
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Safe Spend Limit</CardTitle>
            <CardDescription>Set a target credit utilization percentage to maintain a healthy credit score.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Slider
                        value={[spendLimit]}
                        onValueChange={(value) => setSpendLimit(value[0])}
                        max={100}
                        step={1}
                        className="flex-1"
                    />
                    <div className="w-20 text-center text-lg font-semibold">{spendLimit}%</div>
                </div>
                 <Button onClick={handleSaveSpendLimit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Limit
                </Button>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending Habits</CardTitle>
          <CardDescription>
            Provide your average monthly spending to help the AI make better recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <FormField
                      control={form.control}
                      name={`habits.${index}.category`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`habits.${index}.amount`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ id: crypto.randomUUID(), category: '', amount: 0 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Habits
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Providers</CardTitle>
            <CardDescription>Add or remove credit card providers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New provider name"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  onKeyDown={(e) => {if (e.key === 'Enter') { e.preventDefault(); handleAddProvider();}}}
                />
                <Button onClick={handleAddProvider} aria-label="Add provider">
                  <PlusCircle />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {providers.map((provider) => (
                  <Badge key={provider.id} variant="secondary" className="group text-sm inline-flex items-center">
                    {provider.name}
                    <button onClick={() => deleteProvider(provider.id)} className="ml-2 rounded-full p-0.5 hover:bg-muted-foreground/20 opacity-50 group-hover:opacity-100" aria-label={`Remove ${provider.name}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Networks</CardTitle>
            <CardDescription>Add or remove card networks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New network name"
                  value={newNetwork}
                  onChange={(e) => setNewNetwork(e.target.value)}
                  onKeyDown={(e) => {if (e.key === 'Enter') { e.preventDefault(); handleAddNetwork();}}}
                />
                <Button onClick={handleAddNetwork} aria-label="Add network">
                  <PlusCircle />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {networks.map((network) => (
                  <Badge key={network.id} variant="secondary" className="group text-sm inline-flex items-center">
                    {network.name}
                    <button onClick={() => deleteNetwork(network.id)} className="ml-2 rounded-full p-0.5 hover:bg-muted-foreground/20 opacity-50 group-hover:opacity-100" aria-label={`Remove ${network.name}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Manage Perks</CardTitle>
            <CardDescription>Add or remove common card perks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New perk name"
                  value={newPerk}
                  onChange={(e) => setNewPerk(e.target.value)}
                  onKeyDown={(e) => {if (e.key === 'Enter') { e.preventDefault(); handleAddPerk();}}}
                />
                <Button onClick={handleAddPerk} aria-label="Add perk">
                  <PlusCircle />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {perks.map((perk) => (
                  <Badge key={perk.id} variant="secondary" className="group text-sm inline-flex items-center">
                    {perk.name}
                    <button onClick={() => deletePerk(perk.id)} className="ml-2 rounded-full p-0.5 hover:bg-muted-foreground/20 opacity-50 group-hover:opacity-100" aria-label={`Remove ${perk.name}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
