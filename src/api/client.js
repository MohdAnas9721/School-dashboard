const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  getSummary: () => apiRequest("/api/dashboard/summary"),
  getFees: (params = "") => apiRequest(`/api/fees${params ? `?${params}` : ""}`),
  createFee: (payload) =>
    apiRequest("/api/fees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getTeachers: () => apiRequest("/api/teachers"),
  getTeacherById: (teacherId) => apiRequest(`/api/teachers/${teacherId}`),
  addTeacher: (payload) =>
    apiRequest("/api/teachers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTeacher: (teacherId, payload) =>
    apiRequest(`/api/teachers/${teacherId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  generateTeacherId: (schoolName) =>
    apiRequest("/api/teachers/generate-id", {
      method: "POST",
      body: JSON.stringify({ schoolName }),
    }),
  getStudents: () => apiRequest("/api/students"),
  generateStudentId: (schoolName, className) =>
    apiRequest("/api/students/generate-id", {
      method: "POST",
      body: JSON.stringify({ schoolName, className }),
    }),
  addStudent: (payload) =>
    apiRequest("/api/students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateStudent: (studentId, payload) =>
    apiRequest(`/api/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  getFiles: (limit = 30) => apiRequest(`/api/files?limit=${limit}`),
};
