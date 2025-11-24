import { CLIENT_CONFIG } from "../config/chain";

/**
 * Test function to verify server connectivity
 * This can be called from browser console to debug connection issues
 */
export async function testServerConnection(): Promise<{
  success: boolean;
  error?: string;
  details?: any;
}> {
  if (!CLIENT_CONFIG.CLIENT_URL) {
    return {
      success: false,
      error: "CLIENT_URL is not set",
    };
  }

  // Determine URL with protocol
  let testUrl = CLIENT_CONFIG.CLIENT_URL;
  if (!testUrl.startsWith("http")) {
    const isLocalhost = 
      testUrl.includes("localhost") || 
      testUrl.includes("127.0.0.1");
    
    testUrl = isLocalhost 
      ? `http://${testUrl}` 
      : `https://${testUrl}`;
  }

  try {
    // Try a simple fetch to see if server responds
    // Circle API typically needs specific endpoints, so we'll test the base URL
    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Don't throw on error status codes, we want to see the response
    });

    const status = response.status;
    const contentType = response.headers.get("content-type");
    let body: any = null;

    try {
      const text = await response.text();
      if (text) {
        if (contentType?.includes("application/json")) {
          body = JSON.parse(text);
        } else {
          body = text.substring(0, 200); // First 200 chars
        }
      }
    } catch (e) {
      // Ignore parse errors
    }

    return {
      success: status >= 200 && status < 300,
      details: {
        url: testUrl,
        status,
        statusText: response.statusText,
        contentType,
        body,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: {
        url: testUrl,
      },
    };
  }
}

// Make it available globally for console debugging
if (typeof window !== "undefined") {
  (window as any).testServerConnection = testServerConnection;
  console.log(
    "💡 Debug tip: Run 'await testServerConnection()' in console to test server connectivity"
  );
}

