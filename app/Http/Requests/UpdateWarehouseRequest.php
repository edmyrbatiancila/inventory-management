<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateWarehouseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $warehouseId = $this->route('warehouse') ?? $this->route('id');

        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:warehouses,code,' . $warehouseId,
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean'
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */

    public function messages(): array
    {
        return [
            'name.required' => 'The warehouse name is required.',
            'code.unique' => 'The warehouse code has already been taken.',
            'address.required' => 'The warehouse address is required.',
            'city.required' => 'The city is required.',
            'state.required' => 'The state is required.',
            'postal_code.required' => 'The postal code is required.',
            'country.required' => 'The country is required.',
            'email.email' => 'Please provide a valid email address.'
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_acive', true)
        ]);
    }
}
