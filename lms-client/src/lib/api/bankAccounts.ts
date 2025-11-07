import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type { BankAccount } from '../../types';

export interface CreateBankAccountData {
  accountHolderName: string;
  bankName?: string;
  iban: string;
  swiftCode?: string;
  currency?: 'EUR' | 'USD' | 'GBP' | 'RSD' | 'CHF' | 'JPY' | 'AUD' | 'CAD';
  isPrimary?: boolean;
}

export interface UpdateBankAccountData {
  accountHolderName?: string;
  bankName?: string;
  iban?: string;
  swiftCode?: string;
  currency?: 'EUR' | 'USD' | 'GBP' | 'RSD' | 'CHF' | 'JPY' | 'AUD' | 'CAD';
  isPrimary?: boolean;
}

export interface BankAccountListParams {
  isPrimary?: boolean;
  currency?: 'EUR' | 'USD' | 'GBP' | 'RSD' | 'CHF' | 'JPY' | 'AUD' | 'CAD';
}

export const bankAccountsApi = {
  list: async (params?: BankAccountListParams): Promise<BankAccount[]> => {
    const { data } = await apiClient.get<BankAccount[]>(
      API_ENDPOINTS.bankAccounts.list,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<BankAccount> => {
    const { data } = await apiClient.get<BankAccount>(
      API_ENDPOINTS.bankAccounts.detail(id)
    );
    return data;
  },

  create: async (
    bankAccountData: CreateBankAccountData
  ): Promise<BankAccount> => {
    const { data } = await apiClient.post<BankAccount>(
      API_ENDPOINTS.bankAccounts.create,
      bankAccountData
    );
    return data;
  },

  update: async (
    id: string,
    bankAccountData: UpdateBankAccountData
  ): Promise<BankAccount> => {
    const { data } = await apiClient.put<BankAccount>(
      API_ENDPOINTS.bankAccounts.update(id),
      bankAccountData
    );
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete<{ message: string }>(
      API_ENDPOINTS.bankAccounts.delete(id)
    );
    return data;
  },
};
