import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { CustomerAddress } from '@/lib/types';
import { ServiceResult } from './cartService';

export interface AddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

function mapDbAddressToCustomerAddress(row: any): CustomerAddress {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phone: row.phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country || 'India',
    isDefault: !!row.is_default,
    createdAt: row.created_at,
  };
}

export const serverAddressService = {
  /**
   * Fetch all saved addresses for the authenticated user.
   */
  async getUserAddresses(): Promise<ServiceResult<CustomerAddress[]>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to access saved addresses.',
        };
      }

      const supabase: any = await createClient();

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching addresses from Supabase:', error);
        return {
          success: false,
          error: 'DATABASE_ERROR',
          message: 'Failed to retrieve saved addresses.',
        };
      }

      return {
        success: true,
        data: (data || []).map(mapDbAddressToCustomerAddress),
      };
    } catch (err: any) {
      console.error('Unexpected error in getUserAddresses:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Add a new shipping address for the authenticated user.
   */
  async addUserAddress(input: AddressInput): Promise<ServiceResult<CustomerAddress>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to save an address.',
        };
      }

      // Validate required fields
      if (!input.fullName?.trim() || !input.phone?.trim() || !input.addressLine1?.trim() || !input.city?.trim() || !input.state?.trim() || !input.postalCode?.trim()) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Please fill in all required address fields.',
        };
      }

      const supabase: any = await createClient();

      // If set as default, remove default flag from other addresses
      if (input.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          address_line1: input.addressLine1.trim(),
          address_line2: input.addressLine2?.trim() || null,
          city: input.city.trim(),
          state: input.state.trim(),
          postal_code: input.postalCode.trim(),
          country: input.country?.trim() || 'India',
          is_default: !!input.isDefault,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error inserting address:', error);
        return {
          success: false,
          error: 'INSERT_FAILED',
          message: 'Failed to save address.',
        };
      }

      return {
        success: true,
        data: mapDbAddressToCustomerAddress(data),
        message: 'Address saved successfully.',
      };
    } catch (err: any) {
      console.error('Unexpected error in addUserAddress:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Edit an existing address for the authenticated user.
   */
  async updateUserAddress(
    addressId: string,
    input: Partial<AddressInput>
  ): Promise<ServiceResult<CustomerAddress>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to edit an address.',
        };
      }

      const supabase: any = await createClient();

      // Verify ownership
      const { data: existing, error: checkError } = await supabase
        .from('addresses')
        .select('id')
        .eq('id', addressId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError || !existing) {
        return {
          success: false,
          error: 'NOT_FOUND',
          message: 'Address not found or access denied.',
        };
      }

      if (input.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const updatePayload: any = {};
      if (input.fullName !== undefined) updatePayload.full_name = input.fullName.trim();
      if (input.phone !== undefined) updatePayload.phone = input.phone.trim();
      if (input.addressLine1 !== undefined) updatePayload.address_line1 = input.addressLine1.trim();
      if (input.addressLine2 !== undefined) updatePayload.address_line2 = input.addressLine2?.trim() || null;
      if (input.city !== undefined) updatePayload.city = input.city.trim();
      if (input.state !== undefined) updatePayload.state = input.state.trim();
      if (input.postalCode !== undefined) updatePayload.postal_code = input.postalCode.trim();
      if (input.country !== undefined) updatePayload.country = input.country.trim();
      if (input.isDefault !== undefined) updatePayload.is_default = input.isDefault;

      const { data, error } = await supabase
        .from('addresses')
        .update(updatePayload)
        .eq('id', addressId)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating address:', error);
        return {
          success: false,
          error: 'UPDATE_FAILED',
          message: 'Failed to update address.',
        };
      }

      return {
        success: true,
        data: mapDbAddressToCustomerAddress(data),
        message: 'Address updated successfully.',
      };
    } catch (err: any) {
      console.error('Unexpected error in updateUserAddress:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Delete an address, verifying ownership.
   */
  async deleteUserAddress(addressId: string): Promise<ServiceResult<{ id: string }>> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You must be signed in to delete an address.',
        };
      }

      const supabase: any = await createClient();

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting address:', error);
        return {
          success: false,
          error: 'DELETE_FAILED',
          message: 'Failed to delete address.',
        };
      }

      return {
        success: true,
        data: { id: addressId },
        message: 'Address deleted successfully.',
      };
    } catch (err: any) {
      console.error('Unexpected error in deleteUserAddress:', err);
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
      };
    }
  },

  /**
   * Set an address as the default address for the user.
   */
  async setDefaultAddress(addressId: string): Promise<ServiceResult<CustomerAddress>> {
    return this.updateUserAddress(addressId, { isDefault: true });
  },
};
