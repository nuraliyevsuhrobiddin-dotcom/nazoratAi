import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getPlaces = async () => {
  try {
    const response = await api.get('/places');
    return response.data;
  } catch (error) {
    console.warn("API unavailable, using mock data.", error);
    // Return advanced mock data if backend fails
    return [
      { 
        id: 1, 
        name: "Chilonzor hokimiyati", 
        lat: 41.2825, 
        lng: 69.2133, 
        score: 85, 
        category: "Boshqaruv",
        issue: "Yashirin to'lovlar va qarorlar uchun pul talab qilish", 
        complaints: 12,
        status: "Tekshirilmoqda",
        trust_score: 88,
        ai_explanation: "Ko‘p sonli takroriy murojaatlar va korrupsiya kalit so‘zlari qayd etilganligi sababli xavf darajasi yuqori baholandi."
      },
      { 
        id: 2, 
        name: "Yunusobod tuman sudi", 
        lat: 41.3650, 
        lng: 69.2886, 
        score: 45, 
        category: "Sud-huquq",
        issue: "Uzoq navbatlar va sun'iy byurokratiya", 
        complaints: 34,
        status: "Qabul qilindi",
        trust_score: 72,
        ai_explanation: "Jarayonlarning kechikishi yuzasidan shikoyatlar o'rta xavf tug'dirmoqda."
      },
      { 
        id: 3, 
        name: "Mirzo Ulug'bek DSI", 
        lat: 41.3283, 
        lng: 69.3330, 
        score: 65, 
        category: "Moliya",
        issue: "Soliq tekshiruvida asossiz ayblovlar", 
        complaints: 8,
        status: "Tekshirilmoqda",
        trust_score: 55,
        ai_explanation: "Moliya yo'nalishidagi murojaatlarda 'tekshiruv' va 'jarima' kalit so'zlari orqali o'rta-yuqori xavf belgilandi."
      },
      { 
        id: 4, 
        name: "Sergeli bojxona posti", 
        lat: 41.2133, 
        lng: 69.2272, 
        score: 92, 
        category: "Bojxona",
        issue: "Tovarlarni o'tkazish uchun ochiqdan-ochiq pora so'rash", 
        complaints: 56,
        status: "Hal qilindi",
        trust_score: 95,
        ai_explanation: "Aynan bitta turdagi jinoyat bo'yicha ko'plab mustaqil foydalanuvchilardan bir xil murojaat tushgan. Kritik holat."
      },
      { 
        id: 5, 
        name: "112-sonli maktab", 
        lat: 41.3050, 
        lng: 69.2600, 
        score: 25, 
        category: "Ta'lim",
        issue: "Maktab fondiga majburiy pul yig'ish", 
        complaints: 3,
        status: "Qabul qilindi",
        trust_score: 45,
        ai_explanation: "Alohida kichik holatlar, risk past, lekin e'tibor talab qiladi."
      },
      { 
        id: 6, 
        name: "Shahar 1-sonli klinik shifoxonasi", 
        lat: 41.3120, 
        lng: 69.2750, 
        score: 78, 
        category: "Tibbiyot",
        issue: "Bepul dori vositalarini pullik sotish", 
        complaints: 21,
        status: "Tekshirilmoqda",
        trust_score: 82,
        ai_explanation: "Tibbiyot muassasasida tizimli noqonuniy holat ehtimoli bor."
      }
    ];
  }
};

export const submitReport = async (formData) => {
  try {
    const response = await api.post('/report', formData);
    return response.data;
  } catch (error) {
    console.error("Failed to submit report", error);
    const detail = error.response?.data?.detail;
    const translateBackendMessage = (message = '') => {
      if (message === 'Field required') return 'Bu maydon majburiy';
      if (message.includes('Input should be a valid number')) return "Raqamli qiymat noto'g'ri kiritilgan";
      if (message.includes('Description must be at least 10 characters')) return 'Iltimos, muammoni kamida 10 ta belgidan iborat qilib yozing';
      return message;
    };

    if (Array.isArray(detail)) {
      throw new Error(detail.map((item) => translateBackendMessage(item.msg)).join(', '), { cause: error });
    }
    throw new Error(translateBackendMessage(detail || error.message || "Backend bilan aloqa bo'lmadi"), { cause: error });
  }
};

export const loginAdmin = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getReports = async (token) => {
  const response = await api.get('/reports', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateReportStatus = async (id, status, token) => {
  const response = await api.patch(
    `/report/${id}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const downloadReportFile = async (reportId, fileId, token) => {
  const response = await api.get(`/report/${reportId}/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'blob',
  });
  return response.data;
};
