const convertPsdToJpg = (buffer) => {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Create image from buffer
        const blob = new Blob([buffer]);
        const img = new Image();
        img.src = URL.createObjectURL(blob);
        
        img.onload = () => {
          // Set canvas dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image and convert to JPG
          ctx.drawImage(img, 0, 0);
          const jpgData = canvas.toDataURL('image/jpeg', 0.9);
          resolve(jpgData);
          
          // Cleanup
          URL.revokeObjectURL(img.src);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
      } catch (error) {
        reject(error);
      }
    });
  };
  
  export default convertPsdToJpg;