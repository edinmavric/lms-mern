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

    try {
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });
    } catch (error: any) {
      if (error.response) {
        console.error('S3 error:', error.response.status, error.response.data);
      } else {
        console.error('Network error:', error.message);
      }
      throw error;
    }

    return {
      fileUrl,
      storageKey,
    };
  },
};
