import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Tag,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: 'completed' | 'pending' | 'failed';
  tags: string[];
}

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2024-12-15'),
    description: 'Samsung Galaxy S24 Sale',
    amount: 75000,
    type: 'income',
    category: 'Mobile Sales',
    status: 'completed',
    tags: ['electronics', 'smartphone', 'samsung']
  },
  {
    id: '2',
    date: new Date('2024-12-14'),
    description: 'Store Rent Payment',
    amount: 25000,
    type: 'expense',
    category: 'Rent',
    status: 'completed',
    tags: ['fixed-cost', 'monthly']
  },
  {
    id: '3',
    date: new Date('2024-12-13'),
    description: 'iPhone 15 Pro Sale',
    amount: 120000,
    type: 'income',
    category: 'Mobile Sales',
    status: 'completed',
    tags: ['electronics', 'smartphone', 'apple', 'premium']
  },
  {
    id: '4',
    date: new Date('2024-12-12'),
    description: 'Electricity Bill',
    amount: 8500,
    type: 'expense',
    category: 'Utilities',
    status: 'pending',
    tags: ['utilities', 'monthly', 'fixed-cost']
  },
  {
    id: '5',
    date: new Date('2024-12-11'),
    description: 'Xiaomi Phone Sale',
    amount: 18000,
    type: 'income',
    category: 'Mobile Sales',
    status: 'completed',
    tags: ['electronics', 'smartphone', 'xiaomi', 'budget']
  }
];

interface FilterState {
  search: string;
  dateRange: { from?: Date; to?: Date };
  type: string;
  category: string;
  status: string;
  amountRange: { min: string; max: string };
  tags: string[];
}

export function AdvancedSearchFilter() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: {},
    type: 'all',
    category: 'all',
    status: 'all',
    amountRange: { min: '', max: '' },
    tags: []
  });

  const [savedSearches, setSavedSearches] = useState<string[]>([
    'High value sales this month',
    'Pending payments',
    'Samsung electronics'
  ]);

  // Extract unique values for filter options
  const categories = ['all', ...Array.from(new Set(sampleTransactions.map(t => t.category)))];
  const allTags = Array.from(new Set(sampleTransactions.flatMap(t => t.tags)));

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return sampleTransactions.filter(transaction => {
      // Search filter
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase()) &&
          !transaction.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from && transaction.date < filters.dateRange.from) return false;
      if (filters.dateRange.to && transaction.date > filters.dateRange.to) return false;

      // Type filter
      if (filters.type !== 'all' && transaction.type !== filters.type) return false;

      // Category filter
      if (filters.category !== 'all' && transaction.category !== filters.category) return false;

      // Status filter
      if (filters.status !== 'all' && transaction.status !== filters.status) return false;

      // Amount range filter
      if (filters.amountRange.min && transaction.amount < Number(filters.amountRange.min)) return false;
      if (filters.amountRange.max && transaction.amount > Number(filters.amountRange.max)) return false;

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => transaction.tags.includes(tag))) return false;

      return true;
    });
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      dateRange: {},
      type: 'all',
      category: 'all',
      status: 'all',
      amountRange: { min: '', max: '' },
      tags: []
    });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const saveCurrentSearch = () => {
    const searchName = prompt('Enter a name for this search:');
    if (searchName) {
      setSavedSearches(prev => [...prev, searchName]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="modern-card">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions, descriptions, tags..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={saveCurrentSearch}>
              Save Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Saved Searches:</p>
              <div className="flex gap-2 flex-wrap">
                {savedSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => setFilters(prev => ({ ...prev, search }))}
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card className="modern-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amount Range</label>
            <div className="flex gap-2">
              <Input
                placeholder="Min amount"
                value={filters.amountRange.min}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amountRange: { ...prev.amountRange, min: e.target.value }
                }))}
                type="number"
              />
              <span className="flex items-center text-muted-foreground">to</span>
              <Input
                placeholder="Max amount"
                value={filters.amountRange.max}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  amountRange: { ...prev.amountRange, max: e.target.value }
                }))}
                type="number"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? format(filters.dateRange.from, 'PPP') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.from}
                    onSelect={(date) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, from: date }
                    }))}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.to ? format(filters.dateRange.to, 'PPP') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange.to}
                    onSelect={(date) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, to: date }
                    }))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="space-y-2">
              {filters.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {filters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {allTags.filter(tag => !filters.tags.includes(tag)).map(tag => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6"
                    onClick={() => addTag(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="modern-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Search Results ({filteredTransactions.length})
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  transaction.type === 'income' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium">{transaction.description}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{format(transaction.date, 'PPP')}</span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        transaction.status === 'completed' && "border-success/20 text-success",
                        transaction.status === 'pending' && "border-warning/20 text-warning",
                        transaction.status === 'failed' && "border-destructive/20 text-destructive"
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={cn(
                  "font-medium",
                  transaction.type === 'income' ? "text-success" : "text-destructive"
                )}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                </div>
                <div className="flex gap-1 mt-1">
                  {transaction.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {transaction.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{transaction.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No transactions found matching your search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}