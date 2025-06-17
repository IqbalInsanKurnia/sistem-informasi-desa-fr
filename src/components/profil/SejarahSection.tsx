import { Card, CardContent } from "@/components/ui/card";

interface SejarahProps {
  namaDesa: string;
  sejarah: string;
}

export default function SejarahSection({ namaDesa, sejarah }: SejarahProps) {
  const parseSejarahText = (text: string) => {
    if (!text) return null;

    // First, check if text is already well-formatted (has multiple newlines)
    const hasFormatting = text.includes("\n\n") || text.split("\n").length > 3;

    if (hasFormatting) {
      const sections = text
        .split(/\n\s*\n/)
        .filter((section) => section.trim());

      return sections
        .map((section, sectionIndex) => {
          const lines = section.split("\n").filter((line) => line.trim());
          if (lines.length === 0) return null;

          const firstLine = lines[0].trim();
          const isTitle =
            firstLine === firstLine.toUpperCase() &&
            firstLine.length > 15 &&
            !/^\d+\./.test(firstLine);

          if (isTitle && lines.length > 1) {
            return (
              <div key={sectionIndex} className="mb-8 last:mb-0">
                <h4 className="mb-3 border-l-4 border-blue-600 pl-3 text-xl font-semibold text-slate-700 dark:text-slate-300">
                  {firstLine}
                </h4>
                <div className="ml-2 space-y-2">
                  {lines.slice(1).map((line, lineIndex) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;

                    if (/^\d+\./.test(trimmedLine)) {
                      return (
                        <div
                          key={lineIndex}
                          className="flex items-start gap-2 pl-4"
                        >
                          <span className="mt-1 min-w-[1.5rem] font-semibold text-blue-600 dark:text-blue-400">
                            {trimmedLine.match(/^\d+\./)?.[0]}
                          </span>
                          <p className="text-justify leading-relaxed text-slate-600 dark:text-slate-400">
                            {trimmedLine.replace(/^\d+\./, "").trim()}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <p
                        key={lineIndex}
                        className="pl-4 text-justify leading-relaxed text-slate-600 dark:text-slate-400"
                      >
                        {trimmedLine}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            const content = lines.join(" ").trim();
            if (!content) return null;

            if (/^\d+\./.test(content)) {
              return (
                <div
                  key={sectionIndex}
                  className="mb-3 flex items-start gap-2 last:mb-0"
                >
                  <span className="mt-1 min-w-[1.5rem] font-semibold text-blue-600 dark:text-blue-400">
                    {content.match(/^\d+\./)?.[0]}
                  </span>
                  <p className="text-justify leading-relaxed text-slate-600 dark:text-slate-400">
                    {content.replace(/^\d+\./, "").trim()}
                  </p>
                </div>
              );
            }
            return (
              <p
                key={sectionIndex}
                className="mb-4 text-justify leading-relaxed text-slate-600 last:mb-0 dark:text-slate-400"
              >
                {content}
              </p>
            );
          }
        })
        .filter(Boolean);
    } else {
      const cleanText = text.trim();
      const sentences = cleanText.split(
        /(?<=\.)\s+(?=[A-Z]|Pada|Dalam|Dengan|Berdasarkan|Selanjutnya|Kemudian|Atas|Merespon|Sejalan)/,
      );

      const paragraphs: string[] = [];
      let currentParagraph: string[] = [];
      let currentLength = 0;

      sentences.forEach((sentence) => {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) return;
        currentParagraph.push(trimmedSentence);
        currentLength += trimmedSentence.length;
        if (currentLength > 400 || currentParagraph.length >= 3) {
          paragraphs.push(currentParagraph.join(" "));
          currentParagraph = [];
          currentLength = 0;
        }
      });
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(" "));
      }

      return paragraphs.map((paragraph, index) => {
        const numberedListMatch = paragraph.match(
          /:\s*(\d+\.[^;]+(?:;\s*\d+\.[^;]+)*)/,
        );

        if (numberedListMatch && numberedListMatch.index !== undefined) {
          const beforeList = paragraph
            .substring(0, numberedListMatch.index + 1)
            .trim();
          const listItems = numberedListMatch[1].split(/;\s*(?=\d+\.)/);
          const afterList = paragraph
            .substring(numberedListMatch.index + numberedListMatch[0].length)
            .trim();

          return (
            <div key={index} className="mb-6 last:mb-0">
              {beforeList && (
                <p className="mb-3 text-justify leading-relaxed text-slate-600 dark:text-slate-400">
                  {beforeList}
                </p>
              )}
              <div className="ml-4 space-y-2">
                {listItems.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-2">
                    <span className="mt-1 min-w-[1.5rem] font-semibold text-blue-600 dark:text-blue-400">
                      {item.match(/^\d+\./)?.[0]}
                    </span>
                    <p className="text-justify leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.replace(/^\d+\./, "").trim()}
                    </p>
                  </div>
                ))}
              </div>
              {afterList && (
                <p className="mt-3 text-justify leading-relaxed text-slate-600 dark:text-slate-400">
                  {afterList}
                </p>
              )}
            </div>
          );
        }
        return (
          <p
            key={index}
            className="mb-4 text-justify leading-relaxed text-slate-600 last:mb-0 dark:text-slate-400"
          >
            {paragraph}
          </p>
        );
      });
    }
  };

  return (
    <section
      id="sejarah"
      className="w-full scroll-mt-20 bg-slate-50 py-16 md:py-24 dark:bg-slate-900"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl lg:text-5xl dark:text-slate-100">
            Sejarah {namaDesa}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600 sm:mt-4 dark:text-slate-400">
            Menelusuri jejak langkah dan peristiwa penting.
          </p>
          <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-blue-600"></div>
        </div>

        <Card className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-700/50">
          <CardContent className="p-6 sm:p-8 md:p-10">
            <div className="prose prose-slate dark:prose-invert prose-lg prose-headings:font-semibold prose-headings:text-slate-700 dark:prose-headings:text-slate-300 prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed prose-strong:text-slate-700 dark:prose-strong:text-slate-300 prose-bullets:text-blue-600 dark:prose-bullets:text-blue-400 prose-numeric:text-blue-600 dark:prose-numeric:text-blue-400 max-w-none max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 dark:scrollbar-thumb-slate-600 dark:scrollbar-track-slate-800">
              {parseSejarahText(sejarah)}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
