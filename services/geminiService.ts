import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { GroupSessionData, AssessmentSessionData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const generateGroupReport = async (data: GroupSessionData): Promise<string> => {
  const modelId = "gemini-3-flash-preview"; 

  // Format logs for the AI
  const logsText = data.logs.map(log => {
    const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (log.type === 'phase') return `[PHASE CHANGE] ${log.action}`;
    if (log.type === 'global') return `GLOBAL NOTE: ${log.note}`;
    
    const actorLabel = log.isParentAction 
      ? `Parent of ${log.actorName || 'Unknown'}` 
      : `Member: ${log.actorName || 'Unknown'}`;

    return `${actorLabel} (${log.action}) - ${log.note}`;
  }).join('\n');

  // Format member context
  const memberContext = data.members.map(m => 
    `${m.name} ${m.parentName ? `(Parent: ${m.parentName})` : ''} [Feature: ${m.feature}]`
  ).join('; ');

  const promptText = `
    [模式: 團體觀察報告生成]
    
    1. 基本資料:
      團體名稱: ${data.groupName}
      日期: ${data.date}
      治療師: ${data.therapist}
      成員名單: ${memberContext}
    
    2. 指定理論視角: ${data.theory}
       (請依據此理論，在心得部分提出引導式問題，而非直接撰寫結論)

    3. 教案內容 (文字輸入):
    ${data.lessonPlanText || "無文字輸入"}

    4. 觀察筆記 (Logs):
    ${logsText}

    5. 特別要求:
    - 撰寫「團體觀察」段落時，請將零散的觀察紀錄整合為通順的敘事文章。
    - **絕對不要**在報告內容中顯示具體時間點（如 10:05），請改用「活動初期」、「隨後」、「結束前」等連接詞。
    - 格式：純文字 (Plain Text)。
  `;

  const parts: any[] = [{ text: promptText }];

  if (data.lessonPlanImage) {
    const base64Data = data.lessonPlanImage.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg', 
        data: base64Data
      }
    });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      }
    });

    return response.text || "無法生成報告，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error generating report: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const generateAssessmentReport = async (data: AssessmentSessionData): Promise<string> => {
  const modelId = "gemini-3-flash-preview";

  const logsText = data.logs.map(log => 
    `[Category: ${log.category}] ${log.note}`
  ).join('\n');

  const promptText = `
    [模式: 衡鑑觀察報告生成]

    1. 基本資料:
       日期: ${data.date}
       個案代號: ${data.caseName}
       年齡: ${data.age}
       性別: ${data.gender}
       初步診斷假設: ${data.provisionalDiagnosis}

    2. 原始主述 (Chief Complaint Raw Input):
       "${data.chiefComplaint}"

    3. 行為觀察筆記 (Behavior Logs):
       ${logsText}

    4. 任務要求:
       請生成一份完整的衡鑑觀察報告，包含以下三個明確欄位：

       **一、主述 (Chief Complaint)**
       請將上述「原始主述」轉化為專業病歷格式（例如：將「講不聽」轉化為「指令遵從性低」或「對立反抗特質」）。

       **二、行為觀察 (Behavioral Observation)**
       請將「行為觀察筆記」整合成一篇完整、通順、具現象學描述的文章。
       - 描述個案的外觀、態度、測驗中的具體反應。
       - 嚴格遵守現象學：寫出動作、表情、語氣，而非冷冰冰的分數。
       - **不要**顯示時間戳記。

       **三、心得與綜合評估 (Conclusion & Impression)**
       - 綜合上述觀察，驗證「初步診斷假設」是否成立。
       - 提供臨床觀察總結。

    5. 格式: 純文字 (Plain Text)。
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: promptText }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      }
    });

    return response.text || "無法生成報告。";
  } catch (error) {
    console.error("Gemini Assessment Error:", error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const generateReflectiveQuestions = async (reportContext: string): Promise<string> => {
    return ""; 
}
