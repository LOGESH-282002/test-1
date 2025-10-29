export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateName = (name) => {
  return name && name.trim().length >= 2
}

export const validateNote = (title, content) => {
  const errors = {}
  
  if (!title || title.trim().length < 1) {
    errors.title = 'Title is required'
  }
  
  if (title && title.trim().length > 500) {
    errors.title = 'Title must be less than 500 characters'
  }
  
  // Content can be empty for notes (unlike blog posts)
  if (content && content.length > 50000) {
    errors.content = 'Content must be less than 50,000 characters'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Keep the old function for backward compatibility
export const validateBlogPost = validateNote

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}