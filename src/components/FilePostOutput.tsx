'use client';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

type FileType = {
  fileKey: string;
  fileUrl: string;
};

interface FilePostOutputProps {
  files: FileType[];
}

const FilePostOutput = ({ files }: FilePostOutputProps) => {
  let docs = [];

  for (let i = 0; i < files.length; i++) {
    docs.push({
      uri: files[i].fileUrl,
      fileType: files[i].fileUrl.split('.').pop(),
    });
  }

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const DocViewer = dynamic(() => import('@cyntler/react-doc-viewer'), {
    ssr: false,
  });

  return (
    <div className="w-full">
      {mounted && (
        <div className="min-w-full">
          {
            // @ts-ignore
            <DocViewer
              documents={docs}
              // make pdf full screen

              // make it full width
              className="w-full min-h-[500px]"
              config={{
                header: {
                  retainURLParams: true,
                },
              }}
              // fullscreen option

              // disable download
            />
          }
        </div>
      )}
    </div>
  );
};

export default FilePostOutput;
