import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useModal } from '@/hooks/modal'
import { Modals } from '@/store/slices/modals'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetMiningAssignmentDetailQuery } from '@/queries/mining/use-mining-assignment-detail-query'
import { cn } from '@/utils/tw'
import { motion } from 'framer-motion'
import { AlertCircle, Code2, Eye } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export function AssignmentDetailModal() {
  const { open, data, closeModal } = useModal(Modals.ASSIGNMENT_DETAILS)

  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={closeModal}>
      <DialogContent className="grid-cols-1 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Result</DialogTitle>
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
  const [markdownMode, setMarkdownMode] = useState<'text' | 'preview'>('preview')

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icon icon="LoaderCircle" className="size-8 animate-spin text-white/40" />
          <p className="text-14 text-white/60">Loading assignment details...</p>
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
            <p className="text-16 mb-2 font-medium text-white">Failed to load assignment details</p>
            <p className="text-14 text-white/60">
              {error?.message || 'An error occurred while fetching the data'}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
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
                    '# No content available\n\nThe scraped content for this assignment is not available.'
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
              <div className="prose prose-invert max-w-none flex-1 overflow-auto p-6 break-words">
                {markdownContent ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ ...props }) => (
                        <h1 className="text-24 mt-6 mb-4 font-bold text-white" {...props} />
                      ),
                      h2: ({ ...props }) => (
                        <h2 className="text-20 mt-5 mb-3 font-semibold text-white" {...props} />
                      ),
                      h3: ({ ...props }) => (
                        <h3 className="text-18 mt-4 mb-2 font-semibold text-white" {...props} />
                      ),
                      p: ({ ...props }) => (
                        <p className="text-14 mb-4 leading-relaxed text-white/90" {...props} />
                      ),
                      a: ({ ...props }) => (
                        <a
                          className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => (
                        <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />
                      ),
                      ol: ({ ...props }) => (
                        <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />
                      ),
                      li: ({ ...props }) => <li className="text-14 text-white/90" {...props} />,
                      code: ({ className, children, ...props }) => {
                        const inline = !className
                        return inline ? (
                          <code
                            className="text-13 rounded bg-white/10 px-1.5 py-0.5 font-mono text-white"
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
                          className="mb-4 overflow-x-auto rounded-lg bg-white/5 p-4"
                          {...props}
                        />
                      )
                    }}
                  >
                    {markdownContent}
                  </ReactMarkdown>
                ) : (
                  <div className="text-center">
                    <p className="text-14 font-medium text-white/80">No content available</p>
                    <p className="text-12 mt-1 text-white/60">
                      The scraped content for this assignment is not available.
                    </p>
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
