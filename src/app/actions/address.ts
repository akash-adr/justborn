'use server';

import { serverAddressService, AddressInput } from '@/lib/services/server/addressService';
import { CustomerAddress } from '@/lib/types';
import { ServiceResult } from '@/lib/services/server/cartService';
import { revalidatePath } from 'next/cache';

export async function getAddressesAction(): Promise<ServiceResult<CustomerAddress[]>> {
  return serverAddressService.getUserAddresses();
}

export async function addAddressAction(input: AddressInput): Promise<ServiceResult<CustomerAddress>> {
  const result = await serverAddressService.addUserAddress(input);
  if (result.success) {
    revalidatePath('/checkout');
    revalidatePath('/account');
  }
  return result;
}

export async function updateAddressAction(
  addressId: string,
  input: Partial<AddressInput>
): Promise<ServiceResult<CustomerAddress>> {
  const result = await serverAddressService.updateUserAddress(addressId, input);
  if (result.success) {
    revalidatePath('/checkout');
    revalidatePath('/account');
  }
  return result;
}

export async function deleteAddressAction(addressId: string): Promise<ServiceResult<{ id: string }>> {
  const result = await serverAddressService.deleteUserAddress(addressId);
  if (result.success) {
    revalidatePath('/checkout');
    revalidatePath('/account');
  }
  return result;
}

export async function setDefaultAddressAction(addressId: string): Promise<ServiceResult<CustomerAddress>> {
  const result = await serverAddressService.setDefaultAddress(addressId);
  if (result.success) {
    revalidatePath('/checkout');
    revalidatePath('/account');
  }
  return result;
}
