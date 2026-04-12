import { DiseaseType, PredictionResponse } from "../types";
import { DISEASES } from "../constants";

const API_URL = ((import.meta as any)?.env?.VITE_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

const buildFeatures = (disease: DiseaseType, data: Record<string, number | string>) => {
  const diseaseDef = DISEASES.find(d => d.id === disease);
  if (!diseaseDef) {
    throw new Error("Invalid disease type");
  }
  const fieldsForModel = diseaseDef.fields.filter(field => !(disease === "kidney" && field.name === "id"));
  const features = fieldsForModel.map(field => {
    let value = data[field.name];
    if (value === undefined || value === '' || value === null) {
      if (field.defaultValue !== undefined) {
        value = field.defaultValue;
      } else {
        value = 0;
      }
    }
    return Number(value);
  });
  return { diseaseDef, features };
};

export const getLocalPrediction = async (
  disease: DiseaseType,
  data: Record<string, number | string>,
  patientName?: string
): Promise<PredictionResponse> => {
  const { diseaseDef, features } = buildFeatures(disease, data);

  try {
    const response = await fetch(`${API_URL}/predict/${disease}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
      },
      body: JSON.stringify({ features, patientName }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Session expired. Please logout and login again.");
      }
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get prediction");
    }

    const result = await response.json();
    
    // Use the probability from the backend (0.0 to 1.0)
    return generatePredictionResult(diseaseDef, result.probability);
  } catch (error: any) {
    console.error("Local API Error:", error);
    if (error.message && (error.message.includes("Session expired") || error.message.includes("logout"))) {
        throw error;
    }
    throw new Error(`Failed to connect to local prediction server: ${error.message || "Unknown error"}`);
  }
};

export const getPublicPrediction = async (
  disease: DiseaseType,
  data: Record<string, number | string>
): Promise<PredictionResponse> => {
  const { diseaseDef, features } = buildFeatures(disease, data);
  try {
    const response = await fetch(`${API_URL}/predict/public/${disease}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ features }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get prediction");
    }

    const result = await response.json();
    return generatePredictionResult(diseaseDef, result.probability);
  } catch (error: any) {
    console.error("Local API Error:", error);
    throw new Error(`Failed to connect to local prediction server: ${error.message || "Unknown error"}`);
  }
};

const generatePredictionResult = (diseaseDef: any, probability: number): PredictionResponse => {
  const percentage = Math.round(probability * 100);
  
  let riskLevel: 'Low' | 'Moderate' | 'High';
  let analysis: string;
  let suggestions: string[];

  if (probability > 0.75) {
    riskLevel = "High";
    analysis = `The clinical parameters indicate a HIGH likelihood (${percentage}%) of ${diseaseDef.title}. This assessment is based on the provided metrics significantly matching patterns associated with the condition.`;
    
    if (diseaseDef.id === 'diabetes') {
        suggestions = [
            "Dietary Management: Limit carbohydrate intake to 45-60g per meal. Prioritize low-glycemic index foods (whole grains, legumes) and eliminate sugary beverages.",
            "Physical Activity: Engage in at least 150 minutes of moderate aerobic activity (e.g., brisk walking) per week, spread over at least 3 days, with no more than 2 consecutive days without activity.",
            "Blood Glucose Monitoring: Check fasting blood glucose daily. Target range: 80-130 mg/dL before meals and <180 mg/dL two hours after meals.",
            "Medication Adherence: If prescribed, take insulin or oral medications exactly as directed. Do not adjust dosage without medical consultation."
        ];
    } else if (diseaseDef.id === 'heart') {
        suggestions = [
            "Dietary Changes (DASH Diet): Reduce sodium intake to <1,500 mg/day. Increase consumption of potassium-rich foods (spinach, bananas) and omega-3 fatty acids (salmon, flaxseeds).",
            "Exercise Protocol: Aim for 30-60 minutes of moderate-intensity cardio (walking, swimming) 5 days a week. Monitor heart rate and stop if chest pain or dizziness occurs.",
            "Stress Management: Practice deep breathing or meditation for 15 minutes daily to lower cortisol and blood pressure. Ensure 7-8 hours of quality sleep.",
            "Vitals Monitoring: Measure blood pressure daily at the same time. Keep a log to share with your cardiologist."
        ];
    } else if (diseaseDef.id === 'kidney') {
        suggestions = [
            "Fluid Management: Limit fluid intake to 1.5-2.0 Liters per day to prevent fluid retention/edema, unless otherwise directed by a nephrologist.",
            "Protein Regulation: Restrict protein intake to 0.6-0.8g per kg of body weight to reduce kidney workload. Choose high-quality proteins like egg whites and fish.",
            "Electrolyte Balance: Avoid high-potassium foods (potatoes, tomatoes, bananas) and high-phosphorus foods (dairy, nuts, cola) if labs indicate imbalance.",
            "Blood Pressure Control: Maintain blood pressure below 130/80 mmHg using prescribed medications to prevent further kidney damage."
        ];
    } else if (diseaseDef.id === 'liver') {
        suggestions = [
            "Alcohol Abstinence: Completely avoid alcohol consumption to prevent further hepatotoxicity and allow liver regeneration.",
            "Medication Safety: Avoid hepatotoxic drugs (e.g., high doses of Acetaminophen/Paracetamol). Consult a doctor before taking herbal supplements.",
            "Dietary Adjustments: Adopt a Mediterranean-style diet rich in olive oil, fruits, and vegetables. Reduce saturated fats and refined sugars to manage fatty liver.",
            "Vaccination & Screening: Ensure vaccination against Hepatitis A and B. Schedule regular liver function tests (LFTs) every 3-6 months."
        ];
    } else if (diseaseDef.id === 'stroke') {
        suggestions = [
            "Emergency Awareness: Learn the FAST signs (Face drooping, Arm weakness, Speech difficulty, Time to call 108). Immediate action is critical.",
            "Blood Pressure Control: Hypertension is the leading cause of stroke. Target BP < 120/80 mmHg through DASH diet and prescribed medication.",
            "Lifestyle Cessation: Completely stop smoking and limit alcohol intake. Tobacco use significantly increases the risk of arterial narrowing.",
            "Physical Activity: Aim for 150 minutes of moderate-intensity activity per week. Even small increases in movement can lower neurological risks."
        ];
    } else if (diseaseDef.id === 'ckd') {
        suggestions = [
            "Hydration Monitoring: Maintain optimal fluid intake as advised by your doctor. Over-hydration or severe dehydration can both strain the kidneys.",
            "Dietary Phosphorus & Potassium: Limit high-phosphorus foods (dairy, beans) and high-potassium foods (bananas, potatoes) to prevent mineral buildup.",
            "Regular GFR Testing: Schedule periodic Glomerular Filtration Rate (GFR) and creatinine tests to monitor kidney filtration efficiency.",
            "Avoid NSAIDs: Do not use over-the-counter painkillers like Ibuprofen or Naproxen without consulting your nephrologist, as they can worsen renal function."
        ];
    } else {
        suggestions = [
            "Consult Specialist: Schedule an immediate appointment with a specialist for confirmatory testing.",
            "Symptom Logging: Keep a detailed daily log of symptoms, including severity and triggers.",
            "Lifestyle Audit: Review and eliminate major risk factors (smoking, excessive alcohol, high stress).",
            "Medication Review: Discuss all current medications with your doctor to check for side effects."
        ];
    }

  } else if (probability > 0.35) {
    riskLevel = "Moderate";
    analysis = `The clinical parameters indicate a MODERATE likelihood (${percentage}%) of ${diseaseDef.title}. Some metrics are showing concerning patterns, but a definitive diagnosis requires professional evaluation.`;
    
    suggestions = [
      "Medical Check-up: Schedule a consultation with a general physician within the next 2 weeks for a physical exam.",
      "Preventive Diet: Increase intake of fiber-rich vegetables and whole grains. Reduce processed foods and added sugars by 50%.",
      "Regular Exercise: Commit to 20 minutes of daily physical activity, such as brisk walking or light jogging.",
      "Biomarker Monitoring: Re-test specific biomarkers relevant to this condition in 3 months to track progress."
    ];
  } else {
    riskLevel = "Low";
    analysis = `The clinical parameters indicate a LOW likelihood (${percentage}%) of ${diseaseDef.title}. The provided metrics are largely within ranges typically associated with healthy individuals.`;
    
    suggestions = [
      "Maintenance: Continue your current balanced diet and exercise routine.",
      "Annual Screening: Schedule a general health check-up once a year.",
      "Hydration & Sleep: Drink at least 2-3 liters of water daily and aim for 7-9 hours of sleep.",
      "Stress Management: Engage in hobbies or relaxation techniques to maintain mental well-being."
    ];
  }
  
  return {
    riskLevel,
    confidence: percentage,
    analysis,
    suggestions
  };
};

export const getRemoteHistory = async (role: string): Promise<any[]> => {
  const endpoint = role === 'ADMIN' ? '/predictions/all' : '/predictions/my';
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
      }
    });
    
    if (!response.ok) throw new Error("Failed to fetch history");
    
    const data = await response.json();
    
    return data.map((item: any) => {
      const diseaseDef = DISEASES.find(d => d.id === item.disease);
      if (!diseaseDef) return null;
      
      const result = generatePredictionResult(diseaseDef, item.probability);
      
      return {
        id: item.id.toString(),
        date: item.created_at,
        disease: item.disease,
        result,
        patientName: item.patient_name || (item.user_name ? `${item.user_name}'s Patient` : 'Unknown Patient')
      };
    }).filter(Boolean);
  } catch (error) {
    console.error("History Fetch Error:", error);
    return [];
  }
};

export const downloadAdminExcel = async (): Promise<Blob> => {
  const response = await fetch(`${API_URL}/admin/export-data`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token") || ""}`
    }
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to download Excel");
  }
  return response.blob();
};
