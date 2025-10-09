import validator from 'validator';

/**
 * Input Sanitizer Class
 * Cung cấp các phương thức để làm sạch và validate user inputs
 */
export class InputSanitizer {
  /**
   * Làm sạch HTML content, loại bỏ script và các tag độc hại
   * @param input - HTML string cần làm sạch
   * @returns HTML string đã được làm sạch
   */
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Simple HTML sanitization without DOMPurify for server-side compatibility
    let sanitized = input
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove event handlers
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:/gi, '')
      // Remove data: URLs (except safe ones)
      .replace(/data:(?!image\/[png|jpg|jpeg|gif|svg])[^;]*;base64,([A-Za-z0-9+/=]+)/gi, '')
      // Escape remaining dangerous characters
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized;
  }

  /**
   * Làm sạch text thường, escape các ký tự đặc biệt
   * @param input - Text string cần làm sạch
   * @returns Text string đã được escape
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Trim whitespace và escape HTML entities
    return validator.escape(input.trim());
  }

  /**
   * Validate và normalize email
   * @param email - Email string
   * @returns Email đã được normalize
   * @throws Error nếu email không hợp lệ
   */
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      throw new Error('Email không được để trống');
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    if (!validator.isEmail(trimmedEmail)) {
      throw new Error('Email không hợp lệ');
    }

    // Normalize email (loại bỏ dots trong Gmail, etc.)
    return validator.normalizeEmail(trimmedEmail) || trimmedEmail;
  }

  /**
   * Validate và làm sạch số điện thoại
   * @param phone - Phone string
   * @returns Phone đã được làm sạch
   * @throws Error nếu phone không hợp lệ
   */
  static sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Số điện thoại không được để trống');
    }

    // Loại bỏ tất cả ký tự không phải số, dấu +, dấu -, dấu (), khoảng trắng
    const cleanPhone = phone.replace(/[^\d+\-\(\)\s]/g, '');
    
    // Loại bỏ khoảng trắng
    const trimmedPhone = cleanPhone.replace(/\s/g, '');
    
    // Validate phone number (Việt Nam và international)
    if (!validator.isMobilePhone(trimmedPhone, 'any', { strictMode: false })) {
      throw new Error('Số điện thoại không hợp lệ');
    }

    return trimmedPhone;
  }

  /**
   * Làm sạch URL
   * @param url - URL string
   * @returns URL đã được validate và làm sạch
   * @throws Error nếu URL không hợp lệ
   */
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') return '';
    
    const trimmedUrl = url.trim();
    
    if (trimmedUrl && !validator.isURL(trimmedUrl, { 
      protocols: ['http', 'https', 'ftp'],
      require_protocol: false,
      require_valid_protocol: true
    })) {
      throw new Error('URL không hợp lệ');
    }

    return trimmedUrl;
  }

  /**
   * Làm sạch và validate username
   * @param username - Username string
   * @returns Username đã được làm sạch
   * @throws Error nếu username không hợp lệ
   */
  static sanitizeUsername(username: string): string {
    if (!username || typeof username !== 'string') {
      throw new Error('Username không được để trống');
    }

    const trimmedUsername = username.trim();
    
    // Chỉ cho phép chữ cái, số, dấu gạch dưới, dấu gạch ngang
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      throw new Error('Username chỉ được chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang');
    }

    if (trimmedUsername.length < 3) {
      throw new Error('Username phải có ít nhất 3 ký tự');
    }

    if (trimmedUsername.length > 30) {
      throw new Error('Username không được vượt quá 30 ký tự');
    }

    return trimmedUsername.toLowerCase();
  }

  /**
   * Làm sạch password (chỉ validate độ dài, không lưu trữ)
   * @param password - Password string
   * @returns Password đã được validate
   * @throws Error nếu password không hợp lệ
   */
  static sanitizePassword(password: string): string {
    if (!password || typeof password !== 'string') {
      throw new Error('Password không được để trống');
    }

    const trimmedPassword = password.trim();
    
    if (trimmedPassword.length < 3) {
      throw new Error('Password phải có ít nhất 3 ký tự');
    }

    if (trimmedPassword.length > 128) {
      throw new Error('Password không được vượt quá 128 ký tự');
    }

    return trimmedPassword;
  }

  /**
   * Làm sạch JSON object (recursive)
   * @param input - Object hoặc array cần làm sạch
   * @returns Object/array đã được làm sạch
   */
  static sanitizeJson(input: any): any {
    if (input === null || input === undefined) {
      return input;
    }

    if (typeof input === 'string') {
      return this.sanitizeText(input);
    }

    if (typeof input === 'number' || typeof input === 'boolean') {
      return input;
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeJson(item));
    }

    if (typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        const cleanKey = this.sanitizeText(key);
        sanitized[cleanKey] = this.sanitizeJson(value);
      }
      return sanitized;
    }

    return input;
  }

  /**
   * Làm sạch array of strings (cho support categories, tags, etc.)
   * @param input - Array of strings
   * @returns Array đã được làm sạch
   */
  static sanitizeStringArray(input: any[]): string[] {
    if (!Array.isArray(input)) {
      return [];
    }

    return input
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => this.sanitizeText(item.trim()))
      .filter(item => item.length > 0);
  }

  /**
   * Validate và làm sạch số nguyên
   * @param input - String hoặc number
   * @returns Number đã được validate
   * @throws Error nếu không phải số hợp lệ
   */
  static sanitizeInteger(input: string | number): number {
    if (typeof input === 'number') {
      if (!Number.isInteger(input)) {
        throw new Error('Phải là số nguyên');
      }
      return input;
    }

    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!validator.isInt(trimmed)) {
        throw new Error('Phải là số nguyên hợp lệ');
      }
      return parseInt(trimmed, 10);
    }

    throw new Error('Giá trị không hợp lệ');
  }

  /**
   * Validate và làm sạch số thập phân
   * @param input - String hoặc number
   * @returns Number đã được validate
   * @throws Error nếu không phải số hợp lệ
   */
  static sanitizeFloat(input: string | number): number {
    if (typeof input === 'number') {
      return input;
    }

    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!validator.isFloat(trimmed)) {
        throw new Error('Phải là số hợp lệ');
      }
      return parseFloat(trimmed);
    }

    throw new Error('Giá trị không hợp lệ');
  }
}

/**
 * Helper function để sanitize contact form data
 */
export function sanitizeContactData(data: any) {
  try {
    return {
      name: InputSanitizer.sanitizeText(data.name),
      email: InputSanitizer.sanitizeEmail(data.email),
      phone: data.phone ? InputSanitizer.sanitizePhone(data.phone) : '',
      company: InputSanitizer.sanitizeText(data.company),
      message: InputSanitizer.sanitizeText(data.message), // Sanitize text content
      type: InputSanitizer.sanitizeText(data.type),
      notes: InputSanitizer.sanitizeStringArray(data.notes || [])
    };
  } catch (error) {
    throw new Error(`Lỗi validate dữ liệu: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function để sanitize event data
 */
export function sanitizeEventData(data: any) {
  try {
    return {
      title: InputSanitizer.sanitizeText(data.title),
      description: InputSanitizer.sanitizeHtml(data.description),
      location: InputSanitizer.sanitizeText(data.location),
      onlineLink: data.onlineLink ? InputSanitizer.sanitizeUrl(data.onlineLink) : null,
      capacity: InputSanitizer.sanitizeInteger(data.capacity),
      price: InputSanitizer.sanitizeInteger(data.price),
      category: InputSanitizer.sanitizeText(data.category),
      requirements: data.requirements ? InputSanitizer.sanitizeText(data.requirements) : null,
      agenda: data.agenda ? InputSanitizer.sanitizeHtml(data.agenda) : null,
      speakers: data.speakers ? InputSanitizer.sanitizeJson(data.speakers) : null
    };
  } catch (error) {
    throw new Error(`Lỗi validate dữ liệu sự kiện: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function để sanitize admin credentials
 */
export function sanitizeAdminCredentials(data: any) {
  try {
    return {
      username: InputSanitizer.sanitizeUsername(data.username),
      password: InputSanitizer.sanitizePassword(data.password)
    };
  } catch (error) {
    throw new Error(`Lỗi validate thông tin admin: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
