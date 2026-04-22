import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosticResult, HerbRecommendation, VPKVector, Dosha } from "../lib/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getDiagnosticReport(
  weight: number,
  selectedSymptoms: string[],
  vpkVector: VPKVector,
  customNotes?: string
): Promise<DiagnosticResult> {
  const symptomText = selectedSymptoms.join(", ");
  
  const dominantDosha = Object.entries(vpkVector).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0] as Dosha;

  const prompt = `
    You are "The Unified Compendium" AI, an expert in Thai Herbal Pharmacopoeia and Modern Pharmacology.
    Patient Weight: ${weight} kg
    Selected Symptoms: ${symptomText}
    Additional Patient Notes: ${customNotes || 'None provided'}
    VPK Vector Values: Vata: ${vpkVector.Vata}, Pitta: ${vpkVector.Pitta}, Kapha: ${vpkVector.Kapha}
    Calculated Dominant Dosha: ${dominantDosha}

    Task:
    1. Verify the VPK balance and consider the additional patient notes for nuance.
    2. Suggest 2-3 Thai herbs based on ${dominantDosha}, symptoms, and notes.
    3. Include a descriptive 'imageSearchTerm' (English) for each herb to find its photo.
    4. Provide specific medical or pharmacological references in the 'source' field (e.g., Thai Herbal Pharmacopoeia, WHO Monographs, NCBI study) and include a URL in English or Thai if available.
    5. Calculate dosing: Base Dose = weight * 12.5 mg.
    6. Adjust dose for 250mg capsules.
    7. Provide evidence-based reasoning in both English and Thai.
    8. Include active compounds and safety notes (ALT/AST cross-check).

    Return ONLY JSON matching the DiagnosticResult schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vector: {
              type: Type.OBJECT,
              properties: {
                Vata: { type: Type.NUMBER },
                Pitta: { type: Type.NUMBER },
                Kapha: { type: Type.NUMBER },
              },
              required: ["Vata", "Pitta", "Kapha"],
            },
            dominantDosha: { type: Type.STRING },
            baseDoseMg: { type: Type.NUMBER },
            capsulesPerDay: { type: Type.NUMBER },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  nameTh: { type: Type.STRING },
                  scientificName: { type: Type.STRING },
                  imageSearchTerm: { type: Type.STRING },
                  activeCompounds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  taste: { type: Type.STRING },
                  property: { type: Type.STRING },
                  targetDosha: { type: Type.ARRAY, items: { type: Type.STRING } },
                  dosePerDayMg: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                  reasonTh: { type: Type.STRING },
                  safetyNote: { type: Type.STRING },
                  source: { type: Type.STRING },
                },
                required: ["name", "nameTh", "scientificName", "reason", "reasonTh", "dosePerDayMg", "source"],
              },
            },
          },
          required: ["vector", "dominantDosha", "baseDoseMg", "capsulesPerDay", "recommendations"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}") as any;
    
    // Add image URLs using search terms
    if (result.recommendations) {
      result.recommendations = result.recommendations.map((h: any) => ({
        ...h,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(h.imageSearchTerm || h.name)}/600/400`
      }));
    }

    return result as DiagnosticResult;
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if AI fails
    return {
      vector: vpkVector,
      dominantDosha,
      baseDoseMg: weight * 12.5,
      capsulesPerDay: Math.ceil((weight * 12.5) / 250),
      recommendations: []
    };
  }
}

export async function generateHerbImage(herbName: string, scientificName: string): Promise<string | null> {
  const prompt = `A cute, friendly 3D cartoon style illustration of the Thai herb "${herbName}" (${scientificName}). 
  Bright colors, soft lighting, clean white background. Personified with small cute eyes and a smile to look like a friendly character. 
  High quality, sticker style, easy to recognize features of the plant.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}
