import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AxiosError } from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback;

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const responseData = axiosError?.response?.data;

  if (responseData) {
    return responseData.message ?? responseData.error ?? fallback;
  }

  return fallback;
}

export function getMaterialUrl(material: {
  url?: string;
  storageKey?: string;
}): string | undefined {
  if (material.storageKey) {
    const bucketName =
      import.meta.env.VITE_S3_BUCKET_NAME || 'faks-lms-2025';
    const region = import.meta.env.VITE_S3_REGION || 'eu-north-1';
    return `https://${bucketName}.s3.${region}.amazonaws.com/${material.storageKey}`;
  }
  return material.url;
}
