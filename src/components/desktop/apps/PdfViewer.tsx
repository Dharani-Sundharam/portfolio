'use client'

// Simple in-window PDF viewer with a Win7-ish toolbar: Download + Open in new tab.
export default function PdfViewer({
  src,
  download = 'Dharani_Sundharam_CV.pdf',
}: {
  src: string
  download?: string
}) {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#525659]">
      {/* toolbar */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gradient-to-b from-[#f6f6f6] to-[#e7e7e7] border-b border-slate-300 font-win7 text-[12px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/win7/icons/pdf.png" alt="" className="w-4 h-4" />
        <span className="font-medium text-slate-700 truncate">{download}</span>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={src}
            download={download}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded font-medium text-white bg-gradient-to-b from-[#6cb1ec] to-[#2f80c0] border border-[#2a6ba3] shadow-sm hover:brightness-105 active:brightness-95"
          >
            ⤓ Download
          </a>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-slate-700 bg-gradient-to-b from-white to-slate-100 border border-slate-300 hover:from-slate-50 hover:to-slate-200"
          >
            ↗ Open in tab
          </a>
        </div>
      </div>

      {/* the document */}
      <iframe src={`${src}#toolbar=0`} title={download} className="flex-1 w-full border-0" />
    </div>
  )
}
