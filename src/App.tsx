/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Leaf, 
  Weight as WeightIcon, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw,
  ShieldAlert,
  Info,
  Microscope,
  Stethoscope,
  ChevronDown,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { SYMPTOMS } from './lib/constants';
import { VPKVector, DiagnosticResult, Dosha } from './lib/types';
import { getDiagnosticReport, generateHerbImage } from './services/geminiService';
import VPKChart from './components/VPKChart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import mascotImg from './assets/images/herbal_pharmacopeia_mascot_1776841271997.png';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [weight, setWeight] = useState<number>(60);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [report, setReport] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const vpkVector = useMemo(() => {
    const vector: VPKVector = { Vata: 0.1, Pitta: 0.1, Kapha: 0.1 };
    selectedSymptoms.forEach(id => {
      const symptom = SYMPTOMS.find(s => s.id === id);
      if (symptom?.doshaImpact) {
        if (symptom.doshaImpact.Vata) vector.Vata += symptom.doshaImpact.Vata;
        if (symptom.doshaImpact.Pitta) vector.Pitta += symptom.doshaImpact.Pitta;
        if (symptom.doshaImpact.Kapha) vector.Kapha += symptom.doshaImpact.Kapha;
      }
    });

    // Normalize to max 1.0 for each to keep chart readable, though raw sum is fine too
    const maxVal = Math.max(vector.Vata, vector.Pitta, vector.Kapha, 1);
    return {
      Vata: vector.Vata / maxVal,
      Pitta: vector.Pitta / maxVal,
      Kapha: vector.Kapha / maxVal
    };
  }, [selectedSymptoms]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRunDiagnosis = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsDiagnosticRunning(true);
    setError(null);
    try {
      const result = await getDiagnosticReport(weight, selectedSymptoms, vpkVector, customNotes);
      
      if (result.recommendations.length === 0) {
        setError("ไม่พบข้อมูลสมุนไพรที่เหมาะสมกับอาการปัจุบันของคุณ หรือระบบขัดข้องชั่วคราว โปรลองใหม่อีกครั้ง");
        setIsDiagnosticRunning(false);
        return;
      }

      setReport(result);

      // Generate AI Images for each herb to ensure accuracy
      if (result.recommendations) {
        for (const herb of result.recommendations) {
          const aiImage = await generateHerbImage(herb.name, herb.scientificName);
          if (aiImage) {
            setReport(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                recommendations: prev.recommendations.map(r => 
                  r.name === herb.name ? { ...r, imageUrl: aiImage } : r
                )
              };
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ");
    } finally {
      setIsDiagnosticRunning(false);
    }
  };

  const reset = () => {
    setSelectedSymptoms([]);
    setCustomNotes('');
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-bottom border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border-2 border-emerald-500 shadow-lg overflow-hidden shrink-0">
              <img 
                src={mascotImg} 
                alt="Mascot" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none">THE UNIFIED COMPENDIUM</h1>
              <p className="text-[10px] text-emerald-500 font-mono tracking-widest mt-1 uppercase opacity-80 font-bold">Herbal Pharmacopoeia v2.5.0</p>
            </div>
          </div>
          {report && (
            <button 
              onClick={reset}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> เริ่มใหม่ (RE-EVALUATE)
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
          
          {/* Left Column: Input */}
          <div className={cn("lg:col-span-12", !report ? "lg:col-span-12" : "hidden")}>
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-12"
             >
                {/* Weight Input */}
                <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <WeightIcon className="text-emerald-400 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-white">ข้อมูลพื้นฐานผู้ป่วย (Biometric Profile)</h2>
                  </div>
                  <div className="flex flex-wrap items-end gap-6">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">น้ำหนักตัว (Weight KG)</label>
                      <input 
                        type="range" 
                        min="30" 
                        max="150" 
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-6 py-4 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white font-mono">{weight}</span>
                      <span className="text-slate-500 font-medium">กก.</span>
                    </div>
                  </div>
                </section>

                {/* Custom Notes - Moved to Top */}
                <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-4 items-start"
                      >
                        <AlertCircle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-red-500 uppercase tracking-widest">การวิเคราะห์ล้มเหลว (Diagnosis Failed)</p>
                          <p className="text-xs text-red-200/80 leading-relaxed">{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="text-emerald-400 w-5 h-5" />
                    <h2 className="text-lg font-semibold text-white">บันทึกอาการเพิ่มเติม (Additional Notes)</h2>
                  </div>
                  <textarea 
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="ระบุอาการอื่นๆ หรือรายละเอียดเพิ่มเติมที่นี่... (เช่น ระยะเวลาที่เป็น, ปัจจัยที่ทำให้อาการแย่ลง)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors min-h-[120px] resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 italic font-mono uppercase tracking-widest">
                    * ข้อมูลนี้จะถูกประมวลผลโดย AI เพื่อนำมาปรับปรุงการวิเคราะห์สมุนไพร
                  </p>
                  
                  {/* Button 1: Under Notes */}
                  <div className="mt-8 flex justify-center">
                    <button 
                      onClick={handleRunDiagnosis}
                      disabled={selectedSymptoms.length === 0 || isDiagnosticRunning}
                      className="group relative px-10 py-4 bg-emerald-500 text-slate-900 font-bold rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center gap-3">
                        {isDiagnosticRunning ? (
                          <>กำลังประมวลผล...</>
                        ) : (
                          <>ออกรายงานทันที <ChevronRight className="w-5 h-5" /></>
                        )}
                      </span>
                    </button>
                  </div>
                </section>

                {/* Symptom Selector - Single Grid */}
                <section>
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <Activity className="text-emerald-400 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-white">การระบุอาการ (Symptom Vectorization)</h2>
                      </div>
                      <span className="text-xs font-mono text-slate-500">เลือกแล้ว {selectedSymptoms.length} รายการ</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {SYMPTOMS.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => toggleSymptom(s.id)}
                          className={cn(
                            "group text-left p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden h-full flex gap-4",
                            selectedSymptoms.includes(s.id) 
                              ? "bg-white border-emerald-500 shadow-[4px_4px_0px_#10b981]" 
                              : "bg-slate-800/30 border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
                          )}
                        >
                          <div className={cn(
                            "text-4xl shrink-0 flex items-center justify-center p-2 rounded-xl transition-all duration-300 group-active:scale-90",
                            selectedSymptoms.includes(s.id) ? "bg-emerald-50" : "bg-slate-900/50"
                          )}>
                             <motion.span
                               animate={selectedSymptoms.includes(s.id) ? { scale: [1, 1.2, 1] } : {}}
                               transition={{ duration: 0.3 }}
                             >
                               {s.icon}
                             </motion.span>
                          </div>
                          <div className="flex justify-between items-start flex-1 relative z-10 py-1">
                            <div>
                              <p className={cn("text-[10px] font-black transition-colors uppercase tracking-widest mb-1", 
                                selectedSymptoms.includes(s.id) ? "text-emerald-600" : "text-slate-500"
                              )}>
                                {s.label}
                              </p>
                              <p className={cn("text-base font-bold leading-tight",
                                selectedSymptoms.includes(s.id) ? "text-slate-900" : "text-white"
                              )}>{s.labelTh}</p>
                            </div>
                            {selectedSymptoms.includes(s.id) && (
                              <div className="bg-emerald-500 rounded-full p-0.5 shadow-sm">
                                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                   </div>
                </section>

                {/* Action */}
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={handleRunDiagnosis}
                    disabled={selectedSymptoms.length === 0 || isDiagnosticRunning}
                    className="group relative px-12 py-5 bg-emerald-500 text-slate-900 font-bold rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.2)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center gap-3 text-lg">
                      {isDiagnosticRunning ? (
                        <>กำลังประมวลผลข้อมูลทางเภสัชวิทยา...</>
                      ) : (
                        <>ออกรายงานตำรับยาสมุนไพร (GENERATE REPORT) <ChevronRight className="w-5 h-5" /></>
                      )}
                    </span>
                  </button>
                </div>
             </motion.div>
          </div>

          {/* Report View */}
          <AnimatePresence>
            {report && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-12 space-y-12 pb-24"
              >
                {/* Visual Analysis */}
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-emerald-400 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-white">กราฟวิเคราะห์สมดุลธาตุ (V-P-K)</h2>
                      </div>
                      <VPKChart vector={report.vector} />
                   </div>

                   <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <Stethoscope className="text-emerald-400 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-white">ธาตุเจ้าเรือนที่เด่นชัด (Dominant Dosha)</h2>
                      </div>
                      <div className="text-6xl font-black text-emerald-400 tracking-tighter mb-2 italic">
                        {report.dominantDosha === 'Vata' ? 'วาตะ (Vata)' : report.dominantDosha === 'Pitta' ? 'ปิตตะ (Pitta)' : 'เสมหะ (Kapha)'}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        ผู้ป่วยมีสภาวะความไม่สมดุลของ {report.dominantDosha === 'Vata' ? 'วาตะ' : report.dominantDosha === 'Pitta' ? 'ปิตตะ' : 'เสมหะ'} อย่างเห็นได้ชัด 
                        จำเป็นต้องได้รับการดูแลด้วยสมุนไพรที่มีฤทธิ์ตรงกันข้ามเพื่อปรับสมดุลร่างกาย
                      </p>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">ปริมาณยารวม (ต่อวัน)</p>
                          <p className="text-xl font-bold text-white font-mono">{report.baseDoseMg.toFixed(1)} มก.</p>
                        </div>
                        <div className="flex-1 border-l border-emerald-500/20 pl-4">
                          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">ขนาดรับประทาน</p>
                          <p className="text-xl font-bold text-white font-mono">{report.capsulesPerDay} แคปซูล</p>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Recommendations */}
                <section>
                   <div className="flex items-center gap-3 mb-8">
                      <Microscope className="text-emerald-400 w-5 h-5" />
                      <h2 className="text-xl font-bold text-white">ตำรับยาสมุนไพรฐานข้อมูลเภสัชวิทยา (Evidence-Based Formulation)</h2>
                   </div>

                   <div className="grid gap-6">
                      {report.recommendations.map((herb, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={herb.name}
                          className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
                        >
                          <div className="flex flex-col md:flex-row">
                             <div className="md:w-1/3 bg-slate-900/50 border-r border-slate-700/50">
                                {herb.imageUrl && (
                                  <div className="w-full aspect-video md:aspect-[4/3] bg-slate-800 relative overflow-hidden">
                                     {herb.imageUrl.startsWith('https://picsum.photos') ? (
                                       <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
                                          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                                          <p className="text-[10px] text-emerald-500/60 font-mono animate-pulse uppercase tracking-widest">
                                            AI Generating Real Image...
                                          </p>
                                       </div>
                                     ) : (
                                       <motion.img 
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          src={herb.imageUrl} 
                                          alt={herb.name} 
                                          referrerPolicy="no-referrer"
                                          className="w-full h-full object-cover"
                                        />
                                     )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                  </div>
                                )}
                                <div className="p-8">
                                  <p className="text-3xl font-bold text-white">{herb.nameTh}</p>
                                  <p className="text-xs text-emerald-500 font-mono mt-1">{herb.name}</p>
                                  <p className="text-[11px] text-slate-500 italic mt-2">{herb.scientificName}</p>
                                  
                                  <div className="mt-8 space-y-4">
                                    <div>
                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">ปริมาณที่ควรได้รับ (ต่อวัน)</p>
                                      <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold text-white font-mono">{herb.dosePerDayMg}</p>
                                        <span className="text-slate-500 text-xs font-medium">มก. / วัน</span>
                                      </div>
                                      <p className="text-xs text-emerald-400 mt-1">≈ {Math.ceil(herb.dosePerDayMg / 250)} แคปซูล (250มก.)</p>
                                    </div>
                                  </div>
                                </div>
                             </div>

                             <div className="md:w-2/3 p-8 space-y-6">
                                <div>
                                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> เหตุผลทางเภสัชวิทยา (Pharmacological Reasoning)
                                  </p>
                                  <p className="text-white font-medium leading-relaxed mb-2">{herb.reasonTh}</p>
                                  <div className="flex items-center gap-2 mb-2 bg-slate-900/40 w-fit px-3 py-1.5 rounded-lg border border-slate-700/50 group hover:border-emerald-500/30 transition-colors">
                                    <ExternalLink className="w-3 h-3 text-emerald-500/60" />
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">Source:</span>
                                    <div className="text-[10px] text-emerald-500/80 font-medium italic truncate max-w-[200px]">
                                      {(() => {
                                        if (!herb.source) return null;
                                        const urlMatch = herb.source.match(/https?:\/\/[^\s]+/);
                                        if (urlMatch) {
                                          return (
                                            <a href={urlMatch[0]} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 transition-colors">
                                              {herb.source}
                                            </a>
                                          );
                                        }
                                        return <span>{herb.source}</span>;
                                      })()}
                                    </div>
                                  </div>
                                  <p className="text-slate-400 text-sm italic leading-relaxed">{herb.reason}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">สารประกอบสำคัญ</p>
                                    <div className="flex flex-wrap gap-2">
                                      {herb.activeCompounds.map(c => (
                                        <span key={c} className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-[10px] font-medium border border-slate-600/50">
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">คุณสมบัติ/รสยา</p>
                                    <p className="text-sm text-slate-300 font-medium">{herb.taste}, {herb.property}</p>
                                  </div>
                                </div>

                                {herb.safetyNote && (
                                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                                    <ShieldAlert className="text-amber-500 w-5 h-5 shrink-0" />
                                    <div>
                                      <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">หมายเหตุความปลอดภัย (Safety Note)</p>
                                      <p className="text-xs text-amber-200/80 leading-relaxed">{herb.safetyNote}</p>
                                    </div>
                                  </div>
                                )}
                             </div>
                          </div>
                        </motion.div>
                      ))}
                   </div>
                </section>

                {/* Disclaimer */}
                <footer className="pt-12 border-t border-slate-800">
                   <div className="flex gap-4 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <AlertCircle className="text-slate-500 w-6 h-6 shrink-0" />
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">ข้อจำกัดความรับผิดชอบทางกฎหมาย (Medical Disclaimer)</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          ระบบนี้เป็นเครื่องมือช่วยดึงข้อมูลจากฐานข้อมูลเภสัชวิทยาโดยใช้ AI เท่านั้น ไม่ใช่คำแนะนำทางการแพทย์โดยตรง 
                          ปริมาณยาที่คำนวณเป็นเพียงค่าทางทฤษฎีตามน้ำหนักตัวมาตรฐาน โปรดปรึกษาแพทย์หรือผู้เชี่ยวชาญด้านสมุนไพรก่อนเริ่มการรักษาจริง
                        </p>
                      </div>
                   </div>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

       {/* Loading Overlay */}
      {isDiagnosticRunning && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="max-w-md w-full space-y-8 text-center">
              <motion.div 
                animate={{ 
                  y: [0, -20, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-32 h-32 bg-white rounded-3xl border-4 border-emerald-500 shadow-2xl overflow-hidden mx-auto p-2"
              >
                 <img 
                  src="/src/assets/images/herbal_pharmacopeia_mascot_1776841271997.png" 
                  alt="AI Mascot" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white tracking-tight italic">คุณหมอใบไม้กำลังจัดยาให้...</h3>
                <p className="text-emerald-500 font-mono text-xs animate-pulse font-bold">PLEASE WAIT WHILE WE FIND THE BEST CURE</p>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mt-6">
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                     เรากำลังวิเคราะห์ข้อมูล VPK Vector และคำนวณโดสยาให้เหมาะสมกับน้ำหนักและอาการของคุณ
                   </p>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
