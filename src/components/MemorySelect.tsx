import { useState } from "react";
import { capitalize } from "lodash";

interface MemoryItem {
  score: number;
  page_content: string;
  metadata: {
    docstring?: string;
    source: string;
    name?: string;
    when: number;
  };
}

interface MemoryResult {
  [collectionName: string]: MemoryItem[];
}

interface MemorySelectProps {
  result: MemoryResult;
}

export default function MemorySelect({ result }: MemorySelectProps) {
  const [selectedCollection, setSelectedCollection] =
    useState<string>("episodic");

  const collections = Object.keys(result);

  const selectedItems = result[selectedCollection] || [];

  return (
    <div className="flex w-full flex-col gap-6 rounded-lg bg-base-100 p-4">
      <div className="flex flex-wrap justify-center gap-2">
        {collections.map((col) => (
          <button
            key={col}
            className={`btn btn-xs rounded-full ${
              selectedCollection === col
                ? "btn-primary text-base-100"
                : "btn-ghost !border-2 !border-primary"
            }`}
            onClick={() => setSelectedCollection(col)}
          >
            {col}
          </button>
        ))}
      </div>

      {selectedItems.length > 0 ? (
        <>
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="indicator flex w-full flex-col gap-2 rounded-md bg-base-200 p-2"
            >
              <span className="indicator-center badge indicator-item badge-success font-medium text-base-100">
                {item.score}
              </span>

              <p className="mt-2">
                {item.metadata.docstring
                  ? item.metadata.docstring
                  : item.page_content}
              </p>

              <div className="flex justify-between gap-2 text-xs font-medium text-primary">
                <p>
                  {capitalize(item.metadata.source)}
                  {item.metadata.name && ` (${item.metadata.name})`}
                </p>
                <p>{new Date(item.metadata.when * 1000).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </>
      ) : (
        <p className="text-center font-medium">
          No <span className="text-primary">{selectedCollection}</span> memories
          were used.
        </p>
      )}
    </div>
  );
}
