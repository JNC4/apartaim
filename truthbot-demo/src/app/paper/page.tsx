import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readFileSync } from 'fs';
import { join } from 'path';

function getPaperContent(): string {
  const filePath = join(process.cwd(), 'public', 'data', 'paper.md');
  return readFileSync(filePath, 'utf-8');
}

export default function PaperPage() {
  const content = getPaperContent();

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-[720px] mx-auto px-6 py-12 paper-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight font-sans">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4 pb-2 border-b border-gray-200 font-sans">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-3 font-sans">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base font-semibold text-gray-700 mt-6 mb-2 font-sans">
                {children}
              </h4>
            ),
            p: ({ children }) => {
              const text = String(children);
              // Author line
              if (text.startsWith('Julius Chandler')) {
                return (
                  <p className="text-base text-gray-600 mb-1 font-sans">
                    {children}
                  </p>
                );
              }
              // "With Apart Research" line
              if (text.startsWith('With Apart Research')) {
                return (
                  <p className="text-sm text-gray-500 italic mb-6 font-sans">
                    {children}
                  </p>
                );
              }
              // Keywords line
              if (text.startsWith('Keywords:')) {
                return (
                  <p className="text-sm text-gray-500 mt-4 mb-2">
                    {children}
                  </p>
                );
              }
              return (
                <p className="text-base text-gray-700 leading-relaxed mb-4 paper-serif">
                  {children}
                </p>
              );
            },
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-4 space-y-1 text-base text-gray-700 paper-serif">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-4 space-y-1 text-base text-gray-700 paper-serif">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            hr: () => (
              <hr className="my-8 border-gray-200" />
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic paper-serif">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full text-sm border border-gray-300">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50 font-sans">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-gray-200">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="even:bg-gray-50">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-300">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-gray-700 border-b border-gray-200">
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
              >
                {children}
              </a>
            ),
            code: ({ children, className }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <code className="block bg-gray-50 border border-gray-200 p-4 text-sm text-gray-800 overflow-x-auto whitespace-pre font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <code className="bg-gray-100 px-1.5 py-0.5 text-sm text-gray-800 font-mono">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="my-4">{children}</pre>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </article>

      <style>{`
        .paper-serif {
          font-family: Georgia, 'Times New Roman', Times, serif;
        }
      `}</style>
    </div>
  );
}
