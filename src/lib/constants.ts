import { Symptom, Dosha } from './types';

export const SYMPTOMS: Symptom[] = [
  // VATA (Air/Ether)
  { id: 'bloating', label: 'Bloating/Gas', labelTh: 'ท้องอืด ท้องเฟ้อ', icon: '🎈', doshaImpact: { Vata: 0.4, Kapha: 0.1 } },
  { id: 'constipation', label: 'Constipation', labelTh: 'ท้องผูก', icon: '🧱', doshaImpact: { Vata: 0.5 } },
  { id: 'anxiety', label: 'Anxiety/Insomnia', labelTh: 'วิตกกังวล นอนไม่หลับ', icon: '😰', doshaImpact: { Vata: 0.4 } },
  { id: 'joint_pain', label: 'Joint Pain', labelTh: 'ปวดข้อ อาการขัด', icon: '💥', doshaImpact: { Vata: 0.3, Pitta: 0.1 } },
  { id: 'dry_skin', label: 'Dry Skin/Hair', labelTh: 'ผิวแห้ง ผมแห้งกรอบ', icon: '🍂', doshaImpact: { Vata: 0.4 } },
  { id: 'cramps', label: 'Muscle Cramps', labelTh: 'ตะคริว ปวดเกร็งขา', icon: '⚡', doshaImpact: { Vata: 0.3 } },
  { id: 'cold_limbs', label: 'Cold Hands/Feet', labelTh: 'มือเท้าเย็น', icon: '🥶', doshaImpact: { Vata: 0.3, Kapha: 0.1 } },
  { id: 'pms', label: 'Menstrual Discomfort', labelTh: 'ปวดประจำเดือน', icon: '🩸', doshaImpact: { Vata: 0.4, Pitta: 0.1 } },
  
  // PITTA (Fire/Water)
  { id: 'acidity', label: 'Acid Reflux/Burning', labelTh: 'กรดเกิน แสบร้อนอก', icon: '🌋', doshaImpact: { Pitta: 0.5 } },
  { id: 'inflammation', label: 'Inflammation/Heat', labelTh: 'อักเสบ ร้อนใน', icon: '🌡️', doshaImpact: { Pitta: 0.5 } },
  { id: 'rashes', label: 'Skin Rashes/Acne', labelTh: 'ผื่นคัน สิวอักเสบ', icon: '💢', doshaImpact: { Pitta: 0.4 } },
  { id: 'irritability', label: 'Irritability/Anger', labelTh: 'หงุดหงิดง่าย ขี้โมโห', icon: '🧨', doshaImpact: { Pitta: 0.3 } },
  { id: 'thirst', label: 'Excessive Thirst', labelTh: 'หิวน้ำบ่อย คอแห้ง', icon: '🚱', doshaImpact: { Pitta: 0.4 } },
  { id: 'sweating', label: 'Excessive Sweating', labelTh: 'เหงื่อออกมาก', icon: '💦', doshaImpact: { Pitta: 0.3, Kapha: 0.1 } },
  { id: 'loose_stools', label: 'Loose Stools', labelTh: 'ถ่ายเหลวบ่อย', icon: '🚽', doshaImpact: { Pitta: 0.4 } },
  { id: 'hypertension', label: 'High Blood Pressure', labelTh: 'ความดันโลหิตสูง', icon: '📈', doshaImpact: { Pitta: 0.3, Vata: 0.2 } },
  { id: 'migraine', label: 'Migraine/Headache', labelTh: 'ไมเกรน ปวดศีรษะ', icon: '💥', doshaImpact: { Vata: 0.3, Pitta: 0.3 } },

  // KAPHA (Earth/Water)
  { id: 'congestion', label: 'Congestion/Mucus', labelTh: 'คัดจมูก มีเสมหะ', icon: '🤧', doshaImpact: { Kapha: 0.5 } },
  { id: 'lethargy', label: 'Lethargy/Heaviness', labelTh: 'ง่วงซึม หนักตัว', icon: '🔋', doshaImpact: { Kapha: 0.4 } },
  { id: 'edema', label: 'Water Retention', labelTh: 'บวมน้ำ', icon: '💧', doshaImpact: { Kapha: 0.5 } },
  { id: 'weight_gain', label: 'Slow Metabolism', labelTh: 'อ้วนง่าย เผาผลาญช้า', icon: '⚖️', doshaImpact: { Kapha: 0.4, Vata: -0.1 } },
  { id: 'mental_fog', label: 'Mental Fog', labelTh: 'สมองตื้อ คิดช้า', icon: '🌫️', doshaImpact: { Kapha: 0.3, Vata: 0.1 } },
  { id: 'slow_digestion', label: 'Slow Digestion', labelTh: 'ย่อยยาก อิ่มนาน', icon: '🐢', doshaImpact: { Kapha: 0.4 } },
  { id: 'oily_skin', label: 'Oily Skin', labelTh: 'หน้ามัน ผิวเหนอะ', icon: '🧼', doshaImpact: { Kapha: 0.3 } },
  { id: 'sugar_imbalance', label: 'Sugar Imbalance', labelTh: 'เบาหวาน น้ำตาลสูง', icon: '🍩', doshaImpact: { Kapha: 0.4, Pitta: 0.1 } },
  { id: 'allergy', label: 'Seasonal Allergy', labelTh: 'ภูมิแพ้อากาศ', icon: '🤧', doshaImpact: { Kapha: 0.3, Vata: 0.2 } },
];
