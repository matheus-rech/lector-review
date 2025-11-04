import { useState, useEffect } from "react";
import {
  useSearch,
  usePdf,
  usePdfJump,
  calculateHighlightRects,
  SearchResult,
} from "@anaralabs/lector";
import { useDebounce } from "use-debounce";

interface ResultItemProps {
  result: SearchResult;
  originalSearchText: string;
  type: "exact" | "fuzzy";
}

const ResultItem = ({ result, originalSearchText, type }: ResultItemProps) => {
  const { jumpToHighlightRects } = usePdfJump();
  const getPdfPageProxy = usePdf((state) => state.getPdfPageProxy);

  const onClick = async () => {
    try {
      const pageProxy = getPdfPageProxy(result.pageNumber);
      const rects = await calculateHighlightRects(pageProxy, {
        pageNumber: result.pageNumber,
        text: result.text,
        matchIndex: result.matchIndex,
        searchText: originalSearchText, // Pass searchText for exact term highlighting
      });
      jumpToHighlightRects(rects, "pixels");
    } catch (error) {
      console.error("Error highlighting search result:", error);
    }
  };

  return (
    <div
      className="p-2 cursor-pointer hover:bg-blue-50 border-b last:border-b-0"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-blue-700">Page {result.pageNumber}</div>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            type === "exact"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {type === "exact" ? "✓ Exact" : "≈ Fuzzy"}
        </span>
      </div>
      <div className="text-gray-600 text-xs truncate">
        {result.text?.substring(0, 60) || "Match found"}...
      </div>
    </div>
  );
};

export function SearchUI() {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText] = useDebounce(searchText, 500);
  const { searchResults: results, search } = useSearch();

  useEffect(() => {
    if (debouncedSearchText) {
      search(debouncedSearchText, { limit: 50 });
    }
  }, [debouncedSearchText, search]);

  const totalMatches =
    results.exactMatches.length + results.fuzzyMatches.length;

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold">Search</label>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search in PDF..."
        className="w-full border p-1 rounded text-sm"
        aria-label="Search in PDF"
      />

      {totalMatches > 0 && (
        <>
          <div className="text-xs text-gray-600">
            {totalMatches} {totalMatches === 1 ? "match" : "matches"} found
          </div>

          <div className="max-h-40 overflow-y-auto border rounded text-xs bg-white">
            {results.exactMatches.length > 0 && (
              <>
                {results.exactMatches.map((result, index) => (
                  <ResultItem
                    key={`exact-${result.pageNumber}-${result.matchIndex}-${index}`}
                    result={result}
                    originalSearchText={searchText}
                    type="exact"
                  />
                ))}
              </>
            )}

            {results.fuzzyMatches.length > 0 && (
              <>
                {results.fuzzyMatches.map((result, index) => (
                  <ResultItem
                    key={`fuzzy-${result.pageNumber}-${result.matchIndex}-${index}`}
                    result={result}
                    originalSearchText={searchText}
                    type="fuzzy"
                  />
                ))}
              </>
            )}
          </div>

          {totalMatches > 10 && (
            <div className="text-xs text-center text-gray-500 italic">
              Showing first 10 of {totalMatches} results
            </div>
          )}
        </>
      )}

      {searchText && totalMatches === 0 && (
        <div className="text-xs text-center text-gray-500 py-2">
          No results found
        </div>
      )}
    </div>
  );
}
