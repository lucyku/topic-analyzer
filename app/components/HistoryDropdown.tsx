'use client'

import { useHistory } from '@/lib/HistoryContext';

export function HistoryDropdown() {
  const { searchHistory, isLoading } = useHistory();
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  return (
    <DropdownMenuContent 
      align="end" 
      className="w-[90vw] max-w-[500px] md:w-[500px]"
    >
      <DropdownMenuLabel>Search History</DropdownMenuLabel>
      
      {isLoading && searchHistory.length === 0 ? (
        <DropdownMenuItem disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading history...
        </DropdownMenuItem>
      ) : searchHistory.length > 0 ? (
        searchHistory.map((item) => (
          <div key={item.id} className="animate-none"> {/* Prevent animation */}
            <DropdownMenuItem
              className="flex flex-col items-start cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                if (!expandedHistoryId || expandedHistoryId !== item.id) {
                  setExpandedHistoryId(item.id);
                }
              }}
            >
              {/* ... rest of your history item UI ... */}
            </DropdownMenuItem>
          </div>
        ))
      ) : (
        <DropdownMenuItem disabled>
          No search history
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  );
} 