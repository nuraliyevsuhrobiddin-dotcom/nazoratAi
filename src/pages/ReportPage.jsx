import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Crosshair,
  File as FileIcon,
  Mail,
  MapPin,
  Mic,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '../utils/cn';
import { submitReport } from '../services/api';

const customMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #6366F1; width: 22px; height: 22px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.9); box-shadow: 0 0 20px #6366F1;"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_FILE_PREFIXES = ['image/', 'video/', 'audio/'];
const KEYWORDS = ['pora', 'pul', 'navbat'];

const categories = [
  { label: 'Umumiy', value: 'Umumiy' },
  { label: "Ta'lim", value: "Ta'lim" },
  { label: "Sog'liqni saqlash", value: 'Tibbiyot' },
  { label: 'Sud', value: 'Sud-huquq' },
  { label: 'Bojxona', value: 'Bojxona' },
  { label: 'Moliya', value: 'Moliya' },
  { label: 'Boshqaruv', value: 'Boshqaruv' },
  { label: 'Transport', value: 'Transport' },
];

const steps = [
  { id: 1, title: 'Tashkilot', subtitle: 'Nom va kategoriya' },
  { id: 2, title: 'Joylashuv', subtitle: 'Xarita yoki GPS' },
  { id: 3, title: 'Tavsif', subtitle: 'AI yordamchi' },
  { id: 4, title: 'Dalillar', subtitle: 'Ixtiyoriy fayllar' },
  { id: 5, title: "Ko'rib chiqish", subtitle: 'Tasdiqlash' },
];

function LocationPickerMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={customMarkerIcon} /> : null;
}

function FilePreview({ file }) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

  if (file.type.startsWith('image/')) {
    return <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />;
  }

  if (file.type.startsWith('video/')) {
    return <video src={previewUrl} className="h-full w-full object-cover" muted />;
  }

  if (file.type.startsWith('audio/')) {
    return <Mic size={24} className="text-green-400" />;
  }

  return <FileIcon size={24} className="text-slate-400" />;
}

function FieldError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4, x: 0 }}
          animate={{ opacity: 1, y: 0, x: [0, -4, 4, -2, 2, 0] }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function StepTimeline({ step, completedSteps, goToStep }) {
  return (
    <aside className="glass-panel rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl lg:sticky lg:top-28 lg:self-start">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Smart report</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">Murojaat oqimi</h2>
      </div>

      <div className="relative space-y-4">
        <motion.div
          className="absolute left-5 top-5 w-px rounded-full bg-gradient-to-b from-indigo-400 to-purple-500"
          initial={false}
          animate={{ height: `${((step - 1) / (steps.length - 1)) * 86}%` }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
        <div className="absolute left-5 top-5 h-[86%] w-px bg-white/10" />

        {steps.map((item) => {
          const isActive = step === item.id;
          const isComplete = completedSteps.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goToStep(item.id)}
              className="relative z-10 flex w-full items-center gap-4 rounded-2xl p-2 text-left transition-colors hover:bg-white/[0.04]"
            >
              <span
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-black transition-all',
                  isActive
                    ? 'border-indigo-300 bg-indigo-500 text-white shadow-[0_0_28px_rgba(99,102,241,0.55)]'
                    : isComplete
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/10 bg-slate-950 text-slate-500'
                )}
              >
                {isComplete ? <Check size={17} /> : item.id}
              </span>
              <span>
                <span className={cn('block text-sm font-bold', isActive ? 'text-white' : 'text-slate-300')}>
                  {item.title}
                </span>
                <span className="text-xs text-slate-500">{item.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function RiskPreview({ description }) {
  const lower = description.toLowerCase();
  const hits = KEYWORDS.filter((keyword) => lower.includes(keyword));
  const level = lower.includes('pora') || lower.includes('pul')
    ? { label: 'Yuqori', value: 92, color: 'from-red-500 to-rose-400', text: 'text-red-300' }
    : lower.includes('navbat') || description.length > 80
      ? { label: "O'rta", value: 58, color: 'from-yellow-500 to-orange-400', text: 'text-yellow-300' }
      : { label: 'Past', value: description.length >= 10 ? 28 : 8, color: 'from-emerald-500 to-cyan-400', text: 'text-emerald-300' };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Bot size={17} className="text-indigo-300" /> AI risk preview
        </div>
        <span className={cn('text-sm font-black', level.text)}>{level.label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-950/80">
        <motion.div
          className={cn('h-full rounded-full bg-gradient-to-r', level.color)}
          initial={{ width: 0 }}
          animate={{ width: `${level.value}%` }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {KEYWORDS.map((keyword) => (
          <span
            key={keyword}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-bold',
              hits.includes(keyword)
                ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
                : 'border-white/10 bg-white/[0.03] text-slate-500'
            )}
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({});
  const [reportId, setReportId] = useState('');
  const [formData, setFormData] = useState({
    organization: '',
    category: 'Umumiy',
    lat: null,
    lng: null,
    description: '',
    files: [],
    isAnonymous: true,
    reporterName: '',
    contact: '',
  });
  const fileInputRef = useRef(null);

  const errors = useMemo(() => {
    const nextErrors = {};

    if (!formData.organization.trim()) {
      nextErrors.organization = 'Bu maydon majburiy';
    } else if (formData.organization.trim().length < 3) {
      nextErrors.organization = 'Tashkilot nomini kamida 3 ta belgidan iborat qilib yozing';
    }

    if (!formData.category) {
      nextErrors.category = 'Kategoriya tanlang';
    }

    if (!formData.lat || !formData.lng) {
      nextErrors.location = 'Xaritadan joy tanlang yoki GPSdan foydalaning';
    }

    if (!formData.description.trim()) {
      nextErrors.description = 'Bu maydon majburiy';
    } else if (formData.description.trim().length < 10) {
      nextErrors.description = 'Iltimos, muammoni kamida 10 ta belgidan iborat qilib yozing';
    }

    if (!formData.isAnonymous) {
      if (!formData.reporterName.trim()) {
        nextErrors.reporterName = 'Ismingizni kiriting yoki anonim rejimni yoqing';
      }
      if (!formData.contact.trim()) {
        nextErrors.contact = 'Email yoki telefon kiriting';
      }
    }

    return nextErrors;
  }, [formData]);

  const stepFields = {
    1: ['organization', 'category', 'reporterName', 'contact'],
    2: ['location'],
    3: ['description'],
    4: [],
    5: [],
  };

  const completedSteps = steps
    .filter((item) => item.id < step)
    .map((item) => item.id);

  const markTouched = (field) => setTouched((current) => ({ ...current, [field]: true }));
  const shouldShowError = (field) => Boolean((touched[field] || submitAttempted) && errors[field]);
  const getFieldError = (field) => shouldShowError(field) ? errors[field] : '';

  const validateStep = (targetStep = step) => {
    const invalidFields = stepFields[targetStep].filter((field) => errors[field]);
    if (invalidFields.length > 0) {
      setTouched((current) => ({
        ...current,
        ...Object.fromEntries(invalidFields.map((field) => [field, true])),
      }));
      return false;
    }
    return true;
  };

  const updateForm = (patch) => {
    setFormData((current) => ({ ...current, ...patch }));
    setSubmitError('');
  };

  const handleNext = () => {
    if (step < steps.length && validateStep(step)) {
      setStep((current) => current + 1);
    }
  };

  const handlePrev = () => {
    setStep((current) => Math.max(1, current - 1));
  };

  const goToStep = (targetStep) => {
    if (targetStep <= step || validateStep(step)) {
      setStep(targetStep);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSubmitError("Brauzeringiz GPS joylashuvni qo'llab-quvvatlamaydi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateForm({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        markTouched('location');
      },
      () => setSubmitError('GPS joylashuvni olishga ruxsat berilmadi.')
    );
  };

  const addFiles = (incomingFiles) => {
    const validFiles = [];

    for (const file of incomingFiles) {
      if (!ALLOWED_FILE_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
        setSubmitError(`"${file.name}" fayl turi qo'llab-quvvatlanmaydi. Faqat rasm, video yoki audio yuklang.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setSubmitError(`"${file.name}" hajmi 25 MB dan katta. Kichikroq fayl yuklang.`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSubmitError('');
      setFormData((current) => ({ ...current, files: [...current.files, ...validFiles] }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) addFiles(files);
  };

  const removeFile = (fileIndex) => {
    setFormData((current) => ({
      ...current,
      files: current.files.filter((_, index) => index !== fileIndex),
    }));
  };

  const resetForm = () => {
    setStep(1);
    setStatus('idle');
    setSubmitAttempted(false);
    setTouched({});
    setSubmitError('');
    setReportId('');
    setFormData({
      organization: '',
      category: 'Umumiy',
      lat: null,
      lng: null,
      description: '',
      files: [],
      isAnonymous: true,
      reporterName: '',
      contact: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitError('');

    const isValid = [1, 2, 3, 5].every((targetStep) => validateStep(targetStep));
    if (!isValid) {
      setSubmitError("Iltimos, belgilangan maydonlarni to'g'ri to'ldiring.");
      return;
    }

    setStatus('submitting');

    const payload = new FormData();
    payload.append('name', formData.organization);
    payload.append('description', formData.description);
    payload.append('category', formData.category);
    payload.append('lat', formData.lat);
    payload.append('lng', formData.lng);
    payload.append('is_anonymous', formData.isAnonymous);

    formData.files.forEach((file) => payload.append('files', file));

    try {
      const response = await submitReport(payload);
      setReportId(`NAZ-2026-${String(response.id || Date.now()).slice(-6).toUpperCase()}`);
      setStatus('success');
    } catch (error) {
      console.error('Report submission failed:', error);
      setSubmitError(error.message || "Murojaatni yuborishda xatolik yuz berdi. Backend ishlayotganini tekshiring.");
      setStatus('idle');
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" {...stepMotion} className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">1-qadam</p>
              <h2 className="mt-2 text-3xl font-black text-white">Tashkilot va kategoriya</h2>
              <p className="mt-2 text-slate-400">Murojaat qaysi tashkilot yoki hududga tegishli?</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tashkilot nomi</label>
              <input
                value={formData.organization}
                onBlur={() => markTouched('organization')}
                onChange={(e) => updateForm({ organization: e.target.value })}
                placeholder="Masalan: Chilonzor hokimiyati"
                className={inputClass(shouldShowError('organization'))}
              />
              <div className="flex flex-wrap gap-2">
                {['Hokimiyat', 'Maktab', 'Poliklinika'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => updateForm({ organization: suggestion })}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <FieldError message={getFieldError('organization')} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Kategoriya</label>
              <select
                value={formData.category}
                onBlur={() => markTouched('category')}
                onChange={(e) => updateForm({ category: e.target.value })}
                className={inputClass(shouldShowError('category'))}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
              <FieldError message={getFieldError('category')} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <button
                type="button"
                onClick={() => updateForm({ isAnonymous: !formData.isAnonymous })}
                className="flex w-full items-center justify-between gap-4"
              >
                <span>
                  <span className="block text-left text-sm font-bold text-white">Murojaatni anonim yuborish</span>
                  <span className="text-left text-xs text-slate-500">O'chirilsa ism va aloqa ma'lumotlari so'raladi</span>
                </span>
                <span className={cn(
                  'relative h-7 w-12 rounded-full transition-colors',
                  formData.isAnonymous ? 'bg-indigo-500' : 'bg-slate-700'
                )}>
                  <span className={cn(
                    'absolute top-1 h-5 w-5 rounded-full bg-white transition-transform',
                    formData.isAnonymous ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </span>
              </button>

              <AnimatePresence>
                {!formData.isAnonymous && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 grid gap-3 md:grid-cols-2"
                  >
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Ism</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          value={formData.reporterName}
                          onBlur={() => markTouched('reporterName')}
                          onChange={(e) => updateForm({ reporterName: e.target.value })}
                          className={cn(inputClass(shouldShowError('reporterName')), 'pl-11')}
                          placeholder="Ismingiz"
                        />
                      </div>
                      <FieldError message={getFieldError('reporterName')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Email yoki telefon</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                          value={formData.contact}
                          onBlur={() => markTouched('contact')}
                          onChange={(e) => updateForm({ contact: e.target.value })}
                          className={cn(inputClass(shouldShowError('contact')), 'pl-11')}
                          placeholder="+998 yoki email"
                        />
                      </div>
                      <FieldError message={getFieldError('contact')} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" {...stepMotion} className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">2-qadam</p>
              <h2 className="mt-2 text-3xl font-black text-white">Joylashuv</h2>
              <p className="mt-2 text-slate-400">Xaritadan nuqtani tanlang yoki joriy GPS joylashuvdan foydalaning.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={useCurrentLocation}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 transition-transform hover:scale-[1.02]"
              >
                <Crosshair size={16} /> Joriy joylashuv
              </button>
              {formData.lat && formData.lng && (
                <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-bold text-blue-200">
                  <MapPin size={16} /> {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                </div>
              )}
            </div>

            <div className="h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
              <MapContainer center={[41.311081, 69.240562]} zoom={12} className="h-full w-full dark-map-tiles">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPickerMarker
                  position={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null}
                  setPosition={(latlng) => {
                    updateForm({ lat: latlng.lat, lng: latlng.lng });
                    markTouched('location');
                  }}
                />
              </MapContainer>
            </div>
            <FieldError message={getFieldError('location')} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" {...stepMotion} className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">3-qadam</p>
              <h2 className="mt-2 text-3xl font-black text-white">Muammo tavsifi</h2>
              <p className="mt-2 text-slate-400">Aniq, qisqa va dalilga yaqin yozing.</p>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
              <div className="mb-1 flex items-center gap-2 font-bold"><Bot size={17} /> AI yordamchi</div>
              Aniqroq yozing: kim, qachon, qayerda, qancha pul so'ralgan.
            </div>

            <div className="space-y-2">
              <textarea
                value={formData.description}
                onBlur={() => markTouched('description')}
                onChange={(e) => updateForm({ description: e.target.value })}
                rows={8}
                placeholder="Holatni batafsil tushuntirib bering..."
                className={cn(inputClass(shouldShowError('description')), 'resize-none leading-7')}
              />
              <div className="flex items-center justify-between gap-3">
                <FieldError message={getFieldError('description')} />
                <span className={cn('ml-auto shrink-0 text-xs font-bold', formData.description.trim().length >= 10 ? 'text-emerald-400' : 'text-slate-500')}>
                  {formData.description.trim().length}/10
                </span>
              </div>
            </div>

            <RiskPreview description={formData.description} />
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" {...stepMotion} className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">4-qadam</p>
              <h2 className="mt-2 text-3xl font-black text-white">Dalillarni yuklash (ixtiyoriy)</h2>
              <p className="mt-2 text-slate-400">Fayl yuklash majburiy emas. Rasm, video yoki audio yuklash mumkin.</p>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-3xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 p-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-500/10"
            >
              <UploadCloud className="mx-auto mb-4 text-indigo-300" size={42} />
              <p className="text-lg font-black text-white">Fayllarni shu yerga tashlang</p>
              <p className="mt-2 text-sm text-slate-400">Har bir fayl 25 MB dan oshmasin</p>
              <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={handleFileChange} />
            </div>

            {formData.files.length > 0 && (
              <div className="space-y-3">
                {formData.files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
                        <FilePreview file={file} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{file.name}</p>
                        <p className="text-xs text-slate-500">{file.type || 'file'} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="rounded-full bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" {...stepMotion} className="space-y-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-300">5-qadam</p>
              <h2 className="mt-2 text-3xl font-black text-white">Ko'rib chiqish va yuborish</h2>
              <p className="mt-2 text-slate-400">Yuborishdan oldin ma'lumotlarni tekshirib oling.</p>
            </div>

            <div className="grid gap-4">
              <ReviewRow label="Tashkilot" value={formData.organization || 'Kiritilmagan'} onEdit={() => setStep(1)} />
              <ReviewRow label="Kategoriya" value={formData.category} onEdit={() => setStep(1)} />
              <ReviewRow label="Joylashuv" value={formData.lat && formData.lng ? `${formData.lat.toFixed(4)}, ${formData.lng.toFixed(4)}` : 'Tanlanmagan'} onEdit={() => setStep(2)} />
              <ReviewRow label="Tavsif" value={formData.description || 'Kiritilmagan'} onEdit={() => setStep(3)} multiline />
              <ReviewRow label="Fayllar" value={formData.files.length ? `${formData.files.length} ta fayl` : 'Fayl yuklanmagan'} onEdit={() => setStep(4)} />
              <ReviewRow label="Anonimlik" value={formData.isAnonymous ? 'Anonim yuboriladi' : `${formData.reporterName} · ${formData.contact}`} onEdit={() => setStep(1)} />
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (status === 'success') {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center px-5 pt-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-panel w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.05] p-9 text-center shadow-2xl"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_55px_rgba(16,185,129,0.35)]">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-white">Murojaat muvaffaqiyatli yuborildi</h1>
          <p className="mt-3 text-slate-400">Murojaatingiz nazorat tizimiga qabul qilindi.</p>
          <div className="my-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left">
            <p className="text-sm text-slate-500">ID</p>
            <p className="text-xl font-black text-white">{reportId || 'NAZ-2026-000123'}</p>
            <p className="mt-3 text-sm text-slate-500">Status</p>
            <p className="font-bold text-blue-300">Qabul qilindi</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/map" className="flex-1 rounded-2xl bg-white px-5 py-4 text-center font-black text-slate-900 transition-transform hover:scale-[1.02]">
              Xaritada ko'rish
            </Link>
            <button onClick={resetForm} className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-black text-white hover:bg-white/10">
              Yangi murojaat yuborish
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-1 bg-[radial-gradient(circle_at_top,#1E293B_0%,#0F172A_46%,#020617_100%)] px-4 pb-12 pt-28 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-violet-300">Nazorat AI</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-6xl">Korrupsiya haqida xabar bering</h1>
          <p className="mt-4 text-lg leading-8 text-slate-400">Premium, xavfsiz va aqlli 5-qadamli murojaat yuborish tajribasi.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[330px_1fr]">
          <StepTimeline step={step} completedSteps={completedSteps} goToStep={goToStep} />

          <div className="glass-panel min-h-[620px] rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl md:p-8">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200"
              >
                {submitError}
              </motion.div>
            )}

            <div className="mt-10 flex gap-4">
              {step > 1 && (
                <button type="button" onClick={handlePrev} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-bold text-white hover:bg-white/10">
                  <ArrowLeft size={20} />
                </button>
              )}
              {step < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext(step, errors)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-slate-900 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
                >
                  Keyingisi <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 font-black text-white shadow-[0_0_40px_rgba(99,102,241,0.28)] transition-all hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {status === 'submitting' ? (
                    <><span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Murojaat yuborilmoqda...</>
                  ) : (
                    <><CheckCircle2 size={20} /> Yuborish</>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

const inputClass = (hasError) => cn(
  'w-full rounded-2xl border bg-slate-950/55 px-5 py-4 text-white placeholder-slate-500 outline-none transition-all focus:ring-2',
  hasError
    ? 'border-red-500/40 focus:border-red-500/50 focus:ring-red-500/40'
    : 'border-white/10 focus:border-indigo-400/50 focus:ring-indigo-500/40'
);

function canGoNext(step, errors) {
  if (step === 1) return !errors.organization && !errors.category && !errors.reporterName && !errors.contact;
  if (step === 2) return !errors.location;
  if (step === 3) return !errors.description;
  return true;
}

function ReviewRow({ label, value, onEdit, multiline = false }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <Check size={16} className="text-emerald-300" /> {label}
        </div>
        <button type="button" onClick={onEdit} className="text-xs font-bold text-indigo-300 hover:text-indigo-200">
          Tahrirlash
        </button>
      </div>
      <p className={cn('text-white', multiline ? 'line-clamp-4 text-sm leading-6 text-slate-300' : 'font-semibold')}>
        {value}
      </p>
    </div>
  );
}
