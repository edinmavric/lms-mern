import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import axios from 'axios';

export interface UploadSignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  storageKey: string;
}

export interface UploadFileResult {
  fileUrl: string;
  storageKey: string;
}

export const uploadsApi = {
  getSignedUrl: async (
    fileName: string,
    contentType: string
  ): Promise<UploadSignedUrlResponse> => {
    const { data } = await apiClient.get<UploadSignedUrlResponse>(
      API_ENDPOINTS.uploads.signedUrl,
      {
        params: { fileName, contentType },
      }
    );
    return data;
  },

  uploadFile: async (file: File): Promise<UploadFileResult> => {
    const { uploadUrl, fileUrl, storageKey } = await uploadsApi.getSignedUrl(
      file.name,
      file.type
    );

    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    return {
      fileUrl,
      storageKey,
    };
  },
};
