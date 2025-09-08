import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "./utils";

function MarkdownRenderer({
  className,
  content,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { content: string }) {
  return (
    <div
      data-slot="markdown-renderer"
      className={cn("prose max-w-none", className)}
      {...props}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export { MarkdownRenderer };
