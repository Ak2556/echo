'use client';

import React, { useState } from 'react';

interface UploadedFile {
  file_id: string;
  filename: string;
  size: number;
  uploaded_at: string;
}

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadedFiles([...uploadedFiles, data]);
        setSelectedFile(null);
      }
    } catch (error) {
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (fileId: string) => {
    window.open(`/api/files/download/${fileId}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">File Upload & Sharing</h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
        <input type="file" onChange={handleFileSelect} className="mb-4" />
        {selectedFile && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3">Uploaded Files</h3>
        {uploadedFiles.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet</p>
        ) : (
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li
                key={file.file_id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <p className="font-medium">{file.filename}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(file.file_id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
