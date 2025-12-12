/**
 * Utility functions for loading and displaying certificates
 */

/**
 * Get a certificate HTML content from localStorage
 * @param certificateName - The name/title of the certificate
 * @returns The HTML content or null if not found
 */
export const getCertificateFromStorage = (certificateName: string): string | null => {
  const storageKey = `certificate_${certificateName.replace(/\s+/g, "_")}`;
  return localStorage.getItem(storageKey);
};

/**
 * Get all saved certificate names
 * @returns Array of certificate names
 */
export const getAllCertificates = (): string[] => {
  const certificatesList = JSON.parse(localStorage.getItem("certificates_list") || "[]");
  return certificatesList;
};

/**
 * Load a certificate from the public folder
 * @param filename - The filename in public/certificates/ folder
 * @returns Promise with HTML content
 */
export const loadCertificateFromPublic = async (filename: string): Promise<string> => {
  try {
    const response = await fetch(`/certificates/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load certificate: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error loading certificate from public folder:", error);
    throw error;
  }
};

/**
 * Save certificate HTML to localStorage
 * @param certificateName - The name/title of the certificate
 * @param htmlContent - The HTML content
 */
export const saveCertificate = (certificateName: string, htmlContent: string): void => {
  const storageKey = `certificate_${certificateName.replace(/\s+/g, "_")}`;
  localStorage.setItem(storageKey, htmlContent);
  
  // Update certificates list
  const certificatesList = JSON.parse(localStorage.getItem("certificates_list") || "[]");
  if (!certificatesList.includes(certificateName)) {
    certificatesList.push(certificateName);
    localStorage.setItem("certificates_list", JSON.stringify(certificatesList));
  }
};

/**
 * Delete a certificate from storage
 * @param certificateName - The name/title of the certificate
 */
export const deleteCertificate = (certificateName: string): void => {
  const storageKey = `certificate_${certificateName.replace(/\s+/g, "_")}`;
  localStorage.removeItem(storageKey);
  
  // Update certificates list
  const certificatesList = JSON.parse(localStorage.getItem("certificates_list") || "[]");
  const updatedList = certificatesList.filter((name: string) => name !== certificateName);
  localStorage.setItem("certificates_list", JSON.stringify(updatedList));
};

