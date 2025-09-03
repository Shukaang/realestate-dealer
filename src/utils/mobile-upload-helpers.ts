export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

export const checkMobileImageSupport = (): boolean => {
  // Check if device supports file input and FileReader
  return !!(window.File && window.FileReader && window.FileList && window.Blob)
}

export const optimizeImageForMobile = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // For mobile devices, we might want to compress large images
    if (file.size > 5 * 1024 * 1024 && isMobileDevice()) {
      // If image is larger than 5MB on mobile, we could implement compression
      // For now, just resolve with original file
      console.log("Large image detected on mobile device")
    }
    resolve(file)
  })
}

export const handleMobileFileInput = (input: HTMLInputElement, callback: (files: FileList) => void): void => {
  // Enhanced mobile file input handling
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      callback(target.files)
    }
  }

  // Remove existing listeners
  input.removeEventListener("change", handleChange)

  // Add new listener
  input.addEventListener("change", handleChange)

  // For mobile, also handle focus events to ensure proper behavior
  if (isMobileDevice()) {
    input.addEventListener("focus", () => {
      // Ensure input is ready for mobile interaction
      setTimeout(() => {
        input.click()
      }, 100)
    })
  }
}
