// Function to validate donation inputs
export function validateDonation(data: any) {
    const errors: string[] = [];
    const { amount, recipient } = data;
  
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push('Invalid amount. It must be a positive number.');
    }
  
    if (!recipient || !/^.+@.+\..+$/.test(recipient)) { // Simple email validation
      errors.push('Invalid recipient. It must be a valid email address.');
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  // Function to validate NFT minting inputs (example)
  export function validateNFTMinting(data: any) {
    const errors: string[] = [];
    const { title, description, imageUrl } = data;
  
    if (!title || typeof title !== 'string' || title.length < 3) {
      errors.push('Title must be a string with at least 3 characters.');
    }
  
    if (!description || typeof description !== 'string' || description.length < 10) {
      errors.push('Description must be a string with at least 10 characters.');
    }
  
    if (!imageUrl || !/^https?:\/\/.*\.(jpeg|jpg|gif|png)$/.test(imageUrl)) {
      errors.push('Invalid image URL. It must be a valid image link.');
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  // Function to validate token transfer inputs (example)
  export function validateTokenTransfer(data: any) {
    const errors: string[] = [];
    const { amount, recipient, tokenId } = data;
  
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.push('Invalid amount. It must be a positive number.');
    }
  
    if (!recipient || !/^.+@.+\..+$/.test(recipient)) {
      errors.push('Invalid recipient. It must be a valid email address.');
    }
  
    if (!tokenId || typeof tokenId !== 'string') {
      errors.push('Invalid token ID. It must be a valid string.');
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  