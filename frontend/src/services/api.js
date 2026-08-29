const API_BASE_URL = "http://127.0.0.1:8000";

export async function analyzeSession(videoBlob) {
  const formData = new FormData();

  formData.append(
    "file",
    videoBlob,
    "interview.webm"
  );

  const response = await fetch(
    `${API_BASE_URL}/analyze-session`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Analysis failed: ${response.status} ${errorText}`
    );
  }

  return await response.json();
}