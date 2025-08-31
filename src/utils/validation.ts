/**
 * Form validation utilities
 * Provides common validation functions for app forms
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class FormValidator {
  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): ValidationResult {
    const errors: string[] = [];
    
    if (!phone.trim()) {
      errors.push('Phone number is required');
    } else {
      // Remove all non-digit characters for validation
      const digitsOnly = phone.replace(/\D/g, '');
      
      if (digitsOnly.length < 10) {
        errors.push('Phone number must be at least 10 digits');
      } else if (digitsOnly.length > 15) {
        errors.push('Phone number cannot exceed 15 digits');
      }
      
      // Check for valid format patterns
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        errors.push('Please enter a valid phone number format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate required text field
   */
  static validateRequiredText(text: string, fieldName: string, minLength = 1): ValidationResult {
    const errors: string[] = [];
    
    if (!text || !text.trim()) {
      errors.push(`${fieldName} is required`);
    } else if (text.trim().length < minLength) {
      errors.push(`${fieldName} must be at least ${minLength} characters`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate incident report form
   */
  static validateIncidentReport(formData: {
    title: string;
    description: string;
    type: string;
    severity: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    // Validate title
    const titleValidation = this.validateRequiredText(formData.title, 'Title', 3);
    if (!titleValidation.isValid) {
      errors.push(...titleValidation.errors);
    }
    
    // Validate description
    const descriptionValidation = this.validateRequiredText(formData.description, 'Description', 10);
    if (!descriptionValidation.isValid) {
      errors.push(...descriptionValidation.errors);
    }
    
    // Validate type
    const validTypes = ['injury', 'property_damage', 'near_miss', 'safety_violation', 'other'];
    if (!validTypes.includes(formData.type)) {
      errors.push('Please select a valid incident type');
    }
    
    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(formData.severity)) {
      errors.push('Please select a valid severity level');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate emergency contact form
   */
  static validateEmergencyContact(contact: {
    name: string;
    phoneNumber: string;
    relationship: string;
    email?: string;
  }): ValidationResult {
    const errors: string[] = [];
    
    // Validate name
    const nameValidation = this.validateRequiredText(contact.name, 'Name', 2);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    }
    
    // Validate phone number
    const phoneValidation = this.validatePhoneNumber(contact.phoneNumber);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }
    
    // Validate relationship
    const relationshipValidation = this.validateRequiredText(contact.relationship, 'Relationship');
    if (!relationshipValidation.isValid) {
      errors.push(...relationshipValidation.errors);
    }
    
    // Validate email if provided
    if (contact.email && contact.email.trim()) {
      const emailValidation = this.validateEmail(contact.email);
      if (!emailValidation.isValid) {
        errors.push(...emailValidation.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digitsOnly.length === 10) {
      return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    
    // Format with country code +X (XXX) XXX-XXXX
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
    }
    
    // Return original if format doesn't match expected patterns
    return phone;
  }

  /**
   * Sanitize text input
   */
  static sanitizeText(text: string): string {
    return text.trim().replace(/[<>]/g, ''); // Remove potential HTML/script tags
  }

  /**
   * Validate multiple fields and return combined result
   */
  static validateMultiple(validations: ValidationResult[]): ValidationResult {
    const allErrors = validations.reduce((acc, result) => {
      return acc.concat(result.errors);
    }, [] as string[]);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
}

/**
 * Hook for form validation
 */
export function useFormValidation() {
  const validateForm = (
    data: any,
    validationFn: (data: any) => ValidationResult
  ): ValidationResult => {
    return validationFn(data);
  };

  const showValidationErrors = (
    errors: string[],
    alertFn = (title: string, message: string) => console.error(title, message)
  ) => {
    if (errors.length > 0) {
      const message = errors.join('\n• ');
      alertFn('Validation Error', `Please fix the following issues:\n• ${message}`);
    }
  };

  return {
    validateForm,
    showValidationErrors,
    FormValidator
  };
}