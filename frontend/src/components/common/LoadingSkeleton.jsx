import React from 'react';

export function LoadingSkeleton({ className }) {
  return (
    <div className={`animate-pulse rounded-md bg-muted/65 ${className}`} />
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-4 p-4 border rounded-2xl bg-card">
      <LoadingSkeleton className="h-6 w-1/3" />
      <LoadingSkeleton className="h-32 w-full" />
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-5/6" />
        <LoadingSkeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="space-y-4 border rounded-2xl p-4 bg-card/60">
      <div className="flex justify-between items-center pb-2 border-b">
        <div className="flex gap-2">
          <LoadingSkeleton className="h-8 w-24" />
          <LoadingSkeleton className="h-8 w-32" />
        </div>
        <LoadingSkeleton className="h-8 w-20" />
      </div>
      <LoadingSkeleton className="h-[400px] w-full rounded-xl" />
    </div>
  );
}
