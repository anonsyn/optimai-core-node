import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetMiningAssignmentDetailQuery } from '@/queries/mining/use-mining-assignment-detail-query'
import { cn } from '@/utils/tw'
import { motion } from 'framer-motion'
import { AlertCircle, Code2, Eye, X } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export function AssignmentDetailModal() {
  const { open, data, closeModal } = useModal(Modals.ASSIGNMENT_DETAILS)

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="grid-cols-1 sm:max-w-4xl">
        <DialogClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Assignment Details</DialogTitle>
          {data.sourceUrl && (
            <DialogDescription className="truncate">{data.sourceUrl}</DialogDescription>
          )}
        </DialogHeader>
        <AssignmentDetailContent assignmentId={data.assignmentId} />
      </DialogContent>
    </Dialog>
  )
}

interface AssignmentDetailContentProps {
  assignmentId: string
}

const AssignmentDetailContent = ({ assignmentId }: AssignmentDetailContentProps) => {
  const {
    data: assignment,
    isLoading,
    isError,
    error,
    refetch
  } = useGetMiningAssignmentDetailQuery(assignmentId)
  const [markdownMode, setMarkdownMode] = useState<'text' | 'preview'>('text')

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="LoaderCircle" className="size-8 animate-spin text-white/40" />
          <p className="text-14 text-white/60">Loading details...</p>
        </div>
      </div>
    )
  }

  if (isError || !assignment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="size-12 text-red-500/60" />
          <div className="text-center">
            <p className="text-16 mb-2 font-medium text-white">We couldn’t load the details</p>
            <p className="text-14 text-white/60">{error?.message || 'Something went wrong.'}</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Try again
          </Button>
        </div>
      </div>
    )
  }

  // Extract markdown content from result (the actual scraped content)
  const markdownContent = assignment.result?.content || ''

  // Create full JSON object including result
  const jsonContent = JSON.stringify(assignment.result, null, 2)

  return (
    <div className="flex flex-col pt-6">
      <Tabs defaultValue="markdown" className="w-full">
        <TabsList className="w-fit justify-start">
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="markdown" className="mt-4">
          <div className="flex max-h-[520px] flex-col overflow-hidden rounded-lg border border-white/5 bg-white/[0.02]">
            <div className="flex items-center border-b border-white/5 bg-white/[0.04] px-4 py-1.5">
              <div className="bg-background/30 flex overflow-hidden rounded-lg">
                <button
                  onClick={() => setMarkdownMode('text')}
                  className="text-12 relative flex h-8 min-w-20 items-center justify-center gap-1 px-2"
                >
                  <Code2 className="mr-1.5 size-3.5" />
                  <span>Text</span>
                  {markdownMode === 'text' && (
                    <motion.span
                      className="absolute inset-0.5 rounded-lg bg-white/10"
                      layoutId="markdown-mode"
                    />
                  )}
                </button>
                <button
                  onClick={() => setMarkdownMode('preview')}
                  className="text-12 relative flex h-8 min-w-20 items-center justify-center gap-1 px-2"
                >
                  <Eye className="mr-1.5 size-3.5" />
                  <span>Preview</span>
                  {markdownMode === 'preview' && (
                    <motion.span
                      className="absolute inset-0.5 rounded-lg bg-white/10"
                      layoutId="markdown-mode"
                    />
                  )}
                </button>
              </div>
            </div>
            {markdownMode === 'text' ? (
              <div className="w-full flex-1 overflow-x-auto overflow-y-auto">
                <Highlight
                  theme={themes.vsDark}
                  code={
                    markdownContent ||
                    '# No content available\n\nThe content for this assignment isn’t available.'
                  }
                  language="markdown"
                >
                  {({ className, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className={cn(className, 'min-w-max p-4')}
                      style={{
                        ...style,
                        margin: 0,
                        background: 'transparent',
                        fontSize: '13px',
                        lineHeight: '1.6',
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'
                      }}
                    >
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            ) : (
              <div className="max-w-none flex-1 overflow-auto p-6 break-words">
                {markdownContent ? (
                  <div className="markdown-content">
                    <ReactMarkdown
                      components={{
                        h1: ({ ...props }) => (
                          <h1
                            className="text-28 mt-8 mb-6 border-b border-white/10 pb-3 font-bold text-white first:mt-0"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-22 mt-7 mb-4 border-b border-white/5 pb-2 font-semibold text-white first:mt-0"
                            {...props}
                          />
                        ),
                        h3: ({ ...props }) => (
                          <h3
                            className="text-18 mt-6 mb-3 font-semibold text-white first:mt-0"
                            {...props}
                          />
                        ),
                        h4: ({ ...props }) => (
                          <h4
                            className="text-16 mt-5 mb-2 font-semibold text-white/95 first:mt-0"
                            {...props}
                          />
                        ),
                        p: ({ ...props }) => (
                          <p className="text-15 mb-5 leading-7 text-white/85" {...props} />
                        ),
                        a: ({ ...props }) => (
                          <a
                            className="text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition-colors hover:text-blue-300 hover:decoration-blue-300/60"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul className="mb-5 ml-6 space-y-2.5 text-white/85" {...props} />
                        ),
                        ol: ({ ...props }) => (
                          <ol className="mb-5 ml-6 space-y-2.5 text-white/85" {...props} />
                        ),
                        li: ({ children, ...props }) => (
                          <li className="text-15 pl-2 leading-7" {...props}>
                            <span className="inline-block">{children}</span>
                          </li>
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote
                            className="my-5 border-l-4 border-white/20 bg-white/5 py-3 pr-4 pl-5 text-white/75 italic"
                            {...props}
                          />
                        ),
                        code: ({ className, children, ...props }) => {
                          const inline = !className
                          return inline ? (
                            <code
                              className="text-13 rounded bg-white/10 px-1.5 py-0.5 font-mono text-yellow-300/90 before:content-[''] after:content-['']"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className={cn('text-13', className)} {...props}>
                              {children}
                            </code>
                          )
                        },
                        pre: ({ ...props }) => (
                          <pre
                            className="text-14 mb-5 overflow-x-auto rounded-lg border border-white/10 bg-white/5 p-4 leading-6"
                            {...props}
                          />
                        ),
                        hr: () => <hr className="my-8 border-t border-white/10" />,
                        table: ({ ...props }) => (
                          <div className="my-5 overflow-x-auto">
                            <table
                              className="text-14 w-full border-collapse text-white/85"
                              {...props}
                            />
                          </div>
                        ),
                        thead: ({ ...props }) => <thead className="bg-white/5" {...props} />,
                        tbody: ({ ...props }) => <tbody {...props} />,
                        tr: ({ ...props }) => <tr className="border-b border-white/5" {...props} />,
                        th: ({ ...props }) => (
                          <th className="px-4 py-3 text-left font-semibold text-white" {...props} />
                        ),
                        td: ({ ...props }) => <td className="px-4 py-3 text-white/85" {...props} />,
                        img: ({ ...props }) => (
                          <img className="my-5 max-w-full rounded-lg" {...props} />
                        ),
                        strong: ({ ...props }) => (
                          <strong className="font-semibold text-white" {...props} />
                        ),
                        em: ({ ...props }) => <em className="text-white/90 italic" {...props} />
                      }}
                    >
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-14 font-medium text-white/80">No content available</p>
                    <p className="text-12 mt-1 text-white/60">The content isn’t available.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <div className="max-h-[520px] overflow-x-auto overflow-y-auto rounded-lg border border-white/5 bg-white/[0.02]">
            <Highlight theme={themes.vsDark} code={jsonContent} language="json">
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                  className={cn(className, 'min-w-max p-4')}
                  style={{
                    ...style,
                    margin: 0,
                    background: 'transparent',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    whiteSpace: 'pre'
                  }}
                >
                  {tokens.map((line, i) => (
                    <div key={i} {...getLineProps({ line })}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  ))}
                </pre>
              )}
            </Highlight>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
